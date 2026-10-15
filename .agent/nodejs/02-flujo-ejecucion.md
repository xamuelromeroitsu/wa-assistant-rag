# 🔄 Flujo de Ejecución

> Wa-Assistant RAG · orden de arranque y ciclo de vida del proceso Node.js.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP) |
| Dueño | Técnico |

## Arranque (`npm run dev`)

```
npm run dev
    │
    ▼
1. Carga de variables de entorno
   └── dotenv.config() → lee .env
    │
    ▼
2. Validación de configuración
   └── config.js → verifica que OLLAMA_HOST, PGHOST, etc. estén definidos
   └── Si falta algo: muestra error y termina
    │
    ▼
3. Inicialización de conexión a PostgreSQL
   └── db.js → crea pool de conexión
   └── Prueba de conexión: SELECT 1
   └── Si falla: muestra error de BD
    │
    ▼
4. Verificación de modelos Ollama
   └── ollama.js → GET /api/tags
   └── Verifica que OLLAMA_MODEL y EMBEDDING_MODEL existan
   └── Si no existen: muestra "ollama pull <modelo>"
   └── Si falla Ollama: muestra "El motor de IA no está disponible"
    │
    ▼
5. Inicialización de WhatsApp
   └── index.js → client.initialize()
   └── Muestra QR en terminal (si no hay sesión guardada)
   └── Evento 'ready' → bot conectado
    │
    ▼
6. Bucle de eventos
   └── Espera mensajes de WhatsApp
   └── message_create → handlers/message.js
```

## Ciclo de vida del proceso

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  INICIO  │────▶│ ESCUCHANDO│────▶│  CERRANDO │────▶│  FIN     │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                 │                 │
     │                 │  Ctrl+C         │
     │                 │                 │
     │                 │                 ▼
     │                 │          client.destroy()
     │                 │          db.end()
     │                 │          proceso sale limpio
     │                 │
     └─────────────────┘  Sesión persistente en .wwebjs_auth/
                           No necesita reescanear QR al reiniciar
```

## Flujo de un mensaje (H3)

```
WhatsApp → message_create → handlers/message.js
                                │
                                ├── ¿Es saludo?
                                │       → Respuesta directa (H2)
                                │       → Fin
                                │
                                └── ¿Es pregunta?
                                        │
                                        ▼
                                    rag/search.js
                                        │
                                        ├── Embedding de la pregunta (Ollama)
                                        ├── Búsqueda top-K en pgvector
                                        ├── Construcción de contexto
                                        └── Si vacío → "No encontré información"
                                        │
                                        ▼
                                    ollama.js POST /api/generate
                                        │
                                        ├── System prompt + contexto + pregunta
                                        ├── Ollama genera respuesta
                                        └── Timeout? → Error amigable
                                        │
                                        ▼
                                    Enviar respuesta por WhatsApp
```

## Flujo de ingesta (H4)

```
Usuario ejecuta: npm run ingest <ruta_archivos>
    │
    ▼
rag/ingest.js
    │
    ├── Lee cada archivo (PDF/TXT)
    ├── Divide en chunks
    ├── Para cada chunk:
    │       ├── Genera embedding (Ollama)
    │       ├── Inserta en chunks (BD)
    │       └── Inserta en embeddings (BD)
    ├── Guarda metadatos en documents (BD)
    └── Reporte de resumen
```

## Manejo de reinicio

| Escenario | Comportamiento |
|---|---|
| `Ctrl+C` | Cierre limpio; sesión persiste en `.wwebjs_auth/` |
| Crash inesperado | Sesión persiste; al reiniciar se reanuda automáticamente |
| Sesión expirada | Se muestra QR nuevo; el usuario debe reescanear |
| BD caída | El bot no arranca (config.js falla la validación de BD) |
| Ollama caído | El bot arranca pero muestra advertencia; respuestas fallan |

---

↩️ [Volver al índice](../00-INDEX.md)
