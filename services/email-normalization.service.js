const normalizeEmailForStorage = (email) => String(email || '').trim();

const normalizeEmailForLookup = (email) => {
  const value = normalizeEmailForStorage(email).toLowerCase();
  const atIndex = value.lastIndexOf('@');
  if (atIndex <= 0 || atIndex === value.length - 1) {
    return value;
  }

  let local = value.slice(0, atIndex);
  const domain = value.slice(atIndex + 1);

  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    local = local.split('+')[0].replaceAll('.', '');
    return `${local}@gmail.com`;
  }

  return `${local}@${domain}`;
};

module.exports = {
  normalizeEmailForLookup,
  normalizeEmailForStorage,
};
