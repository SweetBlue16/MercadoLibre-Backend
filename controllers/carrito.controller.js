const carritoService = require('../services/carrito.service');
const ClaimTypes = require('../config/claimtypes');

const getEmail = (req) => req.decodedToken[ClaimTypes.Name];

const get = async (req, res, next) => {
  try {
    const data = await carritoService.getByUsuarioEmail(getEmail(req));
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const agregar = async (req, res, next) => {
  try {
    const data = await carritoService.agregar(
      getEmail(req),
      Number.parseInt(req.body.productoid, 10),
      req.body.cantidad
    );
    req.bitacora('carrito.agregar', req.body.productoid);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const data = await carritoService.actualizar(
      getEmail(req),
      Number.parseInt(req.params.productoid, 10),
      req.body.cantidad
    );
    req.bitacora('carrito.actualizar', req.params.productoid);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const data = await carritoService.eliminar(getEmail(req), Number.parseInt(req.params.productoid, 10));
    req.bitacora('carrito.eliminar', req.params.productoid);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const vaciar = async (req, res, next) => {
  try {
    await carritoService.vaciar(getEmail(req));
    req.bitacora('carrito.vaciar', null);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  get,
  agregar,
  actualizar,
  eliminar,
  vaciar,
};
