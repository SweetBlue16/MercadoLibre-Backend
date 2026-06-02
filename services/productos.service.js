const { producto, categoria, archivo, Sequelize } = require('../models');
const { normalizeTextInput } = require('./text.service');
const ErrorCodes = require('../messages/error-codes');
const { createError } = require('../utils/app-error');
const { mapProducto } = require('./productos.mapper');
const Op = Sequelize.Op;

const productoAttributes = [['id', 'productoId'], 'titulo', 'descripcion', 'precio', ['archivoid', 'archivoId']];
const archivoAttributes = ['id', 'mime', 'nombre', 'size'];

const buildProductoIncludes = () => [
  {
    model: categoria,
    as: 'categorias',
    attributes: [['id', 'categoriaId'], 'nombre', 'protegida'],
    through: { attributes: [] },
  },
  {
    model: archivo,
    as: 'archivo',
    attributes: archivoAttributes,
    required: false,
  },
];

const normalizeSearchTerm = (searchTerm) => {
  if (typeof searchTerm !== 'string') {
    return null;
  }

  const trimmed = searchTerm.trim();
  if (!trimmed) {
    return null;
  }

  return normalizeTextInput(trimmed, 40).replace(/[\\%_]/g, '\\$&');
};

const getAll = async (searchTerm) => {
  const filters = {};
  const safeSearchTerm = normalizeSearchTerm(searchTerm);
  if (safeSearchTerm) {
    filters.titulo = {
      [Op.like]: `%${safeSearchTerm}%`,
    };
  }

  return await producto
    .findAll({
      where: filters,
      attributes: productoAttributes,
      include: buildProductoIncludes(),
      subQuery: false,
    })
    .then((items) => items.map(mapProducto));
};

const getById = async (id) => {
  const data = await producto.findByPk(id, {
    attributes: productoAttributes,
    include: buildProductoIncludes(),
  });

  if (!data) {
    throw createError(ErrorCodes.PRODUCT_NOT_FOUND, 404);
  }
  return mapProducto(data);
};

const create = async (productoData) => {
  const archivoid = productoData.archivoid || productoData.archivoId || null;

  if (archivoid) {
    const portada = await archivo.findByPk(archivoid);
    if (!portada) {
      const error = new Error('Archivo de portada no encontrado.');
      error.statusCode = 400;
      throw error;
    }
  }

  return await producto.create({
    titulo: normalizeTextInput(productoData.titulo),
    descripcion: normalizeTextInput(productoData.descripcion),
    precio: productoData.precio,
    archivoid,
  });
};

const update = async (id, updateData) => {
  const safeUpdateData = { ...updateData };
  if (safeUpdateData.archivoId !== undefined) {
    safeUpdateData.archivoid = safeUpdateData.archivoId;
    delete safeUpdateData.archivoId;
  }

  if (safeUpdateData.productoId !== undefined) {
    delete safeUpdateData.productoId;
  }

  if (safeUpdateData.categorias !== undefined) {
    delete safeUpdateData.categorias;
  }

  if (safeUpdateData.titulo !== undefined) safeUpdateData.titulo = normalizeTextInput(safeUpdateData.titulo);
  if (safeUpdateData.descripcion !== undefined)
    safeUpdateData.descripcion = normalizeTextInput(safeUpdateData.descripcion);

  if (safeUpdateData.archivoid) {
    const portada = await archivo.findByPk(safeUpdateData.archivoid);
    if (!portada) {
      const error = new Error('Archivo de portada no encontrado.');
      error.statusCode = 400;
      throw error;
    }
  }

  const data = await producto.update(safeUpdateData, { where: { id: id } });

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
