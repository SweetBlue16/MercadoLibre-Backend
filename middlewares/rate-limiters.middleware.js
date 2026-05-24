const { rateLimit } = require('express-rate-limit');
const ErrorCodes = require('../messages/error-codes');
const { createError } = require('../utils/app-error');

const minutes = (value) => value * 60 * 1000;

const jsonErrorHandler =
  (code = ErrorCodes.SERVER_UNAVAILABLE) =>
  (req, res, next) =>
    next(createError(code, 429));

const createLimiter = ({ windowMinutes, max, code }) =>
  rateLimit({
    windowMs: minutes(windowMinutes),
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonErrorHandler(code),
  });

const apiDefaultLimiter = createLimiter({
  windowMinutes: 15,
  max: 150,
  code: ErrorCodes.SERVER_UNAVAILABLE,
});

const productReadLimiter = createLimiter({
  windowMinutes: 15,
  max: 240,
  code: ErrorCodes.SERVER_UNAVAILABLE,
});

const imageContentLimiter = createLimiter({
  windowMinutes: 15,
  max: 600,
  code: ErrorCodes.SERVER_UNAVAILABLE,
});

const fileMetadataLimiter = createLimiter({
  windowMinutes: 15,
  max: 120,
  code: ErrorCodes.SERVER_UNAVAILABLE,
});

const fileMutationLimiter = createLimiter({
  windowMinutes: 15,
  max: 30,
  code: ErrorCodes.SERVER_UNAVAILABLE,
});

const authGeneralLimiter = createLimiter({
  windowMinutes: 15,
  max: 90,
  code: ErrorCodes.SERVER_UNAVAILABLE,
});

module.exports = {
  apiDefaultLimiter,
  productReadLimiter,
  imageContentLimiter,
  fileMetadataLimiter,
  fileMutationLimiter,
  authGeneralLimiter,
};
