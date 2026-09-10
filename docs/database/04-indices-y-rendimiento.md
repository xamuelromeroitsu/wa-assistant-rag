# 🚀 Índices y Rendimiento

> Wa-Assistant RAG · optimización de la base de datos para búsquedas vectoriales.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP) |
| Dueño | Técnico |

## Índices principales

### Índice vectorial en embeddings

El índice vectorial es la clave para que las búsquedas por similitud sean rápidas.

```sql
CREATE INDEX idx_embeddings_vector ON embeddings USING ivfflat (vector vector_cosine_ops);
```

| Índice | Tipo | Operador | Descripción |
|---|---|---|---|
| `idx_embeddings_vector` | ivfflat | `vector_cosine_ops` | Búsqueda por similitud coseno |

**ivfflat** es el tipo de índice recomendado por pgvector para búsquedas aproximadas de alta velocidad. La configuración por defecto es suficiente para el MVP.

### Índices de foreign key

```sql
CREATE INDEX idx_chunks_document_id ON chunks(document_id);
CREATE INDEX idx_embeddings_chunk_id ON embeddings(chunk_id);
```

### Índices de búsqueda

```sql
CREATE INDEX idx_documents_hash ON documents(hash_contenido);
CREATE INDEX idx_chunks_hash ON chunks(hash_fragmento);
```

## Configuración de rendimiento de PostgreSQL

| Parámetro | Valor recomendado | Justificación |
|---|---|---|
| `shared_buffers` | 25% de RAM | Cache de datos de PostgreSQL |
| `work_mem` | `16MB` | Memoria para operaciones de ordenamiento |
| `maintenance_work_mem` | `256MB` | Memoria para operaciones de mantenimiento (VACUUM, CREATE INDEX) |
| `effective_cache_size` | 75% de RAM | Planificador de queries |
| `random_page_cost` | `1.1` | Optimizado para SSD |

## Rendimiento esperado

| Operación | Volumen | Tiempo estimado |
|---|---|---|
| Búsqueda vectorial (top-5) | Hasta 10,000 embeddings | < 100 ms |
| Búsqueda vectorial (top-5) | Hasta 100,000 embeddings | < 500 ms |
| Ingesta de un PDF (10 páginas) | ~50 chunks | < 5 s |
| Inserción de embeddings | 1,000 por lote | < 30 s |

## Escalabilidad

- El MVP está diseñado para **hasta 100 documentos** (~10,000 fragments).
- Para volúmenes mayores, considerar:
  - Particionamiento de tabla por `document_id`
  - Ajuste de parámetros de pgvector (lists, probes)
  - Migración a BD vectorial dedicada si es necesario

## VACUUM y ANALYZE

Se recomienda ejecutar periódicamente:

```sql
VACUUM ANALYZE;
```

Esto mantiene actualizadas las estadísticas del planificador de queries y recupera espacio en tablas y índices.

---

↩️ [Volver al índice](../00-INDEX.md)
