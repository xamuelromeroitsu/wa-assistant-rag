import { describe, it, expect } from 'vitest';
import { AppError, ERROR_CODES, ERROR_CATEGORIES, friendlyMessage, categoryFor, isAppError, toAppError } from '../../src/errors.js';

describe('errors.js', () => {
  it('crea un AppError con código, categoría y mensaje amigable', () => {
    const error = new AppError(ERROR_CODES.DB_CONNECTION);

    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe(ERROR_CODES.DB_CONNECTION);
    expect(error.category).toBe(ERROR_CATEGORIES.DATABASE);
    expect(error.userMessage).toContain('base de datos');
  });

  it('usa el mensaje explícito para desarrolladores y conserva el amigable', () => {
    const error = new AppError(ERROR_CODES.OLLAMA_MODEL_NOT_FOUND, {
      message: 'detalle técnico',
      details: { model: 'x' },
    });

    expect(error.message).toBe('detalle técnico');
    expect(error.userMessage).toContain('ollama pull');
    expect(error.details).toEqual({ model: 'x' });
  });

  it('devuelve un mensaje genérico para códigos desconocidos', () => {
    expect(friendlyMessage('ERR_UNKNOWN_999')).toContain('error interno');
  });

  it('deriva la categoría desde el prefijo del código', () => {
    expect(categoryFor(ERROR_CODES.FILE_NOT_FOUND)).toBe(ERROR_CATEGORIES.FILE);
    expect(categoryFor(ERROR_CODES.WHATSAPP_QR_REQUIRED)).toBe(ERROR_CATEGORIES.WHATSAPP);
  });

  it('identifica y envuelve errores', () => {
    expect(isAppError(new AppError(ERROR_CODES.DB_QUERY))).toBe(true);
    expect(isAppError(new Error('x'))).toBe(false);

    const wrapped = toAppError(new Error('boom'), ERROR_CODES.DB_QUERY);
    expect(isAppError(wrapped)).toBe(true);
    expect(wrapped.code).toBe(ERROR_CODES.DB_QUERY);

    const same = toAppError(wrapped, ERROR_CODES.DB_CONNECTION);
    expect(same).toBe(wrapped);
  });
});
