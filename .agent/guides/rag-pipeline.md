# 🔄 Pipeline RAG

> Wa-Assistant RAG · flujo completo de ingesta y búsqueda de información.


## ¿Qué es RAG?

**RAG (Retrieval-Augmented Generation)** es una técnica donde el bot:
1. **Recupera** fragmentos relevantes de tus documentos.
2. **Genera** una respuesta fundamentada en esos fragmentos usando IA.

Esto evita que el modelo invente información (alucinaciones).

## Pipeline de ingesta (H4)

### Paso a paso

```
1. Archivo PDF o TXT
       │
       ▼
2. Lectura del contenido
   ├── PDF → pdf-parse extrae texto
   └── TXT → lectura directa
       │
       ▼
3. Chunking (división en fragmentos)
   └── Cada fragmento tiene ~500 caracteres
   └── Se preservan límites de párrafo/sección
       │
       ▼
4. Generación de embeddings
   └── Cada fragmento → modelo nomic-embed-text
   └── Resultado: vector de 768 dimensiones
       │
       ▼
5. Persistencia en PostgreSQL + pgvector
   └── Metadatos → tabla `documents` y `chunks`
   └── Vectores → tabla `embeddings` con índice vectorial
```

### Chunking

- **Tamaño**: ~500 caracteres por fragmento.
- **Solapamiento**: Opcional, para mantener contexto entre fragmentos.
- **Preservación**: Se mantienen los límites de párrafos y secciones.
- **Hash**: Cada fragmento se identifica con SHA-256 para evitar duplicados.

### Ingesta repetida

Si se vuelve a procesar un documento ya cargado:
- El hash del contenido coincide → se ignora (no duplica).
- El hash del fragmento coincide → se ignora el fragmento.

## Pipeline de búsqueda (H3)

### Paso a paso

```
1. Pregunta del usuario
       │
       ▼
2. Generación de embedding de la pregunta
   └── Modelo: nomic-embed-text
   └── Resultado: vector de 768 dimensiones
       │
       ▼
3. Búsqueda top-K en pgvector
   └── SELECT ... ORDER BY embedding <=> $question_vector LIMIT K
   └── K configurable (por defecto 5)
       │
       ▼
4. Construcción del contexto
   └── Se concatenan los K fragmentos recuperados
   └── Se agregan metadatos (nombre del documento)
       │
       ▼
5. Generación de respuesta con Ollama
   └── System prompt + contexto + pregunta
   └── Modelo: llama3.2
   └── Parámetros: temperature 0.2, top_p 0.9
       │
       ▼
6. Respuesta al usuario por WhatsApp
```

### Parámetros de búsqueda

| Parámetro | Default | Descripción |
|---|---|---|
| `top_k` | 5 | Número de fragmentos recuperados |
| `modelo_embeddings` | `nomic-embed-text` | Modelo para generar embeddings |
| `modelo_generacion` | `llama3.2` | Modelo para generar respuestas |
| `temperatura` | 0.2 | Control de aleatoriedad en generación |

## Anti-alucinación

El pipeline previene alucinaciones de 3 formas:

1. **Solo contexto recuperado**: El modelo nunca recibe información que no esté en los documentos cargados.
2. **System prompt estricto**: Instrucciones explícitas de no inventar datos.
3. **Verificación de vacío**: Si no hay fragmentos recuperados, se responde "No encontré información sobre eso."

## Rendimiento

| Operación | Tiempo esperado |
|---|---|
| Ingesta de 1 PDF (10 páginas) | < 10 segundos |
| Búsqueda + generación (H3) | < 30 segundos |
| Saludo (H2) | < 3 segundos |

---

↩️ [Volver al índice](../00-INDEX.md)
