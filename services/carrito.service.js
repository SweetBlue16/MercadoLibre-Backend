const { carrito, producto, usuario, sequelize } = require('../models');
const ErrorCodes = require('../messages/error-codes');
const { createError } = require('../utils/app-error');

const getUsuarioPorEmail = async (email) => {
  const data = await usuario.findOne({ where: { email } });
  if (!data) {
    const error = new Error('Usuario no encontrado.');
    error.statusCode = 404;
    throw error;
  }
  return data;
};

const mapItem = (item) => {
  const product = item.producto;
  const precio = Number(product.precio);
  const cantidad = item.cantidad;
  return {
    carritoId: item.id,
    productoId: product.id,
    titulo: product.titulo,
    descripcion: product.descripcion,
    precio,
    archivoId: product.archivoid,
    cantidad,
    subtotal: Number((precio * cantidad).toFixed(2)),
  };
};

const getByUsuarioEmail = async (email) => {
  const user = await getUsuarioPorEmail(email);
  const items = await carrito.findAll({
    where: { usuarioid: user.id },
    include: [{ model: producto, attributes: ['id', 'titulo', 'descripcion', 'precio', 'archivoid'] }],
    order: [['id', 'ASC']],
  });

  const productos = items.map(mapItem);
  const total = productos.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    items: productos,
    total: Number(total.toFixed(2)),
  };
};

const agregar = async (email, productoid, cantidad = 1) => {
  const user = await getUsuarioPorEmail(email);
  const product = await producto.findByPk(productoid);
  if (!product) {
    throw createError(ErrorCodes.PRODUCT_NOT_FOUND, 404);
  }

  const safeCantidad = Math.min(Math.max(Number.parseInt(cantidad, 10) || 1, 1), 99);
  const [item, created] = await carrito.findOrCreate({
    where: { usuarioid: user.id, productoid },
    defaults: { cantidad: safeCantidad },
  });

  if (!created) {
    item.cantidad = Math.min(item.cantidad + safeCantidad, 99);
    await item.save();
  }

  return await getByUsuarioEmail(email);
};

const actualizar = async (email, productoid, cantidad) => {
  const user = await getUsuarioPorEmail(email);
  const safeCantidad = Number.parseInt(cantidad, 10);
  if (!Number.isInteger(safeCantidad) || safeCantidad < 1 || safeCantidad > 99) {
    const error = new Error('La cantidad debe estar entre 1 y 99.');
    error.statusCode = 400;
    throw error;
  }

  const [affected] = await carrito.update({ cantidad: safeCantidad }, { where: { usuarioid: user.id, productoid } });

  if (affected === 0) {
    const error = new Error('Producto no encontrado en el carrito.');
    error.statusCode = 404;
    throw error;
  }

  return await getByUsuarioEmail(email);
};

const eliminar = async (email, productoid) => {
  const user = await getUsuarioPorEmail(email);
  await carrito.destroy({ where: { usuarioid: user.id, productoid } });
  return await getByUsuarioEmail(email);
};

const vaciar = async (email, transaction = null) => {
  const user = await getUsuarioPorEmail(email);
  await carrito.destroy({ where: { usuarioid: user.id }, transaction });
  return true;
};

module.exports = {
  getByUsuarioEmail,
  agregar,
  actualizar,
  eliminar,
  vaciar,
  getUsuarioPorEmail,
  sequelize,
};
