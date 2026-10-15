import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '../../src/config.js';
import { ERROR_CODES } from '../../src/errors.js';

const envExample = readFileSync(
  fileURLToPath(new URL('../../.env.example', import.meta.url)),
  'utf8',
);

const validEnv = {
  PGHOST: 'localhost',
  PGPORT: '5432',
  PGUSER: 'postgres',
  PGPASSWORD: 'secreta',
  PGDATABASE: 'wa_assistant',
  OLLAMA_HOST: 'http://localhost:11434/',
  OLLAMA_MODEL: 'llama3.2',
  EMBEDDING_MODEL: 'nomic-embed-text',
};

describe('config.test.js — .env.example', () => {
  it('define las variables mínimas de PostgreSQL', () => {
    for (const variable of ['PGHOST', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE']) {
      expect(envExample).toMatch(new RegExp(`^${variable}=`, 'm'));
    }
  });

  it('define las variables mínimas de Ollama', () => {
    for (const variable of ['OLLAMA_HOST', 'OLLAMA_MODEL', 'EMBEDDING_MODEL']) {
      expect(envExample).toMatch(new RegExp(`^${variable}=`, 'm'));
    }
  });

  it('define el puerto del servidor interno', () => {
    expect(envExample).toMatch(/^PORT=/m);
  });
});

describe('config.test.js — loadConfig', () => {
  it('devuelve configuración tipada y aplica valores por defecto', () => {
    const config = loadConfig({ ...validEnv });

    expect(config.database).toEqual({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'secreta',
      database: 'wa_assistant',
    });
    expect(config.ollama.host).toBe('http://localhost:11434');
    expect(config.rag.topK).toBe(5);
    expect(config.server.port).toBe(3000);
    expect(config.logging.level).toBe('INFO');
  });

  it('omite la barra final de OLLAMA_HOST', () => {
    const config = loadConfig({ ...validEnv, OLLAMA_HOST: 'http://localhost:11434///' });
    expect(config.ollama.host).toBe('http://localhost:11434');
  });

  it('lanza ERR_CONFIG_001 cuando falta una variable requerida', () => {
    const env = { ...validEnv };
    delete env.PGHOST;

    let error;
    try {
      loadConfig(env);
    } catch (caught) {
      error = caught;
    }

    expect(error?.code).toBe(ERROR_CODES.CONFIG_MISSING);
    expect(error?.details.missing).toContain('PGHOST');
  });

  it('lanza ERR_CONFIG_001 cuando PGPORT no es un entero positivo', () => {
    expect(() => loadConfig({ ...validEnv, PGPORT: 'abc' })).toThrowError();
  });

  it('lanza ERR_CONFIG_001 cuando LOG_LEVEL es inválido', () => {
    let error;
    try {
      loadConfig({ ...validEnv, LOG_LEVEL: 'VERBOSE' });
    } catch (caught) {
      error = caught;
    }
    expect(error?.code).toBe(ERROR_CODES.CONFIG_MISSING);
  });
});
