# 📏 Convenciones de Trabajo

> Wa-Assistant RAG · estilo de código, naming, commits y buenas prácticas.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP) |
| Dueño | Equipo |

## Estilo de código

### JavaScript / Node.js (ESM)

| Regla | Detalle |
|---|---|
| **Formato** | Node.js con módulos ESM (`import`/`export`) |
| **Linter** | Configurar con ESLint o JSHint; reglas estrictas |
| **Indentación** | 2 espacios (no tabs) |
| **Quotes** | Comillas simples `'` |
| **Semicolones** | Siempre |
| **Nombres de archivo** | `snake_case.js` (ej. `config.js`, `ollama.js`) |
| **Nombres de variables** | `camelCase` |
| **Constantes** | `UPPER_SNAKE_CASE` |
| **Funciones** | Verb+noun (`getConnection`, `generateResponse`) |

### Naming de archivos y carpetas

```
src/
├── index.js            # Punto de entrada
├── config.js           # Configuración general
├── db.js               # Conexión a base de datos
├── ollama.js           # Cliente de Ollama
├── handlers/
│   └── message.js      # Handler de mensajes de WhatsApp
└── rag/
    ├── ingest.js       # Ingesta de documentos
    └── search.js       # Búsqueda RAG
```

## Convenciones de commit

Todos los commits deben seguir este formato:

```
<tipo>: <descripción en español o inglés>
```

| Tipo | Descripción | Ejemplo |
|---|---|---|
| `feat` | Nueva funcionalidad | `feat: agregar handler de saludos` |
| `fix` | Corrección de bug | `fix: corregir timeout en Ollama` |
| `docs` | Cambio en documentación | `docs: actualizar README con nueva sección` |
| `refactor` | Refactorización sin cambio de comportamiento | `refactor: mejorar estructura de handlers` |
| `test` | Añadir o modificar tests | `test: agregar test para ingesta de PDFs` |
| `chore` | Tareas de mantenimiento | `chore: actualizar dependencias` |
| `style` | Formateo sin cambio de lógica | `style: ajustar indentación en config.js` |

**Ejemplo de mensaje de commit:**
```
feat: implementar pipeline RAG para búsqueda de documentos
```

## Convenciones de documentación

- Todos los docs en **español**.
- Formato estándar: título con emoji, tabla de metadatos, secciones con `##`, ↩️ volver al índice.
- El `00-INDEX.md` se actualiza en el mismo commit que cualquier documento nuevo o renombrado.
- Los cambios de alcance se documentan en ADRs.

## Convenciones de variables de entorno

- Todas las variables de entorno se documentan en `.env.example`.
- Nombres en `UPPER_SNAKE_CASE`.
- Valores por defecto indicados en `.env.example`.
- **Nunca** hardcodear secretos en el código.

## Manejo de errores

- Todos los errores se loguean con un mensaje claro.
- Los mensajes al usuario son amigables y en español.
- Los errores técnicos detallados van a logs, no al usuario.
- Los errores se manejan gracefulmente sin crashear el proceso.

## Pull Requests

- Titular con `tipo:` según convenciones de commit.
- Descripción clara del cambio y su justificación.
- Si cambia la API o configuración, actualizar documentación correspondiente.
- Al menos **1 revisión** antes de merge a `main`.
- CI debe estar pasando (lint + tests) antes de merge.

## Git Flow / Branching

### Estructura de ramas

| Rama | Propósito | Merge a |
|---|---|---|
| `main` | Código listo para producción | — |
| `develop` | Integración de features | `main` |
| `feat/H1-nombre` | Nueva funcionalidad (ej: `feat/H1-connect-whatsapp`) | `develop` |
| `fix/descripcion` | Corrección de bug | `develop` |
| `hotfix/descripcion` | Corrección urgente en producción | `main` y `develop` |

### Reglas de merge

1. `feat/` y `fix/` se mergean a `develop` primero.
2. `develop` se mergea a `main` cuando está listo para producción.
3. `hotfix/` se mergea directamente a `main` y `develop`.
4. **Nunca** hacer push directo a `main`.
5. Todos los commits en `main` deben pasar CI.

