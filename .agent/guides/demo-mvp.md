# 🧪 Demo del MVP (evidencia de H1–H5)

> Wa-Assistant RAG · corrida manual documentada del recorrido completo del MVP con servicios reales.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-10-15 |
| Versión asociada | v0.1.0 |
| Dueño | Equipo |

## Entorno de la corrida

| Componente | Detalle |
|---|---|
| PostgreSQL | 16.15 + pgvector, contenedor `wa-assistant-db` (puerto 5433, porque el 5432 local estaba ocupado por otra instancia) |
| Ollama | `llama3.2` (generación) + `nomic-embed-text` (embeddings), CPU local |
| Node.js | 24 (mínimo requerido: 20) |
| Configuración | `.env` creado desde `.env.example`, con `OLLAMA_GENERATE_TIMEOUT_MS=180000` (la CPU local tarda más de 30 s con prompts RAG largos) |

## Pasos ejecutados

```bash
# 1. Base de datos ( esquema + pgvector )
podman run -d --name wa-assistant-db -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=<la de .env> -e POSTGRES_DB=wa_assistant -p 5433:5432 \
  -v wa-assistant-rag_pgdata:/var/lib/postgresql/data \
  -v ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql \
  docker.io/pgvector/pgvector:pg16

# 2. Ingesta de documentos reales (fixtures del repo)
npm run ingest tests/fixtures

# 3. Pregunta sin WhatsApp (H3, sin reiniciar el bot)
node scripts/ask.js "cuantas kcal aporta la proteina"
```

## Resultados observados

| Verificación | Resultado |
|---|---|
| Ingesta de PDF + TXT | 2 documentos, 6 fragmentos, 6 embeddings, 0 errores |
| Re-ingesta (idempotencia por hash) | 0 archivos procesados, 0 errores |
| Búsqueda RAG | 5 fragmentos recuperados (`topK=5`) |
| Generación | «La proteína aporta 4 kcal por gramo.» (respuesta fundamentada en el contexto) |
| H5 con `EMBEDDING_MODEL` distinto | `AVISO: EMBEDDING_MODEL="otro-modelo" no coincide con los embeddings almacenados` |

## Hallazgos durante la demo

1. **Timeouts de Ollama ahora configurables** (`OLLAMA_GENERATE_TIMEOUT_MS`, `OLLAMA_EMBEDDINGS_TIMEOUT_MS`, `OLLAMA_TAGS_TIMEOUT_MS`): el default de 30 s quedaba corto en CPU con prompts RAG largos.
2. **Ingesta transaccional**: una corrida fallida previa (modelo sin descargar) había dejado 2 documentos con 1 fragmento y 0 embeddings — el patrón "documento huérfano". Ahora los embeddings se generan **antes** de tocar la BD y la persistencia va en una transacción con rollback.
3. **Mensaje de error 404 corregido**: cuando falta el modelo de embeddings, el error ahora sugiere `ollama pull nomic-embed-text` (antes siempre sugería el modelo de generación).

## Reproducir

1. `podman compose up -d` (o el `podman run` documentado arriba).
2. `ollama pull llama3.2 && ollama pull nomic-embed-text`.
3. `cp .env.example .env` y ajustar `PGPORT` si el 5432 está ocupado.
4. `npm run ingest tests/fixtures` y `node scripts/ask.js "<pregunta>"`.
5. `node scripts/db-status.js` para ver documentos, fragmentos y modelos de embeddings.

---

↩️ [Volver al índice](../00-INDEX.md)
