const crypto = require('node:crypto');

const generateSixDigitCode = () => crypto.randomInt(100000, 1000000).toString();

const hashToken = (token) => crypto.createHash('sha256').update(String(token), 'utf8').digest('hex');

const constantTimeEquals = (left, right) => {
  const leftBuffer = Buffer.from(String(left || ''), 'hex');
  const rightBuffer = Buffer.from(String(right || ''), 'hex');

  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

module.exports = {
  generateSixDigitCode,
  hashToken,
  constantTimeEquals,
};
