const { categoria } = require('../models');
const { body, validationResult } = require('express-validator');

const categoriaValidator = [body('nombre', 'El campo {0} es obligatorio').not().isEmpty()];

const getAll = async (req, res, next) => {
  try {
    const data = await categoria.findAll({
      attributes: [['id', 'categoriaId'], 'nombre', 'protegida'],
    });
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const get = async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = await categoria.findByPk(id, {
      attributes: [['id', 'categoriaId'], 'nombre', 'protegida'],
    });

    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error(JSON.stringify(errors));

    const data = await categoria.create({
      nombre: req.body.nombre,
    });
    req.bitacora('categoria.crear', data.id);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error(JSON.stringify(errors));

    const id = req.params.id;
    const bodyReq = req.body;
    const data = await categoria.update(bodyReq, { where: { id: id } });

    if (data[0] === 0) {
      return res.status(404).send();
    }

    req.bitacora('categoria.editar', id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const id = req.params.id;
    let data = await categoria.findByPk(id);

    if (!data) {
      return res.status(404).send();
    }

    if (data.protegida) {
      return res.status(400).send();
    }

    data = await categoria.destroy({ where: { id: id } });
    if (data === 1) {
      req.bitacora('categoria.eliminar', id);
      return res.status(204).send();
    }
    res.status(404).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  categoriaValidator,
  getAll,
  get,
  create,
  update,
  delete: eliminar,
};
