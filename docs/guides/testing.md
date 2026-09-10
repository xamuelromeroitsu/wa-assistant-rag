# 🧪 Estrategia de Testing

> Wa-Assistant RAG · guía de pruebas para el MVP.


## Estrategia general

El MVP utiliza **tests unitarios** para los módulos críticos. La estrategia cubre:

- **Módulos de negocio**: handlers, rag (ingesta y búsqueda)
- **Configuración**: validación de variables de entorno
- **Acceso a datos**: queries a PostgreSQL

## Estructura de tests

```
tests/
├── unit/
│   ├── handlers/
│   │   └── message.test.js
│   ├── rag/
│   │   ├── ingest.test.js
│   │   └── search.test.js
│   └── config.test.js
├── fixtures/
│   └── documento-prueba.pdf
└── helpers/
    └── db-test-helper.js
```

## Types de tests

### Tests unitarios

| Módulo | Qué se testea | Ejemplo |
|---|---|---|
| `config.test.js` | Validación de variables de entorno | Falta de variable → error |
| `message.test.js` | Clasificación de mensajes (saludo vs. pregunta) | "hola" → saludo; "¿qué es?" → pregunta |
| `ingest.test.js` | Proceso de chunking y detección de duplicados | PDF → fragmentos correctos |
| `search.test.js` | Búsqueda top-K y construcción de contexto | Pregunta → fragmentos relevantes |

### Tests de integración

| Qué se testea | Cómo |
|---|---|
| Conexión a PostgreSQL | `db.test.js` con pool real |
| Ingesta completa | `ingest.test.js` con fixture de documentos |
| Pipeline RAG completo | `rag.test.js` con pregunta y respuesta esperada |

## Fixtures

Se usa un documento de prueba (`tests/fixtures/documento-prueba.pdf`) que contiene información sobre alimentación para verificar que el sistema RAG funciona correctamente.

## Ejecución

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests con coverage
npm test -- --coverage

# Ejecutar un test específico
npm test -- --grep "handlers"
```

## Convenciones de testing

1. **Todos los tests deben pasar** antes de hacer un PR.
2. **No se suben datos reales** a los tests; se usan fixtures.
3. **La BD de test se resetea** antes de cada ejecución.
4. **Los tests no dependen de Ollama** para los unitarios; se mockean las llamadas HTTP.
5. **Cobertura mínima**: 80% para módulos críticos (handlers, rag).

## Mocks

Los tests unitarios mockean las dependencias externas:

- **Ollama**: Se mockea la respuesta de `/api/generate` y `/api/embeddings`.
- **PostgreSQL**: Se usa una BD de test dedicada o se mockea el pool.
- **WhatsApp**: No se testea la integración real; se testea la lógica del handler con datos simulados.

---

↩️ [Volver al índice](../00-INDEX.md)
