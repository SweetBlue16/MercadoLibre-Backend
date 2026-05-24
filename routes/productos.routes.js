const router = require('express').Router();
const productosController = require('../controllers/productos.controller');
const validateRequest = require('../middlewares/validator.middleware');
const { body, param, query } = require('express-validator');
const Authorize = require('../middlewares/auth.middleware');

const productoRules = [
  body('titulo').notEmpty().withMessage('El título es obligatorio').trim(),
  body('descripcion').notEmpty().withMessage('La descripción es obligatoria').trim(),
  body('precio')
    .notEmpty()
    .withMessage('El precio es obligatorio')
    .isDecimal()
    .withMessage('El precio debe ser un número decimal'),
  body('archivoid')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('El archivoid debe ser un entero positivo'),
  body('archivoId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('El archivoId debe ser un entero positivo'),
];

const idParamRules = [param('id').isInt({ min: 1 }).withMessage('El ID debe ser un entero positivo')];

const eliminaCategoriaRules = [
  param('id').isInt({ min: 1 }).withMessage('El ID del producto debe ser un entero positivo'),
  param('categoriaid').isInt({ min: 1 }).withMessage('El ID de la categoría debe ser un entero positivo'),
];

const productoSearchRules = [
  query('s').optional({ nullable: true }).isString().trim().isLength({ max: 100 }).withMessage('Busqueda invalida'),
];

router.get('/', Authorize('Usuario,Administrador'), productoSearchRules, validateRequest, (req, res, next) => {
  // #swagger.tags = ['Productos']
  // #swagger.summary = 'Listar productos del catálogo'
  // #swagger.description = 'Obtiene la lista de productos y sus categorías vinculadas. Soporta búsqueda por coincidencia parcial en el título.'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  /* #swagger.parameters['s'] = {
        in: 'query',
        description: 'Termino de busqueda opcional',
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
  // #swagger.description = 'Los campos de texto son sanitizados contra XSS (CWE-79). El archivoid debe ser un entero positivo o nulo para mantener la integridad relacional.'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  /* #swagger.parameters['body'] = {
        in: 'body',
        schema: {
            titulo: "Teclado Mecánico",
            descripcion: "Teclado RGB switch rojo",
            precio: 1200.50,
            archivoid: 1
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
  body('categoriaid').isInt({ min: 1 }).withMessage('El id de categoría debe ser un entero positivo'),
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
