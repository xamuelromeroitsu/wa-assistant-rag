# 🔮 Largo Plazo

> Wa-Assistant RAG · visión futura y migraciones.

| Metadatos | Valor |
|---|---|
| Estado | Pendiente |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.2.0+ (Largo plazo) |
| Dueño | Product Owner |

## Historias planificadas

| ID | Historia | Descripción |
|---|---|---|
| H11 | Migración a WhatsApp Cloud API | Reemplazar whatsapp-web.js por la API oficial de Meta |
| H12 | Alta disponibilidad | Clúster de bots con balanceo de carga |
| H13 | Modelos de IA optimizados | Ajuste fino de modelos según hardware |
| H14 | Integración con otros canales | Telegram, Web Chat, etc. |
| H15 | Escalabilidad horizontal | Distribución de carga entre múltiples instancias |

## Migración a Cloud API

La migración a la WhatsApp Cloud API de Meta está planificada para el largo plazo. Detalle en [docs/future/01-roadmap.md](../future/01-roadmap.md).

## Escalabilidad

- De monolito a microservicios (ver [ADR-001](../architecture/03-adr.md)).
- Base de datos particionada por usuario.
- Caching de respuestas frecuentes.

---

↩️ [Volver al índice](../00-INDEX.md)
