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
├── index.js              # Punto de entrada principal
├── config.js             # Carga y validación de configuración (.env)
├── db.js                 # Pool de conexión a PostgreSQL
├── ollama.js             # Cliente de Ollama (HTTP)
├── handlers/
│   └── message.js        # Lógica de clasificación y respuesta de mensajes
└── rag/
    ├── ingest.js         # Pipeline de ingesta: leer → chunking → embeddings → persistir
    └── search.js         # Pipeline de búsqueda: embedding → top-K → contexto
```

## Responsabilidad de cada módulo

| Módulo | Archivo | Responsabilidad | Historia asociada |
|---|---|---|---|
| Configuración | `config.js` | Carga `.env`, valida variables, expone config | Transversal |
| Entrada | `index.js` | Inicializa WhatsApp, orquesta eventos | H1 |
| BD | `db.js` | Pool de conexión PostgreSQL, queries CRUD | Transversal |
| IA | `ollama.js` | Llamadas HTTP a Ollama (generate, embeddings, tags) | H3, H4, H5 |
| Mensajes | `handlers/message.js` | Clasifica mensajes (saludo vs. RAG), orquesta respuesta | H2, H3 |
| Ingesta | `rag/ingest.js` | Lee archivos PDF/TXT, chunking, embeddings, persistencia | H4 |
| Búsqueda | `rag/search.js` | Genera embedding de pregunta, busca top-K, construye contexto | H3 |

## Principios de diseño

1. **Una responsabilidad por módulo**: Cada archivo tiene un único propósito.
2. **Sin dependencias circulares**: `config.js` es importado por todos, pero no importa de nadie.
3. **Comunicación interna**: Los módulos se comunican por funciones exportadas, no por acceso directo a variables globales.
4. **Configuración externa**: `config.js` lee de `.env`; ningún hardcode.
5. **Error handling**: Cada módulo lanza errores con mensajes descriptivos; el handler central los captura.

## Dependencias (package.json)

| Dependencia | Tipo | Versión | Propósito |
|---|---|---|---|
| `whatsapp-web.js` | npm | últ. | Conector WhatsApp |
| `pg` | npm | últ. | Cliente PostgreSQL |
| `dotenv` | npm | últ. | Carga de variables de entorno |
| `pdf-parse` | npm | últ. | Extracción de texto de PDFs |
| `node-fetch` | npm | últ. | Cliente HTTP para Ollama |
| `express` | npm | últ. | Servidor HTTP interno (opcional) |

## Flujo de importación

```
index.js ──▶ config.js
index.js ──▶ db.js
index.js ──▶ handlers/message.js
handlers/message.js ──▶ ollama.js
handlers/message.js ──▶ rag/search.js
handlers/message.js ──▶ rag/ingest.js (cuando hay un comando de ingesta)
rag/ingest.js ──▶ db.js
rag/ingest.js ──▶ ollama.js
rag/search.js ──▶ db.js
rag/search.js ──▶ ollama.js
```

---

↩️ [Volver al índice](../00-INDEX.md)
