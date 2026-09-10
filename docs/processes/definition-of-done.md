# ✅ Definition of Done

> Wa-Assistant RAG · criterios de "terminado" para cada elemento del backlog.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP) |
| Dueño | Scrum Master |

## Definición

Un elemento del backlog (historia, tarea, bug) se considera **"Hecho" (Done)** cuando cumple TODOS los siguientes criterios:

### Para historias de funcionalidad (H1-H5)

- [ ] Los criterios de aceptación funcionales de [03-functional-spec.md](../producto/03-functional-spec.md) están cumplidos
- [ ] Los criterios técnicos de [02-mvp-scope.md](../producto/02-mvp-scope.md) están cumplidos
- [ ] El código pasa **lint** sin errores (`npm run lint`)
- [ ] Los **tests** correspondientes pasan (`npm run test`)
- [ ] No hay dependencias sin usar en el código
- [ ] El código sigue las **convenciones** de estilo definidas en [convenciones.md](convenciones.md)
- [ ] La documentación se actualizó si el cambio afecta la API o el comportamiento
- [ ] El **Pull Request** fue revisado y aprobado por al menos una persona
- [ ] El **CHANGELOG.md** se actualizó con la versión correspondiente

### Para documentación

- [ ] Sigue el formato estándar (tabla de metadatos, secciones estructuradas, ↩️ volver al índice)
- [ ] Esta listado en el [00-INDEX.md](../00-INDEX.md) con estado y prioridad actualizados
- [ ] Enlaza correctamente a documentos relacionados

### Para código

- [ ] No hay secretos hardcodeados (contraseñas, tokens, claves)
- [ ] Variables de entorno usadas para configuración sensible
- [ ] Manejo de errores implementado para todos los puntos de fallo posibles
- [ ] Logs claros para diagnóstico

## Criterios de "terminado" para el MVP completo

Según [02-mvp-scope.md](../producto/02-mvp-scope.md):

1. Las 5 historias H1–H5 implementadas y verificadas por tests.
2. Guía de instalación reproducida sin pasos omitidos.
3. Documento de uso publicado con preguntas de ejemplo.
4. CI ejecutando lint + tests en cada PR.
5. El flujo de ejemplo se demuestra con un documento real de prueba.

## Reglas de proceso

- **Ningún cambio se fusiona sin pasar CI** (lint + tests).
- **Ningún archivo `.env` se sube al repositorio**.
- **El README se mantiene actualizado** con cada cambio significativo.
- **Cada sprint entrega valor funcional**, no solo código.

---

↩️ [Volver al índice](../00-INDEX.md)
