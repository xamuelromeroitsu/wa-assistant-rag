# 🗺️ Roadmap

> Wa-Assistant RAG · plan de desarrollo general del proyecto.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP) |
| Dueño | Product Owner |

## Metodología

El proyecto se desarrolla con **metodología Scrum** en sprints de **2 semanas**.

## Resumen por horizonte

| Horizonte | Sprints | Duración | Contenido | Historias |
|---|---|---|---|---|
| **Corto plazo** | Sprint 1-3 | 6 semanas | Conexión WhatsApp, saludos, RAG, ingesta, modelo configurable | H1-H5 |
| **Mediano plazo** | Sprint 4-8 | 10 semanas | Multi-usuario, más formatos, dashboard web | H6-H10 |
| **Largo plazo** | Sprint 9-12 | 8 semanas | Cloud API, alta disponibilidad, escalamiento | H11-H15 |

## Historias del MVP (corto plazo)

| ID | Historia | Reto técnico | Prioridad | Desarrollador | Esfuerzo | Fecha | Dependencias | Criterio de aceptación |
|---|---|---|---|---|---|---|---|---|
| H1 | Conectar el bot a WhatsApp escaneando un código QR | Sesión persistente | P0 | Desarrollador | 2 días | 2026-09-15 | Ninguna | QR generado, sesión guardada |
| H2 | Responder a un saludo en menos de 3 segundos | Detección temprana | P0 | Desarrollador | 1 día | 2026-09-15 | H1 | Respuesta < 3s |
| H3 | Responder preguntas usando el contenido de los documentos cargados | Pipeline RAG | P1 | Desarrollador | 4 días | 2026-09-17 | H4 | Bot responde con contexto |
| H4 | Cargar documentos (PDF/TXT) a la base de datos | Ingesta, chunking y embeddings | P1 | Desarrollador | 3 días | 2026-09-16 | Ninguna | PDF procesado, chunks guardados |
| H5 | Cambiar el modelo de IA con una variable de entorno | Configuración y validación | P2 | Desarrollador | 1 día | 2026-09-18 | H1 | Variable env cambia modelo |

## Documentación completa

Para entender a fondo cada parte del proyecto, entra en los documentos de la carpeta `docs/`:

- [Producto](../product/01-product-brief.md) — Visión, alcance y especificaciones.
- [Arquitectura](../architecture/01-architecture.md) — Diseño del sistema y decisiones técnicas.
- [APIs](../apis/01-ollama-local.md) — Contratos de integración con Ollama, WhatsApp y más.
- [Base de datos](../database/01-esquema.md) — Esquema, migraciones, índices y backups.
- [Node.js](../nodejs/01-estructura-modulos.md) — Estructura de módulos, flujo, errores y configuración.
- [Guías](../guides/setup-and-env.md) — Setup, RAG, ingesta y testing.
- [Operación](../operations/runbook.md) — Runbook, troubleshooting y seguridad.
- [Usuario](../user/guia-uso.md) — Guía de uso y preguntas frecuentes.
- [Procesos](../processes/scrum.md) — Scrum, convenciones y criterios de terminado.
- [Futuro](../future/01-roadmap.md) — Migración a WhatsApp Cloud API.

---

↩️ [Volver al índice](../00-INDEX.md)
