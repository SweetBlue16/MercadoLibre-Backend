const { bitacora } = require('../models');

const getAll = async () => {
  return await bitacora.findAll({
    attributes: [['id', 'bitacoraId'], 'accion', 'elementoid', 'ip', 'usuario', 'fecha'],
    order: [['id', 'DESC']],
  });
};

module.exports = { getAll };
