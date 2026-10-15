# 🏃 Metodología Scrum

> Wa-Assistant RAG · cómo se trabaja, iteraciones y ceremonies.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP) |
| Dueño | Scrum Master |

## Framework

El proyecto utiliza **Scrum** con las siguientes ceremonies:

### Ciclo de sprint

| Evento | Frecuencia | Duración | Propósito |
|---|---|---|---|
| Sprint Planning | Inicio de cada sprint | 1 h | Definir el objetivo del sprint y seleccionar historias |
| Daily Standup | Todos los días | 15 min | Estado del avance y bloqueos |
| Sprint Review | Fin de sprint | 1 h | Demostración de lo completado |
| Sprint Retrospective | Fin de sprint | 1 h | Mejoras de proceso |

### Duración del sprint

- **MVP**: Sprints de **1 semana**.
- Objetivo: validar rápido, iterar rápido, reducir riesgo.

### Historias y criterios de "terminado"

Cada historia del MVP (H1-H5) debe cumplir los criterios de aceptación definidos en [03-functional-spec.md](../producto/03-functional-spec.md).

Una historia se considera **terminada** cuando:
1. Cumple todos los criterios de aceptación funcionales.
2. Pasa los tests unitarios y de integración.
3. Pasa lint sin errores.
4. Está documentada en este repositorio.
5. Tiene un Pull Request revisado por al menos un compañero.

## Definition of Done

Detallado en [definition-of-done.md](definition-of-done.md).

## Roles

| Rol | Responsabilidad en este proyecto |
|---|---|
| **Product Owner** | Define el alcance del MVP, prioriza el backlog, valida las historias |
| **Scrum Master** | Facilita las ceremonias, elimina bloqueos, protege al equipo |
| **Desarrollador/Técnico** | Implementa las historias, escribe código y tests |

## Backlog

El backlog completo está en [docs/roadmap/backlog.md](../roadmap/backlog.md).

## Tablero de seguimiento

| Historia | Estado | Sprint |
|---|---|---|
| H1 — Conectar WhatsApp | ✅ Planificada | MVP |
| H2 — Saludo | ✅ Planificada | MVP |
| H3 — Preguntas RAG | ✅ Planificada | MVP |
| H4 — Ingesta de documentos | ✅ Planificada | MVP |
| H5 — Modelo configurable | ✅ Planificada | MVP |

---

↩️ [Volver al índice](../00-INDEX.md)
