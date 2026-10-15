export const DEFAULT_CONTEXT_MAX_CHARS = 4000;

function sourceLabel(fragment, index) {
  if (fragment.nombre) return `Fuente: ${fragment.nombre}`;
  if (fragment.documentId) return `Fuente: documento #${fragment.documentId}`;
  return `Fuente: fragmento ${index + 1}`;
}

export function buildContext(fragments, options = {}) {
  const { maxChars = DEFAULT_CONTEXT_MAX_CHARS } = options;
  const usable = (fragments ?? []).filter(
    (fragment) => fragment && typeof fragment.texto === 'string' && fragment.texto.trim(),
  );

  if (usable.length === 0) return '';

  const sections = [];
  let budget = maxChars;

  for (let index = 0; index < usable.length; index += 1) {
    const fragment = usable[index];
    const section = `[Fragmento ${index + 1} | ${sourceLabel(fragment, index)}]\n${fragment.texto.trim()}`;

    if (section.length + 2 > budget) break;

    sections.push(section);
    budget -= section.length + 2;
    if (budget <= 0) break;
  }

  if (sections.length === 0) {
    return usable[0].texto.trim().slice(0, maxChars);
  }

  return sections.join('\n\n');
}
