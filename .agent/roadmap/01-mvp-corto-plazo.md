# 🚀 MVP — Corto Plazo

> Wa-Assistant RAG · producto mínimo viable, historias H1-H5.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP) |
| Dueño | Product Owner |

## Alcance

El MVP cubre el recorrido completo básico: **conectar el bot → saludar → hacer preguntas → cargar documentos → cambiar modelo**.

## Historias incluidas

| ID | Historia | Criterios de aceptación |
|---|---|---|
| H1 | Conectar WhatsApp por QR | QR en < 60 s, sesión persiste, Ctrl+C limpio |
| H2 | Responder saludo | "hola" responde en < 3 s, no dispara RAG |
| H3 | Preguntas con RAG | < 30 s, no alucina, responde con contexto |
| H4 | Cargar documentos | PDF/TXT, sin duplicados, errores parciales |
| H5 | Modelo configurable | OLLAMA_MODEL y EMBEDDING_MODEL funcionan |

## Criterios de "listo" para el MVP

Según [02-mvp-scope.md](../product/02-mvp-scope.md):

1. Las 5 historias H1–H5 implementadas y verificadas por tests.
2. Guía de instalación reproducida sin pasos omitidos.
3. Documento de uso con preguntas de ejemplo.
4. CI ejecutando lint + tests en cada PR.
5. Flujo de ejemplo demostrado con documento real de prueba.

## Requisitos no funcionales del MVP

| RNF | Criterio |
|---|---|
| Privacidad | Ninguna llamada de red fuera del host local y del WS de WhatsApp |
| Rendimiento | "hola" < 3 s; pregunta RAG < 30 s |
| Compatibilidad | Node.js ≥ 20, Ollama local, PostgreSQL 16 + pgvector, Podman |
| Mantenibilidad | Código por capas, cubierto por tests unitarios |
| Seguridad | No se sube `.env`; contraseñas no en código |

## Fuera de alcance (deliberado)

- WhatsApp Cloud API → largo plazo
- Múltiples usuarios → mediano plazo
- Más formatos (DOCX, XLSX) → mediano plazo
- Interfaz web de administración → mediano plazo
- Historial de conversaciones → largo plazo
- Autenticación de usuarios → posteriores
- Alta disponibilidad → posteriores

---

↩️ [Volver al índice](../00-INDEX.md)
