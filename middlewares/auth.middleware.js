const jwt = require('jsonwebtoken');
const ClaimTypes = require('../config/claimtypes');
const { GeneraToken } = require('../services/jwttoken.service');

const Authorize = (rol) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.header('Authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json('Acceso denegado. Token no proporcionado o formato inválido.');
      }

      const token = authHeader.split(' ')[1];

      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      const rolesPermitidos = rol.split(',').map((r) => r.trim());
      const userRole = decodedToken[ClaimTypes.Role];

      if (!rolesPermitidos.includes(userRole)) {
        return res.status(403).json('Acceso denegado. Permisos insuficientes para esta acción.');
      }

      const timeNow = Math.floor(Date.now() / 1000);
      const timeLeft = decodedToken.exp - timeNow;

      if (timeLeft < 300 && timeLeft > 0) {
        const newToken = GeneraToken(decodedToken[ClaimTypes.Name], decodedToken[ClaimTypes.GivenName], userRole);
        res.setHeader('Set-Authorization', newToken);
      }

      req.decodedToken = decodedToken;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json('El token ha expirado. Por favor, inicie sesión nuevamente.');
      }
      return res.status(401).json('Token inválido o corrupto.');
    }
  };
};

module.exports = Authorize;
