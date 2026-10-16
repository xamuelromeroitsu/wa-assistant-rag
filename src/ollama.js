import { AppError, ERROR_CODES } from './errors.js';

export const EMBEDDING_DIMENSIONS = 768;

export const GENERATION_PARAMS = Object.freeze({
  temperature: 0.2,
  top_p: 0.9,
  num_predict: 512,
  stop: ['\n\n'],
  num_ctx: 4096,
});

export const DEFAULT_TIMEOUTS = Object.freeze({
  tags: 5000,
  generate: 30000,
  embeddings: 15000,
});

function modelMatches(availableName, configuredName) {
  return availableName === configuredName || availableName.startsWith(`${configuredName}:`);
}

export function createOllamaClient(options) {
  const {
    host,
    model,
    embeddingModel,
    logger,
    timeouts = {},
    fetchImpl = globalThis.fetch,
    generateParams = GENERATION_PARAMS,
  } = options;

  const baseUrl = String(host).replace(/\/+$/, '');
  const limits = { ...DEFAULT_TIMEOUTS, ...timeouts };

  const request = async (endpoint, { method = 'GET', body, timeoutMs, modelName }) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response;

    try {
      response = await fetchImpl(`${baseUrl}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timer);
      if (error?.name === 'AbortError') {
        throw new AppError(ERROR_CODES.OLLAMA_TIMEOUT, {
          message: `Ollama no respondió en ${timeoutMs} ms (${endpoint}).`,
          details: { endpoint, timeoutMs },
          cause: error,
        });
      }
      throw new AppError(ERROR_CODES.OLLAMA_UNAVAILABLE, {
        message: `No se pudo conectar con Ollama en ${baseUrl}.`,
        details: { endpoint },
        cause: error,
      });
    }

    clearTimeout(timer);

    if (!response.ok) {
      if (response.status === 404) {
        throw new AppError(ERROR_CODES.OLLAMA_MODEL_NOT_FOUND, {
          message: `Modelo no encontrado en Ollama (${endpoint}). Ejecutá: ollama pull ${modelName ?? model}`,
          details: { endpoint, status: response.status, model: modelName ?? model },
        });
      }
      throw new AppError(ERROR_CODES.OLLAMA_UNAVAILABLE, {
        message: `Ollama respondió con estado ${response.status}.`,
        details: { endpoint, status: response.status },
      });
    }

    try {
      return await response.json();
    } catch (error) {
      throw new AppError(ERROR_CODES.OLLAMA_UNAVAILABLE, {
        message: `Respuesta inválida de Ollama en ${endpoint}.`,
        details: { endpoint },
        cause: error,
      });
    }
  };

  return {
    model,
    embeddingModel,

    async listModels() {
      const data = await request('/api/tags', { timeoutMs: limits.tags });
      return (data?.models ?? []).map((entry) => entry.name);
    },

    async verifyModels() {
      const available = await this.listModels();
      const missing = [model, embeddingModel].filter(
        (configured) => !available.some((name) => modelMatches(name, configured)),
      );
      return { available, missing };
    },

    async generate(prompt) {
      const data = await request('/api/generate', {
        method: 'POST',
        timeoutMs: limits.generate,
        body: {
          model,
          prompt,
          stream: false,
          ...generateParams,
        },
      });
      return data?.response ?? '';
    },

    async embed(text) {
      const data = await request('/api/embeddings', {
        method: 'POST',
        timeoutMs: limits.embeddings,
        modelName: embeddingModel,
        body: {
          model: embeddingModel,
          prompt: text,
          temperature: 0,
          options: { top_p: 1.0 },
        },
      });

      const vector = data?.embedding;
      if (!Array.isArray(vector) || vector.length !== EMBEDDING_DIMENSIONS) {
        if (logger) {
          logger.error('ollama', 'Embedding con dimensión inesperada', {
            expected: EMBEDDING_DIMENSIONS,
            received: Array.isArray(vector) ? vector.length : null,
          });
        }
        throw new AppError(ERROR_CODES.OLLAMA_BAD_EMBEDDING, {
          message: `El embedding debe tener ${EMBEDDING_DIMENSIONS} dimensiones.`,
          details: { expected: EMBEDDING_DIMENSIONS, received: Array.isArray(vector) ? vector.length : null },
        });
      }

      return vector;
    },
  };
}
