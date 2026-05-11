const bitacoraService = require('../services/bitacora.service');

const getAll = async (req, res, next) => {
  try {
    const data = await bitacoraService.getAll();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
};
