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

### RAG

| Variable | Default | Descripción | Requerida |
|---|---|---|---|
| `TOP_K` | `5` | Cantidad de fragmentos recuperados por pregunta | ❌ No |

### Logging

| Variable | Default | Descripción | Requerida |
|---|---|---|---|
| `LOG_LEVEL` | `INFO` | Nivel mínimo de log: `DEBUG`, `INFO`, `WARN`, `ERROR` | ❌ No |

### WhatsApp

| Variable | Default | Descripción | Requerida |
|---|---|---|---|
| `WABA_BOT_NUMBER` | — | Número de WhatsApp del bot (referencia) | ❌ No |
| `QR_PNG_PATH` | `.wwebjs_auth/qr.png` | Ruta del PNG con el QR de vinculación | ❌ No |

## Carga y validación de configuración

La carga se realiza en dos pasos: `src/index.js` hace `dotenv.config()` y luego llama a `loadConfig(env)` de `src/config.js`:

```javascript
// src/config.js — función pura, testeable sin archivo .env
export function loadConfig(env = process.env) {
  // 1. Validación de variables requeridas
  const required = ['PGHOST', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE', 'OLLAMA_HOST', 'OLLAMA_MODEL', 'EMBEDDING_MODEL'];
  const missing = required.filter((key) => !env[key]);
  if (missing.length) {
    throw new AppError('ERR_CONFIG_001', { message: `Variables no definidas: ${missing.join(', ')}` });
  }

  // 2. Conversión tipada + defaults (PORT, TOP_K, LOG_LEVEL)
  return {
    database: { host: env.PGHOST, port: parseInt(env.PGPORT, 10), user: env.PGUSER, password: env.PGPASSWORD, database: env.PGDATABASE },
    ollama: { host: env.OLLAMA_HOST, model: env.OLLAMA_MODEL, embeddingModel: env.EMBEDDING_MODEL },
    server: { port: parseInt(env.PORT ?? '3000', 10) },
    rag: { topK: parseInt(env.TOP_K ?? '5', 10) },
    logging: { level: (env.LOG_LEVEL ?? 'INFO').toUpperCase() },
  };
}
```

Si falta algo, se lanza `ERR_CONFIG_001` con mensaje amigable y el proceso termina antes de conectarse a nada.

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

# ---- RAG ----
TOP_K=5

# ---- Logging ----
LOG_LEVEL=DEBUG

# ---- Vinculación por QR ----
QR_PNG_PATH=.wwebjs_auth/qr.png
```

## Validación de entorno

El sistema valida el entorno en cada arranque:

1. **Variables definidas**: Todas las requeridas están en `.env`.
2. **Modelo descargado**: `OLLAMA_MODEL` existe en Ollama (`GET /api/tags`).
3. **BD accesible**: Conexión exitosa a PostgreSQL.
4. **Si falla**: Muestra mensaje claro con instrucción de solución.

---

↩️ [Volver al índice](../00-INDEX.md)
