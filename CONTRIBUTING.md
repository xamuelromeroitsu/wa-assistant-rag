# 🤝 Guía de Contribución

> Wa-Assistant RAG · cómo contribuir al proyecto.

## Flujo de trabajo

1. **Usa ramas de feature**: `feature/nombre-de-la-funcionalidad`.
2. **No trabajes directo en `main`**.
3. Crea un **Pull Request** cuando termines.
4. Espera la **revisión** antes de fusionar.

## Convenciones

- Sigue las [convenciones de código](../docs/processes/convenciones.md).
- Escribe mensajes de commit claros: `feat: ...`, `fix: ...`, `docs: ...`.
- El código está en **español** o **inglés**.
- Sigue [Scrum](../docs/processes/scrum.md).

## Criterios de aceptación

Todo cambio debe cumplir el [Definition of Done](../docs/processes/definition-of-done.md).

## Pasos para contribuir

1. Clona el repositorio.
2. Crea una rama: `git checkout -b feature/nombre`.
3. Implementa tu cambio.
4. Ejecuta `npm run lint` y `npm test`.
5. Actualiza documentación si es necesario.
6. Actualiza el [CHANGELOG.md](CHANGELOG.md).
7. Actualiza el [00-INDEX.md](../docs/00-INDEX.md).
8. Crea el Pull Request.

## Documentación

- La regla de oro: al agregar, mover o renombrar un documento, actualizar el [00-INDEX.md](../docs/00-INDEX.md) en el mismo commit.
- Usar [plantilla de historia](../.github/ISSUE_TEMPLATE/historia.md) para reportar documentación faltante.
- Seguir las [convenciones](../docs/processes/convenciones.md) de estilo y formato.

## Código de conducta

- Respeta las decisiones del equipo.
- Comenta con constructivismo.
- Sigue la metodología Scrum definida.

---

↩️ [Volver al índice](../docs/00-INDEX.md)
