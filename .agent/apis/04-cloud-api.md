# ☁️ Migración a WhatsApp Cloud API

> Wa-Assistant RAG · plan detallado de migración de whatsapp-web.js a la WhatsApp Cloud API de Meta.

| Metadatos | Valor |
|---|---|
| Estado | Pendiente |
| Última actualización | 2026-09-09 |
| Versión | v0.2.0+ (Largo plazo) |
| Dueño | Técnico |

## Estado

El MVP usa `whatsapp-web.js` para la conectividad con WhatsApp. La migración a la WhatsApp Cloud API de Meta está planificada para el **horizonte de largo plazo**.

## Por Qué Migrar

| Limitación de whatsapp-web.js | Solución con Cloud API |
|---|---|
| Riesgo de bloqueo por términos de servicio | Canal oficial de Meta, sin riesgo de bloqueo |
| Sesión basada en QR | Conexión más estable y persistente |
| No apto para uso comercial | Soporte para cuentas empresariales |
| Dependencia de Puppeteer | API directa, sin navegador necesario |

## Protocolo y Seguridad

**Protocolo**: **HTTPS** (obligatorio para todos los endpoints de Cloud API)
**Autenticación**: Token de acceso permanente (bearer token)
**Webhook**: Endpoint HTTPS con verificación de firma

## Recursos y Métodos

**URL base**: `https://graph.facebook.com/v18.0/`

| Método | Recurso | Propósito |
|---|---|---|
| `GET` | `/{phone_number_id}/messages` | Obtener el estado de un mensaje enviado |
| `POST` | `/{phone_number_id}/messages` | Enviar un mensaje a WhatsApp |
| `POST` | `/{webhook_path}` | Recibir mensajes entrantes vía webhook |
| `GET` | `/{phone_number_id}` | Verificar la configuración del número de teléfono |
| `GET` | `/{phone_number_id}/message_templates` | Listar plantillas de mensaje aprobadas |
| `POST` | `/{phone_number_id}/message_templates` | Crear una nueva plantilla de mensaje |

### GET /{phone_number_id}/messages

**Propósito**: Obtener el estado de un mensaje enviado.

**Request**: No se requiere body.

**Response**:
```json
{
  "data": [{ "id": "message-id", "status": "sent", "timestamp": 1234567890 }]
}
```

### POST /{phone_number_id}/messages

**Propósito**: Enviar un mensaje de texto a un usuario de WhatsApp.

**Request**:
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "1234567890",
  "type": "text",
  "text": { "body": "Hola, ¿en qué puedo ayudarte?" }
}
```

**Response**:
```json
{
  "contacts": [{ "wa_id": "1234567890" }],
  "messages": [{ "id": "wamid.HBgN..." }]
}
```

### POST /{webhook_path} (Webhook Entrante)

**Propósito**: Recibir mensajes entrantes de usuarios de WhatsApp.

**Request** (de Meta):
```json
{
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "1234567890",
          "type": "text",
          "text": { "body": "hola" }
        }]
      }
    }]
  }]
}
```

**Verificación**: Meta envía una solicitud GET con los parámetros `hub.mode`, `hub.verify_token` y `hub.challenge` para la verificación del webhook.

## Requisitos Previos para la Migración

1. **Cuenta de Meta Business**: Registrada y verificada.
2. **Número de teléfono**: Asociado y verificado por Meta.
3. **Token de acceso**: Token de acceso permanente generado.
4. **Webhook**: Configurado con endpoint HTTPS público.

## Cambios Técnicos Esperados

### En la Arquitectura

```
ANTES (whatsapp-web.js):          DESPUÉS (Cloud API):
┌─────────────────────┐            ┌─────────────────────┐
│  whatsapp-web.js    │            │  Meta Cloud API     │
│  (WebSocket)        │            │  (Webhook HTTPS)    │
│  localhost          │            │  HTTPS público      │
└─────────────────────┘            └──────────┬──────────┘
                                               │
                                          ┌──────▼──────┐
                                          │  Ngrok/     │
                                          │  Proxy      │
                                          │  Inverso    │
                                          │  (HTTPS)    │
                                          └──────┬──────┘
                                                 │
                                          ┌──────▼──────┐
                                          │  Node.js    │
                                          │  (bot)      │
                                          └─────────────┘
```

### En el Código

| Componente | Cambio |
|---|---|
| `whatsapp-web.js` | Reemplazado por `@twilio/whatsapp` o cliente HTTP directo de Meta |
| `index.js` | `client.initialize()` reemplazado por configuración de webhook de Meta |
| `handlers/message.js` | Adaptado al formato JSON de webhook de Cloud API |
| Configuración de red | Requiere endpoint HTTPS público (Ngrok, dominio propio o servicio de reenvío) |
| Seguridad | Se agrega validación de firma de webhook de Meta |

### Nuevas Variables de Entorno

```env
META_PAGE_ACCESS_TOKEN=tu_token_de_acceso
META_PHONE_NUMBER_ID=tu_numero_id
META_WEBHOOK_VERIFY_TOKEN=tu_token_de_verificacion
META_APP_SECRET=tu_app_secret
WEBHOOK_URL=https://tu-dominio.com/webhook
```

### Pasos de Migración

1. **Registrar negocio en Meta** → [business.facebook.com](https://business.facebook.com)
2. **Verificar número de teléfono** → Meta envía código de verificación
3. **Configurar webhook** → Endpoint HTTPS en el servidor
4. **Adaptar handlers** → Cambiar al formato JSON de webhook de Cloud API
5. **Probar en sandbox** → Usar número de prueba de Meta
6. **Desplegar en producción** → Cambiar la conexión a Cloud API
7. **Eliminar whatsapp-web.js** → Quitar la dependencia del proyecto

## Impacto en Otros Documentos

| Documento | Cambio Esperado |
|---|---|
| `docs/apis/03-whatsapp-webjs.md` | Marcar como obsoleto / histórico |
| `docs/architecture/01-architecture.md` | Actualizar diagrama de bloques |
| `docs/architecture/02-flujo-datos.md` | Actualizar flujo de recepción de mensajes |
| `README.md` | Actualizar sección de tecnologías |

## Decisión ADR

Esta migración es una consecuencia directa de **ADR-003** (whatsapp-web.js para MVP con planificación de migración). El estado de la decisión permanece "Aceptado provisionalmente" hasta que la Cloud API se convierta en el método principal de conexión.

---

↩️ [Volver al índice](../00-INDEX.md)
