const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const validateRequest = require('../middlewares/validator.middleware');
const { body } = require('express-validator');
const Authorize = require('../middlewares/auth.middleware');

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

router.post('/', loginRules, validateRequest, (req, res, next) => {
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

module.exports = router;
