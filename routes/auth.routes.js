const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const validateRequest = require('../middlewares/validator.middleware');
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

router.post('/', loginRules, validateRequest, authController.login);

router.get('/tiempo', Authorize('Usuario,Administrador'), authController.tiempo);

module.exports = router;
