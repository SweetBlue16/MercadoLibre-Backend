const requestIp = require('request-ip');
const ClaimTypes = require('../config/claimtypes');

const errorHandler = (err, req, res) => {
  let statusCode = err.statusCode || 500;
  const ip = requestIp.getClientIp(req);

  let email = 'Anónimo/No autenticado';
  if (req.decodedToken) {
    email = req.decodedToken[ClaimTypes.Name] || 'Anónimo';
  }

  if (
    err.name === 'SequelizeValidationError' ||
    err.name === 'SequelizeUniqueConstraintError' ||
    err.message?.includes('express-validator')
  ) {
    statusCode = 400;
  }

  console.error(
    `[INCIDENTE/ERROR] Fecha: ${new Date().toISOString()} | IP: ${ip} | Usuario: ${email} | Status: ${statusCode} | Mensaje: ${err.message}`
  );
  if (err.stack && statusCode === 500) {
    console.error(err.stack);
  }

  let safeMessage =
    statusCode === 500 ? 'Ocurrió un error interno en el servidor.' : 'Datos de entrada inválidos o acceso denegado.';

  if (process.env.NODE_ENV === 'development') {
    safeMessage = err.message;
  }

  res.status(statusCode).json({
    status: 'error',
    statusCode: statusCode,
    message: safeMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
