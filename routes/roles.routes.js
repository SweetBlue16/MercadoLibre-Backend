const router = require('express').Router();
const rolesController = require('../controllers/roles.controller');
const Authorize = require('../middlewares/auth.middleware');

router.get('/', Authorize('Administrador'), (req, res, next) => {
  // #swagger.tags = ['Roles']
  // #swagger.summary = 'Obtener catálogo de roles'
  // #swagger.description = 'Devuelve la lista de roles estáticos disponibles para asignación (ej: Usuario, Administrador).'
  /* #swagger.security = [{ "bearerAuth": [] }] */
  rolesController.getAll(req, res, next);
});

module.exports = router;
