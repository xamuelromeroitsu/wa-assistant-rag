import { describe, it, expect } from 'vitest';
import { buildContext, DEFAULT_CONTEXT_MAX_CHARS } from '../../../src/domain/context.js';

const fragments = [
  { texto: 'La proteína aporta 4 kcal por gramo.', nombre: 'nutricion.pdf' },
  { texto: 'Las vitaminas son micronutrientes.', nombre: 'vitaminas.txt' },
];

describe('domain/context.js', () => {
  it('devuelve cadena vacía sin fragmentos útiles', () => {
    expect(buildContext([])).toBe('');
    expect(buildContext([{ texto: '   ' }])).toBe('');
    expect(buildContext(null)).toBe('');
  });

  it('incluye el texto y la fuente de cada fragmento', () => {
    const context = buildContext(fragments);
    expect(context).toContain('La proteína aporta 4 kcal por gramo.');
    expect(context).toContain('nutricion.pdf');
    expect(context).toContain('vitaminas.txt');
  });

  it('respeta el presupuesto de caracteres', () => {
    const context = buildContext(fragments, { maxChars: 120 });
    expect(context.length).toBeLessThanOrEqual(120);
  });

  it('expone el límite por defecto', () => {
    expect(DEFAULT_CONTEXT_MAX_CHARS).toBe(4000);
  });
});
