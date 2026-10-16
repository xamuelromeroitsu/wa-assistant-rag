# CHANGELOG

> Wa-Assistant RAG · registro de versiones.

## [Sin publicar]

### Vinculación por QR (terminal + PNG)

- **QR escaneable en la terminal**: nuevo `src/qr.js` (`createQrPresenter`) que dibuja el QR en ASCII con `qrcode-terminal`, reemplazando el `console.log(qr)` crudo que no se podía escanear.
- **QR como PNG**: se guarda en `.wwebjs_auth/qr.png` (ruta configurable con `QR_PNG_PATH`) usando `qrcode`; se sobreescribe con cada QR nuevo.
- **Nuevo código de error `ERR_WHATSAPP_003`** con mensaje amigable si falla la escritura del PNG; el QR sigue visible en la terminal.
- **Tests**: 5 casos de `src/qr.js` con dobles + 4 de config para `QR_PNG_PATH` (105 en total, eran 96).

### Verificación del MVP (H4, H5)

- **H4 cerrado con evidencia real**: `tests/fixtures/` con un PDF real (encabezados + tabla) y un TXT de nutrición; nuevo `tests/integration/rag/ingest-h4.test.js` (8 casos) que verifica extracción del PDF, chunking sin pérdida de contenido, idempotencia por hash, errores parciales sin abortar el lote, disponibilidad de los fragmentos para H3 **sin reiniciar el bot** y la advertencia de H5.
- **H5 cerrado**: si `EMBEDDING_MODEL` no coincide con los embeddings almacenados, la búsqueda ahora lo advierte explícitamente (`src/rag/search.js` + `src/db.js#listEmbeddingModels`) en lugar de devolver cero resultados en silencio.
- **CI**: `.github/workflows/ci.yml` corre `npm run lint` + `npm test` en cada push/PR a `main` (matriz Ubuntu + Windows, Node 20/22).

### Correcciones detectadas por la demo con servicios reales

- **Ingesta transaccional** (`src/rag/ingest.js` + `src/db.js#withTransaction`): los embeddings se generan *antes* de tocar la BD y la persistencia (documento + fragmentos + embeddings) va en una transacción con rollback. Una corrida fallida ya no deja documentos huérfanos (ver `.agent/guides/demo-mvp.md`).
- **Mensaje de error 404 de Ollama corregido**: cuando falta el modelo de embeddings sugiere `ollama pull nomic-embed-text` (antes siempre sugería el modelo de generación).
- **Timeouts de Ollama configurables**: `OLLAMA_GENERATE_TIMEOUT_MS`, `OLLAMA_EMBEDDINGS_TIMEOUT_MS` y `OLLAMA_TAGS_TIMEOUT_MS` (defaults 30000/15000/5000). El default de 30 s quedaba corto en CPU con prompts RAG largos.

### Herramientas nuevas

- `scripts/ask.js`: hace una pregunta al asistente sin WhatsApp (`node scripts/ask.js "<pregunta>"`).
- `scripts/db-status.js`: estado de la BD (documentos, fragmentos, modelos de embeddings) con aviso de modelo no coincidente.

### Documentación

- Nuevo `.agent/guides/vinculacion-qr.md`: guía de vinculación por QR (terminal + PNG, ciclo de vida, `QR_PNG_PATH`, solución de problemas); enlazada desde `.agent/00-INDEX.md` (categoría Guías) y `README.md`.
- `.agent/apis/03-whatsapp-webjs.md` y `.agent/nodejs/05-config-y-env.md` documentan la variable `QR_PNG_PATH` y enlazan la guía.
- Nuevo `.agent/guides/demo-mvp.md`: corrida manual documentada contra PostgreSQL 16 + pgvector y Ollama reales (2 documentos, 6 fragmentos, respuesta fundamentada, idempotencia verificada).
- Nuevo `.agent/architecture/04-analisis-src.md`: auditoría de `src/` con puntos fuertes, debilidades (umbral de distancia ausente, chunking sin overlap, sin rate-limiting ni caché de embeddings, tabla `sessions` sin uso) y hoja de ruta de escalabilidad en 4 fases.
- `README.md`: roadmap H4/H5 marcados como completos, enlaces de documentación corregidos a las rutas reales de `.agent/`, estructura actualizada (scripts, CI).
- **Tests**: 96 en total (eran 58); `npm run lint` limpio.

### Notas de entorno

- `.env` creado en esta máquina con `PGPORT=5433` (el 5432 local estaba ocupado por otra instancia de PostgreSQL) y `OLLAMA_GENERATE_TIMEOUT_MS=180000`.

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