## Security practices

### Protección de secretos

- **Nunca** subir credenciales, tokens o claves al repositorio.
- Usar `.env` local y `.env.example` como plantilla.
- `.env` debe estar en `.gitignore`.
- Todos los secretos se inyectan como variables de entorno.

### Scanning de dependencias

- Ejecutar `npm audit` antes de cada commit.
- Cualquier vulnerabilidad crítica debe corregirse antes de merge.
- Usar `npm audit fix` para corregir vulnerabilidades automáticas.

### .gitignore obligatorio

- `.env` — variables de entorno locales.
- `.wwebjs_auth/` — sesión de WhatsApp.
- `node_modules/` — dependencias.
- `*.log` — archivos de log.
- `backup*.sql` — backups de BD.

## Logging

### Formato de logs

Todos los logs deben seguir este formato estándar:
```
[YYYY-MM-DD HH:MM:SS] [LEVEL] [MÓDULO] Mensaje
```

### Niveles de logs

| Nivel | Cuándo se usa | Ejemplo |
|---|---|---|
| `DEBUG` | Desarrollo, detalles internos | `DEBUG [ollama] Enviando prompt a Ollama` |
| `INFO` | Eventos normales del sistema | `INFO [whatsapp] Sesión conectada` |
| `WARN` | Situaciones inesperadas recuperables | `WARN [db] Conexión lenta a PostgreSQL` |
| `ERROR` | Errores que requieren atención | `ERROR [ollama] Timeout después de 30s` |

### Reglas de logging

1. **Desarrollo**: nivel `DEBUG` visible.
2. **Producción**: nivel `INFO` visible, `DEBUG` a archivo.
3. **Errores**: siempre loggear con stack trace.
4. **Nunca** loggear secretos ni datos personales de usuarios.
5. Los logs de WhatsApp (QR, sesión) van a archivo separado.

## Environment management

### Entornos

| Entorno | Archivo de config | Base de datos | Uso |
|---|---|---|---|
| **Desarrollo** | `.env.dev` | PostgreSQL local | Desarrollo y testing |
| **Staging** | `.env.staging` | PostgreSQL staging | Pruebas de integración |
| **Producción** | `.env.prod` | PostgreSQL prod | Bot en vivo |

### Reglas

1. Cada entorno tiene su propio archivo `.env`.
2. Los archivos `.env` **nunca** se suben al repositorio.
3. `.env.example` es la plantilla con todos los valores por defecto.
4. Las variables de entorno se cargan con `dotenv` o directamente en Node.js.
5. **Nunca** usar credenciales de producción en desarrollo.

## Dependency management

### Versionado

- Usar **semver** (Semantic Versioning): `MAJOR.MINOR.PATCH`.
- `package.json` con versiones exactas para dependencias críticas.
- `package-lock.json` o `yarn.lock` **siempre** versionado.

### Actualización de paquetes

```bash
# Verificar paquetes desactualizados
npm outdated

# Actualizar un paquete
npm update nombre-paquete

# Actualizar todos los paquetes
npm update

# Verificar vulnerabilidades
npm audit

# Corregir vulnerabilidades automáticas
npm audit fix

# Actualizar lock file después de cambios
npm install
```

### Reglas

1. **Nunca** hacer `npm install` sin actualizar `package-lock.json`.
2. Ejecutar `npm audit` antes de cada commit.
3. Las dependencias críticas (pg, whatsapp-web.js) usar versión exacta.
4. Dependencias de desarrollo en `devDependencies`.

## Error codes

### Códigos de error estandarizados

| Código | Categoría | Descripción |
|---|---|---|
| `ERR_DB_001` | Base de datos | Conexión a PostgreSQL fallida |
| `ERR_DB_002` | Base de datos | Query timeout |
| `ERR_OLLAMA_001` | IA | Ollama no responde (connection refused) |
| `ERR_OLLAMA_002` | IA | Modelo no encontrado |
| `ERR_OLLAMA_003` | IA | Timeout de generación |
| `ERR_WHATSAPP_001` | WhatsApp | Sesión expirada |
| `ERR_WHATSAPP_002` | WhatsApp | QR no escaneado |
| `ERR_CONFIG_001` | Configuración | Variable de entorno faltante |
| `ERR_CONFIG_002` | Configuración | Puerto ya en uso |

