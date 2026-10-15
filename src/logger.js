const LEVEL_WEIGHT = Object.freeze({
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40,
});

const SINK_METHOD = Object.freeze({
  DEBUG: 'log',
  INFO: 'log',
  WARN: 'warn',
  ERROR: 'error',
});

function pad(value) {
  return String(value).padStart(2, '0');
}

export function formatLogTimestamp(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

export function createLogger(options = {}) {
  const { level = 'INFO', sink = console } = options;
  const threshold = LEVEL_WEIGHT[String(level).toUpperCase()] ?? LEVEL_WEIGHT.INFO;

  const emit = (levelName, moduleName, message, details) => {
    if (LEVEL_WEIGHT[levelName] < threshold) return;

    const line = `[${formatLogTimestamp()}] [${levelName}] [${moduleName}] ${message}`;
    const method = SINK_METHOD[levelName];

    if (details === undefined) {
      sink[method](line);
      return;
    }
    sink[method](line, details);
  };

  return {
    level,
    debug: (moduleName, message, details) => emit('DEBUG', moduleName, message, details),
    info: (moduleName, message, details) => emit('INFO', moduleName, message, details),
    warn: (moduleName, message, details) => emit('WARN', moduleName, message, details),
    error: (moduleName, message, details) => emit('ERROR', moduleName, message, details),
  };
}
