# 🔒 Seguridad y Privacidad

> Wa-Assistant RAG · principios de seguridad, privacidad de datos y buenas prácticas.


## Principio de privacidad total

**Wa-Assistant RAG** está diseñado para que **ningún dato salga de la máquina del usuario**. Este es el principio fundacional del proyecto.

## Fuentes de datos

| Fuente | ¿Sale del host? | Tipo de dato |
|---|---|---|
| Documentos cargados | ❌ No | Tus archivos PDF/TXT |
| Ollama | ❌ No | Prompts y respuestas de IA |
| PostgreSQL | ❌ No | Metadatos, chunks, embeddings |
| WhatsApp Web | ✅ Sí | Conexión con servidores de WhatsApp |
| Red general | ❌ No | Solo WhatsApp |

## Configuración de seguridad

### Archivo `.env`

- **Nunca** se sube al repositorio (protegido por `.gitignore`).
- Contiene contraseñas y URLs sensibles.
- Se copia desde `.env.example` y se personaliza.

### Contraseñas de base de datos

- La contraseña `PGPASSWORD` debe ser única y segura.
- **Nunca** usar la contraseña por defecto (`postgres`) en producción.
- No poner la contraseña en el código fuente.

### Sesión de WhatsApp

- La sesión se guarda en `.wwebjs_auth/` (local).
- No se comparte con nadie.
- Si se filtra, alguien podría conectarse a tu WhatsApp.
- Se puede invalidar borrando la carpeta y reescanearando QR.

## Acceso a la base de datos

- PostgreSQL escucha solo en `localhost` (5432 por defecto).
- No expone el puerto a la red pública.
- Solo el proceso Node.js puede conectarse.
- El contenedor de Podman aisla la BD del sistema operativo.

## Logs y diagnóstico

Los logs contienen:
- Eventos del sistema (arranque, conexión, desconexión).
- Errores (con mensajes amigables para el usuario).
- **Nunca** contienen contraseñas ni secretos.

**Reglas**:
- No loguear el contenido de mensajes del usuario.
- No loguear el contenido de prompts enviados a Ollama.
- Los errores de conexión se loguean, pero sin credenciales.

## Auditoría

El sistema no registra:
- Quién hizo qué pregunta (solo el tipo de evento).
- El contenido de las respuestas generadas.
- Datos personales del usuario.

El sistema registra:
- Eventos de conexión/desconexión.
- Errores del sistema.
- Métricas de rendimiento (tiempos de respuesta).

## Protección contra abuso

| Riesgo | Mitigación |
|---|---|
| Uso no autorizado | Solo el propietario tiene el teléfono vinculado |
| Sesión comprometida | Borrar `.wwebjs_auth` y reescanear QR |
| Acceso a la BD | Puerto local, sin exposición a red |
| Datos filtrados | Todo queda en el host; sin APIs externas |

## Cumplimiento

- Sin procesamiento de datos personales de terceros.
- Sin envío de datos a servidores externos (excepto WhatsApp).
- El usuario es el dueño de sus datos y puede eliminarlos borrando la BD.

---

↩️ [Volver al índice](../00-INDEX.md)
