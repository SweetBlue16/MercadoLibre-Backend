const bcrypt = require('bcrypt');
const { usuario, rol, Sequelize } = require('../models');
const { GeneraToken } = require('./jwttoken.service');

const login = async (email, password) => {
  const data = await usuario.findOne({
    where: { email: email },
    raw: true,
    attributes: ['id', 'email', 'passwordhash', 'nombre', [Sequelize.col('rol.nombre'), 'rol']],
    include: { model: rol, attributes: [] },
  });

  if (!data) {
    const error = new Error('Usuario o contraseña incorrectos.');
    error.statusCode = 401;
    throw error;
  }

  const passwordMatch = await bcrypt.compare(password, data.passwordhash);
  if (!passwordMatch) {
    const error = new Error('Usuario o contraseña incorrectos.');
    error.statusCode = 401;
    throw error;
  }

  const token = GeneraToken(data.email, data.nombre, data.rol);

  return {
    email: data.email,
    nombre: data.nombre,
    rol: data.rol,
    jwt: token,
  };
};

module.exports = {
  login,
};
