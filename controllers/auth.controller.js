const bcrypt = require('bcrypt');
const { usuario, rol, Sequelize } = require('../models');
const { GeneraToken, TiempoRestanteToken } = require('../services/jwttoken.service');

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const data = await usuario.findOne({
      where: { email: email },
      raw: true,
      attributes: ['id', 'email', 'passwordhash', 'nombre', [Sequelize.col('rol.nombre'), 'rol']],
      include: { model: rol, attributes: [] },
    });

    if (data === null) {
      return res.status(401).json('Usuario o contraseña incorrectos.');
    }

    const passwordMatch = await bcrypt.compare(password, data.passwordhash);
    if (!passwordMatch) {
      return res.status(401).json('Usuario o contraseña incorrectos.');
    }

    const token = GeneraToken(data.email, data.nombre, data.rol);
    req.bitacora('usuario.login', data.email);

    res.status(200).json({
      email: data.email,
      nombre: data.nombre,
      rol: data.rol,
      jwt: token,
    });
  } catch (error) {
    next(error);
  }
};

const tiempo = async (req, res, next) => {
  const tiempoRestante = TiempoRestanteToken(req);
  if (tiempoRestante === null) {
    return res.status(404).send();
  }
  res.status(200).send(tiempoRestante);
};

module.exports = {
  login,
  tiempo,
};
