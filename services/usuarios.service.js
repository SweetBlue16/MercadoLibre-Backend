const { usuario, rol, pedido, Sequelize } = require('../models');
const { Roles } = require('../config/constants');
const { assertStrongPassword } = require('./password-policy.service');
const accountService = require('./account.service');
const ErrorCodes = require('../messages/error-codes');
const { createError } = require('../utils/app-error');
const { normalizeEmailForLookup, normalizeEmailForStorage } = require('./email-normalization.service');
const { normalizeTextInput } = require('./text.service');

const usuarioAttributes = [
  'id',
  'nombre',
  'email',
  'normalizedemail',
  ['emailconfirmado', 'emailConfirmado'],
  [Sequelize.col('rol.nombre'), 'rol'],
];

const getAll = async () => {
  return await usuario.findAll({
    raw: true,
    attributes: usuarioAttributes,
    include: { model: rol, attributes: [] },
  });
};

const getByEmail = async (email) => {
  const data = await usuario.findOne({
    where: { normalizedemail: normalizeEmailForLookup(email) },
    raw: true,
    attributes: usuarioAttributes,
    include: { model: rol, attributes: [] },
  });

  if (!data) {
    throw createError(ErrorCodes.RESOURCE_NOT_FOUND, 404);
  }
  return data;
};

const create = async (usuarioData) => {
  const email = normalizeEmailForStorage(usuarioData.email);
  const normalizedemail = normalizeEmailForLookup(email);
  assertStrongPassword(email, usuarioData.password);

  const rolusuario = await rol.findOne({ where: { nombre: usuarioData.rol || Roles.Usuario } });
  if (!rolusuario) {
    throw createError(ErrorCodes.VALIDATION_ERROR, 400);
  }

  const newUser = await usuario.create({
    email,
    normalizedemail,
    nombre: normalizeTextInput(usuarioData.nombre),
    passwordhash: usuarioData.password,
    rolid: rolusuario.id,
    emailconfirmado: true,
  });

  return {
    id: newUser.id,
    email: newUser.email,
    nombre: newUser.nombre,
    rol: rolusuario.nombre,
    emailConfirmado: newUser.emailconfirmado,
  };
};

const registroPublico = async (usuarioData, correlationId) => {
  return await accountService.crearRegistroPendiente(usuarioData, correlationId);
};

const update = async (email, updateData, actorEmail = null) => {
  const safeData = {};
  const targetNormalizedEmail = normalizeEmailForLookup(email);
  const actorNormalizedEmail = actorEmail ? normalizeEmailForLookup(actorEmail) : null;

  if (updateData.nombre !== undefined) {
    safeData.nombre = normalizeTextInput(updateData.nombre);
  }

  if (updateData.rol !== undefined) {
    if (actorNormalizedEmail === targetNormalizedEmail) {
      throw createError(ErrorCodes.AUTH_FORBIDDEN, 403);
    }

    const rolusuario = await rol.findOne({ where: { nombre: updateData.rol } });
    if (!rolusuario) {
      throw createError(ErrorCodes.VALIDATION_ERROR, 400);
    }
    safeData.rolid = rolusuario.id;
  }

  const result = await usuario.update(safeData, {
    where: { normalizedemail: targetNormalizedEmail },
    individualHooks: true,
  });

  if (result[0] === 0) {
    throw createError(ErrorCodes.RESOURCE_NOT_FOUND, 404);
  }
  return true;
};

const eliminar = async (email, actorEmail = null) => {
  const normalizedemail = normalizeEmailForLookup(email);
  if (actorEmail && normalizeEmailForLookup(actorEmail) === normalizedemail) {
    throw createError(ErrorCodes.AUTH_FORBIDDEN, 403);
  }

  const data = await usuario.findOne({ where: { normalizedemail } });

  if (!data) {
    throw createError(ErrorCodes.RESOURCE_NOT_FOUND, 404);
  }

  if (data.protegido) {
    throw createError(ErrorCodes.AUTH_FORBIDDEN, 403);
  }

  const pedidosAsociados = await pedido.count({ where: { usuarioid: data.id } });
  if (pedidosAsociados > 0) {
    throw createError(ErrorCodes.USER_HAS_ASSOCIATED_ORDERS, 409);
  }

  await usuario.destroy({ where: { normalizedemail } });
  return true;
};

module.exports = { getAll, getByEmail, create, registroPublico, update, eliminar };
