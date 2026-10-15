import { mkdtemp, writeFile, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, it, expect, vi } from 'vitest';
import { extractText, collectFiles, createIngestService, runIngestCli, SUPPORTED_EXTENSIONS } from '../../../src/rag/ingest.js';

let root;

beforeAll(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'ingest-test-'));
});

afterAll(async () => {
  await rm(root, { recursive: true, force: true });
});

function makeDoubles({ existing = null, chunkCreated = true } = {}) {
  return {
    db: {
      findDocumentByHash: vi.fn(async () => existing),
      insertDocument: vi.fn(async () => ({ id: 1, created: true })),
      insertChunk: vi.fn(async () => (chunkCreated ? { id: 10, created: true } : { id: null, created: false })),
      insertEmbedding: vi.fn(async () => ({ id: 5, created: true })),
    },
    ollama: {
      embeddingModel: 'nomic-embed-text',
      embed: vi.fn(async () => new Array(768).fill(0.1)),
    },
  };
}

describe('rag/ingest.js — CLI y rutas', () => {
  it('rechaza formatos no soportados', async () => {
    await expect(extractText('/tmp/archivo.docx')).rejects.toMatchObject({ code: 'ERR_FILE_003' });
  });

  it('lanza ERR_FILE_001 cuando la ruta no existe', async () => {
    await expect(collectFiles(path.join(root, 'inexistente-xyz-123'))).rejects.toMatchObject({ code: 'ERR_FILE_001' });
  });

  it('solo declara PDF y TXT como soportados', () => {
    expect([...SUPPORTED_EXTENSIONS].sort()).toEqual(['.pdf', '.txt']);
  });

  it('muestra el uso y sale con código 1 si no recibe argumentos', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const previousExitCode = process.exitCode;
    process.exitCode = undefined;

    await runIngestCli([]);

    expect(spy).toHaveBeenCalledWith('Uso: npm run ingest <ruta_archivos>');
    expect(process.exitCode).toBe(1);

    spy.mockRestore();
    process.exitCode = previousExitCode;
  });
});

describe('rag/ingest.js — lectura y recolección', () => {
  it('lee el texto de un archivo .txt', async () => {
    const file = path.join(root, 'nota.txt');
    await writeFile(file, 'La proteína aporta 4 kcal por gramo.');
    await expect(extractText(file)).resolves.toBe('La proteína aporta 4 kcal por gramo.');
  });

  it('lista solo archivos soportados y los ordena', async () => {
    const dir = path.join(root, 'docs');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'b.txt'), 'b');
    await writeFile(path.join(dir, 'a.txt'), 'a');
    await writeFile(path.join(dir, 'leeme.docx'), 'x');

    const files = await collectFiles(dir);
    expect(files).toHaveLength(2);
    expect(files.map((file) => path.basename(file))).toEqual(['a.txt', 'b.txt']);
  });
});

describe('rag/ingest.js — pipeline de ingesta', () => {
  it('genera fragmentos, embeddings y persiste el documento', async () => {
    const { db, ollama } = makeDoubles();
    const file = path.join(root, 'manual.txt');
    await writeFile(file, 'La proteína aporta 4 kcal por gramo.\n\nLas grasas aportan 9 kcal por gramo.');

    const result = await createIngestService({ db, ollama }).ingestFile(file);

    expect(result.status).toBe('ok');
    expect(result.chunks).toBeGreaterThan(0);
    expect(db.findDocumentByHash).toHaveBeenCalledTimes(1);
    expect(db.insertDocument).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: 'manual.txt', ruta: file, tamanoBytes: expect.any(Number) }),
    );
    expect(db.insertChunk).toHaveBeenCalled();
    expect(ollama.embed).toHaveBeenCalledWith(expect.stringContaining('proteína'));
    expect(db.insertEmbedding).toHaveBeenCalledWith(
      expect.objectContaining({ chunkId: 10, modelo: 'nomic-embed-text' }),
    );
  });

  it('omite documentos ya cargados (idempotencia por hash)', async () => {
    const { db, ollama } = makeDoubles({ existing: { id: 7, nombre: 'manual.txt' } });
    const file = path.join(root, 'duplicado.txt');
    await writeFile(file, 'Contenido ya ingerido.');

    const result = await createIngestService({ db, ollama }).ingestFile(file);

    expect(result.status).toBe('skipped');
    expect(result.reason).toBe('duplicate');
    expect(db.insertDocument).not.toHaveBeenCalled();
    expect(ollama.embed).not.toHaveBeenCalled();
  });

  it('no genera embedding si el fragmento ya existía', async () => {
    const { db, ollama } = makeDoubles({ chunkCreated: false });
    const file = path.join(root, 'parcial.txt');
    await writeFile(file, 'Fragmento que ya existe.');

    const result = await createIngestService({ db, ollama }).ingestFile(file);

    expect(result.chunks).toBe(0);
    expect(db.insertEmbedding).not.toHaveBeenCalled();
  });

  it('lanza ERR_FILE_002 para un archivo vacío', async () => {
    const { db, ollama } = makeDoubles();
    const file = path.join(root, 'vacio.txt');
    await writeFile(file, '');

    await expect(createIngestService({ db, ollama }).ingestFile(file)).rejects.toMatchObject({ code: 'ERR_FILE_002' });
    expect(db.insertDocument).not.toHaveBeenCalled();
  });

  it('recolecta varios archivos y reporta errores parciales sin abortar', async () => {
    const { db, ollama } = makeDoubles();
    const dir = path.join(root, 'lote');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'bueno.txt'), 'Contenido válido.');
    await writeFile(path.join(dir, 'vacio.txt'), '');

    const summary = await createIngestService({ db, ollama }).ingestPath(dir);

    expect(summary.filesProcessed).toBe(1);
    expect(summary.errors).toHaveLength(1);
    expect(summary.errors[0].code).toBe('ERR_FILE_002');
    expect(summary.results.length + summary.errors.length).toBe(2);
  });
});
