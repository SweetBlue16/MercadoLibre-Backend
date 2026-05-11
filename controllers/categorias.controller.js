const categoriasService = require('../services/categorias.service');

const getAll = async (req, res, next) => {
  try {
    const data = await categoriasService.getAll();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const get = async (req, res, next) => {
  try {
    const data = await categoriasService.getById(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const data = await categoriasService.create(req.body);
    req.bitacora('categoria.crear', data.id);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    await categoriasService.update(req.params.id, req.body);
    req.bitacora('categoria.editar', req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const eliminar = async (req, res, next) => {
  try {
    await categoriasService.eliminar(req.params.id);
    req.bitacora('categoria.eliminar', req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  get,
  create,
  update,
  delete: eliminar,
};
