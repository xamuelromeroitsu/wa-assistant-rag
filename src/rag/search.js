import { buildContext } from '../domain/context.js';

export const DEFAULT_TOP_K = 5;

export function createSearchService({ db, ollama, logger, topK = DEFAULT_TOP_K }) {
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
