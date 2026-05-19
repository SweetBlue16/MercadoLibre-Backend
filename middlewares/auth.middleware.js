const jwt = require('jsonwebtoken');
const ClaimTypes = require('../config/claimtypes');
const { GeneraToken } = require('../services/jwttoken.service');
const ErrorCodes = require('../messages/error-codes');
const { createError } = require('../utils/app-error');

const Authorize = (rol) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.header('Authorization');

      if (!authHeader?.startsWith('Bearer ')) {
        return next(createError(ErrorCodes.AUTH_SESSION_EXPIRED, 401));
      }

      const token = authHeader.split(' ')[1];

      const decodedToken = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'],
        issuer: 'mercadolibre-backend',
        audience: 'mercadolibre-frontend',
      });

      const rolesPermitidos = rol.split(',').map((r) => r.trim());
      const userRole = decodedToken[ClaimTypes.Role];

      if (!rolesPermitidos.includes(userRole)) {
        return next(createError(ErrorCodes.AUTH_FORBIDDEN, 403));
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
      const code = error.name === 'TokenExpiredError' ? ErrorCodes.AUTH_SESSION_EXPIRED : ErrorCodes.AUTH_TOKEN_INVALID;
      return next(createError(code, 401));
    }
  };
};

module.exports = Authorize;
