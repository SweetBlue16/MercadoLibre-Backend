const router = require('express').Router();
const usuariosController = require('../controllers/usuarios.controller');
const validateRequest = require('../middlewares/validator.middleware');
const { body, param } = require('express-validator');
const Authorize = require('../middlewares/auth.middleware');
const rateLimit = require('express-rate-limit');

const TEXT_MAX_LENGTH = 40;
const PASSWORD_LENGTH = 12;

const registroLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Demasiados intentos de registro. Intente nuevamente más tarde.',
});

const passwordRules = (field = 'password') =>
  body(field)
    .if(body(field).exists())
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
    .custom((value, { req }) => value !== req.body.email)
    .withMessage('La contraseña no puede ser igual al correo');

const emailBodyRule = body('email')
  .notEmpty()
  .withMessage('El email es obligatorio')
  .isEmail()
  .withMessage('Formato de email inválido')
  .isLength({ max: TEXT_MAX_LENGTH })
  .withMessage('El correo no debe exceder 40 caracteres')
  .trim();

const nameBodyRule = body('nombre')
  .notEmpty()
  .withMessage('El nombre es obligatorio')
  .isString()
  .withMessage('El nombre debe ser texto')
  .trim()
  .isLength({ max: TEXT_MAX_LENGTH })
  .withMessage('El nombre no debe exceder 40 caracteres')
  .escape();

const baseUserRules = [emailBodyRule, nameBodyRule, passwordRules()];

const usuarioRules = [
  ...baseUserRules,
  body('rol').optional().isString().withMessage('El rol debe ser una cadena de texto').trim(),
];

const registroRules = [
  ...baseUserRules,
  body('rol').not().exists().withMessage('El registro público no permite asignar roles'),
];

const emailParamRules = [
  param('email')
    .isEmail()
    .withMessage('El parámetro debe ser un email válido')
    .isLength({ max: TEXT_MAX_LENGTH })
    .withMessage('El correo no debe exceder 40 caracteres')
    .trim(),
];

router.post('/registro', registroLimiter, registroRules, validateRequest, (req, res, next) => {
  usuariosController.registroPublico(req, res, next);
});

router.get('/', Authorize('Administrador'), (req, res, next) => {
  usuariosController.getAll(req, res, next);
});

router.get('/:email', Authorize('Administrador'), emailParamRules, validateRequest, (req, res, next) => {
  usuariosController.get(req, res, next);
});

router.post('/', Authorize('Administrador'), usuarioRules, validateRequest, (req, res, next) => {
  usuariosController.create(req, res, next);
});

router.put('/:email', Authorize('Administrador'), emailParamRules, usuarioRules, validateRequest, (req, res, next) => {
  usuariosController.update(req, res, next);
});

router.delete('/:email', Authorize('Administrador'), emailParamRules, validateRequest, (req, res, next) => {
  usuariosController.delete(req, res, next);
});

module.exports = router;
