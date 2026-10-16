import 'dotenv/config';
import whatsappWeb from 'whatsapp-web.js';
import qrcodeTerminal from 'qrcode-terminal';
import qrcode from 'qrcode';
import { loadConfig } from './config.js';
import { createLogger, formatLogTimestamp } from './logger.js';
import { createPool, createDatabase } from './db.js';
import { createOllamaClient } from './ollama.js';
import { createSearchService } from './rag/search.js';
import { createMessageHandler } from './handlers/message.js';
import { createHealthApp, startHealthServer } from './server.js';
import { createQrPresenter } from './qr.js';
import { isAppError } from './errors.js';

const { Client, LocalAuth } = whatsappWeb;

const WHATSAPP_REPLY_FALLBACK = 'Ocurrió un error al procesar tu mensaje. Intentá de nuevo en unos instantes.';

async function bootstrap() {
  const config = loadConfig(process.env);
  const logger = createLogger({ level: config.logging.level });

  logger.info('app', 'Iniciando Wa-Assistant RAG...');
  logger.info('app', `Generación: ${config.ollama.model} | Embeddings: ${config.ollama.embeddingModel}`);

  const pool = createPool(config.database);
  const db = createDatabase({ pool, logger });

  try {
    await db.ping();
    logger.info('db', 'Conexión a PostgreSQL verificada');
  } catch (error) {
    logger.error('db', error.message, { code: error.code, details: error.details });
    logger.error('app', error.userMessage ?? error.message);
    process.exitCode = 1;
    return;
  }

  const ollama = createOllamaClient({ ...config.ollama, logger });
  try {
    const { missing } = await ollama.verifyModels();
    if (missing.length > 0) {
      for (const name of missing) {
        logger.warn('ollama', `Modelo no descargado: ${name}. Ejecutá: ollama pull ${name}`);
      }
    } else {
      logger.info('ollama', 'Modelos de Ollama verificados');
    }
  } catch (error) {
    logger.warn('ollama', error.userMessage ?? error.message, { code: error.code });
  }

  let whatsappState = 'disconnected';
  let botId = null;

  const search = createSearchService({ db, ollama, logger, topK: config.rag.topK });
  const handler = createMessageHandler({ search, ollama, logger, getBotId: () => botId });

  let healthServer = null;
  try {
    const app = createHealthApp({ db, ollama, getWhatsappState: () => whatsappState, logger });
    healthServer = await startHealthServer({ app, port: config.server.port, logger });
  } catch (error) {
    logger.warn('server', error.userMessage ?? error.message, { code: error.code });
  }

  const qrPresenter = createQrPresenter({
    terminal: qrcodeTerminal,
    png: qrcode,
    logger,
    outputPath: config.whatsapp.qr.outputPath,
  });

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'wa-assistant' }),
    puppeteer: { headless: true },
  });

  client.on('qr', async (qr) => {
    logger.info('whatsapp', 'Escaneá este código QR (WhatsApp → Dispositivos vinculados):');
    try {
      await qrPresenter.present(qr);
    } catch (error) {
      logger.warn(
        'whatsapp',
        `${error.userMessage ?? error.message} El QR sigue visible en la terminal.`,
        { code: error.code ?? 'desconocido' },
      );
    }
  });

  client.on('ready', () => {
    whatsappState = 'connected';
    botId = client.wid?._serialized ?? client.info?.wid?._serialized ?? null;
    logger.info('whatsapp', `Sesión conectada. Bot: ${config.whatsapp.botNumber ?? botId ?? 'desconocido'}`);
  });

  client.on('auth_failure', (message) => {
    whatsappState = 'disconnected';
    logger.error('whatsapp', `Fallo de autenticación: ${message}`);
  });

  client.on('disconnected', (reason) => {
    whatsappState = 'disconnected';
    logger.warn('whatsapp', `Conexión perdida (${reason ?? 'sin detalle'}). Reconectando...`);
  });

  client.on('message_create', async (message) => {
    if (message.fromMe) return;

    try {
      const result = await handler.handle(message);
      if (result.action === 'reply') {
        await message.reply(result.text);
        logger.info('whatsapp', 'Respuesta enviada al usuario');
      }
    } catch (error) {
      logger.error('whatsapp', `Error procesando mensaje: ${error.message}`, { code: error.code });
      const reply = isAppError(error) ? error.userMessage : WHATSAPP_REPLY_FALLBACK;
      try {
        await message.reply(reply);
      } catch (replyError) {
        logger.error('whatsapp', `No se pudo enviar el mensaje de error: ${replyError.message}`);
      }
    }
  });

  process.on('uncaughtException', (error) => {
    logger.error('app', `Error no capturado: ${error.message}`, { stack: error.stack });
  });

  process.on('unhandledRejection', (reason) => {
    const message = reason instanceof Error ? reason.message : String(reason);
    logger.error('app', `Promesa rechazada: ${message}`);
  });

  let shuttingDown = false;
  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info('app', `Recibí ${signal}, cerrando limpiamente...`);

    try {
      await client.destroy();
    } catch (error) {
      logger.warn('whatsapp', `Error al cerrar WhatsApp: ${error.message}`);
    }

    if (healthServer) {
      try {
        await new Promise((resolve) => healthServer.close(resolve));
      } catch (error) {
        logger.warn('server', `Error al cerrar el servidor interno: ${error.message}`);
      }
    }

    try {
      await db.close();
    } catch (error) {
      logger.warn('db', `Error al cerrar la conexión a PostgreSQL: ${error.message}`);
    }

    process.exit(0);
  };

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });
  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  try {
    await client.initialize();
  } catch (error) {
    logger.error('whatsapp', `No se pudo iniciar la sesión de WhatsApp: ${error.message}`);
    logger.error('app', 'Verificá que WhatsApp Web esté disponible e intentá de nuevo.');
    process.exitCode = 1;
  }
}

bootstrap().catch((error) => {
  console.error(`[${formatLogTimestamp()}] [ERROR] [app] ${error.userMessage ?? error.message}`);
  process.exit(1);
});
