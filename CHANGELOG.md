# CHANGELOG

> Wa-Assistant RAG · registro de versiones.

## [v0.0.1] - 2026-10-08

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
