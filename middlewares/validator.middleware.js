const { validationResult } = require('express-validator');
const ErrorCodes = require('../messages/error-codes');
const { createError } = require('../utils/app-error');

const sanitizeField = (field) => String(field || '').replace(/[^a-zA-Z0-9_.-]/g, '');

const validateRequest = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const details = result.array().map((err) => ({
      field: sanitizeField(err.path),
      code: ErrorCodes.VALIDATION_ERROR,
    }));

    console.warn(
      `[ALERTA VALIDACION] CorrelationId: ${req.correlationId || res.locals.correlationId} | IP: ${req.ip} | Campos: ${details
        .map((item) => item.field)
        .join(',')}`
    );

    return next(createError(ErrorCodes.VALIDATION_ERROR, 400, null, details));
  }
  next();
};

module.exports = validateRequest;
