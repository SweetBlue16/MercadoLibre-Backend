const { bitacora } = require('../models');

const getAll = async (req, res, next) => {
  try {
    const data = await bitacora.findAll({
      attributes: [['id', 'bitacoraId'], 'accion', 'elementoid', 'ip', 'usuario', 'fecha'],
      order: [['id', 'DESC']],
    });
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
};
