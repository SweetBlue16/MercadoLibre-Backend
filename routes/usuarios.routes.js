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
  // #swagger.description = 'Registra un usuario en la BD. El ID (UUIDv4) es generado automáticamente por la capa de datos. La contraseña es procesada mediante hooks (bcrypt) antes de persistirse, mitigando la exposición de credenciales.'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  /* #swagger.parameters['body'] = {
        in: 'body',
        schema: {
            nombre: "Juan Pérez",
            email: "juan@ejemplo.com",
            password: "PasswordSegura123!",
            rol: "Administrador"
        }
  } */
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
  // #swagger.description = 'Regla de negocio: Fallará con un error 403 si se intenta eliminar un usuario con el flag "protegido" (ej: SuperAdministrador principal).'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  usuariosController.delete(req, res, next);
});

module.exports = router;
