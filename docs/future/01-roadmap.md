# ☁️ Migración a WhatsApp Cloud API

> Wa-Assistant RAG · plan detallado de migración a la API oficial de Meta.

| Metadatos | Valor |
|---|---|
| Estado | Pendiente |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.2.0+ (Largo plazo) |
| Dueño | Técnico |

## Resumen

Este documento detalla el plan de migración de `whatsapp-web.js` a la **WhatsApp Cloud API** de Meta para eliminar el riesgo de bloqueo de sesiones web.

## Requisitos previos

1. **Cuenta de Meta Business** registrada y verificada.
2. **Número de teléfono** asociado y verificado por Meta.
3. **Token de acceso** permanente generado.
4. **Webhook** configurado con HTTPS público.

## Cambios técnicos

| Componente | Antes (whatsapp-web.js) | Después (Cloud API) |
|---|---|---|
| Conexión | WebSocket QR | Webhook HTTPS |
| Envío de mensajes | `client.sendMessage()` | `POST /v18.0/{phone_id}/messages` |
| Recepción de mensajes | Evento `message_create` | Payload JSON de webhook |
| Autenticación | `LocalAuth` (sesión en disco) | Token de acceso permanente |
| Configuración | `.env` con variables de BD/Ollama | `.env` + variables de Meta (token, phone_id) |

## Variables de entorno adicionales

```env
META_PAGE_ACCESS_TOKEN=tu_token_de_acceso
META_PHONE_NUMBER_ID=tu_numero_id
META_WEBHOOK_VERIFY_TOKEN=tu_token_de_verificacion
META_APP_SECRET=tu_app_secret
WEBHOOK_URL=https://tu-dominio.com/webhook
```

## Pasos de migración

1. **Registrar negocio en Meta Business** → [business.facebook.com](https://business.facebook.com)
2. **Verificar número** → Meta envía código de verificación
3. **Configurar webhook** → Endpoint HTTPS en el servidor
4. **Adaptar handlers** → Cambiar formato de mensajes entrantes/salientes
5. **Probar en entorno de prueba** → Usar número de prueba de Meta
6. **Desplegar en producción** → Cambiar la conexión al Cloud API
7. **Retirar whatsapp-web.js** → Eliminar dependencia del proyecto

## Impacto

- `docs/apis/03-whatsapp-webjs.md` se marca como obsoleto.
- `docs/architecture/01-architecture.md` se actualiza con nuevo diagrama.
- `docs/architecture/02-flujo-datos.md` se actualiza con nuevo flujo.
- `README.md` se actualiza con nueva sección de tecnologías.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Meta puede cambiar términos | Seguir documentación oficial de Meta |
| Endpoint HTTPS requiere dominio | Usar dominio propio o servicio como Ngrok |
| Complejidad de webhooks | Probar exhaustivamente antes de migrar |

---

↩️ [Volver al índice](../00-INDEX.md)
