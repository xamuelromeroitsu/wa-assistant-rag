# 🧭 Documentation Index

> Wa-Assistant RAG · master guide of the project documentation.

| Metadata | Value |
|---|---|
| Status | [Under review](processes/definition-of-done.md) |
| Last updated | 2026-09-09 |
| Version | v0.0.0 (MVP in planning) |
| Owner | Team |

## How to navigate these documents

Documentation is organized hierarchically, from the business level to the operational level:

1. **Product** — what is being built and why (vision, scope, specifications).
2. **Processes** — how we work (Scrum, definition of done, conventions).
3. **Technical** — how the system is designed (architecture, APIs, database, Node.js).
4. **Guides** — how to use each piece (setup, RAG, ingestion, testing).
5. **Plan and Operation** — when each thing arrives and how it is operated day by day.

> Start with the [README](../README.md) for the overview and this index to go deeper into any topic.

## Project Map

```
wa-assistant-rag/
├── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── .env.example
├── package.json
├── docker-compose.yml
├── .github/
│   ├── workflows/ci.yml
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug.md
│   │   └── historia.md
│   └── pull_request_template.md
├── src/
│   ├── index.js
│   ├── config.js
│   ├── db.js
│   ├── ollama.js
│   ├── handlers/
│   │   └── message.js
│   └── rag/
│       ├── ingest.js
│       └── search.js
├── scripts/
│   └── init-db.sql
├── docs/
│   ├── 00-INDEX.md
│   ├── product/
│   │   ├── 01-product-brief.md
│   │   ├── 02-mvp-scope.md
│   │   ├── 03-functional-spec.md
│   │   └── 04-technical-spec.md
│   ├── processes/
│   │   ├── scrum.md
│   │   ├── definition-of-done.md
│   │   └── convenciones.md
│   ├── architecture/
│   │   ├── 01-architecture.md
│   │   ├── 02-flujo-datos.md
│   │   └── 03-adr.md
│   ├── apis/
│   │   ├── 01-ollama-local.md
│   │   ├── 02-internal-api.md
│   │   ├── 03-whatsapp-webjs.md
│   │   └── 04-cloud-api.md
│   ├── database/
│   │   ├── 01-esquema.md
│   │   ├── 02-migraciones.md
│   │   ├── 03-consultas-sql.md
│   │   ├── 04-indices-y-rendimiento.md
│   │   └── 05-backups.md
│   ├── nodejs/
│   │   ├── 01-estructura-modulos.md
│   │   ├── 02-flujo-ejecucion.md
│   │   ├── 03-error-handling.md
│   │   ├── 04-scripts-npm.md
│   │   └── 05-config-y-env.md
│   ├── guides/
│   │   ├── setup-and-env.md
│   │   ├── rag-pipeline.md
│   │   ├── ingesta-documentos.md
│   │   └── testing.md
│   ├── roadmap/
│   │   ├── 00-roadmap.md
│   │   ├── 01-mvp-corto-plazo.md
│   │   ├── 02-mediano-plazo.md
│   │   ├── 03-largo-plazo.md
│   │   └── backlog.md
│   ├── operations/
│   │   ├── runbook.md
│   │   ├── troubleshooting.md
│   │   └── seguridad-privacidad.md
│   ├── user/
│   │   ├── guia-uso.md
│   │   └── preguntas-frecuentes.md
│   └── future/
│       ├── 00-roadmap.md
│       └── 01-roadmap.md
```

## Categories

| # | Category | Content | Docs |
|---|---|---|---|
| 1 | [Product](product/01-product-brief.md) | Product brief, MVP scope, functional and technical specifications | 4 |
| 2 | [Processes](processes/scrum.md) | Scrum, definition of done, work conventions | 3 |
| 3 | [Architecture](architecture/01-architecture.md) | System overview, data flow, architectural decisions (ADRs) | 3 |
| 4 | [APIs](apis/01-ollama-local.md) | Ollama, API interna, whatsapp-web.js, Cloud API | 4 |
| 5 | [Database](database/01-esquema.md) | Schema, migrations, SQL, indexes, backups | 5 |
| 6 | [Node.js](nodejs/01-estructura-modulos.md) | Modules, execution flow, errors, scripts, env config | 5 |
| 7 | [Guides](guides/setup-and-env.md) | Setup, RAG pipeline, document ingestion, testing | 4 |
| 8 | [User](user/guia-uso.md) | Usage guide and frequently asked questions | 2 |
| 9 | [Roadmap](roadmap/00-roadmap.md) | Executive summary, 3 horizons, backlog | 5 |
| 10 | [Operations](operations/runbook.md) | Runbook, troubleshooting, security and privacy | 3 |
| 11 | [Future](future/01-roadmap.md) | Migration to WhatsApp Cloud API | 2 |

