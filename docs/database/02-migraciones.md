# 🔄 Migraciones de Base de Datos

> Wa-Assistant RAG · registro de migraciones SQL para evolucionar el esquema.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP) |
| Dueño | Técnico |

## Formato de migraciones

Cada migración se registra con el siguiente formato:

```
Nombre: <descripción corta>
Fecha: YYYY-MM-DD
Tablas afectadas: <nombres>
SQL: <script>
```

## Migraciones del MVP

### Migración 001 — Creación de tablas iniciales (v0.0.0)

| Campo | Valor |
|---|---|
| **Nombre** | Creación de tablas: documents, chunks, embeddings |
| **Fecha** | 2026-09-09 |
| **Tablas afectadas** | `documents`, `chunks`, `embeddings`, `sessions` |
| **SQL** | Ver [scripts/init-db.sql](../../scripts/init-db.sql) |
| **Descripción** | Creación inicial del esquema RAG |

**Script**:
- Crea las 4 tablas con sus restricciones.
- Crea índices básicos para búsqueda.
- Configura la extensión pgvector.

**Rollback**: Eliminar las tablas en orden inverso (embeddings → chunks → documents → sessions).

## Reglas de migración

1. **Nunca modificar** una migración ya aplicada.
2. **Siempre crear** una nueva migración para cambios de esquema.
3. **Versionar** las migraciones con numeración secuencial (001, 002, ...).
4. **Backward compatible**: las migraciones no deben romper datos existentes.
5. **Testear** cada migración en base de datos de desarrollo antes de producción.

## Estrategia de rollback

Si una migración falla o debe revertirse:

1. Restaurar backup previo a la migración.
2. O ejecutar el script de rollback correspondiente.
3. Documentar el rollback en este archivo.

---

↩️ [Volver al índice](../00-INDEX.md)
