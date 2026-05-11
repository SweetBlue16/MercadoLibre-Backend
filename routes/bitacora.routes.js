const router = require('express').Router();
const bitacoraController = require('../controllers/bitacora.controller');
const Authorize = require('../middlewares/auth.middleware');

router.get('/', Authorize('Administrador'), bitacoraController.getAll);

module.exports = router;
