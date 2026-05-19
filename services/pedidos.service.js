const { pedido, detallepedido, producto, usuario, sequelize } = require('../models');
const carritoService = require('./carrito.service');
const { PedidoEstados, PedidoEstadosPermitidos } = require('../config/constants');

const ClaimUserAttributes = ['id', 'email', 'nombre'];

const confirmarCompra = async (email) => {
  const user = await carritoService.getUsuarioPorEmail(email);
  const carrito = await carritoService.getByUsuarioEmail(email);

  if (carrito.items.length === 0) {
    const error = new Error('El carrito esta vacio.');
    error.statusCode = 400;
    throw error;
  }

  return await sequelize.transaction(async (transaction) => {
    const nuevoPedido = await pedido.create(
      {
        usuarioid: user.id,
        fecha: new Date(),
        total: carrito.total,
        estado: PedidoEstados.Recibido,
      },
      { transaction }
    );

    const detalles = carrito.items.map((item) => ({
      pedidoid: nuevoPedido.id,
      productoid: item.productoId,
      titulo: item.titulo,
      cantidad: item.cantidad,
      precio: item.precio,
      subtotal: item.subtotal,
    }));

    await detallepedido.bulkCreate(detalles, { transaction });
    await carritoService.vaciar(email, transaction);

    return await getById(nuevoPedido.id, transaction);
  });
};

const getAll = async () => {
  return await pedido.findAll({
    attributes: [['id', 'pedidoId'], 'fecha', 'total', 'estado'],
    include: [
      {
        model: usuario,
        attributes: ClaimUserAttributes,
      },
      {
        model: detallepedido,
        as: 'detalles',
        attributes: [
          ['id', 'detallePedidoId'],
          ['productoid', 'productoId'],
          'titulo',
          'cantidad',
          'precio',
          'subtotal',
        ],
      },
    ],
    order: [['id', 'DESC']],
  });
};

const getById = async (id, transaction = null) => {
  const data = await pedido.findByPk(id, {
    transaction,
    attributes: [['id', 'pedidoId'], 'fecha', 'total', 'estado'],
    include: [
      {
        model: usuario,
        attributes: ClaimUserAttributes,
      },
      {
        model: detallepedido,
        as: 'detalles',
        attributes: [
          ['id', 'detallePedidoId'],
          ['productoid', 'productoId'],
          'titulo',
          'cantidad',
          'precio',
          'subtotal',
        ],
        include: [{ model: producto, attributes: [['archivoid', 'archivoId']] }],
      },
    ],
  });

  if (!data) {
    const error = new Error('Pedido no encontrado.');
    error.statusCode = 404;
    throw error;
  }
  return data;
};

const getByUsuarioEmail = async (email) => {
  const user = await usuario.findOne({ where: { email }, attributes: ['id'] });
  if (!user) {
    const error = new Error('Usuario no encontrado.');
    error.statusCode = 404;
    throw error;
  }

  return await pedido.findAll({
    where: { usuarioid: user.id },
    attributes: [['id', 'pedidoId'], 'fecha', 'total', 'estado'],
    include: [
      {
        model: detallepedido,
        as: 'detalles',
        attributes: [
          ['id', 'detallePedidoId'],
          ['productoid', 'productoId'],
          'titulo',
          'cantidad',
          'precio',
          'subtotal',
        ],
        include: [{ model: producto, attributes: [['archivoid', 'archivoId']] }],
      },
    ],
    order: [['id', 'DESC']],
  });
};

const getByIdParaUsuario = async (id, email) => {
  const user = await usuario.findOne({ where: { email }, attributes: ['id'] });
  if (!user) {
    const error = new Error('Usuario no encontrado.');
    error.statusCode = 404;
    throw error;
  }

  const data = await pedido.findOne({
    where: { id, usuarioid: user.id },
    attributes: [['id', 'pedidoId'], 'fecha', 'total', 'estado'],
    include: [
      {
        model: detallepedido,
        as: 'detalles',
        attributes: [
          ['id', 'detallePedidoId'],
          ['productoid', 'productoId'],
          'titulo',
          'cantidad',
          'precio',
          'subtotal',
        ],
        include: [{ model: producto, attributes: [['archivoid', 'archivoId']] }],
      },
    ],
  });

  if (!data) {
    const error = new Error('Pedido no encontrado.');
    error.statusCode = 404;
    throw error;
  }
  return data;
};

const actualizarEstado = async (id, estado) => {
  if (!PedidoEstadosPermitidos.includes(estado)) {
    const error = new Error('Estado de pedido invalido.');
    error.statusCode = 400;
    throw error;
  }

  const data = await pedido.findByPk(id);
  if (!data) {
    const error = new Error('Pedido no encontrado.');
    error.statusCode = 404;
    throw error;
  }

  const anterior = data.estado;
  await data.update({ estado });
  return { anterior, nuevo: estado };
};

module.exports = {
  confirmarCompra,
  getAll,
  getById,
  getByUsuarioEmail,
  getByIdParaUsuario,
  actualizarEstado,
};
