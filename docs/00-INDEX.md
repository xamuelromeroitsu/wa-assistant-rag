# 🧭 Índice de documentación

> Wa-Assistant RAG · guía maestra de la documentación del proyecto.

| Metadatos | Valor |
|---|---|
| Estado | [En revisión](docs/procesos/definition-of-done.md) |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP en planificación) |
| Dueño | Equipo |

## Cómo navegar estos documentos

La documentación está organizada en una jerarquía lógica, del nivel de negocio al nivel operativo:

1. **Producto** — qué se construye y por qué (visión, alcance, especificaciones).
2. **Procesos** — cómo se trabaja (Scrum, criterios de terminado, convenciones).
3. **Técnica** — cómo está diseñado el sistema (arquitectura, APIs, base de datos, Node.js).
4. **Guías** — cómo se usa cada pieza (setup, RAG, ingesta, testing).
5. **Plan y operación** — cuándo llega cada cosa y cómo se opera día a día.

> Empezá por el [README](../README.md) para la vista general y por este índice para profundizar en cualquier tema.

## Mapa del proyecto

```
wa-assistant-rag/
├── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── .github/
│   ├── workflows/ci.yml
│   ├── ISSUE_TEMPLATE/
│   └── pull_request_template.md
└── docs/
    ├── 00-INDEX.md
    ├── producto/
    ├── procesos/
    ├── arquitectura/
    ├── apis/
    ├── base-de-datos/
    ├── nodejs/
    ├── guias/
    ├── usuario/
    ├── roadmap/
    ├── operacion/
    └── futuro/
```

## Categorías

| # | Categoría | Contenido | Docs |
|---|---|---|---|
| 1 | [Producto](docs/producto/) | Product brief, alcance MVP, especificación funcional y técnica | 4 |
| 2 | [Procesos](docs/procesos/) | Scrum, definition of done, convenciones de trabajo | 3 |
| 3 | [Arquitectura](docs/arquitectura/) | Vista general, flujo de datos, decisiones (ADRs) | 3 |
| 4 | [APIs](docs/apis/) | Ollama, API interna, whatsapp-web.js, Cloud API | 4 |
| 5 | [Base de datos](docs/base-de-datos/) | Esquema, migraciones, SQL, índices, backups | 5 |
| 6 | [Node.js](docs/nodejs/) | Módulos, flujo de ejecución, errores, scripts, env | 5 |
| 7 | [Guías](docs/guias/) | Setup, pipeline RAG, ingesta de documentos, testing | 4 |
| 8 | [Usuario](docs/usuario/) | Guía de uso y preguntas frecuentes del bot | 2 |
| 9 | [Roadmap](docs/roadmap/) | Resumen ejecutivo, 3 horizontes, backlog | 5 |
| 10 | [Operación](docs/operacion/) | Runbook, troubleshooting, seguridad y privacidad | 3 |
| 11 | [Futuro](docs/futuro/) | Migración a WhatsApp Cloud API | 1 |

## Archivos de la raíz y CI

| Archivo | Contenido |
|---|---|
| [README](../README.md) | Puerta de entrada: qué hace el proyecto y cómo arrancar |
| [CHANGELOG](../CHANGELOG.md) | Registro de versiones (semver) |
| [CONTRIBUTING](../CONTRIBUTING.md) | Guía de contribución y flujo de trabajo |
| [LICENSE](../LICENSE) | Licencia del proyecto (MIT) |
| [.github/workflows/ci.yml](../.github/workflows/ci.yml) | Pipeline de CI: lint + test en cada PR |
| [.github/ISSUE_TEMPLATE/](../.github/ISSUE_TEMPLATE/) | Plantillas de historias de usuario y bugs |
| [.github/pull_request_template.md](../.github/pull_request_template.md) | Plantilla de pull requests |

## Estado y prioridad de la documentación

