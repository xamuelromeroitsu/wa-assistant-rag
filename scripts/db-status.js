// scripts/db-status.js — estado rápido de la base de datos del asistente.
// Uso: node scripts/db-status.js   (requiere .env con las variables de PostgreSQL)

import 'dotenv/config';
import { loadConfig } from '../src/config.js';
import { createLogger } from '../src/logger.js';
import { createPool, createDatabase } from '../src/db.js';

const logger = createLogger({ level: 'WARN' });
const config = loadConfig(process.env);
const pool = createPool(config.database);
const db = createDatabase({ pool, logger });

try {
  const ping = await db.ping();
  console.log(`conexión (${config.database.host}:${config.database.port}/${config.database.database}): ${ping ? 'OK' : 'FALLA'}`);

  const models = await db.listEmbeddingModels();
  const documents = await db.listDocuments();
  const embeddingCounts = await pool.query('SELECT modelo, count(*)::int AS n FROM embeddings GROUP BY modelo ORDER BY modelo');
  const chunkCounts = await pool.query(
    `SELECT d.id, d.nombre, count(c.id)::int AS chunks
     FROM documents d
     LEFT JOIN chunks c ON c.document_id = d.id
     GROUP BY d.id, d.nombre
     ORDER BY d.id`,
  );

  console.log(`documentos: ${documents.length}`);
  for (const row of chunkCounts.rows) {
    console.log(`  #${row.id} ${row.nombre} — ${row.chunks} fragmento(s)`);
  }

  console.log(`modelos de embeddings almacenados: ${models.length > 0 ? models.join(', ') : '(ninguno)'}`);
  for (const row of embeddingCounts.rows) {
    console.log(`  ${row.modelo}: ${row.n} vector(es)`);
  }

  const configured = config.ollama.embeddingModel;
  if (models.length > 0 && !models.includes(configured)) {
    console.log(`AVISO: EMBEDDING_MODEL="${configured}" no coincide con los embeddings almacenados — la búsqueda no devolverá resultados.`);
  }

  if (models.length === 0) {
    console.log('AVISO: no hay documentos cargados. Ejecutá: npm run ingest <ruta_archivos>');
  }
} catch (error) {
  console.error(`ERROR [${error.code ?? 'desconocido'}]: ${error.userMessage ?? error.message}`);
  process.exitCode = 1;
} finally {
  await db.close();
}
