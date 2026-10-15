# CHANGELOG

> Wa-Assistant RAG · registro de versiones.

## [v0.1.0] - 2026-10-15

### Código fuente (`src/`)

- Nueva implementación del bot con **arquitectura limpia por capas**:
  - **Dominio (puro, sin dependencias)**: `src/errors.js` (códigos y mensajes amigables), `src/domain/hashing.js`, `src/domain/chunking.js`, `src/domain/message.js` (clasificación de mensajes), `src/domain/context.js` y `src/domain/prompt.js`.
  - **Infraestructura**: `src/config.js` (carga y validación de `.env`), `src/logger.js` (formato `[YYYY-MM-DD HH:MM:SS] [LEVEL] [MÓDULO]`), `src/db.js` (pool pg, timeout 5 s, queries RAG idempotentes), `src/ollama.js` (cliente HTTP con timeouts) y `src/server.js` (`GET /health`).
  - **Casos de uso**: `src/rag/ingest.js` (H4), `src/rag/search.js` (H3) y `src/handlers/message.js` (H2/H3).
  - **Composición**: `src/index.js` (arranque, WhatsApp, cierre limpio con `Ctrl+C`).
- Corregido el fallo de los scripts `dev`, `start` e `ingest`: apuntaban a `src/` sin existir (`ERR_MODULE_NOT_FOUND`).

### Configuración

- Nuevas variables en `.env.example`: `TOP_K` (fragmentos recuperados) y `LOG_LEVEL`.
- `package.json` versionado a `0.1.0`.

### Pruebas

- Vitest con `tests/**/*.test.js` (`vitest.config.js`): 58 tests unitarios de config, errores, logger, dominio, cliente de Ollama, búsqueda, ingesta y handler de mensajes (sin depender de PostgreSQL, Ollama ni WhatsApp).

## [v0.0.1] - 2026-10-08

### Herramientas de desarrollo

- `package.json`: dependencias del bot (`pg`, `whatsapp-web.js`, `dotenv`, `pdf-parse`, `express`) y scripts `dev`, `start`, `ingest`, `test`, `lint`.
- ESLint 10 con config flat y reglas de estilo (2 espacios, comillas simples, `;`).
- Vitest 4 como runner de tests con soporte de cobertura (`@vitest/coverage-v8`).
- Primer test unitario (`tests/unit/config.test.js`) que valida las variables mínimas de `.env.example`.

### Infraestructura

- Script `scripts/setup-db.sh`: levanta y verifica PostgreSQL + pgvector de forma idempotente (crea `.env`, up de compose, espera a PostgreSQL, valida esquema y extensión `vector`).
- `docker-compose.yml`: imagen `pgvector/pgvector` con referencia totalmente calificada y puerto del host configurable vía `PGPORT`.

## [v0.0.0] - 2026-09-09 (MVP en planificación)

### Planificación

- Documentación de producto completada (product-brief, mvp-scope, functional-spec, technical-spec).
- Documentación de arquitectura completada (01-architecture, 02-flujo-datos, 03-adr).
- Documentación de APIs completada (ollama, internal-api, whatsapp-webjs, cloud-api).
- Documentación de procesos completada (scrum, definition-of-done, convenciones).
- Documentación de base de datos completada (esquema, migraciones, consultas, índices, backups).
- Documentación de Node.js completada (estructura, flujo, error-handling, scripts, config).
- Documentación de guías completada (setup, rag-pipeline, ingesta, testing).
- Documentación de roadmap completada (00-roadmap, mvp corto, mediano, largo, backlog).
- Documentación de operación completada (runbook, troubleshooting, seguridad-privacidad).
- Documentación de usuario completada (guia-uso, preguntas-frecuentes).
- Documentación de futuro completada (migration-cloud-api).
- GitHub configurado (workflows CI, issue templates, PR template).
- Estructura de carpetas creada (docs, src, scripts, tests, container).

### Estado

- Proyecto en fase de planificación del MVP.
- Código fuente y dependencias por implementar.
