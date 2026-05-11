const router = require('express').Router();
const archivosController = require('../controllers/archivos.controller');
const Authorize = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const validateRequest = require('../middlewares/validator.middleware');
const { param } = require('express-validator');

const idParamRules = [
  param('id').notEmpty().withMessage('El ID del archivo es obligatorio').isString().trim().escape(),
];

router.get('/', Authorize('Administrador'), archivosController.getAll);

router.get('/:id', idParamRules, validateRequest, archivosController.get);

router.get('/:id/detalle', Authorize('Administrador'), archivosController.getDetalle);

router.post('/', upload.single('file'), Authorize('Administrador'), archivosController.create);

router.put(
  '/:id',
  upload.single('file'),
  Authorize('Administrador'),
  idParamRules,
  validateRequest,
  archivosController.update
);

router.delete('/:id', Authorize('Administrador'), idParamRules, validateRequest, archivosController.delete);

module.exports = router;