## Root Files and CI

| File | Content |
|---|---|
| [README](../README.md) | Entry point: what the project does and how to start |
| [CHANGELOG](../CHANGELOG.md) | Version history (semver) |
| [CONTRIBUTING](../CONTRIBUTING.md) | Contribution guide and workflow |
| [LICENSE](../LICENSE) | MIT License |
| [.env.example](../.env.example) | Configuration template |
| [package.json](../package.json) | Dependencies and npm scripts |
| [docker-compose.yml](../docker-compose.yml) | PostgreSQL + pgvector definition |
| [scripts/init-db.sql](../scripts/init-db.sql) | Database initialization script |
| [.github/workflows/ci.yml](../.github/workflows/ci.yml) | CI pipeline: lint + tests on every PR |
| [.github/ISSUE_TEMPLATE/](../.github/ISSUE_TEMPLATE/) | User story and bug issue templates |
| [.github/pull_request_template.md](../.github/pull_request_template.md) | Pull request template |

## Status and Priority

| Document | Status | Priority | Owner |
|---|---|---|---|
| `docs/00-INDEX.md` | Ready | High | Team |
| `docs/product/01-product-brief.md` | Ready | High | Product Owner |
| `docs/product/02-mvp-scope.md` | Ready | High | Product Owner |
| `docs/product/03-functional-spec.md` | Ready | High | Product Owner |
| `docs/product/04-technical-spec.md` | Ready | High | Technical |
| `docs/processes/scrum.md` | Ready | High | Scrum Master |
| `docs/processes/definition-of-done.md` | Ready | Medium | Scrum Master |
| `docs/processes/convenciones.md` | Ready | Medium | Team |
| `docs/architecture/01-architecture.md` | Ready | High | Technical |
| `docs/architecture/02-flujo-datos.md` | Ready | High | Technical |
| `docs/architecture/03-adr.md` | Ready | Medium | Technical |
| `docs/apis/01-ollama-local.md` | Ready | Medium | Technical |
| `docs/apis/02-internal-api.md` | Ready | Medium | Technical |
| `docs/apis/03-whatsapp-webjs.md` | Ready | Medium | Technical |
| `docs/apis/04-cloud-api.md` | Pending | Low | Technical |
| `docs/database/01-esquema.md` | Ready | High | Technical |
| `docs/database/02-migraciones.md` | Ready | Medium | Technical |
| `docs/database/03-consultas-sql.md` | Ready | Medium | Technical |
| `docs/database/04-indices-y-rendimiento.md` | Ready | Low | Technical |
| `docs/database/05-backups.md` | Ready | Low | Technical |
| `docs/nodejs/01-estructura-modulos.md` | Ready | High | Technical |
| `docs/nodejs/02-flujo-ejecucion.md` | Ready | Medium | Technical |
| `docs/nodejs/03-error-handling.md` | Ready | Medium | Technical |
| `docs/nodejs/04-scripts-npm.md` | Ready | Medium | Technical |
| `docs/nodejs/05-config-y-env.md` | Ready | Medium | Technical |
| `docs/guides/setup-and-env.md` | Ready | High | Technical |
| `docs/guides/rag-pipeline.md` | Ready | High | Technical |
| `docs/guides/ingesta-documentos.md` | Ready | Medium | Technical |
| `docs/guides/testing.md` | Ready | Medium | Technical |
| `docs/user/guia-uso.md` | Ready | Low | Product Owner |
| `docs/user/preguntas-frecuentes.md` | Ready | Low | Product Owner |
| `docs/roadmap/00-roadmap.md` | Ready | High | Product Owner |
| `docs/roadmap/01-mvp-corto-plazo.md` | Ready | High | Product Owner |
| `docs/roadmap/02-mediano-plazo.md` | Pending | Medium | Product Owner |
| `docs/roadmap/03-largo-plazo.md` | Pending | Low | Product Owner |
| `docs/roadmap/backlog.md` | Ready | High | Product Owner |
| `docs/operations/runbook.md` | Ready | Low | Technical |
| `docs/operations/troubleshooting.md` | Ready | Medium | Technical |
| `docs/operations/seguridad-privacidad.md` | Ready | Medium | Technical |
| `docs/future/00-roadmap.md` | Pending | Low | Technical |
| `docs/future/01-roadmap.md` | Pending | Low | Technical |

## Contributing to Documentation

- **Golden rule:** when adding, moving, or renaming a document, update this index in the same commit.
- Use the [user story template](../.github/ISSUE_TEMPLATE/historia.md) to report missing documentation.
- Follow the [conventions](processes/convenciones.md) for style and format.

---

*This document is the entry point to the project documentation. After completing each step, update its status and priority.*
