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
});
