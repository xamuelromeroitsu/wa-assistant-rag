# 📱 Integración con WhatsApp Web (whatsapp-web.js)

> Wa-Assistant RAG · contrato de integración con la librería whatsapp-web.js para conectarse a WhatsApp.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP) |
| Dueño | Técnico |

## Descripción

`whatsapp-web.js` es una librería open-source que implementa el protocolo de WhatsApp Web en Node.js. Permite al bot conectarse a WhatsApp escaneando un código QR y recibiendo/enviando mensajes.

**Protocolo**: WebSocket (no HTTP/HTTPS). La conexión con los servidores de WhatsApp usa una conexión WebSocket persistente.

```
┌─────────────────────┐          Protocolo WhatsApp Web         ┌──────────────┐
│  whatsapp-web.js    │◀─────────────────────────────────────▶│  WhatsApp    │
│  (cliente Node.js)  │              (WebSocket)                │  Servers     │
└─────────────────────┘                                      └──────────────┘
```

## Recursos y Métodos

**Protocolo**: `WebSocket` (conexión bidireccional persistente)
**Autenticación**: `LocalAuth` (sesión almacenada en disco en `./.wwebjs_auth/`)

| Método | Recurso | Propósito |
|---|---|---|
| `WebSocket` | `authStrategy` | Autenticación y persistencia de sesión |
| `Event` | `qr` | Generación de código QR para vinculación de dispositivo |
| `Event` | `ready` | Cliente conectado y listo para recibir mensajes |
| `Event` | `message_create` | Nuevo mensaje recibido de WhatsApp |
| `Event` | `disconnected` | Sesión desconectada de WhatsApp |
| `Event` | `auth_failure` | Error de autenticación |
| `Método` | `client.sendMessage()` | Enviar un mensaje de texto a un usuario de WhatsApp |
| `Método` | `message.reply()` | Responder a un mensaje específico |
| `Método` | `client.destroy()` | Cerrar la conexión WebSocket limpiamente |

### Ciclo de Vida de la Sesión

#### Inicialización

El cliente se crea en `index.js` con la siguiente configuración:

```javascript
const { Client } = require('whatsapp-web.js');
const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'wa-assistant' }),
  puppeteer: { headless: true }
});
```

**`LocalAuth`**: Estrategia de autenticación que almacena la sesión en disco (`./.wwebjs_auth/`). Esto permite que la sesión persista entre reinicios del bot (H1).

#### Flujo de Conexión

```
npm run dev
    │
    ▼
client.initialize()
    │
    ▼
Evento 'qr' → mostrar QR en terminal
    │
    ▼
Usuario escanea QR con WhatsApp (Dispositivos Vinculados)
    │
    ▼
Evento 'ready' → bot conectado, escuchando mensajes
    │
    ▼
Evento 'message_create' → handler procesa el mensaje
```

### Evento Message (`message_create`)

Cuando se recibe un evento `message_create`, `whatsapp-web.js` entrega un objeto con las siguientes propiedades clave que `handlers/message.js` utiliza:

```javascript
{
  from: "1234567890@c.us",      // ID del remitente (número WhatsApp + @c.us)
  to: "1234567890@c.us",        // ID del destinatario (el bot)
  body: "hola",                  // Contenido de texto del mensaje
  hasMedia: false,               // Si el mensaje incluye imagen/video/documento
  timestamp: 1234567890,        // Timestamp Unix del mensaje
  isGroup: false,                // true si el mensaje es en un grupo
  author: "1234567890@c.us",    // Autor real del mensaje (en grupos)
  id: { id: "...", user: "..." } // ID único del mensaje
}
```

**Propiedades usadas por el handler:**

| Propiedad | Uso en handler |
|---|---|
| `from` | Identificar al usuario para la respuesta |
| `body` | Determinar el tipo de mensaje (saludo vs. pregunta) |
| `hasMedia` | Si es true, el bot ignora archivos (no soportado en MVP) |
| `isGroup` | Filtrar mensajes de grupos |
| `author` | Verificar si el bot fue mencionado en grupos |

**Flujo de procesamiento:**

```
message_create → objeto de mensaje recibido
        │
        ▼
handlers/message.js recibe el objeto
        │
        ▼
1. ¿hasMedia? → Ignorar (MVP no procesa archivos)
2. ¿isGroup && !mentioned? → Ignorar
3. ¿body es saludo? → H2 (respuesta directa)
4. ¿body es pregunta? → H3 (pipeline RAG)
```

### Envío de Mensajes

#### Responder al usuario

```javascript
await message.reply(text);
```

O directamente:
```javascript
await client.sendMessage(message.from, text);
```

### Gestión de Sesión

#### Persistencia

La sesión se guarda automáticamente en la carpeta `.wwebjs_auth/` gracias a `LocalAuth`. Esto significa:
- Al reiniciar el bot, **no es necesario escanear el QR** nuevamente (mientras la sesión sea válida).
- Si la sesión expira o la carpeta se elimina, el siguiente inicio muestra un nuevo QR.

#### Cierre Limpio

```javascript
process.on('SIGINT', async () => {
  await client.destroy();
  process.exit(0);
});
```

El bot cierra la conexión WebSocket limpiamente con `Ctrl+C`, preservando los datos de autenticación.

#### Reconexión

Si WhatsApp desconecta al bot:
1. Se registra el evento `disconnected`.
2. Se intenta una reconexión automática.
3. Si falla, se requiere un nuevo escaneo de QR.

### Manejo de Grupos

El bot **solo responde en chats individuales** (1:1 con el dueño). En grupos:
- Si el bot es mencionado (`@bot`), responde.
- Si no es mencionado, el mensaje se ignora.

Este comportamiento está configurado en `handlers/message.js`.

### Configuración

| Variable | Default | Descripción |
|---|---|---|
| `WABA_BOT_NUMBER` | — | Número de WhatsApp del bot (opcional, para referencia) |

### Limitaciones y Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| WhatsApp bloquea la conexión web | El bot deja de funcionar | Migración a Cloud API planificada ([docs/future/01-roadmap.md](../future/01-roadmap.md)) |
| La sesión expira | Necesidad de escanear QR | Sesión persistida en disco; reautenticación manual |
| Mensajes de grupo no deseados | Ruido | El bot solo responde en 1:1 o cuando es mencionado |

### Alternativas Consideradas

| Alternativa | Por qué no |
|---|---|
| WhatsApp Cloud API | Requiere cuenta de Meta Business; no disponible para MVP |
| Baileys (otra librería) | Menor estabilidad y comunidad; whatsapp-web.js es más madura |
| Twilio WhatsApp | Servicio de pago; viola el principio de costo cero |

---

↩️ [Volver al índice](../00-INDEX.md)
