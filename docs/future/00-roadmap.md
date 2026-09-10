# ☁️ Migración a WhatsApp Cloud API

> Wa-Assistant RAG · plan de migración futura de whatsapp-web.js a la WhatsApp Cloud API de Meta.

| Metadatos | Valor |
|---|---|
| Estado | Pendiente |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.2.0+ (Largo plazo) |
| Dueño | Técnico |

## Estado actual

El MVP utiliza `whatsapp-web.js` como método de conexión a WhatsApp. La migración a la WhatsApp Cloud API de Meta está planificada para el **horizonte largo plazo**.

## ¿Por qué migrar?

- `whatsapp-web.js` puede ser bloqueado por WhatsApp por sus términos de servicio.
- La Cloud API es el canal oficial de Meta.
- No requiere sesión basada en QR.

## Plan de migración

| Fase | Acción | Estado |
|---|---|---|
| 1 | Registrar negocio en Meta Business | Pendiente |
| 2 | Verificar número de teléfono | Pendiente |
| 3 | Configurar webhook de prueba | Pendiente |
| 4 | Adaptar handlers de mensajes al formato Cloud API | Pendiente |
| 5 | Desplegar en producción | Pendiente |
| 6 | Retirar whatsapp-web.js del código | Pendiente |

## Documentación relacionada

- [03-whatsapp-webjs.md](../apis/03-whatsapp-webjs.md) — Documentación de la solución actual.
- [04-cloud-api.md](../apis/04-cloud-api.md) — Detalle técnico de la migración.

---

↩️ [Volver al índice](../00-INDEX.md)
