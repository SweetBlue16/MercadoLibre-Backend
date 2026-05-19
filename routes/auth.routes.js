const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const validateRequest = require('../middlewares/validator.middleware');
const { body } = require('express-validator');
const Authorize = require('../middlewares/auth.middleware');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const ErrorCodes = require('../messages/error-codes');
const { createError } = require('../utils/app-error');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${ipKeyGenerator(req.ip)}:${String(req.body?.email || '').toLowerCase()}`,
  handler: (req, res, next) => next(createError(ErrorCodes.SERVER_UNAVAILABLE, 429)),
});

const loginRules = [
  body('email')
    .notEmpty()
    .withMessage('El email es obligatorio')
    .isEmail()
    .withMessage('Debe ser un correo electrónico válido')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .isString()
    .withMessage('Formato de contraseña inválido')
    .isLength({ min: 8, max: 64 })
    .withMessage('Longitud de contraseña fuera de rango')
    .trim(),
];

const emailRule = body('email')
  .notEmpty()
  .withMessage('El email es obligatorio')
  .isEmail()
  .withMessage('Debe ser un correo electronico valido')
  .normalizeEmail();

const strongPasswordRule = (field) =>
  body(field)
    .notEmpty()
    .withMessage('La contrasena es obligatoria')
    .isLength({ min: 12, max: 128 })
    .withMessage('La contrasena debe tener entre 12 y 128 caracteres')
    .matches(/[A-Z]/)
    .withMessage('La contrasena debe incluir una mayuscula')
    .matches(/[a-z]/)
    .withMessage('La contrasena debe incluir una minuscula')
    .matches(/\d/)
    .withMessage('La contrasena debe incluir un numero')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('La contrasena debe incluir un caracter especial')
    .custom((value, { req }) => value.toLowerCase() !== String(req.body.email || '').toLowerCase())
    .withMessage('La contrasena no puede ser igual al correo');

const confirmationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => next(createError(ErrorCodes.EMAIL_RESEND_RATE_LIMITED, 429)),
});

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => next(createError(ErrorCodes.SERVER_UNAVAILABLE, 429)),
});

router.post('/', loginLimiter, loginRules, validateRequest, (req, res, next) => {
  // #swagger.tags = ['Autenticación']
  // #swagger.summary = 'Iniciar sesión y obtener JWT'
  // #swagger.description = 'Genera un JWT seguro firmado con HS256. Las entradas están fuertemente validadas para evitar inyección SQL (CWE-89) y desbordamientos.'
  /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Credenciales de acceso',
        schema: {
            email: "admin@test.com",
            password: "password123"
        }
  } */
  /* #swagger.responses[200] = { description: 'Autenticación exitosa, retorna el JWT.' } */
  /* #swagger.responses[400] = { description: 'Datos mal formados detectados por express-validator.' } */
  /* #swagger.responses[401] = { description: 'Credenciales incorrectas (Manejo genérico para evitar filtración de usuarios existentes).' } */
  authController.login(req, res, next);
});

router.get('/tiempo', Authorize('Usuario,Administrador'), (req, res, next) => {
  // #swagger.tags = ['Autenticación']
  // #swagger.summary = 'Consultar tiempo restante del token'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  authController.tiempo(req, res, next);
});

router.post('/logout', Authorize('Usuario,Administrador'), (req, res, next) => {
  // #swagger.tags = ['Autenticacion']
  // #swagger.summary = 'Registrar cierre de sesion'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  authController.logout(req, res, next);
});

router.post(
  '/confirmar-correo',
  confirmationLimiter,
  [emailRule, body('codigo').isLength({ min: 6, max: 64 }).withMessage('Codigo invalido').trim()],
  validateRequest,
  (req, res, next) => {
    // #swagger.tags = ['Autenticacion']
    // #swagger.summary = 'Confirmar correo electronico'
    authController.confirmarCorreo(req, res, next);
  }
);

router.post('/reenviar-confirmacion', confirmationLimiter, [emailRule], validateRequest, (req, res, next) => {
  // #swagger.tags = ['Autenticacion']
  // #swagger.summary = 'Reenviar codigo de confirmacion'
  authController.reenviarConfirmacion(req, res, next);
});

router.post('/olvide-password', resetLimiter, [emailRule], validateRequest, (req, res, next) => {
  // #swagger.tags = ['Autenticacion']
  // #swagger.summary = 'Solicitar recuperacion de password'
  authController.solicitarResetPassword(req, res, next);
});

router.post(
  '/restablecer-password',
  resetLimiter,
  [
    emailRule,
    body('token').isLength({ min: 6, max: 128 }).withMessage('Token invalido').trim(),
    strongPasswordRule('password'),
    body('confirmPassword')
      .notEmpty()
      .withMessage('La confirmacion es obligatoria')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Las contrasenas no coinciden'),
  ],
  validateRequest,
  (req, res, next) => {
    // #swagger.tags = ['Autenticacion']
    // #swagger.summary = 'Restablecer password'
    authController.restablecerPassword(req, res, next);
  }
);

router.post('/cambiar-password/enviar-codigo', Authorize('Usuario,Administrador'), resetLimiter, (req, res, next) => {
  // #swagger.tags = ['Autenticacion']
  // #swagger.summary = 'Enviar codigo para cambio de password del usuario autenticado'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  authController.enviarCodigoCambioPassword(req, res, next);
});

router.post(
  '/cambiar-password',
  Authorize('Usuario,Administrador'),
  [
    body('codigo').isLength({ min: 6, max: 64 }).withMessage('Codigo invalido').trim(),
    body('passwordActual').notEmpty().withMessage('La contrasena actual es obligatoria'),
    strongPasswordRule('passwordNueva'),
    body('confirmPassword')
      .notEmpty()
      .withMessage('La confirmacion es obligatoria')
      .custom((value, { req }) => value === req.body.passwordNueva)
      .withMessage('Las contrasenas no coinciden'),
  ],
  validateRequest,
  (req, res, next) => {
    // #swagger.tags = ['Autenticacion']
    // #swagger.summary = 'Cambiar password del usuario autenticado'
    /* #swagger.security = [{ "bearerAuth": [] }] */
    authController.cambiarPassword(req, res, next);
  }
);

module.exports = router;
