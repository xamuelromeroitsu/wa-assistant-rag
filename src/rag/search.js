import { buildContext } from '../domain/context.js';

export const DEFAULT_TOP_K = 5;

export function createSearchService({ db, ollama, logger, topK = DEFAULT_TOP_K }) {
  async function warnAboutEmbeddingModel() {
    const listModels = db.listEmbeddingModels?.bind(db);
    if (!listModels) return;

    try {
      const stored = await listModels();

      if (stored.length === 0) {
        if (logger) logger.info('rag', 'No hay documentos cargados todavía. Ejecutá: npm run ingest <ruta_archivos>');
        return;
      }

      if (!stored.includes(ollama.embeddingModel)) {
        if (logger) {
          logger.warn(
            'rag',
            `EMBEDDING_MODEL "${ollama.embeddingModel}" no coincide con los embeddings almacenados (${stored.join(', ')}). ` +
              'La búsqueda no devolverá resultados hasta re-ingerir con el modelo configurado.',
            { configured: ollama.embeddingModel, stored },
          );
        }
      }
    } catch (error) {
      if (logger) logger.debug('rag', `No se pudo verificar los modelos de embeddings: ${error.message}`);
    }
  }

  async function search(question) {
    const query = String(question ?? '').trim();
    if (!query) {
      return { fragments: [], context: '' };
    }

    const vector = await ollama.embed(query);
    const rows = await db.searchSimilar({
      modelo: ollama.embeddingModel,
      vector,
      limite: topK,
    });

    if (rows.length === 0) {
      await warnAboutEmbeddingModel();
    }

    const fragments = rows.map((row) => ({
      texto: row.texto,
      nombre: row.documento,
      documentId: row.document_id,
      orden: row.orden,
      distancia: row.distancia,
    }));

    if (logger) {
      logger.debug('rag', `Búsqueda completada: ${fragments.length} fragmento(s)`, { topK });
    }

    return { fragments, context: buildContext(fragments) };
  }

  return { search };
}
