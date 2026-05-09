const { rol } = require('../models');

const getAll = async (req, res, next) => {
  try {
    const data = await rol.findAll({ attributes: ['id', 'nombre'] });
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
};
