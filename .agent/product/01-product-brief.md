# 🎯 Product Brief

> Wa-Assistant RAG · visión, problema, usuarios y propuesta de valor del producto.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP) |
| Dueño | Product Owner |

## Resumen del producto

**Wa-Assistant RAG** es un chatbot de WhatsApp que responde preguntas sobre los documentos de su propietario usando modelos de IA que corren **100% localmente** en su propia computadora. No envía datos a la nube ni depende de APIs de pago.

La técnica central es **RAG (_Retrieval-Augmented Generation_)**: el bot recupera los fragmentos más relevantes de los documentos cargados y los usa como contexto para generar respuestas precisas y en español.

## Problema que resuelve

Las personas tienen información valiosa dispersa en documentos (manuales, guías, apuntes, libros, normas) que es difícil de consultar desde el celular:

| Dolor | Impacto |
|---|---|
| Buscar en documentos largos es lento | Pierden tiempo y abandonan la búsqueda |
| Consultar desde el celular es incómodo | No hay forma rápida de preguntar y obtener respuesta |
| No quieren subir documentos privados a la nube | Desconfianza y riesgo legal/comercial |
| Los asistentes generales no conocen su información | Respuestas genéricas, sin contexto real |

## Usuarios y contexto de uso

| Persona | Necesidad | Escenario típico |
|---|---|---|
| **Propietario individual** | Consultar sus propios apuntes y manuales | "¿Qué pasos sigue el procedimiento X?" |
| **Pequeño equipo / PyME** | Compartir conocimiento operativo guardado en documentos | "¿Cuál es la política de reembolsos?" |
| **Usuario técnico inicial** | Evaluar el bot en su máquina sin configuración compleja | Instalar con Podman + Ollama + Node.js |

## Propuesta de valor

- **Privacidad total:** la IA y la base de datos corren en la máquina del usuario; los documentos nunca salen de ella.
- **Respuestas con contexto real:** el bot fundamenta sus respuestas en los documentos cargados, no en conocimiento general.
- **Accesible desde WhatsApp:** el canal de mensajería más usado; no requiere instalar otra app.
- **Costo cero recurrente:** sin suscripciones ni consumo de APIs de pago.
- **Configuración rápida:** de repositorio a bot conectado en menos de 2 minutos.

## Alcance del MVP

El MVP cubre el recorrido básico completo: conectar el bot por QR, responder un saludo, responder preguntas con contexto extraído de documentos, cargar documentos (PDF/TXT) y cambiar el modelo de IA por configuración.

Consulta el alcance sellado en [02-mvp-scope.md](02-mvp-scope.md).

## Éxito del producto

Criterios de éxito a medir durante el MVP:

1. **Tiempo de conexión:** el QR se genera en menos de 60 segundos desde `npm run dev`.
2. **Latencia de respuesta:** "hola" responde en menos de 3 segundos.
3. **Calidad de respuesta RAG:** la respuesta a una pregunta sobre documentos incluye contenido recuperado de ellos (no solo conocimiento general).
4. **Retención de sesión:** el bot se mantiene conectado sin reescanear QR durante una sesión normal.

## Riesgos principales

| Riesgo | Impacto | Mitigación |
|---|---|---|
| WhatsApp bloquea el método de conexión (web) | Todo el canal de comunicación | Planificada migración a [WhatsApp Cloud API](../futuro/migration-cloud-api.md) |
| Modelo local insuficiente dado el hardware | Respuestas lentas o pobres | Modelos configurados por [variable de entorno](../nodejs/05-config-y-env.md); elegir tamaño según hardware |
| Desgaste de QR / sesión expirada | El bot deja de responder | Guía de [reauth en troubleshooting](../operacion/troubleshooting.md) |

## Relación con la documentación

- [02-mvp-scope.md](02-mvp-scope.md) — alcance sellado del MVP.
- [03-functional-spec.md](03-functional-spec.md) — comportamiento funcional e historias.
- [04-technical-spec.md](04-technical-spec.md) — especificación técnica.
- [Roadmap](../roadmap/00-roadmap.md) — cuándo se entrega cada historia.

---

↩️ [Volver al índice](../00-INDEX.md)