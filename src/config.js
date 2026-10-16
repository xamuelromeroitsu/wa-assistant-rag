import { AppError, ERROR_CODES } from './errors.js';

const REQUIRED_VARIABLES = Object.freeze([
  'PGHOST',
  'PGPORT',
  'PGUSER',
  'PGPASSWORD',
  'PGDATABASE',
  'OLLAMA_HOST',
  'OLLAMA_MODEL',
  'EMBEDDING_MODEL',
]);

const DEFAULTS = Object.freeze({
  PORT: '3000',
  TOP_K: '5',
  LOG_LEVEL: 'INFO',
  QR_PNG_PATH: '.wwebjs_auth/qr.png',
  OLLAMA_TIMEOUT_GENERATE: '30000',
  OLLAMA_TIMEOUT_EMBEDDINGS: '15000',
  OLLAMA_TIMEOUT_TAGS: '5000',
});

const VALID_LOG_LEVELS = Object.freeze(['DEBUG', 'INFO', 'WARN', 'ERROR']);

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

function toPositiveInt(value, variable) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError(ERROR_CODES.CONFIG_MISSING, {
      message: `La variable ${variable} debe ser un entero positivo (recibido: "${value}").`,
      details: { variable },
    });
  }
  return parsed;
}

export function loadConfig(env = process.env) {
  const missing = REQUIRED_VARIABLES.filter((key) => isBlank(env[key]));

  if (missing.length > 0) {
    throw new AppError(ERROR_CODES.CONFIG_MISSING, {
      message: `Variables de entorno requeridas no definidas: ${missing.join(', ')}.`,
      details: { missing },
    });
  }

  const logLevel = String(env.LOG_LEVEL ?? DEFAULTS.LOG_LEVEL).toUpperCase();
  if (!VALID_LOG_LEVELS.includes(logLevel)) {
    throw new AppError(ERROR_CODES.CONFIG_MISSING, {
      message: `LOG_LEVEL inválido: "${logLevel}". Usá uno de: ${VALID_LOG_LEVELS.join(', ')}.`,
      details: { variable: 'LOG_LEVEL' },
    });
  }

  return Object.freeze({
    database: Object.freeze({
      host: env.PGHOST,
      port: toPositiveInt(env.PGPORT, 'PGPORT'),
      user: env.PGUSER,
      password: env.PGPASSWORD,
      database: env.PGDATABASE,
    }),
    ollama: Object.freeze({
      host: String(env.OLLAMA_HOST).replace(/\/+$/, ''),
      model: env.OLLAMA_MODEL,
      embeddingModel: env.EMBEDDING_MODEL,
      timeouts: Object.freeze({
        generate: toPositiveInt(env.OLLAMA_GENERATE_TIMEOUT_MS ?? DEFAULTS.OLLAMA_TIMEOUT_GENERATE, 'OLLAMA_GENERATE_TIMEOUT_MS'),
        embeddings: toPositiveInt(env.OLLAMA_EMBEDDINGS_TIMEOUT_MS ?? DEFAULTS.OLLAMA_TIMEOUT_EMBEDDINGS, 'OLLAMA_EMBEDDINGS_TIMEOUT_MS'),
        tags: toPositiveInt(env.OLLAMA_TAGS_TIMEOUT_MS ?? DEFAULTS.OLLAMA_TIMEOUT_TAGS, 'OLLAMA_TAGS_TIMEOUT_MS'),
      }),
    }),
    server: Object.freeze({
      port: toPositiveInt(env.PORT ?? DEFAULTS.PORT, 'PORT'),
    }),
    rag: Object.freeze({
      topK: toPositiveInt(env.TOP_K ?? DEFAULTS.TOP_K, 'TOP_K'),
    }),
    whatsapp: Object.freeze({
      botNumber: isBlank(env.WABA_BOT_NUMBER) ? null : env.WABA_BOT_NUMBER,
      qr: Object.freeze({
        outputPath: isBlank(env.QR_PNG_PATH) ? DEFAULTS.QR_PNG_PATH : String(env.QR_PNG_PATH),
      }),
    }),
    logging: Object.freeze({
      level: logLevel,
    }),
  });
}

export { REQUIRED_VARIABLES, DEFAULTS as CONFIG_DEFAULTS };
