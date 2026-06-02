const usuariosService = require('../services/usuarios.service');
const ClaimTypes = require('../config/claimtypes');

const getActorEmail = (req) => req.decodedToken?.[ClaimTypes.Name] || null;

const getAll = async (req, res, next) => {
  try {
    const data = await usuariosService.getAll();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const get = async (req, res, next) => {
  try {
    const data = await usuariosService.getByEmail(req.params.email);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const data = await usuariosService.create(req.body);
    req.bitacora('usuarios.crear', data.email);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

const registroPublico = async (req, res, next) => {
  try {
    const data = await usuariosService.registroPublico(req.body, req.correlationId);
    req.bitacora('usuarios.registro', data.email);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    await usuariosService.update(req.params.email, req.body, getActorEmail(req));
    req.bitacora('usuarios.editar', req.params.email);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const eliminar = async (req, res, next) => {
  try {
    await usuariosService.eliminar(req.params.email, getActorEmail(req));
    req.bitacora('usuarios.eliminar', req.params.email);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  get,
  create,
  registroPublico,
  update,
  delete: eliminar,
};
