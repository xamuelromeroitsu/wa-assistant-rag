# 🔧 Troubleshooting

> Wa-Assistant RAG · solución de problemas comunes.



## Base de datos no conecta

**Síntomas**: El bot no arranca, error de conexión PostgreSQL.

**Posibles causas**:
- El contenedor de Podman no está corriendo.
- La contraseña en `.env` es incorrecta.
- El puerto 5432 está ocupado por otro servicio.

**Solución**:
```bash
# Verificar contenedor
podman ps

# Si no está corriendo
podman compose up -d

# Si el puerto está ocupado, cambiar PGPORT en .env
# Verificar conexión
podman exec -it <nombre> psql -U postgres -d wa_assistant -c "SELECT 1;"
```

## Modelo de IA no encontrado

**Síntomas**: "Model not found" al intentar responder.

**Posibles causas**:
- No se descargó el modelo en Ollama.
- `OLLAMA_MODEL` en `.env` tiene un nombre incorrecto.

**Solución**:
```bash
# Descargar el modelo
ollama pull llama3.2
ollama pull nomic-embed-text

# Verificar modelos disponibles
ollama list

# Verificar OLLAMA_MODEL en .env
```

## QR no aparece al ejecutar `npm run dev`

**Síntomas**: No se genera código QR en la terminal.

**Posibles causas**:
- Falta la carpeta de sesión.
- Error en la inicialización de whatsapp-web.js.
- Puppeteer no puede lanzar el navegador.

**Solución**:
```bash
# Borrar carpeta de sesión
rm -rf .wwebjs_auth

# Reiniciar el bot
npm run dev
```

## El bot se desconecta después de un tiempo

**Síntomas**: El bot deja de responder después de un rato.

**Posibles causas**:
- La sesión de WhatsApp Web expiró.
- Conexión a internet inestable.
- WhatsApp bloqueó la sesión.

**Solución**:
1. Reescanear el QR reiniciando el bot.
2. Si persiste, borrar `.wwebjs_auth` y reconectar.
3. Si es bloqueo de WhatsApp, consultar [04-cloud-api.md](../apis/04-cloud-api.md).

## El bot responde "No encontré información"

**Síntomas**: El bot no encuentra información sobre cualquier pregunta.

**Posibles causas**:
- No se han cargado documentos a la base de datos.
- Los documentos no están en la tabla `documents`.
- El modelo de embeddings no coincide con el usado en ingesta.

**Solución**:
```bash
# Verificar que hay documentos cargados
# Ejecutar: npm run ingest ./documentos/

# Verificar en BD
podman exec -it <nombre> psql -U postgres -d wa_assistant -c "SELECT COUNT(*) FROM documents;"

# Verificar que EMBEDDING_MODEL coincida
```

## Respuestas lentas o timeout

**Síntomas**: Las respuestas demoran más de 30 segundos.

**Posibles causas**:
- Hardware insuficiente (CPU/RAM).
- Modelo de IA muy grande para el hardware.
- Ollama no tiene suficiente memoria.

**Solución**:
- Cambiar `OLLAMA_MODEL` a un modelo más ligero en `.env`.
- Verificar que Ollama esté usando GPU si disponible.
- Reiniciar Ollama: `ollama serve` o reiniciar Ollama Desktop.

## El contenedor de Podman no se levanta

**Síntomas**: `podman compose up -d` no funciona.

**Posibles causas**:
- Docker/Podman no está instalado correctamente.
- El `docker-compose.yml` tiene errores.
- El volumen de datos no se monta correctamente.

**Solución**:
```bash
# Verificar Podman
podman --version

# Verificar compose
podman compose config

# Intentar con fuerza
podman compose down
podman compose up -d
```

## El puerto 5432 está ocupado

**Síntomas**: PostgreSQL no arranca en el contenedor.

**Solución**:
```bash
# Cambiar PGPORT en .env y en docker-compose.yml
# Ejemplo: PGPORT=5433
```

---

↩️ [Volver al índice](../00-INDEX.md)
