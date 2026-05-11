const { rol } = require('../models');

const getAll = async () => {
  return await rol.findAll({ attributes: ['id', 'nombre'] });
};

module.exports = { getAll };
