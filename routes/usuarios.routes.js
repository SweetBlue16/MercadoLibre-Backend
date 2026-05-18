const router = require('express').Router();
const usuariosController = require('../controllers/usuarios.controller');
const validateRequest = require('../middlewares/validator.middleware');
const { body, param } = require('express-validator');
const Authorize = require('../middlewares/auth.middleware');
const rateLimit = require('express-rate-limit');

const registroLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Demasiados intentos de registro. Intente nuevamente mas tarde.',
});

const passwordRules = (field = 'password') =>
  body(field)
    .if(body(field).exists())
    .isLength({ min: 12, max: 128 })
    .withMessage('La contraseña debe tener entre 12 y 128 caracteres')
    .matches(/[A-Z]/)
    .withMessage('La contraseña debe incluir una mayuscula')
    .matches(/[a-z]/)
    .withMessage('La contraseña debe incluir una minuscula')
    .matches(/\d/)
    .withMessage('La contraseña debe incluir un numero')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('La contraseña debe incluir un caracter especial')
    .custom((value, { req }) => value !== req.body.email)
    .withMessage('La contraseña no puede ser igual al correo');

const baseUserRules = [
  body('email')
    .notEmpty()
    .withMessage('El email es obligatorio')
    .isEmail()
    .withMessage('Formato de email invalido')
    .normalizeEmail(),
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isString()
    .withMessage('El nombre debe ser texto')
    .trim()
    .escape(),
  passwordRules(),
];

const usuarioRules = [
  ...baseUserRules,
  body('rol').optional().isString().withMessage('El rol debe ser una cadena de texto').trim(),
];

const registroRules = [
  ...baseUserRules,
  body('rol').not().exists().withMessage('El registro publico no permite asignar roles'),
];

const emailParamRules = [
  param('email').isEmail().withMessage('El parametro debe ser un email valido').normalizeEmail(),
];

router.post('/registro', registroLimiter, registroRules, validateRequest, (req, res, next) => {
  // #swagger.tags = ['Usuarios']
  // #swagger.summary = 'Registro publico de usuario comprador'
  usuariosController.registroPublico(req, res, next);
});

router.get('/', Authorize('Administrador'), (req, res, next) => {
  // #swagger.tags = ['Usuarios']
  // #swagger.summary = 'Listar todos los usuarios'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  usuariosController.getAll(req, res, next);
});

router.get('/:email', Authorize('Administrador'), emailParamRules, validateRequest, (req, res, next) => {
  // #swagger.tags = ['Usuarios']
  // #swagger.summary = 'Buscar usuario por email'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  usuariosController.get(req, res, next);
});

router.post('/', Authorize('Administrador'), usuarioRules, validateRequest, (req, res, next) => {
  // #swagger.tags = ['Usuarios']
  // #swagger.summary = 'Crear un nuevo usuario'
  // #swagger.description = 'Registra un usuario en la BD. La contraseña se hashea con bcrypt antes de persistirse.'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  usuariosController.create(req, res, next);
});

router.put('/:email', Authorize('Administrador'), emailParamRules, usuarioRules, validateRequest, (req, res, next) => {
  // #swagger.tags = ['Usuarios']
  // #swagger.summary = 'Actualizar datos de usuario'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  usuariosController.update(req, res, next);
});

router.delete('/:email', Authorize('Administrador'), emailParamRules, validateRequest, (req, res, next) => {
  // #swagger.tags = ['Usuarios']
  // #swagger.summary = 'Eliminar usuario'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  usuariosController.delete(req, res, next);
});

module.exports = router;
