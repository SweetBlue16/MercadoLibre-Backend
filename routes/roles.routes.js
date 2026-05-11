const router = require('express').Router();
const rolesController = require('../controllers/roles.controller');
const Authorize = require('../middlewares/auth.middleware');

router.get('/', Authorize('Administrador'), rolesController.getAll);

module.exports = router;
