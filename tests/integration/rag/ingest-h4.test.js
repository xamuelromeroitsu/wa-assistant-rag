import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { afterAll, beforeAll, describe, it, expect, vi } from 'vitest';
import { extractText, createIngestService } from '../../../src/rag/ingest.js';
import { chunkText } from '../../../src/domain/chunking.js';
import { createSearchService } from '../../../src/rag/search.js';
import { createMessageHandler } from '../../../src/handlers/message.js';

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'fixtures');
const PDF_FIXTURE = path.join(fixturesDir, 'guia-macronutrientes.pdf');
const TXT_FIXTURE = path.join(fixturesDir, 'guia-alimentacion.txt');

function embeddingFor(text) {
  const digest = createHash('sha256').update(String(text)).digest();
  return Array.from(digest, (byte) => (byte / 255) * 2 - 1);
}

function makeInMemoryDeps() {
  const documents = new Map();
  const chunks = new Map();
  const embeddings = new Map();

  const db = {
    documents,
    chunks,
    embeddings,
    findDocumentByHash: vi.fn(async (hashContenido) => documents.get(hashContenido) ?? null),
    insertDocument: vi.fn(async ({ nombre, ruta, hashContenido, tamanoBytes }) => {
      const id = documents.size + 1;
      documents.set(hashContenido, { id, nombre, ruta, tamanoBytes });
      return { id, created: true };
    }),
    insertChunk: vi.fn(async ({ documentId, texto, hashFragmento }) => {
      const key = `${documentId}:${hashFragmento}`;
      if (chunks.has(key)) return { id: chunks.get(key).id, created: false };
      const id = chunks.size + 1;
      chunks.set(key, { id, documentId, texto });
      return { id, created: true };
    }),
    insertEmbedding: vi.fn(async ({ chunkId, vector, modelo }) => {
      const key = `${chunkId}:${modelo}`;
      if (embeddings.has(key)) return { id: 0, created: false };
      const id = embeddings.size + 1;
      embeddings.set(key, { id, chunkId, vector, modelo });
      return { id, created: true };
    }),
    withTransaction: vi.fn(async (callback) => {
      const snapshot = {
        documents: new Map(documents),
        chunks: new Map(chunks),
        embeddings: new Map(embeddings),
      };

      try {
        return await callback(db);
      } catch (error) {
        documents.clear();
        chunks.clear();
        embeddings.clear();
        for (const [key, value] of snapshot.documents) documents.set(key, value);
        for (const [key, value] of snapshot.chunks) chunks.set(key, value);
        for (const [key, value] of snapshot.embeddings) embeddings.set(key, value);
        throw error;
      }
    }),
    listEmbeddingModels: vi.fn(async () => [...new Set([...embeddings.values()].map((row) => row.modelo))].sort()),
    searchSimilar: vi.fn(async ({ modelo, vector, limite }) => {
      const cosine = (a, b) => {
        let dot = 0;
        let normA = 0;
        let normB = 0;
        for (let index = 0; index < a.length; index += 1) {
          dot += a[index] * b[index];
          normA += a[index] ** 2;
          normB += b[index] ** 2;
        }
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
      };

      return [...embeddings.values()]
        .filter((row) => row.modelo === modelo)
        .map((row) => {
          const chunk = [...chunks.values()].find((item) => item.id === row.chunkId);
          const document = [...documents.values()].find((item) => item.id === chunk.documentId);
          return {
            texto: chunk.texto,
            orden: 0,
            document_id: chunk.documentId,
            documento: document.nombre,
            distancia: 1 - cosine(vector, row.vector),
          };
        })
        .sort((a, b) => a.distancia - b.distancia)
        .slice(0, limite);
    }),
  };

  const ollama = {
    embeddingModel: 'nomic-embed-text',
    model: 'llama3.2',
    embed: vi.fn(async (text) => embeddingFor(text)),
    generate: vi.fn(async () => 'respuesta generada con contexto'),
  };

  return { db, ollama };
}

