# 📚 Ingesta de Documentos

> Wa-Assistant RAG · guía detallada de cómo cargar documentos al sistema.


## Formatos soportados

| Formato | Extensión | Biblioteca | Método |
|---|---|---|---|
| PDF | `.pdf` | `pdf-parse` | Extracción de texto |
| TXT | `.txt` | Node.js nativo (`fs`) | Lectura directa |

## Formatos NO soportados en el MVP

| Formato | Motivo | Cuándo |
|---|---|---|
| DOCX | Requiere librería adicional | Mediano plazo |
| XLSX | Requiere librería adicional | Mediano plazo |
| Imagenes (JPEG, PNG) | OCR necesario | Largo plazo |
| URLs/web scraping | Fuente externa | Largo plazo |

## Comando de ingestión

```bash
npm run ingest <ruta_archivos>
```

### Ejemplos

```bash
# Ingestar todos los archivos de una carpeta
npm run ingest ./documentos/

# Ingestar un archivo específico
npm run ingest ./documentos/manual.pdf
```

## Proceso de ingesta

1. **Lectura del archivo**: Se lee el contenido completo.
2. **Chunking**: El texto se divide en fragmentos de ~500 caracteres.
3. **Generación de embeddings**: Cada fragmento se convierte en un vector.
4. **Persistencia**: Se guardan metadatos y vectores en PostgreSQL.
5. **Reporte**: Se muestra un resumen con archivos procesados, fragmentos generados y errores.

### Resumen de ingesta

```
Ingesta completada:
  - Archivos procesados: 3
  - Fragmentos generados: 127
  - Errores: 0

Errores:
  - "documento_escaneado.pdf": PDF escaneado, requiere PDF con texto
```

## Manejo de errores durante ingesta

| Error | Comportamiento |
|---|---|
| Archivo no encontrado | Se aborta antes de procesar nada |
| PDF sin texto (escaneado) | Se omite el archivo, se reporta el error |
| Archivo vacío | Se omite, se reporta |
| Archivo corrupto | Se omite, se reporta |
| Error de BD | Se loguea, se continúa con el siguiente archivo |
| Fragmento duplicado | Se ignora (ON CONFLICT DO NOTHING) |

## Ingesta repetida

Si ejecutas `npm run ingest` con archivos ya cargados:
- Los documentos con el mismo hash de contenido **no se duplican**.
- Los fragmentos con el mismo hash **no se duplican**.
- El sistema es **idempotente**: ejecutarlo múltiples veces produce el mismo resultado.

## Verificación de documentos cargados

```sql
SELECT d.nombre, d.hash_contenido, COUNT(c.id) AS fragmentos
FROM documents d
JOIN chunks c ON c.document_id = d.id
GROUP BY d.nombre;
```

---

↩️ [Volver al índice](../00-INDEX.md)
