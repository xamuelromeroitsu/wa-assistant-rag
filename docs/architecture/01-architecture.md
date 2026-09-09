# 🏗️ Arquitectura de Alto Nivel

> Wa-Assistant RAG · diagrama de bloques y relaciones entre componentes del sistema.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP) |
| Dueño | Técnico |

## Visión general

**Wa-Assistant RAG** sigue una arquitectura de **monolito modular con capas** s MMLL (Modular Monolith with Layers). Un único proceso Node.js orquesta toda la lógica, separando responsabilidades en módulos independientes que se comunican entre sí de forma interna.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FUENTE DE DATOS                            │
│                                                                     │
│  ┌──────────────────┐        ┌──────────────────────────────┐     │
│  │   PostgreSQL 16  │        │         Ollama               │     │
│  │   + pgvector     │        │   (API HTTP :11434)          │     │
│  │                  │        │                              │     │
│  │  ┌────────────┐  │        │  ┌────────────────────┐      │     │
│  │  │  Tabla     │  │        │  │  Modelo llama3.2   │      │     │
│  │  │  documents │  │        │  │  (respuestas)      │      │     │
│  │  ├────────────┤  │        │  ├────────────────────┤      │     │
│  │  │  Tabla     │  │        │  │  Modelo nomic-     │      │     │
│  │  │  chunks    │  │        │  │  embed-text        │      │     │
│  │  ├────────────┤  │        │  │  (embeddings)      │      │     │
│  │  │  Tabla     │  │        │  └────────────────────┘      │     │
│  │  │  embeddings│  │        │                              │     │
│  │  └────────────┘  │        └──────────────────────────────┘     │
│  └────────┬─────────┘                        ▲                     │
│           │ SQL / pgvector                   │                     │
│           ▼                                  │                     │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │                    NODE.JS (BOT)                         │      │
│  │                                                         │      │
│  │  ┌─────────────┐     ┌──────────────────────────────┐   │      │
│  │  │  config.js  │────▶│      index.js                │   │      │
│  │  │  (carga     │     │  (punto de entrada,          │   │      │
│  │  │   .env)     │     │   arranca sesión WhatsApp)   │   │      │
│  │  └─────────────┘     └──────────┬───────────────────┘   │      │
│  │                                 │                        │      │
│  │                    ┌────────────┼────────────┐          │      │
│  │                    ▼            ▼            ▼          │      │
│  │             ┌────────────┐ ┌───────────┐ ┌───────────┐ │      │
│  │             │handlers/   │ │ rag/      │ │ db.js     │ │      │
│  │             │message.js  │ │ ingest.js │ │ (pool     │ │      │
│  │             │(H1,H2,H3)  │ │(H4)       │ │  pg)      │ │      │
│  │             └────────────┘ ├───────────┘ └───────────┘ │      │
│  │                          ▼                             │      │
│  │                   ┌──────────────┐                    │      │
│  │                   │ rag/search.js│                    │      │
│  │                   │(H3 - RAG)    │                    │      │
│  │                   └──────────────┘                    │      │
│  └─────────────────────────────────────────────────────────┘      │
│                                                                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               │ WhatsApp Web
                               │ (QR / sesion)
                               ▼
                    ┌─────────────────────┐
                    │    WhatsApp Móvil   │
                    │  (usuario final)    │
                    └─────────────────────┘
```

## Componentes y responsabilidades

| Componente | Archivo | Responsabilidad |
|---|---|---|
| **Configuración** | `config.js` | Carga y validación del archivo `.env`; expone configuración tipada a todo el sistema |
| **Motor de mensajes** | `index.js` | Punto de entrada; arranca la sesión de WhatsApp y registra eventos |
| **Handler de mensajes** | `handlers/message.js` | Clasifica el tipo de mensaje (saludo, pregunta, comando) y orquesta la respuesta |
| **Base de datos** | `db.js` | Pool de conexión a PostgreSQL; expone funciones CRUD |
| **Ingesta RAG** | `rag/ingest.js` | Lee PDF/TXT, divide en fragmentos, genera embeddings y persiste en pgvector |
| **Búsqueda RAG** | `rag/search.js` | Recibe una pregunta, genera embedding, busca fragmentos relevantes en pgvector y construye el contexto |

## Flujo de comunicación

```
whatsapp-web.js          index.js          handlers/message.js
     │                       │                       │
     │  message_create       │                       │
     │──────────────────────▶│                       │
     │                       │─── pregunta? ────────▶│
     │                       │                       │─── saludo? ──▶ Respuesta directa
     │                       │                       │
     │                       │                       │─── RAG ──────▶ rag/search.js
     │                       │                       │                       │
     │                       │                       │                       │ pgvector
     │                       │                       │                       │ (búsqueda)
     │                       │                       │◀──────────────────────│
     │                       │                       │                       │
     │                       │                       │─── Ollama ──────▶ Ollama
     │                       │                       │                       │ (generación)
     │                       │                       │◀──────────────────────│
     │                       │                       │
     │◀──────────────────────│◀──────────────────────│
     │   respuesta texto     │                       │
```

## Principios arquitectónicos

1. **Capas separadas**: cada módulo tiene una única responsabilidad y no conoce la implementación interna de otros.
2. **Configuración externa**: toda la configuración vive en `.env`, no hay hardcodes.
3. **Local-first**: todas las comunicaciones con Ollama y PostgreSQL son locales; la única conexión externa es WhatsApp.
4. **Persistencia de sesión**: la sesión de WhatsApp Web se almacena en disco para sobrevivir reinicios.

## Tecnologías y versiones

| Tecnología | Versión | Rol |
|---|---|---|
| Node.js | ≥ 20 | Runtime |
| whatsapp-web.js | última | Conector WhatsApp |
| Ollama | última | Motor de IA |
| PostgreSQL | 16 | Base de datos |
| pgvector | última | Extensión vectorial |
| Podman | 4+ | Contenedor de BD |

---

↩️ [Volver al índice](../00-INDEX.md)
