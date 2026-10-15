# 📦 Estructura de Módulos Node.js

> Wa-Assistant RAG · organización de archivos y responsabilidad de cada módulo.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP) |
| Dueño | Técnico |

## Árbol de archivos

```
src/
├── index.js              # Composición/entrada (carga config, WhatsApp, ciclo de vida)
├── config.js             # loadConfig(env): carga y validación de .env
├── logger.js             # Logging con formato [YYYY-MM-DD HH:MM:SS] [LEVEL] [MÓDULO]
├── errors.js             # Códigos de error (ERR_*) y mensajes amigables en español
├── db.js                 # Pool de conexión a PostgreSQL + queries RAG
├── ollama.js             # Cliente de Ollama (HTTP, con timeouts)
├── server.js             # Servidor interno: GET /health
├── domain/               # Capa de dominio pura (sin I/O ni dependencias)
│   ├── hashing.js        #   SHA-256 de contenidos y fragmentos
│   ├── chunking.js       #   División del texto en fragmentos
│   ├── message.js        #   Clasificación de mensajes (saludo/pregunta/comando)
│   ├── context.js        #   Construcción del contexto para el prompt
│   └── prompt.js         #   System prompt y ensamblado del prompt final
├── handlers/
│   └── message.js        # Lógica de clasificación y respuesta de mensajes
└── rag/
    ├── ingest.js         # Pipeline de ingesta: leer → chunking → embeddings → persistir
    └── search.js         # Pipeline de búsqueda: embedding → top-K → contexto
```

## Responsabilidad de cada módulo

| Módulo | Archivo | Responsabilidad | Historia asociada |
|---|---|---|---|
| Configuración | `config.js` | `loadConfig(env)`: valida variables, expone config tipada | Transversal |
| Logging | `logger.js` | Logs con formato y niveles (DEBUG/INFO/WARN/ERROR) | Transversal |
| Errores | `errors.js` | `AppError` con código `ERR_*`, categoría y mensaje amigable | Transversal |
| Entrada | `index.js` | Inicializa WhatsApp, orquesta eventos y cierre limpio | H1 |
| BD | `db.js` | Pool de conexión PostgreSQL, queries CRUD y de similitud | Transversal |
| IA | `ollama.js` | Llamadas HTTP a Ollama (generate, embeddings, tags) | H3, H4, H5 |
| Servidor | `server.js` | `GET /health` con estado de db/ollama/whatsapp | H1 |
| Dominio | `domain/*.js` | Lógica pura y testeable sin mocks de infraestructura | Transversal |
| Mensajes | `handlers/message.js` | Clasifica mensajes (saludo vs. RAG), orquesta respuesta | H2, H3 |
| Ingesta | `rag/ingest.js` | Lee archivos PDF/TXT, chunking, embeddings, persistencia | H4 |
| Búsqueda | `rag/search.js` | Genera embedding de pregunta, busca top-K, construye contexto | H3 |

## Principios de diseño

1. **Una responsabilidad por módulo**: Cada archivo tiene un único propósito.
2. **Sin dependencias circulares**: `config.js` es importado por todos, pero no importa de nadie.
3. **Comunicación interna**: Los módulos se comunican por funciones exportadas, no por acceso directo a variables globales.
4. **Configuración externa**: `config.js` valida lo que le pasan; `index.js` es quien hace `dotenv.config()`.
5. **Error handling**: Cada módulo lanza errores con mensajes descriptivos; el handler central los captura.
6. **Dominio puro**: `domain/` y `errors.js` no hacen I/O; se testean sin mocks.
7. **Inyección de dependencias**: los casos de uso (`rag/`, `handlers/`) reciben `{ db, ollama, logger }` como parámetros, por lo que los tests los sustituyen por dobles sin tocar infraestructura.

## Dependencias (package.json)

| Dependencia | Tipo | Versión | Propósito |
|---|---|---|---|
| `whatsapp-web.js` | npm | últ. | Conector WhatsApp |
| `pg` | npm | últ. | Cliente PostgreSQL |
| `dotenv` | npm | últ. | Carga de variables de entorno |
| `pdf-parse` | npm | últ. | Extracción de texto de PDFs |
| `express` | npm | últ. | Servidor HTTP interno (`GET /health`) |

> Ollama se llama con el `fetch` global de Node.js 20+; no hace falta `node-fetch`.

## Flujo de importación (composición en `index.js`)

```
index.js ──▶ config.js, logger.js, errors.js
index.js ──▶ db.js ──▶ errors.js
index.js ──▶ ollama.js ──▶ errors.js
index.js ──▶ server.js
index.js ──▶ handlers/message.js ──▶ domain/message.js, domain/prompt.js
index.js ──▶ rag/search.js ──▶ domain/context.js        (recibe { db, ollama, logger })
index.js ──▶ rag/ingest.js ──▶ domain/chunking.js, domain/hashing.js
index.js ──▶ db.js, ollama.js, logger.js   (se inyectan en rag/ y handlers/)
```

`db.js` y `ollama.js` **no** son importados por `rag/` ni por `handlers/`: llegan como dependencias inyectadas.
`config.js`, `logger.js`, `errors.js` y `domain/` no importan de nadie salvo entre sí (sin dependencias circulares).

---

↩️ [Volver al índice](../00-INDEX.md)
