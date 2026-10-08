# AGENTS.md

## Estado real del repo (verificado)

- Es un repo de **documentación + infraestructura de BD**; el código del bot **aún no existe**. No hay `src/`, `package.json`, `tests/`, `LICENSE` ni `.github/` pese a que README y `docs/00-INDEX.md` los describen.
- Por tanto `npm run dev`, `npm run lint`, `npm test` **aún no funcionan** (están planificados en `docs/nodejs/04-scripts-npm.md`). No los ejecutes ni los afirmes como verificados hasta que exista `package.json`.
- Única rama real: `main`. No existe `develop` (aunque `docs/processes/convenciones.md` lo exige) y el historial commitea directo a `main`. No asumas flujos git que no estén en el repo.

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

## Arquitectura prevista (cuando se implemente `src/`)

Monolito modular Node.js 20+ con capas, ESM (`import`/`export`), documentado en `docs/architecture/01-architecture.md`:

- `src/index.js` (entrada, sesión WhatsApp) → `src/handlers/message.js` (clasifica saludo/pregunta/comando)
- `src/rag/ingest.js` (chunking → embeddings → pgvector), `src/rag/search.js` (top-K + contexto)
- `src/db.js` (Pool pg, máx 10 conexiones, timeout query 5s), `src/config.js` (carga/valida `.env`), `src/ollama.js` (cliente de Ollama)

Estilo (ver `docs/processes/convenciones.md`): 2 espacios, comillas simples `'`, `;` siempre, archivos `snake_case.js`, variables `camelCase`, constantes `UPPER_SNAKE_CASE`, logs formato `[YYYY-MM-DD HH:MM:SS] [LEVEL] [MÓDULO] msg`, errores amigables en español al usuario y detalle solo en logs.

## Esquema de BD (fuente de verdad: `scripts/init-db.sql`)

`documents`, `chunks` (UNIQUE document_id+hash), `embeddings` (VECTOR(768), ivfflat cosine), `sessions`. No hay tool de migraciones; los cambios de esquema se editan ahí + se documentan en `docs/database/02-migraciones.md`.

## Fuentes de verdad

- Proceso/DoD: `docs/processes/definition-of-done.md` (lint + tests + docs + CHANGELOG antes de PR).
- Estado del MVP (H1–H5): `docs/roadmap/01-mvp-corto-plazo.md`.
- Índice maestro: `docs/00-INDEX.md`.
