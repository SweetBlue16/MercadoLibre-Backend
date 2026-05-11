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

router.get('/', Authorize('Usuario,Administrador'), productosController.getAll);

router.get('/:id', Authorize('Usuario,Administrador'), idParamRules, validateRequest, productosController.get);

router.post('/', Authorize('Administrador'), productoRules, validateRequest, productosController.create);

router.put(
  '/:id',
  Authorize('Administrador'),
  idParamRules,
  productoRules,
  validateRequest,
  productosController.update
);

router.delete('/:id', Authorize('Administrador'), idParamRules, validateRequest, productosController.delete);

router.post(
  '/:id/categoria',
  Authorize('Administrador'),
  idParamRules,
  body('categoriaid').notEmpty().withMessage('El id de categoría es obligatorio'),
  validateRequest,
  productosController.asignaCategoria
);

router.delete(
  '/:id/categoria/:categoriaid',
  Authorize('Administrador'),
  eliminaCategoriaRules,
  validateRequest,
  productosController.eliminaCategoria
);

module.exports = router;
