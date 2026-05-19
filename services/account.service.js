const bcrypt = require('bcrypt');
const { usuario, passwordchangetoken, Sequelize } = require('../models');
const { assertStrongPassword } = require('./password-policy.service');
const { generateSixDigitCode, hashToken, constantTimeEquals } = require('./token-code.service');
const emailService = require('./email.service');
const ErrorCodes = require('../messages/error-codes');
const { createError } = require('../utils/app-error');

const CONFIRMATION_MINUTES = 15;
const RESET_MINUTES = 30;
const PASSWORD_CHANGE_MINUTES = 15;
const MAX_CONFIRMATION_ATTEMPTS = 5;
const MAX_PASSWORD_CHANGE_ATTEMPTS = 5;
const RESEND_SECONDS = 60;
const RESET_SECONDS = 60;
const PASSWORD_CHANGE_RESEND_SECONDS = 60;
const Op = Sequelize.Op;

const addMinutes = (minutes) => new Date(Date.now() + minutes * 60 * 1000);
const secondsSince = (date) => (date ? (Date.now() - new Date(date).getTime()) / 1000 : Number.POSITIVE_INFINITY);
const confirmationEnabled = () => process.env.EMAIL_CONFIRMATION_ENABLED !== 'false';

const setConfirmationCode = async (user, correlationId) => {
  const code = generateSixDigitCode();
  await user.update({
    emailconfirmado: false,
    codigoconfirmacionhash: hashToken(code),
    codigoconfirmacionexpira: addMinutes(CONFIRMATION_MINUTES),
    intentosconfirmacion: 0,
    ultimoreenvioconfirmacion: new Date(),
  });
  await emailService.sendConfirmationCode(user.email, code, correlationId);
};

const reenviarConfirmacion = async (email, correlationId) => {
  const user = await usuario.findOne({ where: { email } });
  if (!user || user.emailconfirmado || !confirmationEnabled()) {
    return true;
  }

  if (secondsSince(user.ultimoreenvioconfirmacion) < RESEND_SECONDS) {
    throw createError(ErrorCodes.EMAIL_RESEND_RATE_LIMITED, 429);
  }

  await setConfirmationCode(user, correlationId);
  return true;
};

const confirmarCorreo = async (email, codigo) => {
  const user = await usuario.findOne({ where: { email } });
  if (!user) {
    throw createError(ErrorCodes.EMAIL_CONFIRMATION_INVALID, 400);
  }

  if (user.emailconfirmado) return true;

  if (
    !user.codigoconfirmacionhash ||
    !user.codigoconfirmacionexpira ||
    new Date(user.codigoconfirmacionexpira).getTime() < Date.now() ||
    user.intentosconfirmacion >= MAX_CONFIRMATION_ATTEMPTS
  ) {
    throw createError(ErrorCodes.EMAIL_CONFIRMATION_EXPIRED, 400);
  }

  const isValid = constantTimeEquals(hashToken(codigo), user.codigoconfirmacionhash);
  if (!isValid) {
    await user.increment('intentosconfirmacion');
    throw createError(ErrorCodes.EMAIL_CONFIRMATION_INVALID, 400);
  }

  await user.update({
    emailconfirmado: true,
    codigoconfirmacionhash: null,
    codigoconfirmacionexpira: null,
    intentosconfirmacion: 0,
    ultimoreenvioconfirmacion: null,
  });
  return true;
};

const solicitarResetPassword = async (email) => {
  const user = await usuario.findOne({ where: { email } });
  if (!user) return true;

  if (secondsSince(user.ultimoresetpassword) < RESET_SECONDS) {
    return true;
  }

  const code = generateSixDigitCode();
  await user.update({
    resettokenhash: hashToken(code),
    resettokenexpira: addMinutes(RESET_MINUTES),
    ultimoresetpassword: new Date(),
  });
  await emailService.sendPasswordResetCode(user.email, code);
  return true;
};

