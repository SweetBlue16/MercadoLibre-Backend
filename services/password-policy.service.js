const PASSWORD_POLICY_MESSAGE =
  'La contraseña debe tener 12 caracteres, una mayúscula, una minúscula, un número y un carácter especial.';
const ErrorCodes = require('../messages/error-codes');
const { createError } = require('../utils/app-error');

const getPasswordPolicyErrors = (email, password = '') => {
  const errors = [];

  if (password.length !== 12) errors.push('longitud');
  if (!/[A-Z]/.test(password)) errors.push('mayuscula');
  if (!/[a-z]/.test(password)) errors.push('minuscula');
  if (!/\d/.test(password)) errors.push('numero');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('especial');
  if (email && password.toLowerCase() === String(email).toLowerCase()) errors.push('igual_email');

  return errors;
};

const assertStrongPassword = (email, password) => {
  if (getPasswordPolicyErrors(email, password).length > 0) {
    throw createError(ErrorCodes.PASSWORD_WEAK, 400);
  }
};

module.exports = {
  PASSWORD_POLICY_MESSAGE,
  getPasswordPolicyErrors,
  assertStrongPassword,
};
