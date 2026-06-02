const router = require('express').Router();
const productosController = require('../controllers/productos.controller');
const validateRequest = require('../middlewares/validator.middleware');
const { body, param, query } = require('express-validator');
const Authorize = require('../middlewares/auth.middleware');

const TEXT_MAX_LENGTH = 40;

const productoRules = [
  body('titulo')
    .notEmpty()
    .withMessage('El título es obligatorio')
    .trim()
    .isLength({ max: TEXT_MAX_LENGTH })
    .withMessage('El título no debe exceder 40 caracteres'),
  body('descripcion')
    .notEmpty()
    .withMessage('La descripción es obligatoria')
    .trim()
    .isLength({ max: TEXT_MAX_LENGTH })
    .withMessage('La descripción no debe exceder 40 caracteres'),
  body('precio')
    .notEmpty()
    .withMessage('El precio es obligatorio')
    .isDecimal()
    .withMessage('El precio debe ser un número decimal'),
  body('archivoid').optional({ nullable: true }).isInt({ min: 1 }).withMessage('El archivoid debe ser positivo'),
  body('archivoId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('El archivoId debe ser positivo'),
];

const idParamRules = [param('id').isInt({ min: 1 }).withMessage('El ID debe ser un entero positivo')];

const eliminaCategoriaRules = [
  param('id').isInt({ min: 1 }).withMessage('El ID del producto debe ser un entero positivo'),
  param('categoriaid').isInt({ min: 1 }).withMessage('El ID de la categoría debe ser un entero positivo'),
];

const productoSearchRules = [
  query('s')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: TEXT_MAX_LENGTH })
    .withMessage('Búsqueda inválida'),
];

router.get('/', Authorize('Usuario,Administrador'), productoSearchRules, validateRequest, (req, res, next) => {
  productosController.getAll(req, res, next);
});

router.get('/:id', Authorize('Usuario,Administrador'), idParamRules, validateRequest, (req, res, next) => {
  productosController.get(req, res, next);
});

router.post('/', Authorize('Administrador'), productoRules, validateRequest, (req, res, next) => {
  productosController.create(req, res, next);
});

router.put('/:id', Authorize('Administrador'), idParamRules, productoRules, validateRequest, (req, res, next) => {
  productosController.update(req, res, next);
});

router.delete('/:id', Authorize('Administrador'), idParamRules, validateRequest, (req, res, next) => {
  productosController.delete(req, res, next);
});

router.post(
  '/:id/categoria',
  Authorize('Administrador'),
  idParamRules,
  body('categoriaid').isInt({ min: 1 }).withMessage('El id de categoría debe ser un entero positivo'),
  validateRequest,
  (req, res, next) => {
    productosController.asignaCategoria(req, res, next);
  }
);

router.delete(
  '/:id/categoria/:categoriaid',
  Authorize('Administrador'),
  eliminaCategoriaRules,
  validateRequest,
  (req, res, next) => {
    productosController.eliminaCategoria(req, res, next);
  }
);

module.exports = router;
