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
    .isLength({ max: 40 })
    .withMessage('El nombre no debe exceder 40 caracteres')
    .escape(),
];

const idParamRules = [
  param('id').notEmpty().withMessage('El ID es obligatorio').isInt().withMessage('El ID debe ser un número entero'),
];

router.get('/', Authorize('Usuario,Administrador'), (req, res, next) => {
  categoriasController.getAll(req, res, next);
});

router.get('/:id', Authorize('Usuario,Administrador'), idParamRules, validateRequest, (req, res, next) => {
  categoriasController.get(req, res, next);
});

router.post('/', Authorize('Administrador'), categoriaRules, validateRequest, (req, res, next) => {
  categoriasController.create(req, res, next);
});

router.put('/:id', Authorize('Administrador'), idParamRules, categoriaRules, validateRequest, (req, res, next) => {
  categoriasController.update(req, res, next);
});

router.delete('/:id', Authorize('Administrador'), idParamRules, validateRequest, (req, res, next) => {
  categoriasController.delete(req, res, next);
});

module.exports = router;
