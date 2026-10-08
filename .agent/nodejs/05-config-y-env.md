# ⚙️ Configuración y Variables de Entorno

> Wa-Assistant RAG · toda la configuración del sistema vive en .env.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP) |
| Dueño | Técnico |

## Estructura de configuración

Toda la configuración vive en el archivo `.env`, que se crea copiando `.env.example`:

```bash
copy .env.example .env
```

**Nunca** se sube `.env` al repositorio (protegido por `.gitignore`).

## Variables de entorno

### Base de datos (PostgreSQL + pgvector)

| Variable | Default | Descripción | Requerida |
|---|---|---|---|
| `PGHOST` | `localhost` | Host de PostgreSQL | ✅ Sí |
| `PGPORT` | `5432` | Puerto de conexión | ✅ Sí |
| `PGUSER` | `postgres` | Usuario de la base de datos | ✅ Sí |
| `PGPASSWORD` | — | Contraseña del usuario | ✅ Sí |
| `PGDATABASE` | `wa_assistant` | Nombre de la base de datos | ✅ Sí |

### IA (Ollama)

| Variable | Default | Descripción | Requerida |
|---|---|---|---|
| `OLLAMA_HOST` | `http://localhost:11434` | URL base del servicio Ollama | ✅ Sí |
| `OLLAMA_MODEL` | `llama3.2` | Modelo para generación de respuestas | ✅ Sí |
| `EMBEDDING_MODEL` | `nomic-embed-text` | Modelo para generación de embeddings | ✅ Sí |

### Servidor interno

| Variable | Default | Descripción | Requerida |
|---|---|---|---|
| `PORT` | `3000` | Puerto del servidor HTTP interno | ❌ No |

### WhatsApp

| Variable | Default | Descripción | Requerida |
|---|---|---|---|
| `WABA_BOT_NUMBER` | — | Número de WhatsApp del bot (referencia) | ❌ No |

## Carga y validación de configuración

La carga se realiza en `config.js` con el siguiente orden:

```javascript
// 1. Carga variables de entorno desde .env
require('dotenv').config();

// 2. Validación de variables requeridas
const required = ['PGHOST', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE', 'OLLAMA_HOST', 'OLLAMA_MODEL', 'EMBEDDING_MODEL'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Variable de entorno requerida no definida: ${key}`);
  }
}

// 3. Exporta configuración tipada
module.exports = {
  database: {
    host: process.env.PGHOST,
    port: parseInt(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE
  },
  ollama: {
    host: process.env.OLLAMA_HOST,
    model: process.env.OLLAMA_MODEL,
    embeddingModel: process.env.EMBEDDING_MODEL
  }
};
```

## Reglas de configuración

1. **Todos los secretos** en `.env`, nunca en el código.
2. **Los defaults** en `.env.example` son valores seguros para desarrollo local.
3. **La contraseña de BD** debe cambiarse en producción.
4. **Los modelos Ollama** deben descargarse antes de ejecutar el bot:
   ```bash
   ollama pull llama3.2
   ollama pull nomic-embed-text
   ```
5. **Si Ollama está en otra máquina** (poco probable), cambiar `OLLAMA_HOST` a la IP remota.

## .env.example

Plantilla completa:
```env
# ---- Base de datos (PostgreSQL + pgvector) ----
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=tu_password_segura
PGDATABASE=wa_assistant

# ---- Modelo de IA (Ollama) ----
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2
EMBEDDING_MODEL=nomic-embed-text

# ---- Servidor interno ----
PORT=3000
```

## Validación de entorno

El sistema valida el entorno en cada arranque:

1. **Variables definidas**: Todas las requeridas están en `.env`.
2. **Modelo descargado**: `OLLAMA_MODEL` existe en Ollama (`GET /api/tags`).
3. **BD accesible**: Conexión exitosa a PostgreSQL.
4. **Si falla**: Muestra mensaje claro con instrucción de solución.

---

↩️ [Volver al índice](../00-INDEX.md)
