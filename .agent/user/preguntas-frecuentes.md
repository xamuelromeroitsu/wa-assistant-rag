# ❓ Preguntas Frecuentes

> Wa-Assistant RAG · respuestas a las dudas más comunes de los usuarios.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP) |
| Dueño | Product Owner |

## ¿Qué es Wa-Assistant RAG?

Es un asistente de WhatsApp que responde preguntas sobre tus documentos usando IA que corre en tu propia computadora. No envía tus datos a la nube.

## ¿Qué documentos puedo cargar?

- **PDF** (con texto, no escaneado)
- **TXT**

## ¿Cómo cargo documentos?

El propietario del bot ejecuta:
```bash
npm run ingest ./ruta_de_documentos/
```

## ¿Puedo hacerle cualquier pregunta?

Sí, pero el bot solo responde basándose en lo que contienen tus documentos cargados. Si pregunta algo que no está en los documentos, te dirá "No encontré información sobre eso."

## ¿Por qué el bot no entiende mi pregunta?

El bot entiende español. Si tu pregunta está en otro idioma, puede que no obtengas una respuesta correcta. Asegúrate de preguntar en español.

## ¿El bot recuerda las conversaciones anteriores?

En el MVP, el bot solo recuerda el contexto de la conversación inmediata. El historial de chats no se guarda.

## ¿Puedo usar el bot en grupo de WhatsApp?

Sí, pero solo si el bot es mencionado (`@bot`). Los mensajes en grupo sin mencionar al bot se ignoran.

## ¿Qué pasa si el bot se desconecta?

1. El propietario puede reiniciar el bot (`npm run dev`).
2. No necesita reescanear el QR si la sesión es válida.
3. Si la sesión expiró, se muestra un QR nuevo.

## ¿Es gratis?

Sí, es 100% gratuito y open-source. No hay suscripciones ni costos de API.

## ¿Mis datos están seguros?

Sí. La IA y la base de datos corren en tu máquina. Tus documentos y conversaciones **nunca salen** de tu computadora (excepto la conexión con WhatsApp).

## ¿Necesito una buena computadora?

Funciona en cualquier computadora con Node.js 20+, Ollama y PostgreSQL. Para mejores resultados, se recomienda al menos 8 GB de RAM. Modelos más grandes pueden requerir más recursos.

## ¿Cómo sé si el bot está funcionando?

1. Al ejecutar `npm run dev`, aparece un código QR.
2. Al escanear el QR, el bot queda conectado.
3. Si envías "hola", deberías recibir respuesta en menos de 3 segundos.

---

↩️ [Volver al índice](../00-INDEX.md)
