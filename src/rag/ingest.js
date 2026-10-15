import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { PDFParse } from 'pdf-parse';
import { AppError, ERROR_CODES } from '../errors.js';
import { chunkText } from '../domain/chunking.js';
import { sha256 } from '../domain/hashing.js';

export const SUPPORTED_EXTENSIONS = Object.freeze(['.pdf', '.txt']);

function isSupported(filePath) {
  return SUPPORTED_EXTENSIONS.includes(path.extname(filePath).toLowerCase());
}

export async function extractPdfText(buffer) {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    return result?.text ?? '';
  } catch (error) {
    throw new AppError(ERROR_CODES.FILE_PARSE, {
      message: `No se pudo extraer texto del PDF: ${error?.message ?? 'error desconocido'}`,
      cause: error,
    });
  } finally {
    await parser.destroy();
  }
}

export async function extractText(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    throw new AppError(ERROR_CODES.FILE_UNSUPPORTED, {
      message: `Formato no soportado: ${extension || '(sin extensión)'}. Usá PDF o TXT.`,
      details: { filePath },
    });
  }

  if (extension === '.txt') {
    return readFile(filePath, 'utf8');
  }

  const buffer = await readFile(filePath);
  return extractPdfText(buffer);
}

export async function collectFiles(target) {
  let info;
  try {
    info = await stat(target);
  } catch {
    throw new AppError(ERROR_CODES.FILE_NOT_FOUND, {
      message: `La ruta especificada no existe: ${target}`,
      details: { target },
    });
  }

  if (info.isFile()) {
    return [target];
  }

  const entries = await readdir(target, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && isSupported(entry.name))
    .map((entry) => path.join(target, entry.name))
    .sort();
}

export function createIngestService({ db, ollama, logger }) {
  async function ingestFile(filePath) {
    const stats = await stat(filePath);
    const buffer = await readFile(filePath);
    const contentHash = sha256(buffer);

    const existing = await db.findDocumentByHash(contentHash);
    if (existing) {
      if (logger) logger.info('ingest', `Documento ya cargado, se omite: ${path.basename(filePath)}`);
      return { filePath, status: 'skipped', reason: 'duplicate', chunks: 0 };
    }

    if (stats.size === 0) {
      throw new AppError(ERROR_CODES.FILE_EMPTY, {
        message: `El archivo "${path.basename(filePath)}" está vacío.`,
        details: { filePath },
      });
    }

    const rawText = await extractText(filePath);
    const text = rawText.trim();
    if (!text) {
      const isPdf = path.extname(filePath).toLowerCase() === '.pdf';
      throw new AppError(ERROR_CODES.FILE_EMPTY, {
        message: isPdf
          ? `El archivo "${path.basename(filePath)}" es un PDF escaneado. Se requiere PDF con texto.`
          : `El archivo "${path.basename(filePath)}" no contiene texto.`,
        details: { filePath },
      });
    }

    const chunks = chunkText(text);
    if (chunks.length === 0) {
      throw new AppError(ERROR_CODES.FILE_EMPTY, {
        message: `El archivo "${path.basename(filePath)}" no generó fragmentos.`,
        details: { filePath },
      });
    }

    const { id: documentId } = await db.insertDocument({
      nombre: path.basename(filePath),
      ruta: filePath,
      hashContenido: contentHash,
      tamanoBytes: stats.size,
    });

    let inserted = 0;
    for (let index = 0; index < chunks.length; index += 1) {
      const texto = chunks[index];
      const chunk = await db.insertChunk({
        documentId,
        orden: index,
        texto,
        hashFragmento: sha256(texto),
      });

      if (!chunk.created) continue;

      const vector = await ollama.embed(texto);
      await db.insertEmbedding({ chunkId: chunk.id, vector, modelo: ollama.embeddingModel });
      inserted += 1;
    }

    if (logger) {
      logger.info('ingest', `Documento procesado: ${path.basename(filePath)}`, { chunks: inserted });
    }

    return { filePath, status: 'ok', chunks: inserted, documentId };
  }

  async function ingestPath(target) {
    const files = await collectFiles(target);
    const summary = { filesProcessed: 0, chunksGenerated: 0, errors: [], results: [] };

    for (const filePath of files) {
      try {
        const result = await ingestFile(filePath);
        summary.results.push(result);
        if (result.status === 'ok') {
          summary.filesProcessed += 1;
          summary.chunksGenerated += result.chunks;
        }
      } catch (error) {
        summary.errors.push({ filePath, code: error.code, message: error.userMessage ?? error.message });
        if (logger) logger.error('ingest', `Error procesando ${path.basename(filePath)}`, { code: error.code, message: error.message });
      }
    }

    return summary;
  }

  return { ingestFile, ingestPath };
}

function printSummary(summary) {
  const lines = [
    'Ingesta completada:',
    `  - Archivos procesados: ${summary.filesProcessed}`,
    `  - Fragmentos generados: ${summary.chunksGenerated}`,
    `  - Errores: ${summary.errors.length}`,
  ];

  if (summary.errors.length > 0) {
    lines.push('', 'Errores:');
    for (const error of summary.errors) {
      lines.push(`  - "${path.basename(error.filePath)}": ${error.message}`);
    }
  }

  console.log(lines.join('\n'));
}

export async function runIngestCli(argv = process.argv.slice(2)) {
  const target = argv[0];
  if (!target) {
    console.error('Uso: npm run ingest <ruta_archivos>');
    process.exitCode = 1;
    return;
  }

  const dotenv = (await import('dotenv')).default;
  dotenv.config();

  const { loadConfig } = await import('../config.js');
  const { createLogger } = await import('../logger.js');
  const { createPool, createDatabase } = await import('../db.js');
  const { createOllamaClient } = await import('../ollama.js');

  const config = loadConfig(process.env);
  const logger = createLogger({ level: config.logging.level });
  const pool = createPool(config.database);
  const db = createDatabase({ pool, logger });
  const ollama = createOllamaClient({ ...config.ollama, logger });

  try {
    const service = createIngestService({ db, ollama, logger });
    const summary = await service.ingestPath(target);
    printSummary(summary);
    if (summary.errors.length > 0) process.exitCode = 1;
  } finally {
    await db.close();
  }
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  runIngestCli().catch((error) => {
    console.error(error.userMessage ?? error.message);
    process.exitCode = 1;
  });
}
