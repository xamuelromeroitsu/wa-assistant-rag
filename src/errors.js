export const ERROR_CODES = Object.freeze({
  DB_CONNECTION: 'ERR_DB_001',
  DB_QUERY_TIMEOUT: 'ERR_DB_002',
  DB_QUERY: 'ERR_DB_003',
  OLLAMA_UNAVAILABLE: 'ERR_OLLAMA_001',
  OLLAMA_MODEL_NOT_FOUND: 'ERR_OLLAMA_002',
  OLLAMA_TIMEOUT: 'ERR_OLLAMA_003',
  OLLAMA_BAD_EMBEDDING: 'ERR_OLLAMA_004',
  WHATSAPP_SESSION_EXPIRED: 'ERR_WHATSAPP_001',
  WHATSAPP_QR_REQUIRED: 'ERR_WHATSAPP_002',
  WHATSAPP_QR_FILE: 'ERR_WHATSAPP_003',
  CONFIG_MISSING: 'ERR_CONFIG_001',
  CONFIG_PORT_IN_USE: 'ERR_CONFIG_002',
  FILE_NOT_FOUND: 'ERR_FILE_001',
  FILE_EMPTY: 'ERR_FILE_002',
  FILE_UNSUPPORTED: 'ERR_FILE_003',
  FILE_PARSE: 'ERR_FILE_004',
});

export const ERROR_CATEGORIES = Object.freeze({
  DATABASE: 'PostgreSQL',
  AI: 'Ollama',
  WHATSAPP: 'WhatsApp',
  CONFIG: 'Configuración',
  FILE: 'Archivo',
});

const CATEGORY_BY_PREFIX = Object.freeze({
  DB: ERROR_CATEGORIES.DATABASE,
  OLLAMA: ERROR_CATEGORIES.AI,
  WHATSAPP: ERROR_CATEGORIES.WHATSAPP,
  CONFIG: ERROR_CATEGORIES.CONFIG,
  FILE: ERROR_CATEGORIES.FILE,
});

const USER_MESSAGES = Object.freeze({
  [ERROR_CODES.DB_CONNECTION]: 'La base de datos no está disponible. Verificá que PostgreSQL esté corriendo.',
  [ERROR_CODES.DB_QUERY_TIMEOUT]: 'La consulta a la base de datos tardó demasiado. Intentá de nuevo.',
  [ERROR_CODES.DB_QUERY]: 'Ocurrió un error interno. Intentá de nuevo.',
  [ERROR_CODES.OLLAMA_UNAVAILABLE]: 'El motor de IA no está disponible. Verificá que Ollama esté corriendo.',
  [ERROR_CODES.OLLAMA_MODEL_NOT_FOUND]: 'Modelo no encontrado. Ejecutá `ollama pull <modelo>` para descargarlo.',
  [ERROR_CODES.OLLAMA_TIMEOUT]: 'La generación tomó demasiado tiempo. Intentá de nuevo.',
  [ERROR_CODES.OLLAMA_BAD_EMBEDDING]: 'El modelo de embeddings devolvió un vector inválido. Verificá EMBEDDING_MODEL.',
  [ERROR_CODES.WHATSAPP_SESSION_EXPIRED]: 'Sesión expirada. Escaneá el código QR para reconectar.',
  [ERROR_CODES.WHATSAPP_QR_REQUIRED]: 'Se requiere vincular el dispositivo: escaneá el código QR de la terminal.',
  [ERROR_CODES.WHATSAPP_QR_FILE]: 'No se pudo guardar el código QR como PNG. Escanealo desde la terminal.',
  [ERROR_CODES.CONFIG_MISSING]: 'Falta configuración requerida. Revisá tu archivo .env (ver .env.example).',
  [ERROR_CODES.CONFIG_PORT_IN_USE]: 'El puerto configurado ya está en uso. Cambiá PORT en tu .env.',
  [ERROR_CODES.FILE_NOT_FOUND]: 'La ruta especificada no existe.',
  [ERROR_CODES.FILE_EMPTY]: 'El archivo está vacío o no contiene texto extraíble.',
  [ERROR_CODES.FILE_UNSUPPORTED]: 'Formato de archivo no soportado. Usá archivos PDF o TXT.',
  [ERROR_CODES.FILE_PARSE]: 'No se pudo leer el archivo. Puede estar corrupto.',
});

export function friendlyMessage(code) {
  return USER_MESSAGES[code] ?? 'Ocurrió un error interno. Intentá de nuevo.';
}

export function categoryFor(code) {
  const prefix = String(code).split('_')[1];
  return CATEGORY_BY_PREFIX[prefix] ?? 'Aplicación';
}

export class AppError extends Error {
  constructor(code, options = {}) {
    const { message, details, cause } = options;
    super(message ?? friendlyMessage(code));
    this.name = 'AppError';
    this.code = code;
    this.category = categoryFor(code);
    this.details = details ?? {};
    this.userMessage = friendlyMessage(code);
    if (cause !== undefined) this.cause = cause;
  }
}

export function isAppError(error) {
  return error instanceof AppError;
}

export function toAppError(error, fallbackCode) {
  if (isAppError(error)) return error;
  return new AppError(fallbackCode, {
    message: error instanceof Error ? error.message : String(error),
    cause: error instanceof Error ? error : undefined,
  });
}
