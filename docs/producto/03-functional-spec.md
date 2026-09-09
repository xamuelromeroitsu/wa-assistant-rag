# 🔬 Especificación funcional

> Wa-Assistant RAG · comportamiento del sistema, historias de usuario y criterios de aceptación.

| Metadatos | Valor |
|---|---|
| Estado | Listo |
| Última actualización | 2026-09-09 |
| Versión asociada | v0.0.0 (MVP) |
| Dueño | Product Owner |

## Alcance de este documento

Describe el **comportamiento observable** de cada historia del MVP (H1–H5). Cada historia sigue el formato:

```
COMO <rol>, QUIERO <capacidad>, PARA <beneficio>.
```

Y un conjunto de criterios de aceptación (**Criterios de "terminado" funcionales**) que deben cumplirse para considerar la historia completa. Los criterios técnicos transversales viven en el [Definition of Done](../procesos/definition-of-done.md) y la estrategia de pruebas en [testing](../guias/testing.md).

---

<a name="h1"></a>
## H1 — Conectar el bot a WhatsApp por código QR

> **Historia:** COMO propietario del bot, QUIERO vincularlo a mi WhatsApp escaneando un código QR, PARA poder enviarle mensajes desde mi celular.

### Flujo de uso
1. Ejecutar `npm run dev`.
2. Se genera un código QR en la terminal.
3. En el celular: WhatsApp → Menú → Dispositivos vinculados → Vincular un dispositivo → escanear.
4. El bot queda conectado y queda un registro local de sesión.

### Criterios de aceptación
- [ ] El código QR se muestra en menos de 60 segundos desde `npm run dev`.
- [ ] Al escanear, la sesión queda activa y el bot indica "conectado" en los logs.
- [ ] La sesión persiste entre reinicios (no se reescanea el QR inmediatamente).
- [ ] Si se borra la carpeta de sesión, el próximo arranque vuelve a pedir QR.
- [ ] El proceso termina limpiamente con `Ctrl+C`.

### Casos de borde
- QR vencido: se regenera o se muestra un error claro.
- Red caída al escanear: el bot reintenta y no se cuelga el proceso.

---

<a name="h2"></a>
## H2 — Responder a un saludo

> **Historia:** COMO usuario, QUIERO saludar al bot y recibir una respuesta rápida, PARA confirmar que está conectado sin hacer una pregunta compleja.

### Flujo de uso
1. Enviar "hola" (o saludos equivalentes: "buenas", "hola bot", "hey").
2. El bot responde en español en menos de 3 segundos.

### Criterios de aceptación
- [ ] "hola" responde en < 3 s (medición desde recepción hasta envío).
- [ ] La respuesta incluye el nombre/producto del bot y una invitación a preguntar sobre documentos.
- [ ] Saludos con mayúsculas/minúsculas o tildes variadas se reconocen igual ("HOLA", "Holá").
- [ ] Un saludo no dispara el pipeline RAG (se corta temprano).

### Casos de borde
- Mensajes en grupos: el bot solo responde si lo mencionan (socializado en [whatsapp-web.js](../apis/03-whatsapp-webjs.md)).
- Mensajes con solo espacios o símbolos: se ignoran sin error.

---

<a name="h3"></a>
## H3 — Responder preguntas con contexto de los documentos (RAG)

> **Historia:** COMO usuario, QUIERO hacerle al bot una pregunta sobre mis documentos, PARA obtener una respuesta fundamentada en su contenido.

### Flujo de uso
1. Enviar una pregunta en español.
2. El sistema recupera los fragmentos más relevantes (pgvector).
3. Ollama genera una respuesta usando esos fragmentos como contexto.
4. El bot envía la respuesta y, si se confirma con documentos, cita la fuente.

### Criterios de aceptación
- [ ] La respuesta se genera en < 30 s en hardware nominal.
- [ ] La respuesta NO es "de memoria general" cuando el documento contiene la información.
- [ ] Si hay poca o nula información relevante, el bot lo dice explícitamente ("No encontré información sobre...") en lugar de inventar.
- [ ] La respuesta se muestra como texto plano y en español.
- [ ] El número de fragmentos usados como contexto es configurable ([env](../nodejs/05-config-y-env.md)).

### Casos de borde
- Ollama caído: el bot responde "el motor de IA no está disponible" y registra el error.
- Pregunta ofensiva o fuera de contexto: respuesta cortés y sin datos inventados.
- Base de datos vacía: el bot informa que aún no hay documentos cargados.

---

<a name="h4"></a>
## H4 — Cargar documentos (PDF/TXT)

> **Historia:** COMO propietario, QUIERO cargar mis documentos PDF/TXT al bot, PARA que luego pueda responder preguntas sobre su contenido.

### Flujo de uso
1. Ejecutar el comando/script de ingesta (`npm run ingest`) señalando las rutas de los archivos.
2. El sistema lee cada archivo, lo divide en fragmentos, genera embeddings y los persiste.
3. Se reporta un resumen: archivos procesados, fragmentos generados, errores parciales.

### Criterios de aceptación
- [ ] PDF y TXT se procesan sin modificar el contenido original.
- [ ] Las tablas/encabezados básicos de un PDF se preservan de forma legible.
- [ ] Si un archivo falla, el resto se procesa igual y el error se reporta (no se aborta todo).
- [ ] Los fragmentos cargados quedan disponibles para H3 sin reiniciar el bot.
- [ ] Ingesta repetida no duplica el contenido (identificación por hash del fragmento).

### Casos de borde
- PDF escaneado (imagen, sin texto): se detecta y se informa que se requiere PDF con texto.
- Archivo vacío o corrupto: error claro y continuo con el siguiente.
- Ruta inexistente: aborta con mensaje comprensible antes de procesar nada.

---

<a name="h5"></a>
## H5 — Modelo de IA configurable

> **Historia:** COMO operador, QUIERO elegir el modelo de Ollama con una variable de entorno, PARA adaptar costos, latencia y calidad sin tocar código.

### Criterios de aceptación
- [ ] `OLLAMA_MODEL` define el modelo para respuestas y `EMBEDDING_MODEL` para vectores ([env](../nodejs/05-config-y-env.md)).
- [ ] Si el modelo no está descargado en Ollama, el log lo indica claramente con el comando `ollama pull`.
- [ ] Cambiar `OLLAMA_MODEL` **no exige** re-ingestar los documentos (los embeddings son independientes del modelo generador).
- [ ] El nombre del modelo se valida y se muestra al arrancar el bot.
- [ ] Valores por defecto sensatos presentes en `.env.example`.

### Casos de borde
- Modelo con nombre inválido o versión inexistente: arranque con advertencia y fallo amigable.
- `EMBEDDING_MODEL` distinto al usado en la ingesta: advertencia de que puede degradar la búsqueda.

---

## Matriz de trazabilidad

| Historia | Requisito funcional base | RNF principal (ver [scope](02-mvp-scope.md)) | Testing (ver [testing](../guias/testing.md)) |
|---|---|---|---|
| H1 | Conservación de sesión | Compatibilidad | Integración (sesión/QR) |
| H2 | Español; corte temprano | Rendimiento < 3 s | Unitario del handler |
| H3 | Respuestas fundamentadas | Privacidad; rendimiento < 30 s | Unitario de búsqueda + integración RAG |
| H4 | Ingesta por hash; errores parciales | Privacidad | Unitario de ingesta + fixture de docs |
| H5 | Env validado | Mantenibilidad | Unitario de configuración |

---

↩️ [Volver al índice](../00-INDEX.md)