const productosService = require('../services/productos.service');

const getAll = async (req, res, next) => {
  try {
    const data = await productosService.getAll(req.query.s);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const get = async (req, res, next) => {
  try {
    const data = await productosService.getById(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const data = await productosService.create(req.body);
    req.bitacora('producto.crear', data.id);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    await productosService.update(req.params.id, req.body);
    req.bitacora('producto.editar', req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const eliminar = async (req, res, next) => {
  try {
    await productosService.eliminar(req.params.id);
    req.bitacora('producto.eliminar', req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const asignaCategoria = async (req, res, next) => {
  try {
    await productosService.asignaCategoria(req.params.id, req.body.categoriaid);
    req.bitacora('productocategoria.agregar', `${req.params.id}:${req.body.categoriaid}`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const eliminaCategoria = async (req, res, next) => {
  try {
    await productosService.eliminaCategoria(req.params.id, req.params.categoriaid);
    req.bitacora('productocategoria.eliminar', `${req.params.id}:${req.params.categoriaid}`);
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
  asignaCategoria,
  eliminaCategoria,
  delete: eliminar,
};