### Reglas

1. Cada error tiene un código único y descriptivo.
2. Los errores se loguean con el código y el mensaje detallado.
3. Al usuario se le muestra el mensaje amigable, no el código técnico.
4. Los códigos se documentan en `docs/database/` o en la documentación técnica correspondiente.

## Response formats

### Formato estándar de respuestas API

Todas las respuestas del bot siguen este formato:
```json
{
  "status": "ok",
  "data": {...},
  "timestamp": "2026-09-09T12:00:00Z"
}
```

### Respuesta exitosa
```json
{
  "status": "ok",
  "data": {
    "response": "Texto de la respuesta",
    "context_used": ["fragmento1", "fragmento2"]
  },
  "timestamp": "2026-09-09T12:00:00Z"
}
```

### Respuesta con error
```json
{
  "status": "error",
  "error": "Código de error o mensaje",
  "timestamp": "2026-09-09T12:00:00Z"
}
```

### Reglas

1. **Siempre** incluir `status` en la respuesta.
2. **Siempre** incluir `timestamp` con la fecha ISO 8601.
3. En respuesta exitosa, `data` contiene el resultado.
4. En respuesta con error, `error` contiene el mensaje amigable.
5. Nunca exponer stack traces ni errores técnicos al usuario.

## Performance practices

### Connection pooling

- PostgreSQL usa `Pool` con máximo 10 conexiones concurrentes.
- Cada consulta tiene timeout de 5 segundos.
- Las conexiones se liberan automáticamente después de usar.

### Timeouts

| Operación | Timeout | Acción si excede |
|---|---|---|
| Ollama `/api/generate` | 30 segundos | Mostrar mensaje de timeout |
| PostgreSQL query | 5 segundos | Retry una vez, luego error |
| WhatsApp sendMessage | 10 segundos | Reintentar una vez |
| Ollama `/api/embeddings` | 15 segundos | Error y log |

### Cache

- Los embeddings de documentos se cachean en pgvector.
- Las respuestas de Ollama se cachean por 10 minutos para preguntas repetidas.
- Los modelos de Ollama se cachean localmente en `~/.ollama/models`.

### Reglas

1. **Nunca** hacer queries sin timeout configurado.
2. Usar `Pool` para conexiones a PostgreSQL, nunca conexiones individuales.
3. Monitorear uso de memoria del bot.
4. Si el bot usa más de 512MB de RAM, investigar memory leak.

## Deployment

### Estructura de despliegue

```
wa-assistant-rag/
├── docker-compose.yml      # Levanta PostgreSQL con pgvector
├── scripts/
│   └── init-db.sql         # Script de inicialización de BD
├── src/                    # Código fuente del bot
├── package.json            # Dependencias y scripts
└── .env.example            # Plantilla de variables de entorno
```

### Proceso de deploy

```bash
# 1. Construir imagen
docker build -t wa-assistant-rag .

# 2. Levantar la BD
podman compose up -d

# 3. Inicializar la BD
podman exec -it wa-assistant-rag-postgres psql -U postgres -d wa_assistant -f scripts/init-db.sql

# 4. Ejecutar el bot
npm run dev
```

### Checklist antes de deploy

- [ ] Todos los tests pasan (`npm test`)
- [ ] Linter sin errores (`npm run lint`)
- [ ] Variables de entorno configuradas en `.env`
- [ ] Base de datos inicializada (`init-db.sql`)
- [ ] Modelos de Ollama descargados (`ollama pull llama3.2`)
- [ ] Bot conectado a WhatsApp (QR escaneado)
- [ ] Logs funcionando correctamente

### Reglas

1. **Nunca** hacer deploy directamente a `main` sin merge de `develop`.
2. El deploy se documenta en el CHANGELOG.
3. Si falla el deploy, hacer rollback con el backup de BD.
4. Monitorear el bot las primeras 24 horas después de deploy.

---

↩️ [Volver al índice](../00-INDEX.md)
