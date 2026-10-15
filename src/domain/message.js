export const MESSAGE_TYPES = Object.freeze({
  EMPTY: 'empty',
  GREETING: 'greeting',
  COMMAND: 'command',
  QUESTION: 'question',
});

const GREETING_TERMS = Object.freeze([
  'hola',
  'hey',
  'buenas',
  'buenos dias',
  'buenas tardes',
  'buenas noches',
  'que tal',
  'saludos',
]);

const GREETING_FILLERS = Object.freeze(['bot', 'asistente']);

const COMMAND_TERMS = Object.freeze(['ayuda', 'help', 'comandos', 'menu']);

export function normalizeText(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isGreeting(text) {
  const normalized = normalizeText(text);
  if (!normalized) return false;

  let remainder = ` ${normalized} `;
  for (const term of GREETING_TERMS) {
    remainder = remainder.split(` ${term} `).join(' ');
  }

  const leftover = remainder
    .split(' ')
    .filter((word) => word && !GREETING_FILLERS.includes(word));

  return leftover.length === 0;
}

export function isCommand(text) {
  const normalized = normalizeText(text);
  if (!normalized) return false;

  return COMMAND_TERMS.includes(normalized);
}

export function classifyMessage(body) {
  const normalized = normalizeText(body);
  if (!normalized) return MESSAGE_TYPES.EMPTY;
  if (isGreeting(normalized)) return MESSAGE_TYPES.GREETING;
  if (isCommand(normalized)) return MESSAGE_TYPES.COMMAND;
  return MESSAGE_TYPES.QUESTION;
}
