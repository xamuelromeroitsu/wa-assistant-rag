// scripts/ask.js — hace una pregunta al asistente sin necesidad de WhatsApp.
// Uso: node scripts/ask.js "¿cuántas kcal aporta la proteína?"

import 'dotenv/config';
import { loadConfig } from '../src/config.js';
import { createLogger } from '../src/logger.js';
import { createPool, createDatabase } from '../src/db.js';
import { createOllamaClient } from '../src/ollama.js';
import { createSearchService } from '../src/rag/search.js';
import { createMessageHandler } from '../src/handlers/message.js';

const question = process.argv.slice(2).join(' ').trim();
if (!question) {
  console.error('Uso: node scripts/ask.js "<pregunta>"');
  process.exitCode = 1;
} else {
  const logger = createLogger({ level: process.env.LOG_LEVEL ?? 'INFO' });
  const config = loadConfig(process.env);
  const pool = createPool(config.database);
  const db = createDatabase({ pool, logger });
  const ollama = createOllamaClient({ ...config.ollama, logger });

  try {
    const search = createSearchService({ db, ollama, logger, topK: config.rag.topK });
    const handler = createMessageHandler({ search, ollama, logger });

    const result = await handler.handle({ body: question, from: 'cli@local' });

    if (result.action === 'reply') {
      console.log(`\nPregunta: ${question}`);
      console.log(`Respuesta: ${result.text}\n`);
    } else {
      console.log(`Mensaje ignorado (${result.reason ?? 'sin detalle'})`);
    }
  } catch (error) {
    console.error(`ERROR [${error.code ?? 'desconocido'}]: ${error.userMessage ?? error.message}`);
    process.exitCode = 1;
  } finally {
    await db.close();
  }
}
