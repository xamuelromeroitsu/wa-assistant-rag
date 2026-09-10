# 📖 Guía de Uso del Bot

> Wa-Assistant RAG · guía para el usuario final del bot de WhatsApp.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP) |
| Dueño | Product Owner |

## Conectarse al bot

1. El propietario del bot ejecuta `npm run dev`.
2. Aparece un **código QR** en la terminal.
3. En el celular: WhatsApp → Menú (⋮) → **Dispositivos vinculados** → **Vincular un dispositivo**.
4. Escanear el código QR.
5. El bot queda conectado.

## Comandos y mensajes

### Saludos

Cualquier saludo recibe una respuesta inmediata:

| Mensaje | Respuesta |
|---|---|
| "hola" | Respuesta con nombre del bot e invitación a preguntar |
| "buenas" | Respuesta con nombre del bot |
| "hey" | Respuesta con nombre del bot |
| "hola bot" | Respuesta con nombre del bot |

Los saludos son insensibles a mayúsculas/minúsculas y tildes.

### Preguntas sobre documentos

Cualquier pregunta que no sea un saludo se procesa con RAG:

```
Usuario: ¿Cuáles son los pasos para hacer X?
Bot: [Respuesta basada en los documentos cargados]
```

El bot busca en tus documentos cargados y responde fundamentado.

### Si no encuentra información

```
Usuario: ¿Cuál es el código de descuento para la tienda?
Bot: No encontré información sobre eso.
```

Si el bot responde esto, significa que:
- No has cargado documentos aún, o
- Los documentos cargados no contienen esa información.

### Cargar documentos

Para que el bot pueda responder sobre tus documentos, necesitas cargarlos:

```bash
npm run ingest ./ruta_de_tus_documentos/
```

Formatos soportados: **PDF** y **TXT**.

## Tiempos de respuesta

| Tipo de mensaje | Tiempo esperado |
|---|---|
| Saludo | < 3 segundos |
| Pregunta con RAG | < 30 segundos |
| Ingesta de documentos | Depende del tamaño (generalmente < 10 s por PDF) |

## La sesión se mantiene

- Una vez conectado, el bot **no necesita reescanear el QR** al reiniciar.
- Si el bot se desconecta, se puede reconectar con el mismo método QR.
- La sesión se guarda localmente.

## Limitaciones

- Solo responde sobre los documentos que hayas cargado.
- Solo responde en **español**.
- No puede hacer cálculos ni razonamientos fuera de los documentos.
- Solo funciona en chats individuales (1:1), no en grupos (salvo mención).

## Solución de problemas para el usuario

| Problema | Solución |
|---|---|
| No responde | Verificar que el bot esté conectado (QR no expirado) |
| "Modelo no encontrado" | El propietario debe descargar el modelo: `ollama pull llama3.2` |
| No encuentra información | El propietario debe cargar documentos: `npm run ingest ./documentos/` |
| Bot desconectado | Reescanear el QR |

## Contacto y soporte

Para problemas técnicos, consultar la sección de troubleshooting en la documentación.

---

↩️ [Volver al índice](../00-INDEX.md)
