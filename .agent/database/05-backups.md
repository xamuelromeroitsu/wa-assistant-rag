# 💾 Backups de Base de Datos

> Wa-Assistant RAG · estrategia de respaldo y recuperación de datos.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP) |
| Dueño | Técnico |

## Estrategia de backup

### Backup manual (MVP)

Para el MVP, se recomienda hacer backup manual con pg_dump:

```bash
# Backup completo
pg_dump -h localhost -U postgres -d wa_assistant > backup_$(date +%Y%m%d).sql

# Backup solo de estructura
pg_dump -h localhost -U postgres -d wa_assistant --schema-only > schema_$(date +%Y%m%d).sql

# Backup solo de datos
pg_dump -h localhost -U postgres -d wa_assistant --data-only > data_$(date +%Y%m%d).sql
```

### Restauración

```bash
# Restaurar backup completo
psql -h localhost -U postgres -d wa_assistant < backup_YYYYMMDD.sql
```

## Automatización (futuro)

Para mediano plazo, se puede automatizar con un script:

```bash
#!/bin/bash
BACKUP_DIR="/ruta/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U postgres -d wa_assistant > "$BACKUP_DIR/wa_assistant_$DATE.sql"
# Comprimir
gzip "$BACKUP_DIR/wa_assistant_$DATE.sql"
# Eliminar backups de más de 30 días
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete
```

## Datos críticos

| Tabla | ¿Qué contiene? | ¿Back up necesario? |
|---|---|---|
| `documents` | Metadatos de documentos | ✅ Sí |
| `chunks` | Fragmentos de texto | ✅ Sí |
| `embeddings` | Vectores | ✅ Sí (se pueden regenerar pero ahorra tiempo) |
| `sessions` | Sesiones de WhatsApp | ⚠️ Opcional (se puede regenerar con QR) |

## Consideraciones

1. **Los embeddings pueden regenerarse**: Si se pierde la tabla `embeddings`, se puede volver a ejecutar la ingesta.
2. **Los documentos fuente son la verdad**: Los datos en `documents` y `chunks` son derivables de los archivos originales.
3. **La sesión de WhatsApp NO es crítica**: Se puede reescanear el QR si se pierde.
4. **Backup fuera del host**: Copiar los backups a otro directorio o servicio de almacenamiento.

## Terminología técnica de backups

| Término | Explicación |
|---|---|
| **`pg_dump`** | Utilidad de PostgreSQL para crear backups (exporta todo como SQL) |
| **`psql`** | Terminal interactiva de PostgreSQL para ejecutar comandos SQL |
| **`gzip`** | Compresor de archivos — reduce el tamaño del backup |
| **`-mtime +30`** | Encuentra archivos modificados hace más de 30 días (en `find`) |
| **`>` (redirección)** | Envía la salida de un comando a un archivo |
| **`<` (redirección)** | Lee la entrada de un archivo como comando SQL |
| **`$(date +%Y%m%d)`** | Comando dentro de otro — genera la fecha actual como string |
| **Backup completo** | Copia toda la base de datos (estructura + datos) |
| **Backup estructura** | Solo el esquema (CREATE TABLE, CREATE INDEX) |
| **Backup datos** | Solo los datos (INSERT) |

---

↩️ [Volver al índice](../00-INDEX.md)
