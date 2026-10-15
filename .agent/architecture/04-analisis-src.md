# 🔬 Análisis de `src/` y plan de mejoras

> Wa-Assistant RAG · auditoría del código fuente: puntos fuertes, debilidades y hoja de ruta de escalabilidad.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-10-15 |
| Versión asociada | v0.1.0 |
| Dueño | Equipo |

## ✅ Puntos buenos

- **Arquitectura en capas real y consistente**: dominio puro (`src/domain/*`, sin I/O), infraestructura, casos de uso (`rag/`, `handlers/`) y composición en `index.js`. Clean Architecture aplicada de verdad, no solo en el papel.
- **Inyección de dependencias** (`{ db, ollama, logger }` en todos los casos de uso) → testeable sin PostgreSQL/Ollama, y eso se refleja en los 58 tests unitarios que corren sin servicios externos.
- **`config.js` puro y validado** (`loadConfig(env)` congelado, defaults, validación de enteros y niveles de log) → configuración testeable y predecible.
- **Manejo de errores tipado** (`AppError` + códigos `ERR_*` + `userMessage` amigable en español, detalle solo en logs). Buena separación entre error técnico y error de usuario.
- **AbortController con timeouts** en `ollama.js`, verificación de la dimensión de embeddings (768) y `verifyModels` amigable al arranque.
- **Deduplicación por hash** de documentos (`hash_contenido`) y de chunks (`ON CONFLICT DO NOTHING`) → re-ingesta idempotente a nivel de fila.
- **Graceful shutdown** completo (`SIGINT`/`SIGTERM` con guard `shuttingDown`) y handlers globales de `uncaughtException`/`unhandledRejection`.

## ❌ Debilidades detectadas

### Calidad del RAG

1. **No hay umbral de distancia**: `searchSimilar` devuelve top-K *siempre*, aunque la similitud sea pésima. Si `distancia` es alta (irrelevante), igual se llama a Ollama → alucinaciones sobre contexto inútil. Es el problema de calidad n.º 1.
2. **Chunking sin overlap** (`chunking.js`): partir en 500 caracteres corta oraciones y sintagmas entre chunks → se pierde contexto en los bordes y baja el recall.
3. **`buildContext` trunca por carácter, no por token**, y puede descartar chunks relevantes si uno grande consume el presupuesto. Sin reranking por distancia.
4. **PDF sin metadata**: no se guarda número de página ni sección → la atribución "Fuente: X" es genérica y no se puede citar con precisión.
5. **Sin memoria conversacional**: cada mensaje es independiente; la tabla `sessions` existe en el schema pero **nunca se usa en `src/`** (LocalAuth guarda la sesión en disco, no en BD).

### Robustez y concurrencia

6. **Ollama es cuello de botella sin control**: dos llamadas LLM secuenciales por mensaje (`embed` + `generate`), sin caché de embeddings de preguntas repetidas, sin cola de concurrencia ni retry/backoff. Con N mensajes simultáneos se satura una sola instancia local de Ollama.
7. **Sin rate-limiting ni deduplicación de mensajes**: un usuario spameando dispara N pipelines RAG completos → el pool de PG (máx. 10 conexiones) y Ollama colapsan juntos.
8. **Ingesta sin transacción ni paralelismo**: `insertDocument` y luego N inserts secuenciales; si falla a la mitad queda un documento huérfano. Con PDFs grandes (cientos de chunks) es lentísimo, y el `statement_timeout` de 5 s puede cortar inserts legítimos.
9. **La re-ingesta no reemplaza**: si un archivo cambia (mismo nombre, distinto contenido) se crea un *nuevo* documento con los chunks viejos del anterior todavía consultables → respuestas con datos obsoletos.
10. **Un solo proceso monolítico** (`index.js` arranca todo, y la CLI de ingest duplica la composición). Sin métricas, sin logs estructurados (JSON), sin correlation ID.
11. **`uncaughtException` solo loguea y sigue**: el proceso queda en estado zombi.
12. **whatsapp-web.js = 1 sesión por proceso/instancia** con Puppeteer + LocalAuth: escalar horizontalmente es inviable tal cual; no hay reconexión automática real.
13. **`/health` sin autenticación** (expone estado interno) y `listDocuments()` sin paginación.
14. **Sin tests de integración** contra BD/vector real (solo unitarios con dobles).

## 🚀 Hoja de ruta de mejoras

### Fase 1 — Calidad de respuesta (impacto inmediato, bajo riesgo)

- `MAX_DISTANCE`/`MIN_SCORE` configurable: filtrar fragmentos con `distancia > umbral` antes de generar (`handlers/message.js` + `search.js`).
- Overlap de ~50-80 caracteres en `chunking.js` (ventana deslizante sobre oraciones, no solo párrafos).
- Presupuesto de contexto estimado en tokens + rerank por distancia; priorizar los chunks más cercanos.
- Guardar `pagina`/`seccion` en los chunks (pdf-parse ya aporta posición) para citar fuentes con precisión.

### Fase 2 — Robustez y concurrencia

- Cola con concurrencia limitada + retry con backoff exponencial para las llamadas a Ollama (`ollama.js`).
- Caché LRU en memoria de embeddings por pregunta normalizada (hit rate alto en preguntas frecuentes).
- Rate-limiter por usuario (token bucket) + dedup de mensajes idénticos en ventana corta.
- `uncaughtException`: log **y** `process.exit(1)` para que el orquestador reinicie limpio.

### Fase 3 — Escalabilidad estructural

- Transacción por documento en la ingesta + **re-ingesta que borra chunks/embeddings previos** del mismo documento (`DELETE` antes de insertar).
- Batch de embeddings: usar `/api/embed` con array de inputs (Ollama moderno lo soporta) en vez de una request por chunk.
- Índice **HNSW** en pgvector (mejor recall que ivfflat sin depender de `ANALYZE`) + `WHERE modelo = $1` con índice parcial; `ANALYZE` post-ingesta.
- Logs JSON estructurados con `requestId`; endpoint `/metrics` (contadores: mensajes, RAG hits/misses, latencias p95).
- Separar procesos: `bot`, `worker-ingest`, `health` (o al menos extraer la composición compartida a un módulo `composition/` para eliminar la duplicación con `runIngestCli`).
- Para multi-instancia: `RemoteAuth` (sesión en BD, usando la tabla `sessions` hoy muerta) o migrar a **WhatsApp Cloud API** (webhook stateless, escala horizontal sin Puppeteer).

### Fase 4 — Testing

- Tests de integración con pgvector (Testcontainers o `pg-mem` + vectores fake) y un test end-to-end del pipeline pregunta → respuesta con Ollama mockeado a nivel HTTP.

## 🎯 Prioridad recomendada

Empezar por la **Fase 1** (umbral de distancia + overlap de chunking): cambios chicos, alto impacto en la calidad de respuesta y sin romper la arquitectura actual. La Fase 2 es la que desbloquea la escalabilidad real del bot bajo carga.

---

↩️ [Volver al índice](../00-INDEX.md)
