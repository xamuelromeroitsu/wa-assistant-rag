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
    }),
    server: Object.freeze({
      port: toPositiveInt(env.PORT ?? DEFAULTS.PORT, 'PORT'),
    }),
    rag: Object.freeze({
      topK: toPositiveInt(env.TOP_K ?? DEFAULTS.TOP_K, 'TOP_K'),
    }),
    whatsapp: Object.freeze({
      botNumber: isBlank(env.WABA_BOT_NUMBER) ? null : env.WABA_BOT_NUMBER,
    }),
    logging: Object.freeze({
      level: logLevel,
    }),
  });
}

export { REQUIRED_VARIABLES, DEFAULTS as CONFIG_DEFAULTS };
