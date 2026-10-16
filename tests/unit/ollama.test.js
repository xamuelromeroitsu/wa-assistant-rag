import { describe, it, expect, vi } from 'vitest';
import { createOllamaClient, EMBEDDING_DIMENSIONS } from '../../src/ollama.js';

function okResponse(payload) {
  return { ok: true, status: 200, json: async () => payload };
}

describe('ollama.js', () => {
  it('genera texto usando /api/generate', async () => {
    const fetchImpl = vi.fn(async () => okResponse({ response: 'respuesta' }));
    const client = createOllamaClient({ host: 'http://x', model: 'llama3.2', embeddingModel: 'nomic-embed-text', fetchImpl });

    await expect(client.generate('prompt')).resolves.toBe('respuesta');
    const [url, options] = fetchImpl.mock.calls[0];
    expect(url).toBe('http://x/api/generate');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body).stream).toBe(false);
  });

  it('valida la dimensión del embedding', async () => {
    const fetchImpl = vi.fn(async () => okResponse({ embedding: [1, 2, 3] }));
    const client = createOllamaClient({ host: 'http://x', model: 'm', embeddingModel: 'e', fetchImpl });

    await expect(client.embed('texto')).rejects.toMatchObject({ code: 'ERR_OLLAMA_004' });
  });

  it('acepta embeddings de la dimensión correcta', async () => {
    const embedding = new Array(EMBEDDING_DIMENSIONS).fill(0.1);
    const fetchImpl = vi.fn(async () => okResponse({ embedding }));
    const client = createOllamaClient({ host: 'http://x', model: 'm', embeddingModel: 'e', fetchImpl });

    await expect(client.embed('texto')).resolves.toHaveLength(EMBEDDING_DIMENSIONS);
  });

  it('mapea el timeout a ERR_OLLAMA_003', async () => {
    const abortError = Object.assign(new Error('aborted'), { name: 'AbortError' });
    const fetchImpl = vi.fn(async () => {
      throw abortError;
    });
    const client = createOllamaClient({ host: 'http://x', model: 'm', embeddingModel: 'e', fetchImpl });

    await expect(client.generate('p')).rejects.toMatchObject({ code: 'ERR_OLLAMA_003' });
  });

  it('mapea la conexión rechazada a ERR_OLLAMA_001', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('connect ECONNREFUSED');
    });
    const client = createOllamaClient({ host: 'http://x', model: 'm', embeddingModel: 'e', fetchImpl });

    await expect(client.embed('p')).rejects.toMatchObject({ code: 'ERR_OLLAMA_001' });
  });

  it('mapea un 404 a ERR_OLLAMA_002', async () => {
    const fetchImpl = vi.fn(async () => ({ ok: false, status: 404, json: async () => ({}) }));
    const client = createOllamaClient({ host: 'http://x', model: 'llama3.2', embeddingModel: 'e', fetchImpl });

    await expect(client.generate('p')).rejects.toMatchObject({ code: 'ERR_OLLAMA_002' });
  });

  it('sugiere el modelo de embeddings correcto cuando falla /api/embeddings', async () => {
    const fetchImpl = vi.fn(async () => ({ ok: false, status: 404, json: async () => ({}) }));
    const client = createOllamaClient({ host: 'http://x', model: 'llama3.2', embeddingModel: 'nomic-embed-text', fetchImpl });

    await expect(client.embed('p')).rejects.toMatchObject({
      code: 'ERR_OLLAMA_002',
      message: expect.stringContaining('ollama pull nomic-embed-text'),
    });
  });

  it('verifyModels detecta modelos faltantes', async () => {
    const fetchImpl = vi.fn(async () => okResponse({ models: [{ name: 'llama3.2:latest' }] }));
    const client = createOllamaClient({ host: 'http://x', model: 'llama3.2', embeddingModel: 'nomic-embed-text', fetchImpl });

    const result = await client.verifyModels();
    expect(result.missing).toEqual(['nomic-embed-text']);
  });
});
