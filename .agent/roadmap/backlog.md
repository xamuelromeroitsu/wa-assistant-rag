# 📋 Backlog

> Wa-Assistant RAG · lista priorizada de trabajo futuro.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP) |
| Dueño | Product Owner |

## Prioridad Alta

| ID | Historia/Tarea | Descripción | Referencia |
|---|---|---|---|
| B1 | Documentación completa | Escribir todos los docs de la carpeta `docs/` | Ver 00-INDEX.md |
| B2 | Implementar H1 | Conectar WhatsApp por QR | docs/product/03-functional-spec.md |
| B3 | Implementar H2 | Responder saludo | docs/product/03-functional-spec.md |
| B4 | Implementar H3 | Pipeline RAG completo | docs/product/03-functional-spec.md |
| B5 | Implementar H4 | Ingesta de documentos | docs/product/03-functional-spec.md |
| B6 | Implementar H5 | Modelo configurable | docs/product/03-functional-spec.md |

## Prioridad Media

| ID | Historia/Tarea | Descripción | Referencia |
|---|---|---|---|
| B7 | Sistema de tests | Tests unitarios y de integración | docs/guides/testing.md |
| B8 | CI/CD | Pipeline de lint + tests en cada PR | .github/workflows/ci.yml |
| B9 | Dashboard web | Panel de administración para gestión de documentos | docs/roadmap/02-mediano-plazo.md |
| B10 | Más formatos de documento | DOCX, XLSX, CSV | docs/roadmap/02-mediano-plazo.md |

## Prioridad Baja

| ID | Historia/Tarea | Descripción | Referencia |
|---|---|---|---|
| B11 | Historial de conversaciones | Persistir chats anteriores | docs/roadmap/03-largo-plazo.md |
| B12 | Migración a Cloud API | WhatsApp Cloud API de Meta | docs/future/01-roadmap.md |
| B13 | Alta disponibilidad | Clúster de bots | docs/roadmap/03-largo-plazo.md |
| B14 | Integración con otros canales | Telegram, Web Chat | docs/roadmap/03-largo-plazo.md |
| B15 | Optimización de rendimiento | Ajuste de índices, caching | docs/database/04-indices-y-rendimiento.md |

## Reglas del backlog

1. **Priorizar** por valor para el usuario y viabilidad técnica.
2. **No empezar** una historia sin que esté en el backlog.
3. **Mover** historias entre prioridades según evolucione el proyecto.
4. **Todo** cambio de alcance se registra en ADRs ([docs/architecture/03-adr.md](../architecture/03-adr.md)).
5. **Referencia** cruzada con la documentación funcional y técnica.

---

↩️ [Volver al índice](../00-INDEX.md)
