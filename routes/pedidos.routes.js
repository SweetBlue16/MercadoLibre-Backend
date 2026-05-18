const router = require('express').Router();
const pedidosController = require('../controllers/pedidos.controller');
const Authorize = require('../middlewares/auth.middleware');
const validateRequest = require('../middlewares/validator.middleware');
const { param } = require('express-validator');

const idParamRules = [param('id').isInt({ min: 1 }).withMessage('El pedido debe ser un entero positivo')];

router.post('/confirmar', Authorize('Usuario'), (req, res, next) => {
  // #swagger.tags = ['Pedidos']
  // #swagger.summary = 'Confirmar compra del carrito'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  pedidosController.confirmarCompra(req, res, next);
});

router.get('/mios', Authorize('Usuario'), (req, res, next) => {
  // #swagger.tags = ['Pedidos']
  // #swagger.summary = 'Listar pedidos del usuario autenticado'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  pedidosController.misPedidos(req, res, next);
});

router.get('/', Authorize('Administrador'), (req, res, next) => {
  // #swagger.tags = ['Pedidos']
  // #swagger.summary = 'Listar pedidos recibidos'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  pedidosController.getAll(req, res, next);
});

router.get('/:id', Authorize('Administrador'), idParamRules, validateRequest, (req, res, next) => {
  // #swagger.tags = ['Pedidos']
  // #swagger.summary = 'Detalle de pedido'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  pedidosController.get(req, res, next);
});

module.exports = router;
