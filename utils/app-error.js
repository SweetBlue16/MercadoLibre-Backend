const ErrorCodes = require('../messages/error-codes');
const { getSafeMessage } = require('../messages/message-catalog');

class AppError extends Error {
  constructor(code, httpStatus = 500, safeMessage = null, details = null) {
    super(safeMessage || getSafeMessage(code));
    this.name = 'AppError';
    this.code = code || ErrorCodes.INTERNAL_ERROR;
    this.statusCode = httpStatus;
    this.safeMessage = safeMessage || getSafeMessage(this.code);
    this.details = details;
    Error.captureStackTrace(this, AppError);
  }
}

const createError = (code, httpStatus, safeMessage = null, details = null) =>
  new AppError(code, httpStatus, safeMessage, details);

module.exports = {
  AppError,
  createError,
};
