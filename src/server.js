import express from 'express';
import { AppError, ERROR_CODES } from './errors.js';

export function createHealthApp({ db, ollama, getWhatsappState = () => 'disconnected', logger }) {
  const app = express();

  app.get('/health', async (_req, res) => {
    const services = {
      database: 'disconnected',
      ollama: 'disconnected',
      whatsapp: getWhatsappState(),
    };
    const problems = [];

    try {
      await db.ping();
      services.database = 'connected';
    } catch (error) {
      problems.push(error.userMessage ?? error.message);
      if (logger) logger.warn('health', 'Base de datos no disponible en /health', { code: error.code });
    }

    try {
      await ollama.listModels();
      services.ollama = 'connected';
    } catch (error) {
      problems.push(error.userMessage ?? error.message);
      if (logger) logger.warn('health', 'Ollama no disponible en /health', { code: error.code });
    }

    const healthy = services.database === 'connected' && services.ollama === 'connected';
    const payload = {
      status: healthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services,
    };

    if (!healthy && problems.length > 0) {
      payload.error = problems.join(' ');
    }

    res.status(healthy ? 200 : 503).json(payload);
  });

  return app;
}

export function startHealthServer({ app, port, logger }) {
  const server = app.listen(port);

  return new Promise((resolve, reject) => {
    const onError = (error) => {
      if (server.off) server.off('listening', onListening);
      else server.removeListener('listening', onListening);

      if (error.code === 'EADDRINUSE') {
        reject(new AppError(ERROR_CODES.CONFIG_PORT_IN_USE, {
          message: `El puerto ${port} ya está en uso.`,
          details: { port },
          cause: error,
        }));
        return;
      }
      reject(error);
    };

    const onListening = () => {
      if (!server.listening) return;

      if (server.off) server.off('error', onError);
      else server.removeListener('error', onError);

      if (logger) logger.info('server', `Servidor interno escuchando en http://localhost:${port}/health`);
      resolve(server);
    };

    server.once('error', onError);
    server.once('listening', onListening);
  });
}
