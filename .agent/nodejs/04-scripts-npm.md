# 📜 Scripts NPM

> Wa-Assistant RAG · comandos disponibles para ejecutar el bot.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP) |
| Dueño | Técnico |

## Scripts definidos en package.json

### `npm run dev`

**Propósito**: Ejecutar el bot en modo desarrollo con recarga en caliente.

```bash
npm run dev
```

**Comportamiento**:
- Muestra el código QR de WhatsApp.
- El bot queda en modo escucha.
- Cualquier cambio en el código se recarga automáticamente.

**Salida esperada**:
```
QR Code displayed. Scan with WhatsApp to connect.
Bot connected and listening for messages...
```

### `npm start`

**Propósito**: Ejecutar el bot en modo producción.

```bash
npm start
```

**Comportamiento**:
- Similar a `dev` pero sin recarga en caliente.
- Para despliegue final.

### `npm run ingest`

**Propósito**: Ingestar documentos a la base de datos (H4).

```bash
npm run ingest <ruta_archivos>
```

**Ejemplo**:
```bash
npm run ingest ./documentos/
```

**Comportamiento**:
- Lee todos los PDFs y TXTs de la ruta indicada.
- Procesa cada archivo: chunking → embeddings → persistencia.
- Muestra resumen: archivos procesados, fragmentos generados, errores.

**Salida esperada**:
```
Ingesta completada:
  - Archivos procesados: 3
  - Fragmentos generados: 127
  - Errores: 0
```

### `npm test`

**Propósito**: Ejecutar las pruebas automatizadas.

```bash
npm test
```

**Comportamiento**:
- Ejecuta tests unitarios y de integración.
- Cobertura de handlers, ingesta y búsqueda.
- Detalle en [docs/guides/testing.md](../guides/testing.md).

### `npm run lint`

**Propósito**: Verificar el estilo del código.

```bash
npm run lint
```

**Comportamiento**:
- Ejecuta el linter configurado.
- Devuelve errores de estilo sin ejecutar el código.
- Debe estar limpio antes de cualquier PR.

### `npm run setup`

**Propósito**: Instalación completa del entorno.

```bash
npm run setup
```

**Comportamiento** (pseudo-scripts, por ejecutar en orden):
```bash
npm install
podman compose up -d
ollama pull llama3.2
ollama pull nomic-embed-text
copy .env.example .env
```

## Comandos externos requeridos

| Comando | Cuándo | Qué hace |
|---|---|---|
| `podman compose up -d` | Antes de `npm run dev` | Levanta PostgreSQL + pgvector |
| `ollama pull llama3.2` | Una sola vez | Descarga modelo de generación |
| `ollama pull nomic-embed-text` | Una sola vez | Descarga modelo de embeddings |
| `npm install` | Después de clonar | Instala dependencias de Node.js |

## Variables de entorno requeridas

Detalle completo en [05-config-y-env.md](05-config-y-env.md).

Variables mínimas en `.env`:
```env
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=tu_password
PGDATABASE=wa_assistant
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2
EMBEDDING_MODEL=nomic-embed-text
```

---

↩️ [Volver al índice](../00-INDEX.md)
