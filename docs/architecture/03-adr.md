# 📐 Decisiones de Arquitectura (ADR)

> Wa-Assistant RAG · registro de decisiones técnicas de diseño y sus justificaciones.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP) |
| Dueño | Técnico |

---

## ADR-001: Monolito modular vs. Microservicios

| Campo | Valor |
|---|---|
| **Estado** | Aceptada |
| **Fecha** | 2026-09-09 |
| **Contexto** | Se necesitaba decidir la estructura de despliegue y ejecución del sistema para el MVP. |
| **Decisión** | Implementar un monolito modular: un solo proceso Node.js con módulos internos bien separados (config, db, handlers, rag). |
| **Justificación** | |
| - Simplicidad | Un solo proceso es más fácil de instalar, ejecutar y depurar para el usuario final. |
| - MVP | El MVP busca validar el recorrido completo en menos de 5 minutos. Microservicios agregan complejidad operativa innecesaria. |
| - Portabilidad | Un solo archivo ejecutable se puede distribuir fácilmente. |
| - Migración futura | La separación por capas (config → index → handlers → rag → db) permite extraer módulos a microservicios sin reescribir la lógica. |
| **Consecuencias** | |
| - Positivas | Instalación rápida, depuración sencilla, un único punto de fallo para resolver. |
| - Negativas | Escalabilidad horizontal limitada; un módulo con problema puede afectar a todo el proceso. |
| - Alternativa rechazada | Microservicios con Docker Compose separando Node, PostgreSQL y Ollama. Rechazada por complejidad de coordinación para el MVP. |

---

## ADR-002: Podman en lugar de Docker

| Campo | Valor |
|---|---|
| **Estado** | Aceptada |
| **Fecha** | 2026-09-09 |
| **Contexto** | Se necesitaba un motor de contenedores para levantar PostgreSQL + pgvector de forma aislada. |
| **Decisión** | Usar Podman como motor de contenedores principal, con compatibilidad con `docker-compose.yml`. |
| **Justificación** | |
| - Daemonless | Podman no requiere un daemon corriendo en segundo plano; es más ligero y seguro. |
| - Rootless | No necesita privilegios de root, reduciendo la superficie de ataque. |
| - Compatibilidad | Los archivos `docker-compose.yml` funcionan tal cual con Podman. |
| - Alternativa rechazada | Docker Desktop requiere suscripción en ciertos escenarios empresariales; Podman es 100% open-source y gratuito. |
| **Consecuencias** | |
| - Positivas | Menor consumo de recursos, instalación más simple, sin costo de licencia. |
| - Negativas | Menor ecosistema de plugins comparado con Docker. |
| - Compatibilidad | El proyecto es portable a Docker si el usuario lo prefiere; los comandos son equivalentes. |

---

## ADR-003: whatsapp-web.js en lugar de WhatsApp Cloud API

| Campo | Valor |
|---|---|
| **Estado** | Aceptada (provisional para MVP) |
| **Fecha** | 2026-09-09 |
| **Contexto** | Se necesitaba un canal de mensajería para conectar el bot con los usuarios de WhatsApp. |
| **Decisión** | Usar `whatsapp-web.js` para el MVP, con planificación de migración a WhatsApp Cloud API de Meta. |
| **Justificación** | |
| - Sin cuenta de negocio | whatsapp-web.js no requiere cuenta de Meta Business; el MVP se puede probar con cualquier WhatsApp personal. |
| - Código QR | El flujo de conexión por QR es inmediato y sin burocracia. |
| - Open-source | La librería es open-source y gratuita. |
| - Riesgo | WhatsApp puede bloquear la sesión web por términos de servicio. Mitigado con planificación de migración a Cloud API. |
| - Alternativa rechazada | WhatsApp Cloud API desde el inicio. Rechazada porque requiere registro de negocio, aprobación de Meta y tiempo de espera. |
| **Consecuencias** | |
| - Positivas | Conexión inmediata, sin costo, sin aprobaciones previas. |
| - Negativas | Riesgo de bloqueo de sesión; no es un canal empresarial oficial. |
| - Plan de contingencia | Migración planificada a Cloud API a largo plazo ([docs/future/01-roadmap.md](../future/01-roadmap.md)). |

---

## ADR-004: Ollama como motor de IA local

| Campo | Valor |
|---|---|
| **Estado** | Aceptada |
| **Fecha** | 2026-09-09 |
| **Contexto** | Se necesitaba un motor de IA para generar respuestas y embeddings. |
| **Decisión** | Usar Ollama con modelos `llama3.2` (generación) y `nomic-embed-text` (embeddings), ejecutándose localmente. |
| **Justificación** | |
| - Privacidad total | Los modelos corren en la máquina del usuario; ningún dato sale hacia servidores externos. |
| - Costo cero | No hay consumo de API ni suscripción. |
| - Modelos locales | Ollama gestiona la descarga y ejecución de modelos LLM de forma simple. |
| - Alternativa rechazada | APIs de pago (OpenAI, Anthropic, etc.). Rechazadas porque violan el requisito de privacidad del producto. |
| **Consecuencias** | |
| - Positivas | Privacidad garantizada, costos cero, funciona sin internet para la IA. |
| - Negativas | Depende del hardware del usuario (GPU/RAM); modelos más grandes pueden ser lentos en hardware limitado. |
| - Mitigación | Modelos configurables por variable de entorno; el usuario elige según su hardware. |

