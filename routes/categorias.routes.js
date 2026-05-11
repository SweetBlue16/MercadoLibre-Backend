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

router.get('/', Authorize('Usuario,Administrador'), (req, res, next) => {
  // #swagger.tags = ['Categorías']
  // #swagger.summary = 'Listar todas las categorías'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  categoriasController.getAll(req, res, next);
});

router.get('/:id', Authorize('Usuario,Administrador'), idParamRules, validateRequest, (req, res, next) => {
  // #swagger.tags = ['Categorías']
  // #swagger.summary = 'Obtener una categoría por ID'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  categoriasController.get(req, res, next);
});

router.post('/', Authorize('Administrador'), categoriaRules, validateRequest, (req, res, next) => {
  // #swagger.tags = ['Categorías']
  // #swagger.summary = 'Crear nueva categoría'
  // #swagger.description = 'La entrada se sanitiza (escape) para prevenir ataques Cross-Site Scripting (CWE-79).'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  /* #swagger.parameters['body'] = {
        in: 'body',
        schema: { nombre: "Electrónica" }
  } */
  /* #swagger.responses[201] = { description: 'Categoría creada con éxito.' } */
  categoriasController.create(req, res, next);
});

router.put('/:id', Authorize('Administrador'), idParamRules, categoriaRules, validateRequest, (req, res, next) => {
  // #swagger.tags = ['Categorías']
  // #swagger.summary = 'Actualizar categoría'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  categoriasController.update(req, res, next);
});

router.delete('/:id', Authorize('Administrador'), idParamRules, validateRequest, (req, res, next) => {
  // #swagger.tags = ['Categorías']
  // #swagger.summary = 'Eliminar categoría'
  // #swagger.description = 'Regla de negocio: El sistema abortará la operación con un 400 Bad Request si se intenta eliminar una categoría marcada como "protegida".'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  /* #swagger.responses[204] = { description: 'Categoría eliminada.' } */
  /* #swagger.responses[400] = { description: 'La categoría está protegida por el sistema y no puede ser borrada.' } */
  categoriasController.delete(req, res, next);
});

module.exports = router;
