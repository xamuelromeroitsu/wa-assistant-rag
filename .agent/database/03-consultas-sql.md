# 📝 Consultas SQL

> Wa-Assistant RAG · queries principales para el sistema RAG.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP) |
| Dueño | Técnico |

## Consulta: Insertar documento

```sql
INSERT INTO documents (nombre, ruta, hash_contenido, tamano_bytes)
VALUES ($1, $2, $3, $4)
RETURNING id;
```

**Parámetros**: nombre, ruta, hash_contenido, tamano_bytes.

## Consulta: Insertar fragmento

```sql
INSERT INTO chunks (document_id, orden, texto, hash_fragmento)
VALUES ($1, $2, $3, $4)
ON CONFLICT (document_id, hash_fragmento) DO NOTHING
RETURNING id;
```

**Parámetros**: document_id, orden, texto, hash_fragmento.
**Nota**: `ON CONFLICT DO NOTHING` evita duplicados (ver H4 del MVP).

## Consulta: Insertar embedding

```sql
INSERT INTO embeddings (chunk_id, vector, modelo)
VALUES ($1, $2, $3);
```

**Parámetros**: chunk_id, vector (array), modelo.

## Consulta: Búsqueda por similitud (RAG)

```sql
SELECT c.texto, c.document_id, c.orden
FROM embeddings e
JOIN chunks c ON c.id = e.chunk_id
WHERE e.modelo = $1
ORDER BY e.vector <=> $2
LIMIT $3;
```

**Parámetros**: modelo (ej. `'nomic-embed-text'`), vector de la pregunta (array), límite K.
**Explicación**: Usa el operador `<=>` de pgvector para calcular distancia cosine y retorna los K fragmentos más similares.

## Consulta: Verificar si un fragmento ya existe

```sql
SELECT id FROM chunks WHERE hash_fragmento = $1;
```

**Parámetros**: hash del fragmento.
**Uso**: Antes de insertar, verificar si el fragmento ya fue procesado.

## Consulta: Verificar si un documento ya fue procesado

```sql
SELECT id FROM documents WHERE hash_contenido = $1;
```

**Parámetros**: hash del contenido completo del documento.
**Uso**: Antes de ingestar, verificar si el documento ya existe (evitar re-ingesta).

## Consulta: Listar documentos cargados

```sql
SELECT d.id, d.nombre, d.hash_contenido, d.tamano_bytes, d.fecha_ingesta
FROM documents d
ORDER BY d.fecha_ingesta DESC;
```

**Uso**: Panel de administración o para el usuario.

## Consulta: Contar fragmentos por documento

```sql
SELECT d.nombre, COUNT(c.id) AS total_fragmentos
FROM documents d
JOIN chunks c ON c.document_id = d.id
GROUP BY d.nombre
ORDER BY total_fragmentos DESC;
```

## Terminología técnica de las consultas

| Término | Explicación |
|---|---|
| **`$1`, `$2`, `$3`** | Placeholders de parámetros en queries preparadas. **No son comandos SQL** — son marcadores que se reemplazan con valores reales al ejecutar. Prevención de SQL injection.  `$1` = nombre, `$2` = ruta, `$3` = hash. Se pasan como array: `[nombre, ruta, hash]|
| **`ON CONFLICT DO NOTHING`** | Si el registro ya existe, no hace nada (upsert) |
| **`RETURNING`** | Devuelve la fila insertada después de hacer el INSERT |
| **`JOIN`** | Combina filas de dos tablas relacionadas por una FK |
| **`ORDER BY`** | Ordena los resultados según la columna indicada |
| **`LIMIT`** | Limita la cantidad de filas retornadas |
| **`<=>`** | Distancia cosine de pgvector (ya explicada en `01-esquema.md`) |

---

↩️ [Volver al índice](../00-INDEX.md)
