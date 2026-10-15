# 🔧 API Interna del Bot

> Wa-Assistant RAG · endpoints internos expuestos por el propio bot para monitoreo y salud del sistema.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP) |
| Dueño | Técnico |

## Descripción general

La API interna es un servidor HTTP mínimo que expone endpoints de salud y monitoreo. **Protocolo: HTTP** (solo interno). En el MVP, el alcance es limitado; se planifica expansión futura para un panel de administración web.

```
┌────────────────────┐
│  Node.js Bot       │
│  Servidor HTTP     │
│  (puerto config.)  │
│                    │
│  GET /health ──────┤
└────────────────────┘
```

## Principio de la buena práctica

> La API interna es un servicio local. NO necesita HTTPS — el bot y la API corren en la misma máquina.

## Recursos y Métodos

**Protocolo**: `HTTP`
**URL base**: `http://localhost:{PORT}`

| Método | Recurso | Propósito |
|---|---|---|
| `GET` | `/health` | Verificación de salud del sistema (H1, infraestructura) |

### GET /health

**Propósito**: Verificación de vida del sistema (H1, infraestructura).

**Cuándo se usa**:
- Monitoreo interno (logs de arranque).
- Futuro uso por un panel de administración.
- Verificación automatizada en CI/testing.

**Response exitosa (200 OK)**:
```json
{
  "status": "ok",
  "timestamp": "2026-09-09T12:00:00Z",
  "services": {
    "database": "connected",
    "ollama": "connected",
    "whatsapp": "connected"
  }
}
```

**Response con error (503 Service Unavailable)**:
```json
{
  "status": "degraded",
  "timestamp": "2026-09-09T12:00:00Z",
  "services": {
    "database": "disconnected",
    "ollama": "connected",
    "whatsapp": "connected"
  },
  "error": "PostgreSQL connection refused"
}
```

**Detección de servicios**:
- **database**: Se verifica con un `SELECT 1` a PostgreSQL.
- **ollama**: Se verifica con `GET /api/tags` a Ollama.
- **whatsapp**: Se verifica con el estado de la sesión de `whatsapp-web.js`.

## Estado en el MVP

En el MVP actual, `GET /health` **solo se loguea** al arrancar el bot y en cada ciclo de heartbeat. La ruta no se expone públicamente; es para uso interno y diagnóstico.

La exposición pública de la API para un panel de administración está planificada para **mediano plazo** ([docs/roadmap/02-mediano-plazo.md](../roadmap/02-mediano-plazo.md)).

## Configuración

| Variable | Default | Descripción |
|---|---|---|
| `PORT` | `3000` | Puerto del servidor HTTP interno |

---

↩️ [Volver al índice](../00-INDEX.md)
