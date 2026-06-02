const bcrypt = require('bcrypt');
const { usuario, rol, passwordchangetoken, pendinguserregistration, sequelize, Sequelize } = require('../models');
const { Roles } = require('../config/constants');
const { assertStrongPassword } = require('./password-policy.service');
const { generateSixDigitCode, hashToken, constantTimeEquals } = require('./token-code.service');
const { normalizeEmailForLookup, normalizeEmailForStorage } = require('./email-normalization.service');
const { normalizeTextInput } = require('./text.service');
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

const setPendingRegistrationCode = async (registration, correlationId) => {
  const code = generateSixDigitCode();
  await registration.update({
    codehash: hashToken(code),
    expiresat: addMinutes(CONFIRMATION_MINUTES),
    attempts: 0,
    lastsentat: new Date(),
    usedat: null,
  });
  await emailService.sendConfirmationCode(registration.email, code, correlationId);
};

const getActivePendingRegistration = async (normalizedemail, options = {}) => {
  return await pendinguserregistration.findOne({
    where: {
      normalizedemail,
      usedat: null,
    },
    order: [['createdAt', 'DESC']],
    ...options,
  });
};

const crearRegistroPendiente = async (usuarioData, correlationId) => {
  const email = normalizeEmailForStorage(usuarioData.email);
  const normalizedemail = normalizeEmailForLookup(email);
  const nombre = normalizeTextInput(usuarioData.nombre);

  assertStrongPassword(email, usuarioData.password);

  const existente = await usuario.findOne({ where: { normalizedemail }, attributes: ['id'] });
  if (existente) {
    throw createError(ErrorCodes.EMAIL_ALREADY_REGISTERED, 409);
  }

  if (!confirmationEnabled()) {
    const rolusuario = await rol.findOne({ where: { nombre: Roles.Usuario } });
    if (!rolusuario) throw createError(ErrorCodes.INTERNAL_ERROR, 500);

    const newUser = await usuario.create({
      email,
      normalizedemail,
      nombre,
      passwordhash: usuarioData.password,
      rolid: rolusuario.id,
      emailconfirmado: true,
    });

    return {
      email: newUser.email,
      nombre: newUser.nombre,
      emailConfirmado: newUser.emailconfirmado,
    };
  }

  const code = generateSixDigitCode();
  const now = new Date();
  const pending = await getActivePendingRegistration(normalizedemail);

  if (pending && secondsSince(pending.lastsentat) < RESEND_SECONDS) {
    throw createError(ErrorCodes.EMAIL_RESEND_RATE_LIMITED, 429);
  }

  if (pending) {
    await pending.update({
      email,
      normalizedemail,
      nombre,
      passwordhash: usuarioData.password,
      codehash: hashToken(code),
      expiresat: addMinutes(CONFIRMATION_MINUTES),
      attempts: 0,
      lastsentat: now,
      usedat: null,
    });
  } else {
    await pendinguserregistration.create({
      email,
      normalizedemail,
      nombre,
      passwordhash: usuarioData.password,
      codehash: hashToken(code),
      expiresat: addMinutes(CONFIRMATION_MINUTES),
      attempts: 0,
      lastsentat: now,
    });
  }

  await emailService.sendConfirmationCode(email, code, correlationId);
  return {
    email,
    nombre,
    emailConfirmado: false,
  };
};

const reenviarConfirmacion = async (email, correlationId) => {
  if (!confirmationEnabled()) {
    return true;
  }

  const normalizedemail = normalizeEmailForLookup(email);
  const registration = await getActivePendingRegistration(normalizedemail);
  if (!registration) {
    return true;
  }

  if (secondsSince(registration.lastsentat) < RESEND_SECONDS) {
    throw createError(ErrorCodes.EMAIL_RESEND_RATE_LIMITED, 429);
  }

  await setPendingRegistrationCode(registration, correlationId);
  return true;
};

const confirmarCorreo = async (email, codigo) => {
  const normalizedemail = normalizeEmailForLookup(email);
  const registration = await getActivePendingRegistration(normalizedemail);
  if (!registration) {
    throw createError(ErrorCodes.EMAIL_VERIFICATION_REQUIRED, 400);
  }

  if (
    !registration.codehash ||
    !registration.expiresat ||
    new Date(registration.expiresat).getTime() < Date.now() ||
    registration.attempts >= MAX_CONFIRMATION_ATTEMPTS
  ) {
    throw createError(ErrorCodes.EMAIL_CONFIRMATION_EXPIRED, 400);
  }

  const isValid = constantTimeEquals(hashToken(codigo), registration.codehash);
  if (!isValid) {
    await registration.increment('attempts');
    throw createError(ErrorCodes.EMAIL_CONFIRMATION_INVALID, 400);
  }

  return await sequelize.transaction(async (transaction) => {
    const existente = await usuario.findOne({
      where: { normalizedemail },
      attributes: ['id'],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (existente) {
      await registration.update({ usedat: new Date() }, { transaction });
      throw createError(ErrorCodes.EMAIL_ALREADY_REGISTERED, 409);
    }

    const rolusuario = await rol.findOne({ where: { nombre: Roles.Usuario }, transaction });
    if (!rolusuario) {
      throw createError(ErrorCodes.INTERNAL_ERROR, 500);
    }

    const newUser = await usuario.create(
      {
        email: registration.email,
        normalizedemail: registration.normalizedemail,
        nombre: registration.nombre,
        passwordhash: registration.passwordhash,
        rolid: rolusuario.id,
        emailconfirmado: true,
      },
      { transaction }
    );

    await registration.update({ usedat: new Date() }, { transaction });
    return {
      id: newUser.id,
      email: newUser.email,
      nombre: newUser.nombre,
      rol: rolusuario.nombre,
      emailConfirmado: newUser.emailconfirmado,
    };
  });
};

const solicitarResetPassword = async (email) => {
  const user = await usuario.findOne({ where: { normalizedemail: normalizeEmailForLookup(email) } });

  if (user && secondsSince(user.ultimoresetpassword) >= RESET_SECONDS) {
    const code = generateSixDigitCode();

    await user.update({
      resettokenhash: hashToken(code),
      resettokenexpira: addMinutes(RESET_MINUTES),
      ultimoresetpassword: new Date(),
    });

    await emailService.sendPasswordResetCode(user.email, code);
  }

  return true;
};

const solicitarCodigoCambioPassword = async (email, correlationId) => {
  const user = await usuario.findOne({ where: { normalizedemail: normalizeEmailForLookup(email) } });
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

  const user = await usuario.findOne({ where: { normalizedemail: normalizeEmailForLookup(email) } });
  if (
    !user?.resettokenhash ||
    !user?.resettokenexpira ||
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

  const user = await usuario.findOne({ where: { normalizedemail: normalizeEmailForLookup(email) } });
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
  crearRegistroPendiente,
  confirmarCorreo,
  reenviarConfirmacion,
  solicitarResetPassword,
  restablecerPassword,
  solicitarCodigoCambioPassword,
  cambiarPassword,
};
