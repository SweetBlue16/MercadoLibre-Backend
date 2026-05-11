const router = require('express').Router();
const productosController = require('../controllers/productos.controller');
const validateRequest = require('../middlewares/validator.middleware');
const { body, param } = require('express-validator');
const Authorize = require('../middlewares/auth.middleware');

const productoRules = [
  body('titulo').notEmpty().withMessage('El título es obligatorio').trim().escape(),
  body('descripcion').notEmpty().withMessage('La descripción es obligatoria').trim().escape(),
  body('precio')
    .notEmpty()
    .withMessage('El precio es obligatorio')
    .isDecimal()
    .withMessage('El precio debe ser un número decimal'),
  body('archivoid').optional({ nullable: true }).isUUID().withMessage('El archivoid debe ser un UUID válido'),
];

const idParamRules = [param('id').notEmpty().withMessage('El ID es obligatorio')];

const eliminaCategoriaRules = [
  param('id').notEmpty().withMessage('El ID del producto es obligatorio'),
  param('categoriaid').notEmpty().withMessage('El ID de la categoría es obligatorio'),
];

router.get('/', Authorize('Usuario,Administrador'), (req, res, next) => {
  // #swagger.tags = ['Productos']
  // #swagger.summary = 'Listar productos del catálogo'
  // #swagger.description = 'Obtiene la lista de productos y sus categorías vinculadas. Soporta búsqueda por coincidencia parcial en el título.'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  /* #swagger.parameters['s'] = {
        in: 'query',
        description: 'Término de búsqueda opcional (Ej: "Laptop")',
        type: 'string'
  } */
  /* #swagger.responses[200] = { description: 'Catálogo recuperado exitosamente.' } */
  productosController.getAll(req, res, next);
});

router.get('/:id', Authorize('Usuario,Administrador'), idParamRules, validateRequest, (req, res, next) => {
  // #swagger.tags = ['Productos']
  // #swagger.summary = 'Obtener detalle de un producto'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  productosController.get(req, res, next);
});

router.post('/', Authorize('Administrador'), productoRules, validateRequest, (req, res, next) => {
  // #swagger.tags = ['Productos']
  // #swagger.summary = 'Crear un nuevo producto'
  // #swagger.description = 'Los campos de texto son sanitizados contra XSS (CWE-79). El archivoid debe ser un UUID válido o nulo para mantener la integridad relacional.'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  /* #swagger.parameters['body'] = {
        in: 'body',
        schema: {
            titulo: "Teclado Mecánico",
            descripcion: "Teclado RGB switch rojo",
            precio: 1200.50,
            archivoid: "123e4567-e89b-12d3-a456-426614174000"
        }
  } */
  productosController.create(req, res, next);
});

router.put('/:id', Authorize('Administrador'), idParamRules, productoRules, validateRequest, (req, res, next) => {
  // #swagger.tags = ['Productos']
  // #swagger.summary = 'Actualizar datos del producto'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  productosController.update(req, res, next);
});

router.delete('/:id', Authorize('Administrador'), idParamRules, validateRequest, (req, res, next) => {
  // #swagger.tags = ['Productos']
  // #swagger.summary = 'Eliminar producto'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  productosController.delete(req, res, next);
});

router.post(
  '/:id/categoria',
  Authorize('Administrador'),
  idParamRules,
  body('categoriaid').notEmpty().withMessage('El id de categoría es obligatorio'),
  validateRequest,
  (req, res, next) => {
    // #swagger.tags = ['Productos']
    // #swagger.summary = 'Asignar categoría a producto'
    // #swagger.description = 'Crea una asociación en la tabla intermedia producto_categoria.'
    /* #swagger.security = [{ "bearerAuth": [] }] */
    /* #swagger.parameters['body'] = {
        in: 'body',
        schema: { categoriaid: 1 }
  } */
    productosController.asignaCategoria(req, res, next);
  }
);

router.delete(
  '/:id/categoria/:categoriaid',
  Authorize('Administrador'),
  eliminaCategoriaRules,
  validateRequest,
  (req, res, next) => {
    // #swagger.tags = ['Productos']
    // #swagger.summary = 'Remover categoría de producto'
    // #swagger.description = 'Elimina la asociación entre un producto y una categoría específica sin borrar ninguna de las dos entidades.'
    /* #swagger.security = [{ "bearerAuth": [] }] */
    productosController.eliminaCategoria(req, res, next);
  }
);

module.exports = router;
