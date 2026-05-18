const { usuario, rol, Sequelize } = require('../models');

const assertStrongPassword = (email, password) => {
  const rules = [
    password && password.length >= 12,
    /[A-Z]/.test(password || ''),
    /[a-z]/.test(password || ''),
    /\d/.test(password || ''),
    /[^A-Za-z0-9]/.test(password || ''),
    password !== email,
  ];

  if (rules.some((isValid) => !isValid)) {
    const error = new Error('La contraseña no cumple la politica de seguridad.');
    error.statusCode = 400;
    throw error;
  }
};

const getAll = async () => {
  return await usuario.findAll({
    raw: true,
    attributes: ['id', 'nombre', 'email', [Sequelize.col('rol.nombre'), 'rol']],
    include: { model: rol, attributes: [] },
  });
};

const getByEmail = async (email) => {
  const data = await usuario.findOne({
    where: { email: email },
    raw: true,
    attributes: ['id', 'nombre', 'email', [Sequelize.col('rol.nombre'), 'rol']],
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

  const rolusuario = await rol.findOne({ where: { nombre: usuarioData.rol || 'Usuario' } });
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
  });

  return {
    id: newUser.id,
    email: newUser.email,
    nombre: newUser.nombre,
    rolid: rolusuario.nombre,
  };
};

const registroPublico = async (usuarioData) => {
  assertStrongPassword(usuarioData.email, usuarioData.password);

  const rolusuario = await rol.findOne({ where: { nombre: 'Usuario' } });
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
  });

  return {
    id: newUser.id,
    email: newUser.email,
    nombre: newUser.nombre,
    rol: rolusuario.nombre,
  };
};

const update = async (email, updateData) => {
  if (updateData.rol) {
    const rolusuario = await rol.findOne({ where: { nombre: updateData.rol } });
    if (!rolusuario) {
      const error = new Error('El rol especificado no existe.');
      error.statusCode = 400;
      throw error;
    }
    updateData.rolid = rolusuario.id;
  }

  if (updateData.password) {
    assertStrongPassword(email, updateData.password);
    updateData.passwordhash = updateData.password;
  }

  const result = await usuario.update(updateData, { where: { email: email }, individualHooks: true });

  if (result[0] === 0) {
    const error = new Error('Usuario no encontrado.');
    error.statusCode = 404;
    throw error;
  }
  return true;
};

const eliminar = async (email) => {
  const data = await usuario.findOne({ where: { email: email } });

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

  await usuario.destroy({ where: { email: email } });
  return true;
};

module.exports = { getAll, getByEmail, create, registroPublico, update, eliminar };
