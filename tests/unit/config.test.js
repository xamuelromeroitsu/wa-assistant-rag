import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const envExample = readFileSync(
  fileURLToPath(new URL('../../.env.example', import.meta.url)),
  'utf8',
);

describe('config.test.js', () => {
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
