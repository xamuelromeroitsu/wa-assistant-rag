# 🗄️ Esquema de Base de Datos

> Wa-Assistant RAG · estructura de tablas de PostgreSQL + pgvector para el MVP.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP) |
| Dueño | Técnico |

## Terminología técnica

| Término | Explicación |
|---|---|
| **pgvector** | Extensión de PostgreSQL que añade el tipo `VECTOR` y búsqueda por similitud (cosine distance) |
| **Chunk** | Fragmento de texto de ~300-500 palabras extraído de un documento. Un documento se divide en muchos chunks |
| **Embedding** | Vector de 768 números decimales que representa el **significado** del texto. Generado por el modelo `nomic-embed-text` |
| **`VECTOR(768)`** | Tipo de dato de pgvector — un arreglo de 768 dimensiones numéricas |
| **`<=>`** | Operador de distancia cosine de pgvector. Mide qué tan parecidos son dos vectores (0 = idénticos, 1 = opuestos) |
| **`pgvector_cosine_ops`** | Operador de índice vectorial para búsquedas eficientes en pgvector |
| **`CREATE EXTENSION pgvector`** | Comando SQL que activa pgvector en la base de datos |
| **`SERIAL`** | Tipo de dato auto-incremental en PostgreSQL (1, 2, 3…) |
| **`JSONB`** | Tipo de dato JSON binario — se puede indexar y consultar eficientemente |
| **`SHA-256`** | Función hash criptográfica — genera un string único de 64 caracteres para detectar duplicados |

## Diagrama de entidades

```
┌──────────────┐1───────N┌──────────────┐1───────1┌──────────────┐
│  documents   │         │    chunks    │         │  embeddings  │
│──────────────│         │──────────────│         │──────────────│
│ id (PK)      │         │ id (PK)      │         │ id (PK)      │
│ nombre       │         │ document_id  │         │ chunk_id(FK) │
│ ruta         │         │ orden        │         │ vector       │
│ hash_contenido│         │ texto        │         │ (VECTOR(768))│
│ tamano_bytes │         │ hash_fragmento│         │ modelo       │
│ fecha_creacion│         │              │         │              │
│ fecha_ingesta│         │              │         │              │
└──────────────┘         └──────────────┘         └──────────────┘

┌──────────────┐
│   sessions   │
│──────────────│
│ id (PK)      │
│ platform     │
│ session_id   │
│ data (JSONB) │
│ created_at   │
│ updated_at   │
└──────────────┘
```

## Relación entre tablas (explicada)

```
Un documento se divide en muchos chunks.
Cada chunk tiene un embedding (vector) que representa su significado.
```

- **`documents` → `chunks` (1:N)**: Un documento (PDF, TXT) se divide en muchos fragmentos. Cada fragmento es un `chunk`. Se relacionan por `document_id`.
- **`chunks` → `embeddings` (1:1)**: Cada fragmento tiene exactamente un vector (embedding). Se relacionan por `chunk_id`.
- **`sessions`**: Independiente. Almacena las sesiones de WhatsApp para persistencia.

## Conexión desde Node.js

**Driver**: `pg` (`npm install pg`)
**Pool**: Conexión persistente a PostgreSQL

```javascript
const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'wa_assistant',
  user: 'postgres',
  password: process.env.PGPASSWORD
});
```

**Uso para búsqueda por similitud (RAG)**:
```javascript
const result = await pool.query(`
  SELECT c.texto, c.document_id, c.orden
  FROM embeddings e
  JOIN chunks c ON c.id = e.chunk_id
  WHERE e.modelo = $1
  ORDER BY e.vector <=> $2
  LIMIT $3
`, [modelo, vectorPregunta, limite]);
```

## Tabla: documents

Almacena los metadatos de cada documento cargado.

```sql
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    ruta VARCHAR(500),
    hash_contenido VARCHAR(64) NOT NULL,
    tamano_bytes INTEGER,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_ingesta TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL | Identificador único (PK) |
| `nombre` | VARCHAR(255) | Nombre del archivo original |
| `ruta` | VARCHAR(500) | Ruta donde se encuentra el archivo |
| `hash_contenido` | VARCHAR(64) | SHA-256 del contenido para detectar duplicados |
| `tamano_bytes` | INTEGER | Tamaño del archivo en bytes |
| `fecha_creacion` | TIMESTAMP | Fecha de creación original del archivo |
| `fecha_ingesta` | TIMESTAMP | Fecha en que se cargó al sistema |

## Tabla: chunks

Almacena los fragmentos de texto de cada documento.

```sql
CREATE TABLE chunks (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(id),
    orden INTEGER NOT NULL,
    texto TEXT NOT NULL,
    hash_fragmento VARCHAR(64) NOT NULL,
    UNIQUE(document_id, hash_fragmento)
);
```

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL | Identificador único (PK) |
| `document_id` | INTEGER | Referencia al documento original (FK) |
| `orden` | INTEGER | Posición del fragmento dentro del documento |
| `texto` | TEXT | Contenido del fragmento |
| `hash_fragmento` | VARCHAR(64) | SHA-256 del fragmento para detectar duplicados |

**Constraint**: `UNIQUE(document_id, hash_fragmento)` evita duplicados.

## Tabla: embeddings

Almacena los vectores numéricos de cada fragmento para búsqueda por similitud.

```sql
CREATE TABLE embeddings (
    id SERIAL PRIMARY KEY,
    chunk_id INTEGER NOT NULL REFERENCES chunks(id),
    vector VECTOR(768) NOT NULL,
    modelo VARCHAR(100) NOT NULL DEFAULT 'nomic-embed-text'
);
```

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | SERIAL | Identificador único (PK) |
| `chunk_id` | INTEGER | Referencia al fragmento (FK) |
| `vector` | VECTOR(768) | Vector de embeddings (768 dimensiones para `nomic-embed-text`) |
| `modelo` | VARCHAR(100) | Modelo de embeddings usado |

**Índice**: Se crea un índice vectorial sobre `vector` para búsquedas eficientes con `pgvector_cosine_ops` (ver [04-indices-y-rendimiento.md](04-indices-y-rendimiento.md)).

**Operador `<=>`**: Se usa en las consultas para calcular distancia cosine entre el vector de la pregunta y los vectores almacenados:
```sql
ORDER BY e.vector <=> $2  -- menor distancia = más parecido
```

## Tabla: sessions (opcional para MVP)

Almacena sesiones de WhatsApp para persistencia.

```sql
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(50) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Consultas SQL principales

Detalle en [03-consultas-sql.md](03-consultas-sql.md).

## Migraciones

Los scripts SQL de inicialización están en [scripts/init-db.sql](../../scripts/init-db.sql). Detalle de migraciones en [02-migraciones.md](02-migraciones.md).

---

↩️ [Volver al índice](../00-INDEX.md)
