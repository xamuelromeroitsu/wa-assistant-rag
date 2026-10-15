import { classifyMessage, MESSAGE_TYPES } from '../domain/message.js';
import { buildPrompt } from '../domain/prompt.js';

export const GREETING_REPLY =
  '¡Hola! Soy Wa-Assistant, tu asistente de alimentación y nutrición. ' +
  'Preguntame lo que quieras sobre los documentos cargados y te responderé con la información real.';

export const HELP_REPLY =
  'Comandos disponibles:\n' +
  '- "hola" → saludo\n' +
  '- Cualquier pregunta → respondo usando los documentos cargados.';

export const NO_CONTEXT_REPLY =
  'No encontré información sobre eso en los documentos cargados.';

export function createMessageHandler({ search, ollama, logger, getBotId = () => null }) {
  const isMentioned = (message) => {
    const botId = getBotId();
    if (!botId) return false;
    return (message?.mentionedIds ?? []).includes(botId);
  };

  async function handle(message) {
    if (!message) return { action: 'ignored', reason: 'empty' };

    if (message.hasMedia) {
      if (logger) logger.debug('handler', 'Mensaje con multimedia ignorado (no soportado en el MVP)');
      return { action: 'ignored', reason: 'media' };
    }

    if (message.isGroup && !isMentioned(message)) {
      if (logger) logger.debug('handler', 'Mensaje de grupo sin mención, ignorado');
      return { action: 'ignored', reason: 'group' };
    }

    const type = classifyMessage(message.body);

    if (type === MESSAGE_TYPES.EMPTY) {
      return { action: 'ignored', reason: 'empty' };
    }

    if (type === MESSAGE_TYPES.GREETING) {
      return { action: 'reply', text: GREETING_REPLY };
    }

    if (type === MESSAGE_TYPES.COMMAND) {
      return { action: 'reply', text: HELP_REPLY };
    }

    const { fragments, context } = await search.search(message.body);
    if (fragments.length === 0) {
      if (logger) logger.info('handler', 'Sin fragmentos relevantes para la pregunta');
      return { action: 'reply', text: NO_CONTEXT_REPLY };
    }

    const prompt = buildPrompt(context, message.body);
    const text = await ollama.generate(prompt);
    return { action: 'reply', text };
  }

  return { handle };
}
