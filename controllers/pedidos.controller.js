const pedidosService = require('../services/pedidos.service');
const ClaimTypes = require('../config/claimtypes');

const getEmail = (req) => req.decodedToken[ClaimTypes.Name];

const confirmarCompra = async (req, res, next) => {
  try {
    const data = await pedidosService.confirmarCompra(getEmail(req));
    req.bitacora('pedido.crear', data.pedidoId);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const data = await pedidosService.getAll();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const get = async (req, res, next) => {
  try {
    const data = await pedidosService.getById(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const misPedidos = async (req, res, next) => {
  try {
    const data = await pedidosService.getByUsuarioEmail(getEmail(req));
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const miPedido = async (req, res, next) => {
  try {
    const data = await pedidosService.getByIdParaUsuario(req.params.id, getEmail(req));
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const actualizarEstado = async (req, res, next) => {
  try {
    const cambio = await pedidosService.actualizarEstado(req.params.id, req.body.estado);
    req.bitacora('pedido.estado', `Pedido ${req.params.id} cambió de estado de ${cambio.anterior} a ${cambio.nuevo}`);
    res.status(200).json(cambio);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  confirmarCompra,
  getAll,
  get,
  misPedidos,
  miPedido,
  actualizarEstado,
};
