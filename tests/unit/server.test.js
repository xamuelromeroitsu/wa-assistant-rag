import { afterEach, describe, it, expect, vi } from 'vitest';
import { createHealthApp, startHealthServer } from '../../src/server.js';

let server;

function makeApp() {
  return createHealthApp({
    db: { ping: vi.fn(async () => true) },
    ollama: { listModels: vi.fn(async () => ['llama3.2']) },
    getWhatsappState: () => 'connected',
  });
}

async function request(app) {
  server = app.listen(0);
  await new Promise((resolve) => server.on('listening', resolve));
  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/health`);
  return { status: response.status, body: await response.json() };
}

afterEach(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    server = null;
  }
});

describe('server.js', () => {
  it('responde 200 con todos los servicios conectados', async () => {
    const app = createHealthApp({
      db: { ping: vi.fn(async () => true) },
      ollama: { listModels: vi.fn(async () => ['llama3.2']) },
      getWhatsappState: () => 'connected',
    });

    const { status, body } = await request(app);

    expect(status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.services).toEqual({ database: 'connected', ollama: 'connected', whatsapp: 'connected' });
    expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('responde 503 degraded cuando PostgreSQL no responde', async () => {
    const app = createHealthApp({
      db: { ping: vi.fn(async () => { throw new Error('down'); }) },
      ollama: { listModels: vi.fn(async () => ['llama3.2']) },
      getWhatsappState: () => 'connected',
    });

    const { status, body } = await request(app);

    expect(status).toBe(503);
    expect(body.status).toBe('degraded');
    expect(body.services.database).toBe('disconnected');
    expect(body.error).toContain('down');
  });

  it('marca ollama como desconectado cuando falla', async () => {
    const app = createHealthApp({
      db: { ping: vi.fn(async () => true) },
      ollama: { listModels: vi.fn(async () => { throw new Error('sin ollama'); }) },
      getWhatsappState: () => 'disconnected',
    });

    const { status, body } = await request(app);

    expect(status).toBe(503);
    expect(body.services.ollama).toBe('disconnected');
    expect(body.services.whatsapp).toBe('disconnected');
  });

  it('lanza ERR_CONFIG_002 si el puerto ya está en uso', async () => {
    const first = makeApp().listen(0);
    await new Promise((resolve) => first.on('listening', resolve));
    const { port } = first.address();

    try {
      await expect(startHealthServer({ app: makeApp(), port })).rejects.toMatchObject({
        code: 'ERR_CONFIG_002',
      });
    } finally {
      await new Promise((resolve) => first.close(resolve));
    }
  });
});
