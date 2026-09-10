# 🛠️ Setup y Entorno

> Wa-Assistant RAG · guía de instalación completa y configuración del entorno.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP) |
| Dueño | Técnico |

## Requisitos previos

| Herramienta | Versión mínima | Verificación | Descarga |
|---|---|---|---|
| Node.js | 20+ | `node -v` | [nodejs.org](https://nodejs.org) |
| Ollama | última | `ollama --version` | [ollama.com/download](https://ollama.com/download) |
| Podman | 4+ | `podman --version` | [podman.io](https://podman.io/docs/installation) |

## Paso a paso

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/wa-assistant-rag.git
cd wa-assistant-rag
```

### Paso 2: Levantar la base de datos con Podman

```bash
podman compose up -d
```

**Verificación**: Deberías ver una línea que dice `Container ... Started`.

```bash
# Verificar que el contenedor está corriendo
podman ps

# Verificar conexión a PostgreSQL
podman exec -it <nombre_contenedor> psql -U postgres -d wa_assistant -c "SELECT 1;"
```

### Paso 3: Descargar modelos de Ollama

```bash
ollama pull llama3.2
ollama pull nomic-embed-text
```

**Verificación**: 
```bash
ollama list
# Debería mostrar llama3.2 y nomic-embed-text
```

### Paso 4: Instalar dependencias del proyecto

```bash
npm install
```

**Verificación**: La carpeta `node_modules/` debe existir.

### Paso 5: Crear archivo de configuración

```bash
copy .env.example .env
```

**Importante**: Editar `.env` y configurar `PGPASSWORD` con una contraseña segura.

### Paso 6: Arrancar el bot

```bash
npm run dev
```

**Salida esperada**: Aparece un código QR en la terminal.

### Paso 7: Vincular WhatsApp

1. Abrir WhatsApp en el celular.
2. Menú (⋮) → **Dispositivos vinculados** → **Vincular un dispositivo**.
3. Escanear el código QR de la terminal.
4. El bot queda conectado.

### Paso 8: Probar el bot

1. Enviar **"hola"** al número del bot.
2. Deberías recibir una respuesta en menos de 3 segundos.
3. Enviar una pregunta sobre tus documentos.
4. El bot debe responder usando el contexto de los documentos cargados.

## Configuración de la base de datos

La base de datos PostgreSQL se levanta automáticamente con Podman. Para acceder manualmente:

```bash
podman exec -it wa-assistant-rag-postgres psql -U postgres -d wa_assistant
```

## Solución de problemas comunes

| Problema | Causa | Solución |
|---|---|---|
| El QR no aparece | Falta la carpeta de sesión | Borra `.wwebjs_auth` y vuelve a ejecutar |
| "Model not found" | No descargaste el modelo de Ollama | `ollama pull llama3.2` y `ollama pull nomic-embed-text` |
| La base de datos no conecta | El contenedor de Podman no está corriendo | `podman compose up -d` |
| Puerto 5432 ocupado | Otro servicio usa ese puerto | Cambia `PGPORT` en `.env` y `docker-compose.yml` |
| El contenedor no ve la carpeta de documentos | Volumen mal montado | Revisa los volúmenes en `docker-compose.yml` |

## Desinstalación

```bash
# Detener el bot
Ctrl+C

# Apagar PostgreSQL
podman compose down

# No es necesario eliminar Ollama (los modelos se cachean localmente)
```

---

↩️ [Volver al índice](../00-INDEX.md)
