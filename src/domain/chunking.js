export const DEFAULT_MAX_CHARS = 500;

export function normalizeWhitespace(text) {
  return String(text ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function splitLongParagraph(paragraph, maxChars) {
  const words = paragraph.split(/\s+/).filter(Boolean);
  const pieces = [];
  let current = '';

  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }
    if (current.length + 1 + word.length <= maxChars) {
      current = `${current} ${word}`;
      continue;
    }
    pieces.push(current);
    current = word;
  }

  if (current) pieces.push(current);
  return pieces;
}

export function chunkText(text, options = {}) {
  const { maxChars = DEFAULT_MAX_CHARS } = options;
  const source = normalizeWhitespace(text);

  if (!source) return [];

  const paragraphs = source.split(/\n{2,}/);
  const chunks = [];
  let current = '';

  const flush = () => {
    const chunk = current.trim();
    if (chunk) chunks.push(chunk);
    current = '';
  };

  for (const paragraph of paragraphs) {
    if (paragraph.length > maxChars) {
      flush();
      for (const piece of splitLongParagraph(paragraph, maxChars)) chunks.push(piece);
      continue;
    }

    const candidate = current ? `${current}\n${paragraph}` : paragraph;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    flush();
    current = paragraph;
  }

  flush();
  return chunks;
}
