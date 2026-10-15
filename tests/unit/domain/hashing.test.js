import { describe, it, expect } from 'vitest';
import { sha256 } from '../../../src/domain/hashing.js';

describe('domain/hashing.js', () => {
  it('devuelve un hash SHA-256 hexadecimal de 64 caracteres', () => {
    const hash = sha256('hola');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('es determinista para el mismo contenido', () => {
    expect(sha256('documento')).toBe(sha256('documento'));
  });

  it('cambia ante contenidos distintos', () => {
    expect(sha256('a')).not.toBe(sha256('b'));
  });

  it('acepta Buffer', () => {
    expect(sha256(Buffer.from('hola'))).toBe(sha256('hola'));
  });
});
