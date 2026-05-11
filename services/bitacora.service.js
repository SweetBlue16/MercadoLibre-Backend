const { bitacora } = require('../models');

const getAll = async () => {
  return await bitacora.findAll({
    attributes: [['id', 'bitacoraId'], 'accion', 'elementoid', 'ip', 'usuario', 'fecha'],
    order: [['id', 'DESC']],
  });
};

const create = async (accion, elementoid, ip, usuario) => {
  return await bitacora.create({
    accion: accion,
    elementoid: elementoid ? elementoid.toString() : 'N/A',
    ip: ip,
    usuario: usuario,
    fecha: new Date(),
  });
};

module.exports = { getAll, create };
