const requestIp = require('request-ip');
const ClaimTypes = require('../config/claimtypes');
const ErrorCodes = require('../messages/error-codes');
const { AppError } = require('../utils/app-error');
const { getSafeMessage } = require('../messages/message-catalog');

const sanitizeLog = (str) => String(str || '').replace(/[\r\n]+/g, ' ');

const mapKnownError = (err) => {
  if (err instanceof AppError) return err;

  if (err.name === 'SequelizeUniqueConstraintError') {
    return new AppError(ErrorCodes.EMAIL_ALREADY_REGISTERED, 409);
  }

  if (err.name === 'SequelizeValidationError' || err.message?.includes('express-validator')) {
    return new AppError(ErrorCodes.VALIDATION_ERROR, 400);
  }

  if (err.name === 'MulterError' && err.code === 'LIMIT_FILE_SIZE') {
    return new AppError(ErrorCodes.FILE_TOO_LARGE, 400);
  }

  if (err.name === 'MulterError') {
    return new AppError(ErrorCodes.FILE_UPLOAD_FAILED, 400);
  }

  if (err.statusCode === 401) return new AppError(ErrorCodes.AUTH_SESSION_EXPIRED, 401);
  if (err.statusCode === 403) return new AppError(ErrorCodes.AUTH_FORBIDDEN, 403);
  if (err.statusCode === 404) return new AppError(ErrorCodes.RESOURCE_NOT_FOUND, 404);
  if (err.statusCode === 409) return new AppError(ErrorCodes.EMAIL_ALREADY_REGISTERED, 409);
  if (err.statusCode === 429) return new AppError(ErrorCodes.EMAIL_RESEND_RATE_LIMITED, 429);
  if (err.statusCode === 400) return new AppError(ErrorCodes.VALIDATION_ERROR, 400);
  if (err.statusCode === 503) return new AppError(ErrorCodes.SERVER_UNAVAILABLE, 503);

  return new AppError(ErrorCodes.INTERNAL_ERROR, 500);
};

const errorHandler = (err, req, res, _next) => {
  void _next;
  const appError = mapKnownError(err);
  const statusCode = appError.statusCode || 500;
  const ip = requestIp.getClientIp(req);
  const correlationId = req.correlationId || res.locals.correlationId;

  let email = 'Anonimo/No autenticado';
  if (req.decodedToken) {
    email = req.decodedToken[ClaimTypes.Name] || 'Anonimo';
  }

  console.error(
    `[INCIDENTE/ERROR] Fecha: ${new Date().toISOString()} | CorrelationId: ${sanitizeLog(correlationId)} | IP: ${sanitizeLog(ip)} | Usuario: ${sanitizeLog(email)} | Endpoint: ${sanitizeLog(req.method)} ${sanitizeLog(req.originalUrl)} | Status: ${statusCode} | Code: ${appError.code} | Causa: ${sanitizeLog(err.message)}`
  );

  if (err.stack && statusCode === 500 && process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    code: appError.code,
    message: appError.safeMessage || getSafeMessage(appError.code),
    correlationId,
    ...(appError.details ? { errors: appError.details } : {}),
  });
};

module.exports = errorHandler;
