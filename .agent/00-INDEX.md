# 🧭 Índice de documentación

> Wa-Assistant RAG · guía maestra de la documentación del proyecto.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-10-15 |
| Versión asociada | v0.1.0 |
| Dueño | Equipo |

## Cómo navegar estos documentos

La documentación vive en la carpeta `.agent/` y está organizada en una jerarquía lógica, del nivel de negocio al nivel operativo:

1. **Producto** — qué se construye y por qué (visión, alcance, especificaciones).
2. **Procesos** — cómo se trabaja (Scrum, criterios de terminado, convenciones).
3. **Técnica** — cómo está diseñado el sistema (arquitectura, APIs, base de datos, Node.js).
4. **Guías** — cómo se usa cada pieza (setup, RAG, ingesta, testing, demo).
5. **Plan y operación** — cuándo llega cada cosa y cómo se opera día a día.

> Empezá por el [README](../README.md) para la vista general y por este índice para profundizar en cualquier tema.

## Mapa del proyecto

```
wa-assistant-rag/
├── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── AGENTS.md                  # Instrucciones para agentes: estado real del repo
├── .github/
│   └── workflows/ci.yml       # lint + tests en cada push/PR a main
├── .agent/                   # Documentación completa (este índice)
│   ├── 00-INDEX.md
│   ├── product/
│   ├── processes/
│   ├── architecture/
│   ├── apis/
│   ├── database/
│   ├── nodejs/
│   ├── guides/
│   ├── user/
│   ├── roadmap/
│   ├── operations/
│   └── future/
├── src/                       # Código del asistente
├── tests/                     # Pruebas (unitarias, integración y fixtures)
├── scripts/                   # SQL de inicialización y utilidades de consola
├── container/                 # Definición de PostgreSQL + pgvector
└── docker-compose.yml
```

## Categorías

| # | Categoría | Contenido | Docs |
|---|---|---|---|
| 1 | [Producto](product/) | Product brief, alcance MVP, especificación funcional y técnica | 4 |
| 2 | [Procesos](processes/) | Scrum, definition of done, convenciones de trabajo | 3 |
| 3 | [Arquitectura](architecture/) | Vista general, flujo de datos, decisiones (ADRs) y análisis de `src/` | 4 |
| 4 | [APIs](apis/) | Ollama, API interna, whatsapp-web.js, Cloud API | 4 |
| 5 | [Base de datos](database/) | Esquema, migraciones, SQL, índices, backups | 5 |
| 6 | [Node.js](nodejs/) | Módulos, flujo de ejecución, errores, scripts, env | 5 |
| 7 | [Guías](guides/) | Setup, pipeline RAG, ingesta de documentos, testing y demo del MVP | 5 |
| 8 | [Usuario](user/) | Guía de uso y preguntas frecuentes del bot | 2 |
| 9 | [Roadmap](roadmap/) | Resumen ejecutivo, 3 horizontes, backlog | 5 |
| 10 | [Operación](operations/) | Runbook, troubleshooting, seguridad y privacidad | 3 |
| 11 | [Futuro](future/) | Migración a WhatsApp Cloud API | 2 |

## Archivos de la raíz y CI

| Archivo | Contenido |
|---|---|
| [README](../README.md) | Puerta de entrada: qué hace el proyecto y cómo arrancar |
| [CHANGELOG](../CHANGELOG.md) | Registro de versiones (semver) |
| [CONTRIBUTING](../CONTRIBUTING.md) | Guía de contribución y flujo de trabajo |
| [LICENSE](../LICENSE) | Licencia del proyecto (MIT) |
| [AGENTS.md](../AGENTS.md) | Instrucciones para agentes: estado real del repo y convenciones |
| [.github/workflows/ci.yml](../.github/workflows/ci.yml) | Pipeline de CI: lint + test en cada PR |

## Estado de la documentación

| Documento | Estado | Prioridad | Dueño |
|---|---|---|---|
| `product/01-product-brief.md` | Listo | Alta | Product Owner |
| `product/02-mvp-scope.md` | Listo | Alta | Product Owner |
| `product/03-functional-spec.md` | Listo | Alta | Product Owner |
| `product/04-technical-spec.md` | Listo | Alta | Técnico |
| `processes/scrum.md` | Listo | Alta | Scrum Master |
| `processes/definition-of-done.md` | Listo | Media | Scrum Master |
| `processes/convenciones.md` | Listo | Media | Equipo |
| `architecture/01-architecture.md` | Listo | Alta | Técnico |
| `architecture/02-flujo-datos.md` | Listo | Alta | Técnico |
| `architecture/03-adr.md` | Listo | Media | Técnico |
| `architecture/04-analisis-src.md` | Listo | Alta | Equipo |
| `apis/01-ollama-local.md` | Listo | Media | Técnico |
| `apis/02-internal-api.md` | Listo | Media | Técnico |
| `apis/03-whatsapp-webjs.md` | Listo | Media | Técnico |
| `apis/04-cloud-api.md` | Listo | Baja | Técnico |
| `database/01-esquema.md` | Listo | Alta | Técnico |
| `database/02-migraciones.md` | Listo | Media | Técnico |
| `database/03-consultas-sql.md` | Listo | Media | Técnico |
| `database/04-indices-y-rendimiento.md` | Listo | Baja | Técnico |
| `database/05-backups.md` | Listo | Baja | Técnico |
| `nodejs/01-estructura-modulos.md` | Listo | Alta | Técnico |
| `nodejs/02-flujo-ejecucion.md` | Listo | Media | Técnico |
| `nodejs/03-error-handling.md` | Listo | Media | Técnico |
| `nodejs/04-scripts-npm.md` | Listo | Media | Técnico |
| `nodejs/05-config-y-env.md` | Listo | Media | Técnico |
| `guides/setup-and-env.md` | Listo | Alta | Técnico |
| `guides/rag-pipeline.md` | Listo | Alta | Técnico |
| `guides/ingesta-documentos.md` | Listo | Media | Técnico |
| `guides/demo-mvp.md` | Listo | Alta | Equipo |
| `guides/testing.md` | Listo | Media | Técnico |
| `user/guia-uso.md` | Listo | Baja | Product Owner |
| `user/preguntas-frecuentes.md` | Listo | Baja | Product Owner |
| `roadmap/00-roadmap.md` | Listo | Alta | Product Owner |
| `roadmap/01-mvp-corto-plazo.md` | Listo | Alta | Product Owner |
| `roadmap/02-mediano-plazo.md` | Listo | Media | Product Owner |
| `roadmap/03-largo-plazo.md` | Listo | Baja | Product Owner |
| `roadmap/backlog.md` | Listo | Alta | Product Owner |
| `operations/runbook.md` | Listo | Baja | Técnico |
| `operations/troubleshooting.md` | Listo | Media | Técnico |
| `operations/seguridad-privacidad.md` | Listo | Media | Técnico |
| `future/00-roadmap.md` | Listo | Baja | Técnico |
| `future/01-roadmap.md` | Listo | Baja | Técnico |

## Contribuir a la documentación

- **Regla de oro:** al agregar, mover o renombrar un documento, actualizá este índice en el mismo commit.
- Seguí las [convenciones](processes/convenciones.md) de estilo y formato.
- Toda la documentación va en **español** (ver [CONTRIBUTING](../CONTRIBUTING.md)).

---

* Este documento es la puerta de entrada a la documentación del proyecto. Al finalizar cada paso de creación, actualizá su estado y prioridad.*
