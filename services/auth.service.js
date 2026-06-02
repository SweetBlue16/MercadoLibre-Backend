const bcrypt = require('bcrypt');
const { usuario, rol, Sequelize } = require('../models');
const { GeneraToken } = require('./jwttoken.service');
const accountService = require('./account.service');
const ErrorCodes = require('../messages/error-codes');
const { createError } = require('../utils/app-error');
const { normalizeEmailForLookup } = require('./email-normalization.service');

const login = async (email, password) => {
  const data = await usuario.findOne({
    where: { normalizedemail: normalizeEmailForLookup(email) },
    raw: true,
    attributes: ['id', 'email', 'passwordhash', 'nombre', 'emailconfirmado', [Sequelize.col('rol.nombre'), 'rol']],
    include: { model: rol, attributes: [] },
  });

  if (!data) {
    throw createError(ErrorCodes.USER_NOT_FOUND, 401);
  }

  const passwordMatch = await bcrypt.compare(password, data.passwordhash);
  if (!passwordMatch) {
    throw createError(ErrorCodes.AUTH_INVALID_CREDENTIALS, 401);
  }

  if (accountService.confirmationEnabled() && !data.emailconfirmado) {
    throw createError(ErrorCodes.AUTH_EMAIL_NOT_CONFIRMED, 403);
  }

  const token = GeneraToken(data.email, data.nombre, data.rol);

  return {
    email: data.email,
    nombre: data.nombre,
    rol: data.rol,
    emailConfirmado: Boolean(data.emailconfirmado),
    jwt: token,
  };
};

module.exports = {
  login,
};
