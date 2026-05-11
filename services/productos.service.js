const { producto, categoria, Sequelize } = require('../models');
const Op = Sequelize.Op;

const getAll = async (searchTerm) => {
  const filters = {};
  if (searchTerm) {
    filters.titulo = {
      [Op.like]: `%${searchTerm}%`,
    };
  }

  return await producto.findAll({
    where: filters,
    attributes: [['id', 'productoId'], 'titulo', 'descripcion', 'precio', 'archivoid'],
    include: {
      model: categoria,
      as: 'categorias',
      attributes: [['id', 'categoriaId'], 'nombre', 'protegida'],
      through: { attributes: [] },
    },
    subQuery: false,
  });
};

const getById = async (id) => {
  const data = await producto.findByPk(id, {
    attributes: [['id', 'productoId'], 'titulo', 'descripcion', 'precio', 'archivoid'],
    include: {
      model: categoria,
      as: 'categorias',
      attributes: [['id', 'categoriaId'], 'nombre', 'protegida'],
      through: { attributes: [] },
    },
  });

  if (!data) {
    const error = new Error('Producto no encontrado.');
    error.statusCode = 404;
    throw error;
  }
  return data;
};

const create = async (productoData) => {
  return await producto.create({
    titulo: productoData.titulo,
    descripcion: productoData.descripcion,
    precio: productoData.precio,
    archivoid: productoData.archivoid || null,
  });
};

const update = async (id, updateData) => {
  const data = await producto.update(updateData, { where: { id: id } });

  if (data[0] === 0) {
    const error = new Error('Producto no encontrado.');
    error.statusCode = 404;
    throw error;
  }
  return true;
};

const eliminar = async (id) => {
  const data = await producto.findByPk(id);

  if (!data) {
    const error = new Error('Producto no encontrado.');
    error.statusCode = 404;
    throw error;
  }

  await producto.destroy({ where: { id: id } });
  return true;
};

const asignaCategoria = async (productoId, categoriaId) => {
  const itemToAssign = await categoria.findByPk(categoriaId);
  if (!itemToAssign) {
    const error = new Error('Categoría no encontrada.');
    error.statusCode = 404;
    throw error;
  }

  const item = await producto.findByPk(productoId);
  if (!item) {
    const error = new Error('Producto no encontrado.');
    error.statusCode = 404;
    throw error;
  }

  await item.addCategoria(itemToAssign);
  return true;
};

const eliminaCategoria = async (productoId, categoriaId) => {
  const itemToRemove = await categoria.findByPk(categoriaId);
  if (!itemToRemove) {
    const error = new Error('Categoría no encontrada.');
    error.statusCode = 404;
    throw error;
  }

  const item = await producto.findByPk(productoId);
  if (!item) {
    const error = new Error('Producto no encontrado.');
    error.statusCode = 404;
    throw error;
  }

  await item.removeCategoria(itemToRemove);
  return true;
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  eliminar,
  asignaCategoria,
  eliminaCategoria,
};
