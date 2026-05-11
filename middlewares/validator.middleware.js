const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = [];
    errors.array().forEach((err) => extractedErrors.push({ [err.path]: err.msg }));

    const error = new Error('Los datos proporcionados no cumplen con el formato requerido.');
    error.statusCode = 400;

    console.error(`[ALERTA VALIDACIÓN] IP: ${req.ip} | Detalle:`, extractedErrors);

    return next(error);
  }
  next();
};

module.exports = validateRequest;
