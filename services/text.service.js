const htmlEntities = Object.freeze({
  '&quot;': '"',
  '&#34;': '"',
  '&amp;quot;': '"',
  '&apos;': "'",
  '&#39;': "'",
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
});

const decodeStoredText = (value) => {
  if (typeof value !== 'string') return value;
  let current = value;
  for (let i = 0; i < 5; i += 1) {
    const next = Object.entries(htmlEntities).reduce(
      (text, [entity, decoded]) => text.replaceAll(entity, decoded),
      current
    );
    if (next === current) return next;
    current = next;
  }
  return current;
};

const HTML_TAGS = /<[^>]{0,250}>/g;

const removeControlChars = (value) =>
  [...value]
    .filter((character) => {
      const code = character.codePointAt(0);
      return code > 31 && code !== 127;
    })
    .join('');

const normalizeTextInput = (value, maxLength = 40) =>
  removeControlChars(decodeStoredText(String(value || '')))
    .replace(HTML_TAGS, '')
    .trim()
    .slice(0, maxLength);

module.exports = {
  decodeStoredText,
  normalizeTextInput,
};