---

## ADR-005: PostgreSQL + pgvector para almacenamiento vectorial

| Campo | Valor |
|---|---|
| **Estado** | Aceptada |
| **Fecha** | 2026-09-09 |
| **Contexto** | Se necesitaba una base de datos que soporte almacenamiento y búsqueda de vectores para el sistema RAG. |
| **Decisión** | Usar PostgreSQL 16 con la extensión pgvector para almacenar documentos, fragmentos y embeddings. |
| **Justificación** | |
| - Base de datos única | Una sola base de datos cubre metadatos de documentos (tabla `documents`) y vectores (tabla `embeddings`). No se necesita una DB separada de vectores. |
| - pgvector nativo | La extensión pgvector añade búsqueda vectorial directamente sobre SQL, sin dependencias externas. |
| - Madurez | PostgreSQL es la BD relacional más madura y estable; pgvector tiene integración nativa. |
| - Alternativa rechazada | Bases de datos vectoriales dedicadas (Pinecone, Weaviate, Chroma). Rechazadas porque agregan otra infraestructura y rompen el principio de "una sola BD". |
| **Consecuencias** | |
| - Positivas | Un solo sistema de persistencia, queries SQL unificadas, backups consistentes. |
| - Negativas | pgvector puede no ser tan optimizado para millones de vectores que una BD vectorial dedicada. |
| - Mitigación | Para el MVP el volumen de documentos es manejable; si crece, se puede particionar o migrar. |

---

## ADR-006: JavaScript (Node.js ESM) sin framework web

| Campo | Valor |
|---|---|
| **Estado** | Aceptada |
| **Fecha** | 2026-09-09 |
| **Contexto** | Se necesitaba elegir el lenguaje y paradigma de ejecución del backend. |
| **Decisión** | Usar JavaScript puro en Node.js con módulos ESM, sin framework web (Express, Fastify, etc.). |
| **Justificación** | |
| - No se necesita servidor web | El bot responde eventos de WhatsApp, no solicitudes HTTP de navegadores. |
| - Minimalismo | Sin framework se reduce la dependencia y el tiempo de arranque. |
| - whatsapp-web.js | La librería principal se integra directamente con Node.js sin necesidad de un framework intermedio. |
| - API mínima | El único endpoint HTTP (`GET /health`) se puede manejar con el módulo `http` nativo. |
| - Alternativa rechazada | Usar Express/Fastify para el servidor HTTP. Rechazado porque agrega complejidad sin beneficio para el MVP. |
| **Consecuencias** | |
| - Positivas | Menos dependencias, arranque más rápido, código más simple. |
| - Negativas | Si se necesita un dashboard web administrativo en el futuro, habrá que agregar un framework. |

---

## ADR-007: Configuración externa con .env (12-Factor App)

| Campo | Valor |
|---|---|
| **Estado** | Aceptada |
| **Fecha** | 2026-09-09 |
| **Contexto** | Se necesitaba gestionar las variables de configuración (BD, modelos Ollama, credenciales). |
| **Decisión** | Toda la configuración vive en un archivo `.env` que NO se versiona; `config.js` la carga y valida en el arranque. |
| **Justificación** | |
| - 12-Factor App | La configuración es una variable de entorno, no código. |
| - Seguridad | Los secretos (contraseñas de BD, URLs) nunca se suben al repositorio. |
| - Portabilidad | Cambiar de entorno (desarrollo/producción) solo requiere cambiar el `.env`. |
| - `.gitignore` | El archivo `.env` está protegido por el `.gitignore` del proyecto. |
| - Alternativa rechazada | Hardcodes en el código. Rechazado porque expone secretos y no permite personalización sin tocar el código. |
| **Consecuencias** | |
| - Positivas | Seguro, portable, sigue buenas prácticas de DevOps. |
| - Negativas | El usuario debe crear manualmente el archivo `.env` desde `.env.example`. |

---

## Proceso de nuevas ADRs

Toda nueva decisión de arquitectura debe seguir este formato:

1. **Contexto**: ¿Qué problema se está resolviendo?
2. **Decisión**: ¿Qué se decidió?
3. **Justificación**: ¿Por qué? ¿Qué alternativas se consideraron y por qué se rechazaron?
4. **Consecuencias**: ¿Qué impacto tiene esta decisión? (positivos y negativos)
5. **Estado**: Aceptada / Propuesta / En revisión / Obsoleta

Las ADRs se registran en este archivo con el formato ADR-NNN y se actualizan cuando una decisión cambia de estado.

---

↩️ [Volver al índice](../00-INDEX.md)
