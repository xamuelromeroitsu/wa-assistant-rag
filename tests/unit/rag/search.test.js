import { describe, it, expect, vi } from 'vitest';
import { createSearchService } from '../../../src/rag/search.js';

function makeDeps(rows = []) {
  const db = { searchSimilar: vi.fn(async () => rows) };
  const ollama = { embeddingModel: 'nomic-embed-text', embed: vi.fn(async () => [0.1, 0.2, 0.3]) };
  return { db, ollama };
}

describe('rag/search.js', () => {
  it('genera embedding, busca top-K y construye contexto', async () => {
    const { db, ollama } = makeDeps([
      { texto: 'La fibra mejora la digestión.', documento: 'nutricion.pdf', document_id: 1, orden: 0, distancia: 0.1 },
    ]);
    const service = createSearchService({ db, ollama, topK: 3 });

    const result = await service.search('¿Qué hace la fibra?');

    expect(ollama.embed).toHaveBeenCalledWith('¿Qué hace la fibra?');
    expect(db.searchSimilar).toHaveBeenCalledWith({
      modelo: 'nomic-embed-text',
      vector: [0.1, 0.2, 0.3],
      limite: 3,
    });
    expect(result.fragments).toHaveLength(1);
    expect(result.fragments[0].nombre).toBe('nutricion.pdf');
    expect(result.context).toContain('La fibra mejora la digestión.');
  });

  it('no consulta si la pregunta está vacía', async () => {
    const { db, ollama } = makeDeps();
    const service = createSearchService({ db, ollama });

    const result = await service.search('   ');

    expect(result).toEqual({ fragments: [], context: '' });
    expect(ollama.embed).not.toHaveBeenCalled();
    expect(db.searchSimilar).not.toHaveBeenCalled();
  });

  it('devuelve contexto vacío cuando no hay coincidencias', async () => {
    const { db, ollama } = makeDeps([]);
    const service = createSearchService({ db, ollama });

    const result = await service.search('algo sin resultados');

    expect(result.fragments).toEqual([]);
    expect(result.context).toBe('');
  });

  it('no falla si la BD no expone listEmbeddingModels', async () => {
    const { db, ollama } = makeDeps([]);
    const logger = { warn: vi.fn(), info: vi.fn(), debug: vi.fn() };
    const service = createSearchService({ db, ollama, logger });

    await expect(service.search('algo sin resultados')).resolves.toMatchObject({ fragments: [] });
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('advierte cuando EMBEDDING_MODEL no coincide con los embeddings almacenados', async () => {
    const { db, ollama } = makeDeps([]);
    db.listEmbeddingModels = vi.fn(async () => ['nomic-embed-text-viejo']);
    const logger = { warn: vi.fn(), info: vi.fn(), debug: vi.fn() };
    const service = createSearchService({ db, ollama, logger });

    await service.search('pregunta sin resultados');

    expect(db.listEmbeddingModels).toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      'rag',
      expect.stringContaining('no coincide con los embeddings almacenados'),
      { configured: 'nomic-embed-text', stored: ['nomic-embed-text-viejo'] },
    );
  });

  it('no advierte cuando el modelo coincide con los embeddings almacenados', async () => {
    const { db, ollama } = makeDeps([]);
    db.listEmbeddingModels = vi.fn(async () => ['nomic-embed-text']);
    const logger = { warn: vi.fn(), info: vi.fn(), debug: vi.fn() };
    const service = createSearchService({ db, ollama, logger });

    await service.search('pregunta sin resultados');

    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('informa que no hay documentos cargados cuando la BD está vacía', async () => {
    const { db, ollama } = makeDeps([]);
    db.listEmbeddingModels = vi.fn(async () => []);
    const logger = { warn: vi.fn(), info: vi.fn(), debug: vi.fn() };
    const service = createSearchService({ db, ollama, logger });

    await service.search('pregunta sin documentos');

    expect(logger.info).toHaveBeenCalledWith('rag', expect.stringContaining('No hay documentos cargados'));
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('no advierte cuando la búsqueda sí devuelve fragmentos', async () => {
    const { db, ollama } = makeDeps([
      { texto: 'La proteína aporta 4 kcal por gramo.', documento: 'nutricion.pdf', document_id: 1, orden: 0, distancia: 0.1 },
    ]);
    db.listEmbeddingModels = vi.fn(async () => ['otro-modelo']);
    const logger = { warn: vi.fn(), info: vi.fn(), debug: vi.fn() };
    const service = createSearchService({ db, ollama, logger });

    await service.search('pregunta con resultados');

    expect(db.listEmbeddingModels).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });
});