| Documento | Estado | Prioridad de creación | Dueño |
|---|---|---|---|
| `docs/00-INDEX.md` | Listo | Alta | Equipo |
| `docs/producto/01-product-brief.md` | Listo | Alta | Product Owner |
| `docs/producto/02-mvp-scope.md` | Listo | Alta | Product Owner |
| `docs/producto/03-functional-spec.md` | Listo | Alta | Product Owner |
| `docs/producto/04-technical-spec.md` | Listo | Alta | Técnico |
| `docs/procesos/scrum.md` | Pendiente | Alta | Scrum Master |
| `docs/procesos/definition-of-done.md` | Pendiente | Media | Scrum Master |
| `docs/procesos/convenciones.md` | Pendiente | Media | Equipo |
| `docs/arquitectura/01-architecture.md` | Pendiente | Alta | Técnico |
| `docs/arquitectura/02-flujo-datos.md` | Pendiente | Alta | Técnico |
| `docs/arquitectura/03-adr.md` | Pendiente | Media | Técnico |
| `docs/apis/01-ollama-api.md` | Pendiente | Media | Técnico |
| `docs/apis/02-internal-api.md` | Pendiente | Media | Técnico |
| `docs/apis/03-whatsapp-webjs.md` | Pendiente | Media | Técnico |
| `docs/apis/04-cloud-api.md` | Pendiente | Baja | Técnico |
| `docs/base-de-datos/01-esquema.md` | Pendiente | Alta | Técnico |
| `docs/base-de-datos/02-migraciones.md` | Pendiente | Media | Técnico |
| `docs/base-de-datos/03-consultas-sql.md` | Pendiente | Media | Técnico |
| `docs/base-de-datos/04-indices-y-rendimiento.md` | Pendiente | Baja | Técnico |
| `docs/base-de-datos/05-backups.md` | Pendiente | Baja | Técnico |
| `docs/nodejs/01-estructura-modulos.md` | Pendiente | Alta | Técnico |
| `docs/nodejs/02-flujo-ejecucion.md` | Pendiente | Media | Técnico |
| `docs/nodejs/03-error-handling.md` | Pendiente | Media | Técnico |
| `docs/nodejs/04-scripts-npm.md` | Pendiente | Media | Técnico |
| `docs/nodejs/05-config-y-env.md` | Pendiente | Media | Técnico |
| `docs/guias/setup-and-env.md` | Pendiente | Alta | Técnico |
| `docs/guias/rag-pipeline.md` | Pendiente | Alta | Técnico |
| `docs/guias/ingesta-documentos.md` | Pendiente | Media | Técnico |
| `docs/guias/testing.md` | Pendiente | Media | Técnico |
| `docs/usuario/guia-uso.md` | Pendiente | Baja | Product Owner |
| `docs/usuario/preguntas-frecuentes.md` | Pendiente | Baja | Product Owner |
| `docs/roadmap/00-roadmap.md` | Pendiente | Alta | Product Owner |
| `docs/roadmap/01-mvp-corto-plazo.md` | Pendiente | Alta | Product Owner |
| `docs/roadmap/02-mediano-plazo.md` | Pendiente | Media | Product Owner |
| `docs/roadmap/03-largo-plazo.md` | Pendiente | Baja | Product Owner |
| `docs/roadmap/backlog.md` | Pendiente | Alta | Product Owner |
| `docs/operacion/runbook.md` | Pendiente | Baja | Técnico |
| `docs/operacion/troubleshooting.md` | Pendiente | Media | Técnico |
| `docs/operacion/seguridad-privacidad.md` | Pendiente | Media | Técnico |
| `docs/futuro/migration-cloud-api.md` | Pendiente | Baja | Técnico |

## Contribuir a la documentación

- **Regla de oro:** al agregar, mover o renombrar un documento, actualizá este índice en el mismo commit.
- Usá la [plantilla de historia de usuario](../.github/ISSUE_TEMPLATE/historia.md) para reportar documentación faltante.
- Seguí las [convenciones](docs/procesos/convenciones.md) de estilo y formato.

---

*Este documento es la puerta de entrada a la documentación del proyecto. Al finalizar cada paso de creación, actualizá su estado y prioridad.*