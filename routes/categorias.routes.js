const router = require('express').Router();
const categoriasController = require('../controllers/categorias.controller');
const validateRequest = require('../middlewares/validator.middleware');
const { body, param } = require('express-validator');
const Authorize = require('../middlewares/auth.middleware');

const categoriaRules = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre de la categoría es obligatorio')
    .isString()
    .withMessage('El nombre debe ser una cadena de texto')
    .trim()
    .escape(),
];

const idParamRules = [
  param('id').notEmpty().withMessage('El ID es obligatorio').isInt().withMessage('El ID debe ser un número entero'),
];

router.get('/', Authorize('Usuario,Administrador'), categoriasController.getAll);

router.get('/:id', Authorize('Usuario,Administrador'), idParamRules, validateRequest, categoriasController.get);

router.post('/', Authorize('Administrador'), categoriaRules, validateRequest, categoriasController.create);

router.put(
  '/:id',
  Authorize('Administrador'),
  idParamRules,
  categoriaRules,
  validateRequest,
  categoriasController.update
);

router.delete('/:id', Authorize('Administrador'), idParamRules, validateRequest, categoriasController.delete);

module.exports = router;