const solicitarCodigoCambioPassword = async (email, correlationId) => {
  const user = await usuario.findOne({ where: { email } });
  if (!user) {
    throw createError(ErrorCodes.AUTH_SESSION_EXPIRED, 401);
  }

  const lastToken = await passwordchangetoken.findOne({
    where: {
      usuarioid: user.id,
      usedat: null,
      createdAt: {
        [Op.gte]: new Date(Date.now() - PASSWORD_CHANGE_RESEND_SECONDS * 1000),
      },
    },
    order: [['createdAt', 'DESC']],
  });

  if (lastToken) {
    throw createError(ErrorCodes.PASSWORD_CHANGE_CODE_RATE_LIMITED, 429);
  }

  const code = generateSixDigitCode();
  await passwordchangetoken.update(
    { usedat: new Date() },
    {
      where: {
        usuarioid: user.id,
        usedat: null,
      },
    }
  );
  const token = await passwordchangetoken.create({
    usuarioid: user.id,
    codehash: hashToken(code),
    expiresat: addMinutes(PASSWORD_CHANGE_MINUTES),
    attempts: 0,
  });

  try {
    await emailService.sendPasswordChangeCode(user.email, code, correlationId);
  } catch (error) {
    await token.update({ usedat: new Date() });
    throw error;
  }
  return true;
};

const restablecerPassword = async (email, token, password, confirmPassword) => {
  if (password !== confirmPassword) {
    throw createError(ErrorCodes.PASSWORD_CONFIRMATION_MISMATCH, 400);
  }

  assertStrongPassword(email, password);

  const user = await usuario.findOne({ where: { email } });
  if (
    !user ||
    !user.resettokenhash ||
    !user.resettokenexpira ||
    new Date(user.resettokenexpira).getTime() < Date.now() ||
    !constantTimeEquals(hashToken(token), user.resettokenhash)
  ) {
    throw createError(ErrorCodes.EMAIL_CONFIRMATION_INVALID, 400);
  }

  const samePassword = await bcrypt.compare(password, user.passwordhash);
  if (samePassword) {
    throw createError(ErrorCodes.PASSWORD_REUSE, 400);
  }

  await user.update({
    passwordhash: password,
    resettokenhash: null,
    resettokenexpira: null,
  });
  return true;
};

const cambiarPassword = async (email, codigo, passwordActual, passwordNueva, confirmPassword) => {
  if (passwordNueva !== confirmPassword) {
    throw createError(ErrorCodes.PASSWORD_CONFIRMATION_MISMATCH, 400);
  }

  assertStrongPassword(email, passwordNueva);

  const user = await usuario.findOne({ where: { email } });
  if (!user) {
    throw createError(ErrorCodes.RESOURCE_NOT_FOUND, 404);
  }

  const token = await passwordchangetoken.findOne({
    where: {
      usuarioid: user.id,
      usedat: null,
    },
    order: [['createdAt', 'DESC']],
  });

  if (
    !token ||
    !token.codehash ||
    new Date(token.expiresat).getTime() < Date.now() ||
    token.attempts >= MAX_PASSWORD_CHANGE_ATTEMPTS
  ) {
    throw createError(ErrorCodes.PASSWORD_CHANGE_CODE_EXPIRED, 400);
  }

  const codigoOk = constantTimeEquals(hashToken(codigo), token.codehash);
  if (!codigoOk) {
    await token.increment('attempts');
    throw createError(ErrorCodes.PASSWORD_CHANGE_CODE_INVALID, 400);
  }

  const actualOk = await bcrypt.compare(passwordActual, user.passwordhash);
  if (!actualOk) {
    throw createError(ErrorCodes.PASSWORD_CURRENT_INVALID, 400);
  }

  const mismaPassword = await bcrypt.compare(passwordNueva, user.passwordhash);
  if (mismaPassword) {
    throw createError(ErrorCodes.PASSWORD_REUSE, 400);
  }

  await user.update({ passwordhash: passwordNueva });
  await token.update({ usedat: new Date() });
  return true;
};

module.exports = {
  confirmationEnabled,
  setConfirmationCode,
  confirmarCorreo,
  reenviarConfirmacion,
  solicitarResetPassword,
  restablecerPassword,
  solicitarCodigoCambioPassword,
  cambiarPassword,
};
