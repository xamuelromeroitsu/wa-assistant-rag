import { describe, it, expect } from 'vitest';
import { chunkText, normalizeWhitespace, DEFAULT_MAX_CHARS } from '../../../src/domain/chunking.js';

describe('domain/chunking.js', () => {
  it('devuelve un arreglo vacío para texto vacío', () => {
    expect(chunkText('')).toEqual([]);
    expect(chunkText('   \n\n  ')).toEqual([]);
    expect(chunkText(null)).toEqual([]);
  });

  it('normaliza espacios y saltos redundantes', () => {
    expect(normalizeWhitespace('a   b\r\n\r\n\r\nc')).toBe('a b\n\nc');
  });

  it('mantiene un párrafo corto en un único fragmento', () => {
    const chunks = chunkText('La proteína es un macronutriente.');
    expect(chunks).toEqual(['La proteína es un macronutriente.']);
  });

  it('nunca supera el tamaño máximo en texto normal', () => {
    const text = Array.from({ length: 40 }, (_, i) => `Párrafo número ${i} con contenido de prueba.`).join('\n\n');
    const chunks = chunkText(text, { maxChars: 100 });

    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(100);
    }
  });

  it('divide párrafos que exceden el máximo', () => {
    const longSentence = `${'palabra '.repeat(300)}`.trim();
    const chunks = chunkText(longSentence, { maxChars: 50 });

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.length <= 50)).toBe(true);
  });

  it('usa 500 caracteres por defecto', () => {
    expect(DEFAULT_MAX_CHARS).toBe(500);
  });
});
