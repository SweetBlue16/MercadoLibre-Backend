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

const normalizeTextInput = (value) => decodeStoredText(String(value || '').trim());

module.exports = {
  decodeStoredText,
  normalizeTextInput,
};
