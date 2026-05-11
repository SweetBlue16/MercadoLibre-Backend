const router = require('express').Router();
const bitacoraController = require('../controllers/bitacora.controller');
const Authorize = require('../middlewares/auth.middleware');

router.get('/', Authorize('Administrador'), (req, res, next) => {
  // #swagger.tags = ['Bitácora']
  // #swagger.summary = 'Consultar log de auditoría'
  // #swagger.description = 'Devuelve el registro histórico de acciones críticas (CRUD y accesos) de la plataforma. Este endpoint está fuertemente restringido.'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  /* #swagger.responses[200] = { description: 'Log de auditoría devuelto exitosamente.' } */
  /* #swagger.responses[403] = { description: 'Acceso denegado.' } */
  bitacoraController.getAll(req, res, next);
});

module.exports = router;