describe('H4 — ingesta verificada con documentos reales', () => {
  let workDir;

  beforeAll(async () => {
    workDir = await mkdir(path.join(tmpdir(), 'h4-integration-'), { recursive: true });
  });

  afterAll(async () => {
    await rm(workDir, { recursive: true, force: true });
  });

  it('extrae encabezados y filas de tabla del PDF fixture', async () => {
    const text = await extractText(PDF_FIXTURE);

    expect(text).toContain('Guia de macronutrientes');
    expect(text).toContain('Tabla 1. Aporte energetico por gramo');
    expect(text).toContain('Proteina | 4 kcal');
    expect(text).toContain('Grasa | 9 kcal');
    expect(text).toContain('Adulto activo: 2400 a 2800 kcal por dia.');
  });

  it('trocea el TXT fixture sin perder contenido y respeta el maximo por fragmento', async () => {
    const text = await readFile(TXT_FIXTURE, 'utf8');
    const chunks = chunkText(text, { maxChars: 500 });

    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(500);
      expect(chunk.trim().length).toBeGreaterThan(0);
    }

    const joined = chunks.join(' ').replace(/\s+/g, ' ');
    expect(joined).toContain('La proteina aporta 4 kcal por gramo');
    expect(joined).toContain('La fibra dietetica no aporta energia');
    expect(joined).toContain('la mitad de verduras');
  });

  it('procesa PDF y TXT del fixture y deja embeddings disponibles', async () => {
    const { db, ollama } = makeInMemoryDeps();
    const summary = await createIngestService({ db, ollama }).ingestPath(fixturesDir);

    expect(summary.errors).toEqual([]);
    expect(summary.filesProcessed).toBe(2);
    expect(summary.chunksGenerated).toBeGreaterThan(5);
    expect(db.insertDocument).toHaveBeenCalledTimes(2);
    expect(db.insertEmbedding.mock.calls.every(([payload]) => payload.modelo === 'nomic-embed-text')).toBe(true);
  });

  it('la ingesta repetida no duplica contenido (idempotencia por hash)', async () => {
    const { db, ollama } = makeInMemoryDeps();
    const service = createIngestService({ db, ollama });

    const first = await service.ingestPath(fixturesDir);
    const second = await service.ingestPath(fixturesDir);

    expect(first.filesProcessed).toBe(2);
    expect(second.filesProcessed).toBe(0);
    expect(second.results.every((result) => result.status === 'skipped')).toBe(true);
    expect(db.insertDocument).toHaveBeenCalledTimes(2);
    expect(db.chunks.size).toBe(first.chunksGenerated);
  });

  it('un archivo fallido no aborta el lote (errores parciales)', async () => {
    const lote = path.join(workDir, 'lote-parcial');
    await mkdir(lote, { recursive: true });
    await writeFile(path.join(lote, 'bueno.txt'), 'Contenido valido para la demo del MVP.');
    await writeFile(path.join(lote, 'vacio.txt'), '');

    const { db, ollama } = makeInMemoryDeps();
    const summary = await createIngestService({ db, ollama }).ingestPath(lote);

    expect(summary.filesProcessed).toBe(1);
    expect(summary.errors).toHaveLength(1);
    expect(summary.errors[0].code).toBe('ERR_FILE_002');
    expect(summary.errors[0].filePath).toBe(path.join(lote, 'vacio.txt'));
  });

  it('los fragmentos quedan disponibles para H3 sin reiniciar el bot', async () => {
    const { db, ollama } = makeInMemoryDeps();
    const ingest = createIngestService({ db, ollama });
    await ingest.ingestPath(fixturesDir);

    const search = createSearchService({ db, ollama });
    const { fragments, context } = await search.search('cuantas kcal aporta la proteina');

    expect(fragments.length).toBeGreaterThan(0);
    expect(context).toContain('Proteina | 4 kcal');

    const handler = createMessageHandler({ search, ollama, getBotId: () => null });
    const reply = await handler.handle({ body: 'cuantas kcal aporta la proteina', from: 'usuario@c.us' });

    expect(reply.action).toBe('reply');
    expect(reply.text).toBe('respuesta generada con contexto');
  });

  it('advierte cuando EMBEDDING_MODEL cambia respecto al usado en la ingesta (H5)', async () => {
    const { db, ollama } = makeInMemoryDeps();
    await createIngestService({ db, ollama }).ingestPath(fixturesDir);

    const otherOllama = { ...ollama, embeddingModel: 'otro-embedding-model', embed: vi.fn(async (text) => embeddingFor(text)) };
    const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const search = createSearchService({ db, ollama: otherOllama, logger });

    const { fragments } = await search.search('cuantas kcal aporta la proteina');

    expect(fragments).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith(
      'rag',
      expect.stringContaining('no coincide con los embeddings almacenados'),
      expect.objectContaining({ configured: 'otro-embedding-model' }),
    );
  });

  it('no deja documentos huerfanos si falla la generacion de embeddings', async () => {
    const { db, ollama } = makeInMemoryDeps();
    let llamadas = 0;
    const ollamaRoto = {
      ...ollama,
      embed: vi.fn(async (text) => {
        llamadas += 1;
        if (llamadas > 2) throw Object.assign(new Error('ollama caido'), { code: 'ERR_OLLAMA_001' });
        return embeddingFor(text);
      }),
    };
    const service = createIngestService({ db, ollama: ollamaRoto });

    await expect(service.ingestPath(fixturesDir)).resolves.toMatchObject({ filesProcessed: 0 });
    expect(db.documents.size).toBe(0);
    expect(db.embeddings.size).toBe(0);

    // Tras "reparar" Ollama, la re-ingesta funciona (no quedó un documento duplicado bloqueándola).
    const resumen = await createIngestService({ db, ollama }).ingestPath(fixturesDir);

    expect(resumen.filesProcessed).toBe(2);
    expect(db.documents.size).toBe(2);
    expect(db.embeddings.size).toBe(resumen.chunksGenerated);
  });
});
