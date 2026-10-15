# ⚙️ Especificación técnica

> Wa-Assistant RAG · stack, componentes, interfaces y decisiones técnicas de implementación del MVP.


## Stack técnico

| Capa | Tecnología | Emoji | Versión | Responsabilidad |
|---|---|---|---|---|
| Runtime | Node.js | 🟢 | ≥ 20 | Ejecuta el bot y toda la lógica |
| Conector WhatsApp | `whatsapp-web.js` | 📱 | últ. | Sesión QR, eventos y envío de mensajes |
| IA local | Ollama | 🤖 | últ. | Generación de respuestas y embeddings |
| Modelo generador | `llama3.2` (default) | 🦙🔥 | últ. | Texto de respuesta |
| Modelo embeddings | `nomic-embed-text` (default) | 🧠 | últ. | Conversión de fragmentos a vectores |
| Persistencia | PostgreSQL | 🐘 | 16 | Almacenamiento de documentos y metadatos |
| Vectores | pgvector | 📊 | últ. | Búsqueda por similitud (key del RAG) |
| Contenedores | Podman (o Docker) | 🐳🦭 | 4+ | Levanta la BD de forma reproducible |

## Arquitectura de componentes 

```
┌────────────────────────────────────────────────────────────┐
│                        Node.js (bot)                        │
│  ┌────────────┐   ┌──────────────┐   ┌──────────────────┐  │
│  │ config.js  │──▶│   index.js   │──▶│  handlers/       │  │
│  └────────────┘   └──────┬───────┘   │  message.js      │  │
│                          │           └────────┬─────────┘  │
│                          │                    │            │
│                          ▼                    ▼            │
│                   ┌────────────┐      ┌──────────────┐      │
│                   │  db.js     │      │ rag/         │      │
│                   │ (pg)       │      │ ingest.js    │      │
│                   └─────┬──────┘      │ search.js    │      │
│                         │            └──────┬───────┘      │
│                         │                   │              │
└─────────────────────────┼───────────────────┼──────────────┘
                          │                   │
                          ▼                   ▼
                ┌──────────────┐      ┌──────────────┐
                │ PostgreSQL   │      │   Ollama     │
                │ + pgvector   │      │ (HTTP :11434)│
                └──────────────┘      └──────────────┘
```

**Relación com módulos:**
- `config.js` — carga y valida `.env`; es leído por todos los demás.
- `index.js` — arranca la sesión de WhatsApp y conecta eventos.
- `handlers/message.js` — decide la respuesta según el tipo de mensaje (saludo vs. pregunta RAG).
- `db.js` — pool de conexión a PostgreSQL.
- `rag/ingest.js` — lee PDF/TXT, trocea en fragmentos y persiste embeddings (H4).
- `rag/search.js` — búsqueda top-K por similitud y construcción del contexto (H3).

Detalle adicional en [estructura de módulos](../nodejs/01-estructura-modulos.md) y [flujo de ejecución](../nodejs/02-flujo-ejecucion.md).

## Interfaces externas

### Ollama (HTTP, `http://localhost:11434`)

| Endpoint | Uso en el bot | Referencia |
|---|---|---|
| `POST /api/generate` | Generar la respuesta con contexto (H3) | [ollama-local](..//apis/01-ollama-local.md) |
| `POST /api/embeddings` | Vectores de los fragmentos en ingesta (H4) | [ollama-local](..//apis/01-ollama-local.md) |
| `GET /api/tags` | Validar que el modelo elegido exista (H5) | [ollama-local](..//apis/01-ollama-local.md) |

### WhatsApp (through `whatsapp-web.js`)

| Fuente | Evento/llamada | Uso |
|---|---|---|
| Entrada | `message_create` / `message` | Recibir mensajes del propietario |
| Salida | `client.sendMessage()` | Enviar respuestas |
| Estado | `ready`, `disconnected`, QR | Lifecycle de la sesión (H1) |

Detalle en [whatsapp-web.js](../apis/03-whatsapp-webjs.md).

### API interna (expuesta por el propio bot)

| Endpoint | Propósito | Notas |
|---|---|---|
| `GET /health` | Verificación de vida (BD + Ollama) | Ruta de un futuro admin; en MVP solo se loguea |

Documentada en [internal-api](../apis/02-internal-api.md).

## Modelo de datos (visión general)

| Tabla | Función |
|---|---|
| `documents` | Metadatos del documento: nombre, ruta, hash de contenido, fecha |
| `chunks` | Fragmentos de texto (con `document_id`, orden, hash) |
| `embeddings` | Vector (`chunk_id`, `vector`) con índice vectorial pgvector |

El esquema completo, migraciones, consultas SQL de similitud e índices están en [base-de-datos](../base-de-datos/01-esquema.md).

## Flujo de datos (alto nivel)

```
Ingesta (H4):  archivo → leer → chunking → embeddings (Ollama) → grabar en pgvector
Pregunta (H3): texto → embedding de la pregunta → búsqueda top-K → contexto → LLM → respuesta
```

Intervinientes y decisiones registradas en [flujo de datos](../architecture/02-flujo-datos.md).

## Configuración por entorno

| Variable | Uso | Default |
|---|---|---|
| `PGHOST` / `PGPORT` / `PGUSER` / `PGPASSWORD` / `PGDATABASE` | Conexión BD | `localhost`, `5432`, `postgres`, `…`, `wa_assistant` |
| `OLLAMA_HOST` | Base URL de Ollama | `http://localhost:11434` |
| `OLLAMA_MODEL` | Modelo generador | `llama3.2` |
| `EMBEDDING_MODEL` | Modelo de vectores | `nomic-embed-text` |

Carga, validación y defaults en [config y env](../nodejs/05-config-y-env.md). Plantilla en `.env.example` (no versionada en `.env`).

## Decisión: Podman en vez de Docker

Podman es daemonless y compatible con `docker-compose.yml`; el proyecto usa Podman por defecto pero es portable a Docker. Justificación completa en [ADR](../architecture/03-adr.md).

## Criterios técnicos del MVP

- **Lenguaje:** JavaScript (Node.js, ESM), sin framework web en el núcleo; el "API" HTTP es mínimo.
- **Pruebas:** unitarias para handlers, ingesta y búsqueda; fixture de documentos de prueba ([testing](../guides/testing.md)).
- **CI:** lint + tests en cada PR ([ci.yml](../../.github/workflows/ci.yml)).
- **Scripts npm:** `dev`, `start`, `test`, `ingest` ([scripts npm](../nodejs/04-scripts-npm.md)).

---

↩️ [Volver al índice](../00-INDEX.md)