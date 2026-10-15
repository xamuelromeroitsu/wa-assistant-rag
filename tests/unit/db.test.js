import { describe, it, expect } from 'vitest';
import { toVectorLiteral, translateDbError, POOL_LIMITS } from '../../src/db.js';
import { AppError, ERROR_CODES } from '../../src/errors.js';

describe('db.js', () => {
  it('genera el literal de vector para pgvector', () => {
    expect(toVectorLiteral([0.1, 0.2, 0.3])).toBe('[0.1,0.2,0.3]');
  });

  it('rechaza vectores vacíos', () => {
    expect(() => toVectorLiteral([])).toThrowError(AppError);
  });

  it('limita el pool a 10 conexiones y 5 s por consulta', () => {
    expect(POOL_LIMITS.max).toBe(10);
    expect(POOL_LIMITS.queryTimeoutMs).toBe(5000);
  });

  it('mapea la conexión rechazada a ERR_DB_001', () => {
    const error = translateDbError({ code: 'ECONNREFUSED', message: 'refused' }, 'ping');
    expect(error.code).toBe(ERROR_CODES.DB_CONNECTION);
    expect(error.category).toBe('PostgreSQL');
    expect(error.userMessage).toContain('PostgreSQL');
  });

  it('mapea los timeouts a ERR_DB_002', () => {
    expect(translateDbError({ code: '57014' }, 'search').code).toBe(ERROR_CODES.DB_QUERY_TIMEOUT);
    expect(translateDbError({ message: 'query timeout' }, 'search').code).toBe(ERROR_CODES.DB_QUERY_TIMEOUT);
  });

  it('mapea el resto a ERR_DB_003 conservando el detalle', () => {
    const error = translateDbError({ code: '42P01', message: 'relation does not exist' }, 'insertDocument');
    expect(error.code).toBe(ERROR_CODES.DB_QUERY);
    expect(error.message).toContain('insertDocument');
  });

  it('no re-envuelve los AppError', () => {
    const original = new AppError(ERROR_CODES.DB_QUERY);
    expect(translateDbError(original, 'x')).toBe(original);
  });
});
