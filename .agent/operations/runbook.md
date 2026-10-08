# 📖 Runbook Operativo

> Wa-Assistant RAG · procedimiento paso a paso para operación diaria.



## Arranque del bot

### Requisitos previos

Antes de arrancar, verificar que todo esté listo:

```bash
# 1. Verificar Node.js
node -v        # → v20.x.x o superior

# 2. Verificar Ollama
ollama --version
ollama list    # → debe mostrar llama3.2 y nomic-embed-text

# 3. Verificar Podman
podman --version
podman ps      # → debe mostrar el contenedor de PostgreSQL corriendo

# 4. Si el contenedor no está corriendo
podman compose up -d

# 5. Si falta un modelo de Ollama
ollama pull llama3.2
ollama pull nomic-embed-text
```

### Procedimiento completo

```bash
# 1. Ir al directorio del proyecto
cd wa-assistant-rag

# 2. Asegurar que la BD está corriendo
podman compose up -d

# 3. Verificar conexión a la BD
podman exec -it <nombre_contenedor> psql -U postgres -d wa_assistant -c "SELECT 1;"

# 4. Asegurar que el .env existe y está configurado
# copy .env.example .env  (si no existe)

# 5. Instalar dependencias (solo primera vez)
npm install

# 6. Arrancar el bot
npm run dev

# 7. Escanear el código QR con WhatsApp
# El bot queda conectado
```

### Verificación de funcionamiento

1. Enviar **"hola"** al bot desde WhatsApp.
2. Debe responder en menos de 3 segundos.
3. Enviar una pregunta sobre un documento cargado.
4. Debe responder con contexto de los documentos en menos de 30 segundos.

## Cierre del bot

```bash
# Presionar Ctrl+C en la terminal donde corre el bot
# El bot cierra la sesión limpiamente
# La sesión persiste en .wwebjs_auth/
# No es necesario reescanear QR al reiniciar
```

## Reinicio del bot

```bash
# 1. El bot se puede reiniciar simplemente con Ctrl+C y npm run dev
# No se necesita reescanear QR si la sesión está vigente

# 2. Si la sesión expiró
# 1. Borrar la carpeta .wwebjs_auth
rm -rf .wwebjs_auth
# 2. Reiniciar el bot
npm run dev
# 3. Escanear QR nuevamente
```

## Backup de la base de datos

```bash
# Backup completo
pg_dump -h localhost -U postgres -d wa_assistant > backup_$(date +%Y%m%d).sql

# Restaurar
psql -h localhost -U postgres -d wa_assistant < backup_YYYYMMDD.sql
```

## Actualización de modelos de IA

```bash
# Descargar nueva versión de un modelo
ollama pull llama3.2

# Ver modelos instalados
ollama list

# Eliminar modelo antiguo (opcional)
ollama rm llama3.2
```

---

↩️ [Volver al índice](../00-INDEX.md)
