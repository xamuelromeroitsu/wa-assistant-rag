-- Wa-Assistant RAG - Inicialización de base de datos
-- Ejecutado automáticamente al crear el contenedor PostgreSQL + pgvector

-- 1. Habilitar extensión pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Tabla: documents
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    ruta VARCHAR(500),
    hash_contenido VARCHAR(64) NOT NULL,
    tamano_bytes INTEGER,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_ingesta TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla: chunks
CREATE TABLE chunks (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    orden INTEGER NOT NULL,
    texto TEXT NOT NULL,
    hash_fragmento VARCHAR(64) NOT NULL,
    UNIQUE(document_id, hash_fragmento)
);

-- 4. Tabla: embeddings
CREATE TABLE embeddings (
    id SERIAL PRIMARY KEY,
    chunk_id INTEGER NOT NULL REFERENCES chunks(id) ON DELETE CASCADE,
    vector VECTOR(768) NOT NULL,
    modelo VARCHAR(100) NOT NULL DEFAULT 'nomic-embed-text'
);

-- 5. Índice vectorial para búsquedas eficientes (cosine similarity)
CREATE INDEX embeddings_vector_idx ON embeddings USING ivfflat (vector vector_cosine_ops) WITH (lists = 100);

-- 6. Tabla: sessions (persistencia de sesión WhatsApp)
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(50) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Índices adicionales para performance
CREATE INDEX idx_chunks_document_id ON chunks(document_id);
CREATE INDEX idx_embeddings_chunk_id ON embeddings(chunk_id);
CREATE INDEX idx_embeddings_modelo ON embeddings(modelo);
CREATE UNIQUE INDEX idx_sessions_session_id ON sessions(session_id);

-- 8. Comentarios para documentación
COMMENT ON TABLE documents IS 'Metadatos de documentos cargados (PDF, TXT)';
COMMENT ON TABLE chunks IS 'Fragmentos de texto de ~500 caracteres extraídos de documentos';
COMMENT ON TABLE embeddings IS 'Vectores de embeddings (768 dims) para búsqueda semántica RAG';
COMMENT ON TABLE sessions IS 'Sesiones de WhatsApp para persistencia entre reinicios';
COMMENT ON COLUMN embeddings.vector IS 'Vector de 768 dimensiones generado por nomic-embed-text';