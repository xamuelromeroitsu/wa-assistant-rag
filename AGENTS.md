# AGENTS.md

## Estado real del repo (verificado)

- Ya existe el **código del bot** en `src/` (v0.1.0), además de `package.json`, `eslint.config.js`, `vitest.config.js` y `tests/`. Sigue sin haber `LICENSE` ni `.github/` pese a que README y `.agent/00-INDEX.md` los describen.
- `npm run dev`, `npm run start`, `npm run ingest`, `npm run lint` y `npm test` **sí funcionan**. `npm test` corre 58 tests unitarios sin necesitar PostgreSQL/Ollama/WhatsApp; `npm run dev` exige PostgreSQL y Ollama arriba (si no, falla con mensaje amigable).
- Arquitectura por capas: dominio puro en `src/domain/` + `src/errors.js`; infraestructura en `src/config.js`, `src/logger.js`, `src/db.js`, `src/ollama.js`, `src/server.js`; casos de uso en `src/rag/` y `src/handlers/`; composición en `src/index.js`.
- Única rama real: `main`. No existe `develop` (aunque `.agent/processes/convenciones.md` lo exige) y el historial commitea directo a `main`. No asumas flujos git que no estén en el repo.

## Comandos que sí existen

```bash
podman compose up -d            # PostgreSQL 16 + pgvector (docker compose funciona igual)
podman compose down -v          # BORRA datos; único modo de re-ejecutar init-db.sql
podman exec -it wa-assistant-db psql -U postgres -d wa_assistant
ollama pull llama3.2            # modelo de generación
ollama pull nomic-embed-text    # embeddings: deben ser 768 dims (schema VECTOR(768))
```

Gotchas de infra:
- `scripts/init-db.sql` solo corre la **primera vez** que se crea el volumen `pgdata`; editar el SQL no tiene efecto sobre volúmenes existentes.
- `docker-compose.yml` inyecta `POSTGRES_PASSWORD` desde `PGPASSWORD` del `.env`; si cambias la password hay que recrear el volumen (`down -v`).
- `.env` nunca se sube (está en `.gitignore`); plantilla en `.env.example`.

## Convenciones de documentación (las más enforcement)

- Todo en **español**: docs, mensajes al usuario, commits (`feat: ...`, `fix: ...`, `docs: ...`).
- Formato de doc: título con emoji → tabla de metadatos (Estado/Última actualización/Versión/Dueño) → secciones `##` → enlace final ``↩️ [Volver al índice](../00-INDEX.md)`` (relativo al doc).
- **Regla de oro:** al agregar/mover/renombrar un doc, actualizar `docs/00-INDEX.md` **en el mismo commit**; los docs nuevos se listan con Estado y Prioridad.
- Cierre de tarea también pide actualizar `CHANGELOG.md` (ver `CONTRIBUTING.md` y `docs/processes/definition-of-done.md`).

## Gotchas de enlaces

- Los directorios de `docs/` reales están en **inglés** (`product/`, `processes/`, `architecture/`, `database/`, `guides/`, ...), pero `docs/00-INDEX.md` enlaza rutas en español (`docs/producto/`, ...). Muchos enlaces del índice y del README apuntan a archivos inexistentes (`docs/01_architecture.md`, etc.). Al enlazar, verifica la ruta real con glob antes de escribirla.
- Al modificar el índice, corregí (no dupliques) las rutas rotas que toques.

## Arquitectura de `src/` (implementada)

Monolito modular Node.js 20+ con capas y Clean Architecture, ESM (`import`/`export`):

- `src/index.js` (composición/entrada, sesión WhatsApp, cierre limpio) → `src/handlers/message.js` (clasifica saludo/pregunta/comando).
- `src/rag/ingest.js` (chunking → embeddings → pgvector), `src/rag/search.js` (top-K + contexto).
- Infraestructura: `src/db.js` (Pool pg, máx 10 conexiones, timeout query 5s), `src/config.js` (`loadConfig(env)` puro), `src/ollama.js` (cliente HTTP con timeouts), `src/logger.js` (formato `[YYYY-MM-DD HH:MM:SS] [LEVEL] [MÓDULO]`), `src/server.js` (`GET /health`).
- Dominio puro (sin I/O): `src/domain/` (`hashing`, `chunking`, `message`, `context`, `prompt`) y `src/errors.js` (códigos `ERR_*` + mensajes amigables).

Inyección de dependencias: los casos de uso reciben `{ db, ollama, logger }`; por eso los tests los reemplazan por dobles sin tocar infraestructura.

Estilo (ver `docs/processes/convenciones.md`): 2 espacios, comillas simples `'`, `;` siempre, archivos `snake_case.js`, variables `camelCase`, constantes `UPPER_SNAKE_CASE`, logs formato `[YYYY-MM-DD HH:MM:SS] [LEVEL] [MÓDULO] msg`, errores amigables en español al usuario y detalle solo en logs.

## Esquema de BD (fuente de verdad: `scripts/init-db.sql`)

`documents`, `chunks` (UNIQUE document_id+hash), `embeddings` (VECTOR(768), ivfflat cosine), `sessions`. No hay tool de migraciones; los cambios de esquema se editan ahí + se documentan en `docs/database/02-migraciones.md`.

## Fuentes de verdad

- Proceso/DoD: `docs/processes/definition-of-done.md` (lint + tests + docs + CHANGELOG antes de PR).
- Estado del MVP (H1–H5): `docs/roadmap/01-mvp-corto-plazo.md`.
- Índice maestro: `docs/00-INDEX.md`.
