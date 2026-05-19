const authService = require('../services/auth.service');
const { TiempoRestanteToken } = require('../services/jwttoken.service');
const accountService = require('../services/account.service');
const ClaimTypes = require('../config/claimtypes');

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

const confirmarCorreo = async (req, res, next) => {
  try {
    await accountService.confirmarCorreo(req.body.email, req.body.codigo);
    req.bitacora('usuario.confirmar_correo', req.body.email);
    res.status(200).json({ message: 'Correo confirmado correctamente.' });
  } catch (error) {
    next(error);
  }
};

const reenviarConfirmacion = async (req, res, next) => {
  try {
    await accountService.reenviarConfirmacion(req.body.email, req.correlationId);
    res.status(200).json({ message: 'Si la cuenta requiere confirmacion, recibiras un nuevo codigo.' });
  } catch (error) {
    next(error);
  }
};

const solicitarResetPassword = async (req, res, next) => {
  try {
    await accountService.solicitarResetPassword(req.body.email);
    res
      .status(200)
      .json({ message: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.' });
  } catch (error) {
    next(error);
  }
};

const restablecerPassword = async (req, res, next) => {
  try {
    await accountService.restablecerPassword(
      req.body.email,
      req.body.token,
      req.body.password,
      req.body.confirmPassword
    );
    req.bitacora('usuario.restablecer_password', req.body.email);
    res.status(200).json({ message: 'Contraseña restablecida correctamente.' });
  } catch (error) {
    next(error);
  }
};

const cambiarPassword = async (req, res, next) => {
  try {
    const email = req.decodedToken[ClaimTypes.Name];
    await accountService.cambiarPassword(
      email,
      req.body.codigo,
      req.body.passwordActual,
      req.body.passwordNueva,
      req.body.confirmPassword
    );
    req.bitacora('usuario.cambiar_password', email);
    res.status(200).json({ message: 'Contrasena actualizada correctamente.' });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const email = req.decodedToken[ClaimTypes.Name];
    req.bitacora('usuario.logout', email);
    res.status(200).json({ message: 'Tu sesion se cerro correctamente.' });
  } catch (error) {
    next(error);
  }
};

const enviarCodigoCambioPassword = async (req, res, next) => {
  try {
    const email = req.decodedToken[ClaimTypes.Name];
    await accountService.solicitarCodigoCambioPassword(email, req.correlationId);
    req.bitacora('usuario.solicitar_codigo_cambio_password', email);
    res.status(200).json({ message: 'Codigo de verificacion enviado.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  tiempo,
  confirmarCorreo,
  reenviarConfirmacion,
  solicitarResetPassword,
  restablecerPassword,
  enviarCodigoCambioPassword,
  cambiarPassword,
  logout,
};
