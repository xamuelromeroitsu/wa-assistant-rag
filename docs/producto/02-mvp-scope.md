# 🎯 Alcance del MVP

> Wa-Assistant RAG · qué entra y qué **no** entra en el producto mínimo viable. Documento "sellado".

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP) |
| Dueño | Product Owner |

## Objetivo del MVP

Validar el recorrido completo de valor: **un usuario conecta el bot a su WhatsApp, le hace una pregunta y recibe una respuesta fundamentada en sus propios documentos**, todo corriendo localmente y en menos de 5 minutos de instalación.

## Historias del MVP (EN ALCANCE)

| ID | Historia | Reto técnico principal | Referencia funcional |
|---|---|---|---|
| H1 | Conectar el bot a WhatsApp escaneando un código QR | Sesión de `whatsapp-web.js` persistente | [Functional Spec](03-functional-spec.md#h1) |
| H2 | Responder a un saludo ("hola") en menos de 3 segundos | Detección temprana del tipo de mensaje | [Functional Spec](03-functional-spec.md#h2) |
| H3 | Responder preguntas usando el contenido de los documentos cargados | Pipeline RAG: recuperación + generación | [Functional Spec](03-functional-spec.md#h3) |
| H4 | Cargar documentos (PDF/TXT) a la base de datos | Ingesta, chunking y embeddings | [Functional Spec](03-functional-spec.md#h4) |
| H5 | Cambiar el modelo de IA usando una variable de entorno | Configuración y validación de entorno | [Functional Spec](03-functional-spec.md#h5) |

## Qué NO entra al MVP (FUERA DE ALCANCE)

Deliberadamente se difieren, para no ensanchar el alcance:

| Fuera de alcance | Motivo | ¿Cuándo? |
|---|---|---|
| WhatsApp Cloud API de Meta | El MVP valida con el método web (QR); la API exige cuenta de negocio | [Largo plazo](../roadmap/03-largo-plazo.md) |
| Múltiples usuarios / multi-tenant | El MVP es de un solo propietario | [Mediano plazo](../roadmap/02-mediano-plazo.md) |
| Soporte de más formatos (DOCX, XLSX, web scraping) | Solo PDF y TXT en el MVP | [Mediano plazo](../roadmap/02-mediano-plazo.md) |
| Interfaz web de administración | La ingesta se hace por script/CLI en el MVP | [Mediano plazo](../roadmap/02-mediano-plazo.md) |
| Historial de conversaciones persistente | El MVP recuerda solo el contexto inmediato | [Largo plazo](../roadmap/03-largo-plazo.md) |
| Autenticación/autorización de usuarios | Comunicación 1:1 con el propietario | Posteriores |
| Alta disponibilidad / clúster | Se ejecuta en una sola máquina | Posteriores |

## Requisitos funcionales base (transversales)

- Los diálogos, prompts y respuestas del sistema están en **español**.
- El bot se enciende y apaga limpiamente; conserva la sesión entre reinicios.
- Los errores (Ollama caído, BD caída, sesión vencida) producen respuestas amigables y quedan registrados en logs.
- No se exponen secretos: config vía `.env` y respetado por `.gitignore`.

## Requisitos no funcionales (RNF)

| RNF | Criterio |
|---|---|
| Privacidad | Ninguna llamada de red fuera del host local y del WS de WhatsApp |
| Rendimiento | "hola" responde en < 3 s; pregunta RAG responde en < 30 s en hardware nominal |
| Compatibilidad | Node.js ≥ 20, Ollama local, PostgreSQL 16 + pgvector, Podman |
| Mantenibilidad | Código por capas, cubierto por tests unitarios de los módulos críticos |
| Seguridad | No se sube `.env`; contraseñas no en código; sesión protegida localmente |

## Criterios de "listo" para lanzar el MVP

1. Las 5 historias H1–H5 implementadas y verificadas por tests.
2. Guía de instalación reproducida sin pasos omitidos (ver [setup](../guias/setup-and-env.md)).
3. Documento [de uso](../usuario/guia-uso.md) publicado con preguntas de ejemplo.
4. CI ejecutando lint + tests en cada PR.
5. El flujo de ejemplo se demuestra con un documento real de prueba.

## Cambios de alcance

Todo cambio a este documento se hace por **solicitud formal** y se registra en el [registro de decisiones de arquitectura (ADR)](../arquitectura/03-adr.md). Ningún cambio se aplica sin actualizar la tabla de historias y el [roadmap](../roadmap/00-roadmap.md).

---

↩️ [Volver al índice](../00-INDEX.md)