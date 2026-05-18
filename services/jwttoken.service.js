const jwt = require('jsonwebtoken');
const ClaimTypes = require('../config/claimtypes');

const GeneraToken = (email, nombre, rol) => {
  const payload = {
    [ClaimTypes.Name]: email,
    [ClaimTypes.GivenName]: nombre,
    [ClaimTypes.Role]: rol,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '20m',
    algorithm: 'HS256',
    issuer: 'mercadolibre-backend',
    audience: 'mercadolibre-frontend',
  });
};

const TiempoRestanteToken = (req) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'mercadolibre-backend',
      audience: 'mercadolibre-frontend',
    });

    const timeNow = Math.floor(Date.now() / 1000);
    const timeLeft = decoded.exp - timeNow;

    return timeLeft > 0 ? timeLeft : null;
  } catch {
    return null;
  }
};

module.exports = { GeneraToken, TiempoRestanteToken };
