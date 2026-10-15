import { describe, it, expect } from 'vitest';
import { buildPrompt, SYSTEM_PROMPT, NO_CONTEXT_ANSWER } from '../../../src/domain/prompt.js';

describe('domain/prompt.js', () => {
  it('incluye el system prompt, el contexto y la pregunta', () => {
    const prompt = buildPrompt('contexto recuperado', '¿Qué es la fibra?');
    expect(prompt).toContain(SYSTEM_PROMPT);
    expect(prompt).toContain('contexto recuperado');
    expect(prompt).toContain('¿Qué es la fibra?');
  });

  it('fuerza la respuesta sin contexto cuando no hay fragmentos', () => {
    const prompt = buildPrompt('', '¿Qué es la fibra?');
    expect(prompt).toContain(NO_CONTEXT_ANSWER);
    expect(prompt).not.toContain('Contexto:');
  });
});
