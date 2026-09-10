# 🛡️ Manejo de Errores

> Wa-Assistant RAG · estrategia de manejo de errores para el MVP.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP) |
| Dueño | Técnico |

## Principios generales

1. **Nunca crashear**: El proceso Node.js debe seguir vivo ante cualquier error.
2. **Errores amigables**: El usuario ve mensajes comprensibles, no stack traces.
3. **Errores detallados en logs**: Los desarrolladores ven la información técnica completa en los logs.
4. **Clasificación**: Cada error tiene una categoría (BD, IA, WhatsApp, configuración, archivo).

## Categorías de errores

### Errores de Base de Datos

| Error | Causa | Comportamiento | Mensaje al usuario |
|---|---|---|---|
| Conexión rechazada | PostgreSQL no corriendo | Bot no arranca | "La base de datos no está disponible. Verificá que PostgreSQL esté corriendo." |
| Query fallida | SQL inválido o timeout | Log del error | "Ocurrió un error interno. Intentá de nuevo." |
| Duplicate key | Fragmento ya existe | Se ignora (ON CONFLICT DO NOTHING) | — |

### Errores de IA (Ollama)

| Error | Causa | Comportamiento | Mensaje al usuario |
|---|---|---|---|
| Conexión rechazada | Ollama no corriendo | No se llama a Ollama | "El motor de IA no está disponible. Verificá que Ollama esté corriendo." |
| Modelo no encontrado | Modelo no descargado | Muestra comando | "Modelo no encontrado. Ejecutá: `ollama pull llama3.2`" |
| Timeout | Generación demasiado lenta | Se lanza excepción | "La generación tomó demasiado tiempo. Intentá de nuevo." |

### Errores de WhatsApp

| Error | Causa | Comportamiento | Mensaje al usuario |
|---|---|---|---|
| Sesión expirada | Sesión web caducó | Se muestra QR | "Sesión expirada. Escanéá el código QR para reconectar." |
| Auth failure | Credenciales inválidas | Se limpia carpeta de sesión | "Error de autenticación. Se limpió la sesión. Reiniciá el bot." |
| Desconexión | Red caída | Reconexión automática | "Conexión perdida. Reconectando..." |

### Errores de Archivo (Ingesta)

| Error | Causa | Comportamiento | Mensaje al usuario |
|---|---|---|---|
| Archivo no encontrado | Ruta inválida | Se aborta antes de procesar | "La ruta especificada no existe." |
| PDF sin texto | PDF escaneado/image-only | Se ignora el archivo | "El archivo 'X.pdf' es un PDF escaneado. Se requiere PDF con texto." |
| Archivo corrupto | Formato inválido | Se omite el archivo | "El archivo 'X' está corrupto. Se omitió." |
| Archivo vacío | Contenido vacío | Se omite el archivo | "El archivo 'X' está vacío." |

## Manejo global de errores en Node.js

```javascript
// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
  // No salir; mantener el bot activo
});

process.on('unhandledRejection', (reason) => {
  console.error('Promesa rechazada:', reason);
});

// Cierre limpio
process.on('SIGINT', async () => {
  await client.destroy();
  await pool.end();
  process.exit(0);
});
```

## Logging

Todos los errores se registran con la siguiente estructura:

```javascript
{
  timestamp: "2026-09-09T12:00:00Z",
  level: "ERROR",
  category: "Ollama" | "PostgreSQL" | "WhatsApp" | "Archivo",
  message: "Descripción del error",
  details: { ... }  // Información técnica adicional
}
```

## Reglas de manejo de errores

| Regla | Detalle |
|---|---|
| **Nunca mostrar stack traces al usuario** | Solo mensajes amigables |
| **Siempre loguear el error completo** | Para diagnóstico |
| **Errores de Ollama/BD no deben matar el proceso** | Intentar reconexión o mostrar mensaje |
| **Errores de archivo no abortan la ingesta** | Reportar error y continuar con el siguiente archivo |
| **Errores de WhatsApp no deben reiniciar el bot** | Reintentar o pedir reescaneo |

---

↩️ [Volver al índice](../00-INDEX.md)
