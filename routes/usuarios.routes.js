const router = require('express').Router();
const usuariosController = require('../controllers/usuarios.controller');
const validateRequest = require('../middlewares/validator.middleware');
const { body, param } = require('express-validator');
const Authorize = require('../middlewares/auth.middleware');

const usuarioRules = [
  body('email')
    .notEmpty()
    .withMessage('El email es obligatorio')
    .isEmail()
    .withMessage('Formato de email inválido')
    .normalizeEmail(),
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isString()
    .withMessage('El nombre debe ser texto')
    .trim()
    .escape(),
  body('password')
    .if(body('password').exists())
    .isLength({ min: 8, max: 64 })
    .withMessage('La contraseña debe tener entre 8 y 64 caracteres')
    .trim(),
  body('rol').optional().isString().withMessage('El rol debe ser una cadena de texto').trim(),
];

const emailParamRules = [
  param('email').isEmail().withMessage('El parámetro debe ser un email válido').normalizeEmail(),
];

router.get('/', Authorize('Administrador'), usuariosController.getAll);

router.get('/:email', Authorize('Administrador'), emailParamRules, validateRequest, usuariosController.get);

router.post('/', Authorize('Administrador'), usuarioRules, validateRequest, usuariosController.create);

router.put(
  '/:email',
  Authorize('Administrador'),
  emailParamRules,
  usuarioRules,
  validateRequest,
  usuariosController.update
);

router.delete('/:email', Authorize('Administrador'), emailParamRules, validateRequest, usuariosController.delete);

module.exports = router;
