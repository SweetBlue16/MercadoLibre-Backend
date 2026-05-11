const requestIp = require('request-ip');
const ClaimTypes = require('../config/claimtypes');
const bitacoraService = require('../services/bitacora.service');

const bitacoralogger = (req, res, next) => {
  req.bitacora = async (accion, id) => {
    try {
      const ip = requestIp.getClientIp(req) || '0.0.0.0';
      let email = 'invitado';

      if (req.decodedToken) {
        email = req.decodedToken[ClaimTypes.Name] || 'desconocido';
      }

      await bitacoraService.create(accion, id, ip, email);
    } catch (error) {
      console.error(`[ALERTA DE AUDITORÍA] Fallo al escribir en bitácora: ${error.message}`);
    }
  };
  next();
};

module.exports = bitacoralogger;
