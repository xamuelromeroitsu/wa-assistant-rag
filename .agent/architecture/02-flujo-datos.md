# 🔄 Flujo de Datos

> Wa-Assistant RAG · ciclo de vida completo de un mensaje desde que entra por WhatsApp hasta que se genera la respuesta.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP) |
| Dueño | Técnico |

## Ciclo de vida de un mensaje

### Fase 1: Recepción

```
Usuario envía mensaje por WhatsApp
        │
        ▼
whatsapp-web.js recibe el evento `message_create`
        │
        ▼
index.js filtra: ¿es un mensaje válido?
  ├── Mensaje vacío o solo espacios → se ignora (fin)
  ├── Mensaje en grupo sin mencionar al bot → se ignora (fin)
  └── Mensaje válido → se pasa al handler
```

### Fase 2: Clasificación

```
handlers/message.js recibe el mensaje
        │
        ▼
¿El mensaje es un saludo?
  ├── Sí (hola, buenas, hey, etc.) → ramal H2
  │       │
  │       ▼
  │   Respuesta inmediata en español (< 3 s)
  │   No se consulta RAG ni Ollama
  │       │
  │       ▼
  │   Se envía respuesta por WhatsApp
  │
  └── No → ramal H3
          │
          ▼
      ¿Es un comando de ingesta? (npm run ingest)
          ├── Sí → ramal H4 (ver Fase 4)
          └── No → ramal H3 (pregunta RAG)
```

### Fase 3: Respuesta RAG (H3)

```
handlers/message.js → rag/search.js
        │
        ▼
1. rag/search.js genera el embedding de la pregunta
   (llamada a Ollama POST /api/embeddings con EMBEDDING_MODEL)
        │
        ▼
2. Búsqueda top-K en pgvector
   SELECT chunk_text, document_id
   FROM embeddings
   ORDER BY embedding <=> $1
   LIMIT K
   (K configurable via variable de entorno)
        │
        ▼
3. Se construye el contexto con los K fragmentos recuperados
   Si no hay fragmentos relevantes:
       → mensaje: "No encontré información sobre..."
       → fin del flujo
        │
        ▼
4. rag/search.js entrega el contexto al handler
        │
        ▼
handlers/message.js arma el prompt con:
  - Instrucción del sistema (español)
  - Contexto recuperado de los documentos
  - Pregunta del usuario
        │
        ▼
5. Llamada a Ollama POST /api/generate
   (con OLLAMA_MODEL)
        │
        ▼
6. Ollama genera la respuesta fundamentada en el contexto
        │
        ▼
7. Se envía la respuesta por WhatsApp
   Tiempo objetivo: < 30 s
```

### Fase 4: Ingesta de documentos (H4)

```
Usuario ejecuta: npm run ingest <ruta_archivos>
        │
        ▼
rag/ingest.js procesa cada archivo
        │
        ├── Archivo TXT → lectura directa
        └── Archivo PDF → extracción de texto
        │
        ▼
Para cada archivo:
  1. Se lee el contenido completo
  2. Se divide en chunk_text (fragmentos)
  3. Se calcula el hash del fragmento (para detectar duplicados)
  4. Para cada chunk único:
       a. Se genera el embedding (Ollama POST /api/embeddings)
       b. Se inserta en la tabla `chunks` (metadatos)
       c. Se inserta en la tabla `embeddings` (vector + índice)
  5. Se registra el documento en la tabla `documents`
        │
        ▼
Reporte de resumen:
  - Archivos procesados
  - Fragmentos generados
  - Errores parciales (si los hubo)
```

### Fase 5: Verificación de modelo (H5)

```
Al arrancar el bot (npm run dev)
        │
        ▼
config.js valida las variables de entorno
        │
        ▼
index.js llama a Ollama GET /api/tags
  para verificar que OLLAMA_MODEL exista
        │
        ├── Modelo existe → arranca normalmente
        └── Modelo no encontrado → log indica:
             "Ejecutá: ollama pull <modelo>"
```

## Diagrama de estados del sistema

```
┌──────────────┐
│  INICIO      │──▶ npm run dev
└──────────────┘       │
                       ▼
┌──────────────┐     ┌──────────────┐
│  CONFIGURAR  │────▶│  VERIFICAR   │
│  (.env cargado)│    │  MODELOS     │
└──────────────┘     │  (Ollama)    │
                     └──────┬───────┘
                            │
                     ┌──────▼───────┐
                     │  CONECTAR    │
                     │  WHATSAPP    │
                     │  (QR)        │
                     └──────┬───────┘
                            │
                     ┌──────▼───────┐
                     │  ESCUCHAR    │
                     │  MENSAJES    │
                     └──────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              ▼                           ▼
     ┌──────────────┐          ┌──────────────┐
     │  SALUDO      │          │  PREGUNTA    │
     │  (H2)        │          │  (H3)        │
     └──────┬───────┘          └──────┬───────┘
            │                        │
            ▼                        ▼
     ┌──────────────┐          ┌──────────────┐
     │  Respuesta   │          │  RAG Pipeline│
     │  directa     │          │  (search+    │
     │  (< 3 s)     │          │   Ollama)    │
     └──────────────┘          └──────┬───────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │  Envío por   │
                              │  WhatsApp    │
                              └──────────────┘
```

## Gestión de errores en el flujo

| Error | Momento | Comportamiento |
|---|---|---|
| Ollama caído | Fase 3 (paso 5) | Respuesta: "El motor de IA no está disponible" |
| BD caída | Fase 3 (paso 2) | Respuesta: "No puedo acceder a mis documentos en este momento" |
| Sesión expirada | Fase 1 | Se pide reescanear QR |
| PDF sin texto | Fase 4 | Se informa que se requiere PDF con texto y se omite |
| Archivo corrupto | Fase 4 | Error claro y se continua con el siguiente archivo |
| Base de datos vacía | Fase 3 | Se informa que aún no hay documentos cargados |

---

↩️ [Volver al índice](../00-INDEX.md)
