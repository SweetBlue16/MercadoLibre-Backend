const router = require('express').Router();
const archivosController = require('../controllers/archivos.controller');
const Authorize = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const validateRequest = require('../middlewares/validator.middleware');
const { param } = require('express-validator');

const idParamRules = [
  param('id').notEmpty().withMessage('El ID del archivo es obligatorio').isString().trim().escape(),
];

router.get('/', Authorize('Administrador'), (req, res, next) => {
  // #swagger.tags = ['Archivos']
  // #swagger.summary = 'Listar todos los archivos (Solo Admin)'
  // #swagger.description = 'Obtiene los metadatos de todos los archivos almacenados en el sistema.'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  /* #swagger.responses[200] = { description: 'Lista de archivos obtenida correctamente.' } */
  /* #swagger.responses[401] = { description: 'Falta el token de autorización o expiró.' } */
  /* #swagger.responses[403] = { description: 'El usuario no tiene rol de Administrador.' } */
  archivosController.getAll(req, res, next);
});

router.get('/:id', idParamRules, validateRequest, (req, res, next) => {
  // #swagger.tags = ['Archivos']
  // #swagger.summary = 'Obtener binario de imagen'
  // #swagger.description = 'Devuelve el archivo binario. El ID del archivo está protegido contra inyección (CWE-89) mediante sanitización de parámetros.'
  /* #swagger.responses[200] = { description: 'Archivo binario retornado (image/jpeg, image/png, etc).' } */
  /* #swagger.responses[404] = { description: 'Archivo no encontrado física ni lógicamente.' } */
  archivosController.get(req, res, next);
});

router.get('/:id/detalle', Authorize('Administrador'), (req, res, next) => {
  // #swagger.tags = ['Archivos']
  // #swagger.summary = 'Obtener metadatos de un archivo (Solo Admin)'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  archivosController.getDetalle(req, res, next);
});

router.post('/', upload.single('file'), Authorize('Administrador'), (req, res, next) => {
  // #swagger.tags = ['Archivos']
  // #swagger.summary = 'Subir un nuevo archivo de imagen'
  // #swagger.description = 'Endpoint blindado contra CWE-434 (Subida de archivos peligrosos). Valida estrictamente extensiones y MIME Types permitiendo solo imágenes. Renombra automáticamente el archivo con UUIDv4.'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  /* #swagger.consumes = ['multipart/form-data'] */
  /* #swagger.parameters['file'] = {
        in: 'formData',
        type: 'file',
        required: true,
        description: 'Archivo de imagen a subir (Max 5MB).'
  } */
  /* #swagger.responses[201] = { description: 'Archivo almacenado exitosamente.' } */
  /* #swagger.responses[400] = { description: 'Tipo de archivo no permitido o límite de tamaño excedido.' } */
  archivosController.create(req, res, next);
});

router.put(
  '/:id',
  upload.single('file'),
  Authorize('Administrador'),
  idParamRules,
  validateRequest,
  (req, res, next) => {
    // #swagger.tags = ['Archivos']
    // #swagger.summary = 'Actualizar un archivo existente'
    /* #swagger.security = [{ "bearerAuth": [] }] */
    /* #swagger.consumes = ['multipart/form-data'] */
    /* #swagger.parameters['file'] = { in: 'formData', type: 'file', required: true } */
    archivosController.update(req, res, next);
  }
);

router.delete('/:id', Authorize('Administrador'), idParamRules, validateRequest, (req, res, next) => {
  // #swagger.tags = ['Archivos']
  // #swagger.summary = 'Eliminar archivo'
  // #swagger.description = 'Elimina el registro de la BD y purga el archivo físico del disco de manera segura.'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  /* #swagger.responses[204] = { description: 'Archivo eliminado correctamente.' } */
  archivosController.delete(req, res, next);
});

module.exports = router;
