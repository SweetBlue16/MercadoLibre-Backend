const authService = require('../services/auth.service');
const { TiempoRestanteToken } = require('../services/jwttoken.service');

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const authData = await authService.login(email, password);
    req.bitacora('usuario.login', authData.email);
    res.status(200).json(authData);
  } catch (error) {
    next(error);
  }
};

const tiempo = async (req, res) => {
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
