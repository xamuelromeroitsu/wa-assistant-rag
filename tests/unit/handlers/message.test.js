import { describe, it, expect, vi } from 'vitest';
import { createMessageHandler, GREETING_REPLY, HELP_REPLY, NO_CONTEXT_REPLY } from '../../../src/handlers/message.js';

function makeHandler(overrides = {}) {
  const search = {
    search: vi.fn(async () => ({
      fragments: [{ texto: 'La proteína aporta 4 kcal por gramo.', nombre: 'nutricion.pdf' }],
      context: '[Fragmento 1 | Fuente: nutricion.pdf]\nLa proteína aporta 4 kcal por gramo.',
    })),
  };
  const ollama = { generate: vi.fn(async () => 'respuesta generada') };
  const handler = createMessageHandler({ search, ollama, getBotId: () => null, ...overrides });
  return { handler, search, ollama };
}

describe('handlers/message.js', () => {
  it('responde a un saludo sin disparar RAG', async () => {
    const { handler, search, ollama } = makeHandler();

    const result = await handler.handle({ body: 'hola', from: 'a@c.us' });

    expect(result).toEqual({ action: 'reply', text: GREETING_REPLY });
    expect(search.search).not.toHaveBeenCalled();
    expect(ollama.generate).not.toHaveBeenCalled();
  });

  it('responde a un comando con la ayuda', async () => {
    const { handler } = makeHandler();
    const result = await handler.handle({ body: 'ayuda' });
    expect(result.text).toBe(HELP_REPLY);
  });

  it('ignora mensajes con multimedia', async () => {
    const { handler, search } = makeHandler();
    const result = await handler.handle({ body: 'mira esto', hasMedia: true });
    expect(result).toEqual({ action: 'ignored', reason: 'media' });
    expect(search.search).not.toHaveBeenCalled();
  });

  it('ignora mensajes de grupo sin mención', async () => {
    const { handler } = makeHandler();
    const result = await handler.handle({ body: '¿qué es la fibra?', isGroup: true });
    expect(result).toEqual({ action: 'ignored', reason: 'group' });
  });

  it('procesa una pregunta con contexto y llama a Ollama', async () => {
    const { handler, search, ollama } = makeHandler();

    const result = await handler.handle({ body: '¿Cuántas kcal tiene la proteína?' });

    expect(search.search).toHaveBeenCalledWith('¿Cuántas kcal tiene la proteína?');
    expect(ollama.generate).toHaveBeenCalledWith(expect.stringContaining('La proteína aporta 4 kcal por gramo.'));
    expect(result).toEqual({ action: 'reply', text: 'respuesta generada' });
  });

  it('responde sin contexto cuando no hay fragmentos y no llama a Ollama', async () => {
    const { handler, ollama } = makeHandler({
      search: { search: vi.fn(async () => ({ fragments: [], context: '' })) },
    });

    const result = await handler.handle({ body: '¿Qué es el colágeno?' });

    expect(result).toEqual({ action: 'reply', text: NO_CONTEXT_REPLY });
    expect(ollama.generate).not.toHaveBeenCalled();
  });

  it('ignora mensajes vacíos', async () => {
    const { handler } = makeHandler();
    const result = await handler.handle({ body: '   ' });
    expect(result).toEqual({ action: 'ignored', reason: 'empty' });
  });
});
