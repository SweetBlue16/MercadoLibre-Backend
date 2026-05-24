const { usuario, rol, pedido, Sequelize } = require('../models');
const { Roles } = require('../config/constants');
const { assertStrongPassword } = require('./password-policy.service');
const accountService = require('./account.service');
const ErrorCodes = require('../messages/error-codes');
const { createError } = require('../utils/app-error');

const usuarioAttributes = [
  'id',
  'nombre',
  'email',
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
    where: { email },
    raw: true,
    attributes: usuarioAttributes,
    include: { model: rol, attributes: [] },
  });

  if (!data) {
    const error = new Error('Usuario no encontrado.');
    error.statusCode = 404;
    throw error;
  }
  return data;
};

const create = async (usuarioData) => {
  assertStrongPassword(usuarioData.email, usuarioData.password);

  const rolusuario = await rol.findOne({ where: { nombre: usuarioData.rol || Roles.Usuario } });
  if (!rolusuario) {
    const error = new Error('El rol especificado no existe.');
    error.statusCode = 400;
    throw error;
  }

  const newUser = await usuario.create({
    email: usuarioData.email,
    nombre: usuarioData.nombre,
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

const registroPublico = async (usuarioData) => {
  assertStrongPassword(usuarioData.email, usuarioData.password);

  const existente = await usuario.findOne({ where: { email: usuarioData.email }, attributes: ['id'] });
  if (existente) {
    const error = new Error('El correo electrónico ya está registrado.');
    error.statusCode = 409;
    throw error;
  }

  const rolusuario = await rol.findOne({ where: { nombre: Roles.Usuario } });
  if (!rolusuario) {
    const error = new Error('El rol de usuario no esta configurado.');
    error.statusCode = 500;
    throw error;
  }

  const newUser = await usuario.create({
    email: usuarioData.email,
    nombre: usuarioData.nombre,
    passwordhash: usuarioData.password,
    rolid: rolusuario.id,
    emailconfirmado: !accountService.confirmationEnabled(),
  });

  if (accountService.confirmationEnabled()) {
    await accountService.setConfirmationCode(newUser);
  }

  return {
    id: newUser.id,
    email: newUser.email,
    nombre: newUser.nombre,
    rol: rolusuario.nombre,
    emailConfirmado: newUser.emailconfirmado,
  };
};

const update = async (email, updateData) => {
  const safeData = { ...updateData };

  if (safeData.rol) {
    const rolusuario = await rol.findOne({ where: { nombre: safeData.rol } });
    if (!rolusuario) {
      const error = new Error('El rol especificado no existe.');
      error.statusCode = 400;
      throw error;
    }
    safeData.rolid = rolusuario.id;
  }

  if (safeData.password) {
    assertStrongPassword(email, safeData.password);
    safeData.passwordhash = safeData.password;
  }

  delete safeData.password;
  delete safeData.email;

  const result = await usuario.update(safeData, { where: { email }, individualHooks: true });

  if (result[0] === 0) {
    const error = new Error('Usuario no encontrado.');
    error.statusCode = 404;
    throw error;
  }
  return true;
};

const eliminar = async (email) => {
  const data = await usuario.findOne({ where: { email } });

  if (!data) {
    const error = new Error('Usuario no encontrado.');
    error.statusCode = 404;
    throw error;
  }

  if (data.protegido) {
    const error = new Error('No se puede eliminar un usuario protegido por el sistema.');
    error.statusCode = 403;
    throw error;
  }

  const pedidosAsociados = await pedido.count({ where: { usuarioid: data.id } });
  if (pedidosAsociados > 0) {
    throw createError(ErrorCodes.USER_HAS_ASSOCIATED_ORDERS, 409);
  }

  await usuario.destroy({ where: { email } });
  return true;
};

module.exports = { getAll, getByEmail, create, registroPublico, update, eliminar };
