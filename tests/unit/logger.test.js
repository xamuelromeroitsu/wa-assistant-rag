import { describe, it, expect } from 'vitest';
import { createLogger, formatLogTimestamp } from '../../src/logger.js';

function createSink() {
  const calls = [];
  return {
    calls,
    log: (...args) => calls.push(['log', ...args]),
    warn: (...args) => calls.push(['warn', ...args]),
    error: (...args) => calls.push(['error', ...args]),
  };
}

describe('logger.js', () => {
  it('formatea el timestamp como YYYY-MM-DD HH:MM:SS', () => {
    const timestamp = formatLogTimestamp(new Date('2026-10-15T08:09:10'));
    expect(timestamp).toBe('2026-10-15 08:09:10');
  });

  it('escribe con el formato estándar de logs', () => {
    const sink = createSink();
    const logger = createLogger({ level: 'DEBUG', sink });

    logger.info('whatsapp', 'Sesión conectada');

    expect(sink.calls[0][0]).toBe('log');
    expect(sink.calls[0][1]).toMatch(/^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\] \[INFO\] \[whatsapp\] Sesión conectada$/);
  });

  it('filtra por nivel configurado', () => {
    const sink = createSink();
    const logger = createLogger({ level: 'WARN', sink });

    logger.debug('db', 'detalle');
    logger.info('db', 'info');
    logger.warn('db', 'advertencia');

    expect(sink.calls).toHaveLength(1);
    expect(sink.calls[0][0]).toBe('warn');
  });

  it('adjunta detalles cuando se proveen', () => {
    const sink = createSink();
    const logger = createLogger({ level: 'ERROR', sink });

    logger.error('ollama', 'Timeout', { code: 'ERR_OLLAMA_003' });

    expect(sink.calls[0][0]).toBe('error');
    expect(sink.calls[0][2]).toEqual({ code: 'ERR_OLLAMA_003' });
  });
});
