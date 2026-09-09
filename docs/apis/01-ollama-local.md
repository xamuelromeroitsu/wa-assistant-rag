# ⚙️ Motor de IA Local (Ollama)

> Wa-Assistant RAG · motor de inferencia local que ejecuta modelos LLM y genera embeddings.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP) |
| Dueño | Técnico |

## Descripción general

Ollama es el motor de IA local que corre como un **servicio en un puerto** (`localhost:11434`). El bot se comunica con él mediante HTTP plano, ya que es un servicio local que nunca se expone a internet.

**Protocolo**: `HTTP` en `localhost:11434`

```
┌─────────────────────┐         HTTP (localhost)        ┌─────────────────┐
│  Wa-Assistant       │◀─────────────────────────────────│  Ollama         │
│  (Node.js)        │   localhost:11434                  │  (local)        │
│                     │◀─────────────────────────────────│                 │
└─────────────────────┘         HTTP (localhost)        └─────────────────┘
```

## Principio de la buena práctica

> **Ollama corre como un servicio local en puerto. NO es una API pública que necesite HTTPS.**
>
> - El bot y Ollama corren en la misma máquina (o red local).
> - La conexión es `http://localhost:11434`.
> - Ollama nunca se expone a internet público.
> - Si se necesita exponer externamente, se usa un reverse proxy con HTTPS, pero eso es fuera del alcance del MVP.

## Parámetros de Ollama

| Parámetro | Valor | Justificación |
|---|---|---|
| `temperature` | `0.2` | Bajo para minimizar alucinaciones; respuestas precisas y fundamentadas |
| `top_p` | `0.9` | Nucleus sampling moderado; permite fluidez sin divagar |
| `num_predict` | `512` | Limita la respuesta a ~512 tokens; suficiente para una respuesta breve |
| `stop` | `["\n\n"]` | Corta la generación en doble salto de línea para evitar respuestas extensas |
| `num_ctx` | `4096` | Ventana de contexto amplia para que quepan los fragmentos RAG |

## System prompt

El prompt del sistema instruye al modelo a responder **exclusivamente** basándose en el contexto proporcionado:

```
Eres un asistente experto en alimentación y nutrición. Responde SIEMPRE en español.

Reglas estrictas:
1. Responde SOLO con la información contenida en el contexto proporcionado.
2. Si la información solicitada NO se encuentra en los documentos, responde exactamente: "No encontré información sobre eso."
3. No inventes datos, no hagas suposiciones, no hables de temas que no estén en los documentos.
4. Si una pregunta no está relacionada con alimentación o nutrición, responde: "Soy un asistente de alimentación. Solo puedo ayudarte con temas relacionados con alimentación y nutrición."
5. Responde de forma clara, concisa y en español.
6. Si el contexto incluye información de diferentes documentos, cítala de forma ordenada.
```

## Recursos y Métodos

**Protocolo**: `HTTP`
**URL base**: `http://localhost:11434`

| Método | Recurso | Propósito |
|---|---|---|
| `POST` | `/api/generate` | Generar respuesta de texto con contexto (H3) |
| `POST` | `/api/embeddings` | Generar embeddings vectoriales (H4, H3) |
| `POST` | `/api/chat` | Formato de chat completion (uso futuro) |
| `GET` | `/api/tags` | Listar modelos disponibles (H5) |

Todas las solicitudes usan cuerpo JSON. Las respuestas son JSON.

### POST /api/generate

**Propósito**: Generar una respuesta de texto con contexto (H3).

**Cuándo se usa**: Cuando el usuario envía una pregunta que requiere RAG.

**Prompt completo que se envía a Ollama**:

El `prompt` se construye concatenando el system prompt + el contexto recuperado + la pregunta del usuario:

```javascript
const fullPrompt = `${SYSTEM_PROMPT}\n\nContexto:\n${contextoRecuperado}\n\nPregunta del usuario: ${pregunta}`;
```

**Request**:
```json
{
  "model": "llama3.2",
  "prompt": "[SYSTEM_PROMPT]\n\nContexto:\n[fragmentos recuperados de pgvector]\n\nPregunta del usuario: [pregunta]",
  "temperature": 0.2,
  "top_p": 0.9,
  "num_predict": 512,
  "stop": ["\n\n"],
  "num_ctx": 4096,
  "stream": false
}
```

**System prompt**: Ver sección dedicada arriba.

**Response**:
```json
{
  "response": "Texto de la respuesta generado basándose en el contexto",
  "model": "llama3.2",
  "created_at": "2026-09-09T12:00:00Z"
}
```

