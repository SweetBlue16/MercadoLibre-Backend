const rolesService = require('../services/roles.service');

const getAll = async (req, res, next) => {
  try {
    const data = await rolesService.getAll();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
};
