const archivosService = require('../services/archivos.service');

const getAll = async (req, res, next) => {
  try {
    const data = await archivosService.getAll();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const getDetalle = async (req, res, next) => {
  try {
    const data = await archivosService.getDetalle(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const get = async (req, res, next) => {
  try {
    const { imagen, mime } = await archivosService.getContenido(req.params.id);
    res.status(200).contentType(mime).send(imagen);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json('El archivo es obligatorio.');
    }
    const data = await archivosService.create(req.file);
    req.bitacora('archivos.crear', data.id);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json('El archivo es obligatorio.');
    }
    await archivosService.update(req.params.id, req.file);
    req.bitacora('archivos.editar', req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const eliminar = async (req, res, next) => {
  try {
    await archivosService.eliminar(req.params.id);
    req.bitacora('archivos.eliminar', req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getDetalle,
  get,
  create,
  update,
  delete: eliminar,
};