**Timeout**: Se espera una respuesta en < 30 s en hardware nominal.

**Comportamiento ante ausencia de contexto**:
- Si `contextoRecuperado` está vacío, el system prompt garantiza que el modelo responda: `"No encontré información sobre eso."`
- El handler de mensajes verifica esto antes de llamar a Ollama; si no hay fragmentos, no se hace la llamada.

**Comportamiento ante tema fuera de alimentación**:
- El system prompt instruye al modelo a rechazar preguntas no relacionadas con alimentación/nutrición.

### POST /api/embeddings

**Propósito**: Convertir texto en un vector numérico (H4, H3).

**Cuándo se usa**:
- Durante la ingesta de documentos: para generar embeddings de cada fragmento.
- Durante la búsqueda: para generar el embedding de la pregunta del usuario.

**Parámetros para embeddings** (diferentes a generación):

| Parámetro | Valor | Justificación |
|---|---|---|
| `temperature` | `0` | Los embeddings no requieren aleatoriedad; deben ser deterministas |
| `top_p` | `1.0` | No aplica para embeddings |
| `num_predict` | `0` | No aplica; solo genera el vector |

**Request**:
```json
{
  "model": "nomic-embed-text",
  "prompt": "Texto a convertir en vector",
  "temperature": 0,
  "options": { "top_p": 1.0 }
}
```

**Response**:
```json
{
  "embedding": [0.0023, -0.0187, 0.0456, ..., 0.0012],
  "model": "nomic-embed-text",
  "dimension": 768
}
```

### POST /api/chat

**Propósito**: Formato alternativo de chat completion de Ollama. Opcional para el MVP; `/api/generate` es suficiente.

**Nota**: Este endpoint sigue el formato abierto de OpenAI. Se documenta por compatibilidad futura si se necesitan conversaciones con historial de múltiples turnos.

**Request**:
```json
{
  "model": "llama3.2",
  "messages": [
    { "role": "system", "content": "[SYSTEM_PROMPT]" },
    { "role": "user", "content": "[pregunta]" }
  ],
  "temperature": 0.2,
  "top_p": 0.9,
  "num_predict": 512,
  "stream": false
}
```

**Cuándo se usa**: Si en el futuro se necesita un historial de conversaciones (mediano/largo plazo). En el MVP se usa `/api/generate`.

### GET /api/tags

**Propósito**: Listar los modelos disponibles en Ollama (H5).

**Cuándo se usa**: Al arrancar el bot para verificar que los modelos configurados existen.

**Request**: Sin body.

**Response**:
```json
{
  "models": [
    { "name": "llama3.2", "size": 4500000000 },
    { "name": "nomic-embed-text", "size": 280000000 }
  ]
}
```

**Validación**: El bot verifica que `OLLAMA_MODEL` y `EMBEDDING_MODEL` estén en la lista de modelos disponibles. Si no, muestra el comando `ollama pull <modelo>`.

## Modelos requeridos

| Variable de entorno | Modelo | Función | Comando de descarga |
|---|---|---|---|
| `OLLAMA_MODEL` | `llama3.2` | Generación de respuestas | `ollama pull llama3.2` |
| `EMBEDDING_MODEL` | `nomic-embed-text` | Generación de embeddings | `ollama pull nomic-embed-text` |

> Ambos modelos se descargan una sola vez y se cachean localmente en `~/.ollama/models`.

## Manejo de errores

| Error | Código | Comportamiento del bot |
|---|---|---|
| Ollama no responde | Connection refused | "El motor de IA no está disponible. Verificá que Ollama esté corriendo." |
| Modelo no encontrado | 404 | "Modelo no encontrado. Ejecutá: `ollama pull <modelo>`" |
| Timeout de generación | Timeout | "La generación tomó demasiado tiempo. Intentá de nuevo." |

## Configuración

| Variable | Default | Descripción |
|---|---|---|
| `OLLAMA_HOST` | `http://localhost:11434` | URL base del servicio Ollama (puerto local, HTTP plano) |
| `OLLAMA_MODEL` | `llama3.2` | Modelo para generación de respuestas |
| `EMBEDDING_MODEL` | `nomic-embed-text` | Modelo para generación de embeddings |

> **Nota de seguridad**: Ollama escucha en `localhost` por defecto. Si se configura en `0.0.0.0`, se expone en la red local sin cifrado. Para el MVP, `localhost` es suficiente.

---

↩️ [Volver al índice](../00-INDEX.md)
