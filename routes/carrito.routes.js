const router = require('express').Router();
const carritoController = require('../controllers/carrito.controller');
const Authorize = require('../middlewares/auth.middleware');
const validateRequest = require('../middlewares/validator.middleware');
const { body, param } = require('express-validator');

const productoIdParamRules = [
  param('productoid').isInt({ min: 1 }).withMessage('El producto debe ser un entero positivo'),
];

const agregarRules = [
  body('productoid').isInt({ min: 1 }).withMessage('El producto es obligatorio'),
  body('cantidad').optional().isInt({ min: 1, max: 99 }).withMessage('La cantidad debe estar entre 1 y 99'),
];

const cantidadRules = [body('cantidad').isInt({ min: 1, max: 99 }).withMessage('La cantidad debe estar entre 1 y 99')];

router.get('/', Authorize('Usuario'), (req, res, next) => {
  // #swagger.tags = ['Carrito']
  // #swagger.summary = 'Consultar carrito del usuario autenticado'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  carritoController.get(req, res, next);
});

router.post('/', Authorize('Usuario'), agregarRules, validateRequest, (req, res, next) => {
  // #swagger.tags = ['Carrito']
  // #swagger.summary = 'Agregar producto al carrito'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  carritoController.agregar(req, res, next);
});

router.put(
  '/:productoid',
  Authorize('Usuario'),
  productoIdParamRules,
  cantidadRules,
  validateRequest,
  (req, res, next) => {
    // #swagger.tags = ['Carrito']
    // #swagger.summary = 'Actualizar cantidad de un producto del carrito'
    /* #swagger.security = [{ "bearerAuth": [] }] */
    carritoController.actualizar(req, res, next);
  }
);

router.delete('/:productoid', Authorize('Usuario'), productoIdParamRules, validateRequest, (req, res, next) => {
  // #swagger.tags = ['Carrito']
  // #swagger.summary = 'Eliminar producto del carrito'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  carritoController.eliminar(req, res, next);
});

router.delete('/', Authorize('Usuario'), (req, res, next) => {
  // #swagger.tags = ['Carrito']
  // #swagger.summary = 'Vaciar carrito'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  carritoController.vaciar(req, res, next);
});

module.exports = router;
