import { describe, it, expect } from 'vitest';
import { classifyMessage, isGreeting, isCommand, normalizeText, MESSAGE_TYPES } from '../../../src/domain/message.js';

describe('domain/message.js', () => {
  it('normaliza tildes, mayúsculas y signos', () => {
    expect(normalizeText('  ¡HOLÁ, buenas!  ')).toBe('hola buenas');
  });

  it('reconoce saludos con variaciones', () => {
    for (const text of ['hola', 'HOLA', 'Holá', 'buenas', 'hey', 'hola buenas', 'buenos días', 'qué tal']) {
      expect(isGreeting(text)).toBe(true);
    }
  });

  it('no confunde una pregunta con un saludo', () => {
    expect(isGreeting('hola, ¿qué es la proteína?')).toBe(false);
    expect(isCommand('¿qué es la proteína?')).toBe(false);
  });

  it('clasifica saludo, comando, pregunta y vacío', () => {
    expect(classifyMessage('hola')).toBe(MESSAGE_TYPES.GREETING);
    expect(classifyMessage('ayuda')).toBe(MESSAGE_TYPES.COMMAND);
    expect(classifyMessage('¿Qué es la vitamina C?')).toBe(MESSAGE_TYPES.QUESTION);
    expect(classifyMessage('    ')).toBe(MESSAGE_TYPES.EMPTY);
  });

  it('trata símbolos o solo espacios como vacío', () => {
    expect(classifyMessage('...')).toBe(MESSAGE_TYPES.EMPTY);
  });
});
