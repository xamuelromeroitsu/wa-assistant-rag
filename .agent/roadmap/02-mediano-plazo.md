# 📈 MVP+ — Mediano Plazo

> Wa-Assistant RAG · funcionalidades posteriores al MVP.

| Metadatos | Valor |
|---|---|
| Estado | Pendiente |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.1.0 (Mediano plazo) |
| Dueño | Product Owner |

## Historias planificadas

| ID | Historia | Descripción |
|---|---|---|
| H6 | Multi-usuario | Soporte para varios propietarios en una misma máquina |
| H7 | Más formatos de documento | DOCX, XLSX, CSV |
| H8 | Dashboard web | Interfaz web para subir documentos y ver estado |
| H9 | Historial de conversaciones | Persistencia de chats anteriores |
| H10 | Administración de documentos | Eliminar, editar metadatos de documentos cargados |

## Cambios técnicos esperados

- **Web server**: Agregar Express o Fastify para el dashboard web.
- **Multi-tenant**: Ajustar el modelo de datos para soportar múltiples usuarios.
- **Formatos adicionales**: Integrar bibliotecas para DOCX, XLSX.
- **Frontend**: Panel web simple para gestión de documentos.

## Decisión de ADR

Ver [03-adr.md](../architecture/03-adr.md) para decisiones que afectan esta fase.

---

↩️ [Volver al índice](../00-INDEX.md)
