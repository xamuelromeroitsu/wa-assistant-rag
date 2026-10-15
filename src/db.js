import pg from 'pg';
import { AppError, ERROR_CODES } from './errors.js';

const { Pool } = pg;

export const POOL_LIMITS = Object.freeze({
  max: 10,
  queryTimeoutMs: 5000,
  connectionTimeoutMs: 5000,
  idleTimeoutMs: 30000,
});

const CONNECTION_ERROR_CODES = Object.freeze([
  'ECONNREFUSED',
  'ENOTFOUND',
  'EHOSTUNREACH',
  'ETIMEDOUT',
  '08000',
  '08001',
  '08006',
  '57P03',
]);

const TIMEOUT_ERROR_CODES = Object.freeze(['57014', 'ETIMEDOUT']);

export function createPool(database) {
  return new Pool({
    host: database.host,
    port: database.port,
    user: database.user,
    password: database.password,
    database: database.database,
    max: POOL_LIMITS.max,
    idleTimeoutMillis: POOL_LIMITS.idleTimeoutMs,
    connectionTimeoutMillis: POOL_LIMITS.connectionTimeoutMs,
    query_timeout: POOL_LIMITS.queryTimeoutMs,
    statement_timeout: POOL_LIMITS.queryTimeoutMs,
  });
}

export function toVectorLiteral(vector) {
  if (!Array.isArray(vector) || vector.length === 0) {
    throw new AppError(ERROR_CODES.OLLAMA_BAD_EMBEDDING, {
      message: 'El vector de embeddings está vacío o no es un arreglo.',
      details: { length: Array.isArray(vector) ? vector.length : 0 },
    });
  }
  return `[${vector.map((value) => Number(value)).join(',')}]`;
}

export function translateDbError(error, operation) {
  if (error instanceof AppError) return error;

  const code = error?.code;
  if (CONNECTION_ERROR_CODES.includes(code)) {
    return new AppError(ERROR_CODES.DB_CONNECTION, {
      message: `No se pudo conectar a PostgreSQL durante "${operation}".`,
      details: { operation, code },
      cause: error,
    });
  }

  if (TIMEOUT_ERROR_CODES.includes(code) || /timeout/i.test(error?.message ?? '')) {
    return new AppError(ERROR_CODES.DB_QUERY_TIMEOUT, {
      message: `La consulta "${operation}" superó el tiempo límite.`,
      details: { operation, code },
      cause: error,
    });
  }

  return new AppError(ERROR_CODES.DB_QUERY, {
    message: `Error ejecutando "${operation}": ${error?.message ?? 'error desconocido'}.`,
    details: { operation, code },
    cause: error,
  });
}

export function createDatabase({ pool, logger }) {
  const run = async (operation, text, params = []) => {
    try {
      return await pool.query(text, params);
    } catch (error) {
      const translated = translateDbError(error, operation);
      if (logger) {
        logger.error('db', translated.message, { code: translated.code, operation, details: translated.details });
      }
      throw translated;
    }
  };

  return {
    get pool() {
      return pool;
    },

    async ping() {
      const result = await run('ping', 'SELECT 1 AS ok');
      return result.rows[0]?.ok === 1;
    },

    async findDocumentByHash(hashContenido) {
      const result = await run(
        'findDocumentByHash',
        'SELECT id, nombre FROM documents WHERE hash_contenido = $1 LIMIT 1',
        [hashContenido],
      );
      return result.rows[0] ?? null;
    },

    async insertDocument({ nombre, ruta, hashContenido, tamanoBytes }) {
      const result = await run(
        'insertDocument',
        `INSERT INTO documents (nombre, ruta, hash_contenido, tamano_bytes)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [nombre, ruta, hashContenido, tamanoBytes],
      );
      return { id: result.rows[0].id, created: true };
    },

    async insertChunk({ documentId, orden, texto, hashFragmento }) {
      const result = await run(
        'insertChunk',
        `INSERT INTO chunks (document_id, orden, texto, hash_fragmento)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (document_id, hash_fragmento) DO NOTHING
         RETURNING id`,
        [documentId, orden, texto, hashFragmento],
      );
      const row = result.rows[0];
      return { id: row?.id ?? null, created: Boolean(row) };
    },

    async insertEmbedding({ chunkId, vector, modelo }) {
      const result = await run(
        'insertEmbedding',
        `INSERT INTO embeddings (chunk_id, vector, modelo)
         SELECT $1, $2::vector, $3
         WHERE NOT EXISTS (SELECT 1 FROM embeddings WHERE chunk_id = $1)
         RETURNING id`,
        [chunkId, toVectorLiteral(vector), modelo],
      );
      return { id: result.rows[0]?.id ?? null, created: Boolean(result.rows[0]) };
    },

    async searchSimilar({ modelo, vector, limite }) {
      const result = await run(
        'searchSimilar',
        `SELECT c.texto, c.orden, c.document_id, d.nombre AS documento,
                e.vector <=> $2::vector AS distancia
         FROM embeddings e
         JOIN chunks c ON c.id = e.chunk_id
         JOIN documents d ON d.id = c.document_id
         WHERE e.modelo = $1
         ORDER BY e.vector <=> $2::vector
         LIMIT $3`,
        [modelo, toVectorLiteral(vector), limite],
      );
      return result.rows;
    },

    async listDocuments() {
      const result = await run(
        'listDocuments',
        `SELECT id, nombre, hash_contenido, tamano_bytes, fecha_ingesta
         FROM documents
         ORDER BY fecha_ingesta DESC`,
      );
      return result.rows;
    },

    async close() {
      await pool.end();
    },
  };
}
