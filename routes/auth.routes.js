const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const validateRequest = require('../middlewares/validator.middleware');
const { body } = require('express-validator');
const Authorize = require('../middlewares/auth.middleware');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const ErrorCodes = require('../messages/error-codes');
const { createError } = require('../utils/app-error');

const EMAIL_MAX_LENGTH = 40;
const PASSWORD_LENGTH = 12;
const CODE_PATTERN = /^\d{6}$/;

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${ipKeyGenerator(req.ip)}:${String(req.body?.email || '').toLowerCase()}`,
  handler: (req, res, next) => next(createError(ErrorCodes.SERVER_UNAVAILABLE, 429)),
});

const emailRule = body('email')
  .notEmpty()
  .withMessage('El email es obligatorio')
  .isEmail()
  .withMessage('Debe ser un correo electrónico válido')
  .isLength({ max: EMAIL_MAX_LENGTH })
  .withMessage('El correo no debe exceder 40 caracteres')
  .trim();

const loginRules = [
  emailRule,
  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .isString()
    .withMessage('Formato de contraseña inválido')
    .isLength({ max: PASSWORD_LENGTH })
    .withMessage('La contraseña no debe exceder 12 caracteres'),
];

const strongPasswordRule = (field) =>
  body(field)
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .isLength({ min: PASSWORD_LENGTH, max: PASSWORD_LENGTH })
    .withMessage('La contraseña debe tener 12 caracteres')
    .matches(/[A-Z]/)
    .withMessage('La contraseña debe incluir una mayúscula')
    .matches(/[a-z]/)
    .withMessage('La contraseña debe incluir una minúscula')
    .matches(/\d/)
    .withMessage('La contraseña debe incluir un número')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('La contraseña debe incluir un carácter especial')
    .custom((value, { req }) => value.toLowerCase() !== String(req.body.email || '').toLowerCase())
    .withMessage('La contraseña no puede ser igual al correo');

const codeRule = (field = 'codigo', message = 'El código de verificación no es válido.') =>
  body(field).matches(CODE_PATTERN).withMessage(message).trim();

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
  authController.login(req, res, next);
});

router.get('/tiempo', Authorize('Usuario,Administrador'), (req, res, next) => {
  authController.tiempo(req, res, next);
});

router.post('/logout', Authorize('Usuario,Administrador'), (req, res, next) => {
  authController.logout(req, res, next);
});

router.post(
  '/confirmar-correo',
  confirmationLimiter,
  [emailRule, codeRule('codigo', 'Ingresa el código de verificación.')],
  validateRequest,
  (req, res, next) => {
    authController.confirmarCorreo(req, res, next);
  }
);

router.post('/reenviar-confirmacion', confirmationLimiter, [emailRule], validateRequest, (req, res, next) => {
  authController.reenviarConfirmacion(req, res, next);
});

router.post('/olvide-password', resetLimiter, [emailRule], validateRequest, (req, res, next) => {
  authController.solicitarResetPassword(req, res, next);
});

router.post(
  '/restablecer-password',
  resetLimiter,
  [
    emailRule,
    codeRule('token', 'Código inválido.'),
    strongPasswordRule('password'),
    body('confirmPassword')
      .notEmpty()
      .withMessage('La confirmación es obligatoria')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Las contraseñas no coinciden'),
  ],
  validateRequest,
  (req, res, next) => {
    authController.restablecerPassword(req, res, next);
  }
);

router.post('/cambiar-password/enviar-codigo', Authorize('Usuario,Administrador'), resetLimiter, (req, res, next) => {
  authController.enviarCodigoCambioPassword(req, res, next);
});

router.post(
  '/cambiar-password',
  Authorize('Usuario,Administrador'),
  [
    codeRule(),
    body('passwordActual')
      .notEmpty()
      .withMessage('La contraseña actual es obligatoria')
      .isLength({ max: PASSWORD_LENGTH })
      .withMessage('La contraseña actual no debe exceder 12 caracteres'),
    strongPasswordRule('passwordNueva'),
    body('confirmPassword')
      .notEmpty()
      .withMessage('La confirmación es obligatoria')
      .custom((value, { req }) => value === req.body.passwordNueva)
      .withMessage('Las contraseñas no coinciden'),
  ],
  validateRequest,
  (req, res, next) => {
    authController.cambiarPassword(req, res, next);
  }
);

module.exports = router;
