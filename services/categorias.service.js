const { categoria } = require('../models');

const getAll = async () => {
  return await categoria.findAll({
    attributes: [['id', 'categoriaId'], 'nombre', 'protegida'],
  });
};

const getById = async (id) => {
  const data = await categoria.findByPk(id, {
    attributes: [['id', 'categoriaId'], 'nombre', 'protegida'],
  });

  if (!data) {
    const error = new Error('Categoría no encontrada.');
    error.statusCode = 404;
    throw error;
  }
  return data;
};

const create = async (categoriaData) => {
  return await categoria.create({
    nombre: categoriaData.nombre,
  });
};

const update = async (id, updateData) => {
  const data = await categoria.update(updateData, { where: { id: id } });

  if (data[0] === 0) {
    const error = new Error('Categoría no encontrada.');
    error.statusCode = 404;
    throw error;
  }
  return true;
};

const eliminar = async (id) => {
  const data = await categoria.findByPk(id);

  if (!data) {
    const error = new Error('Categoría no encontrada.');
    error.statusCode = 404;
    throw error;
  }

  if (data.protegida) {
    const error = new Error('No se puede eliminar una categoría protegida por el sistema.');
    error.statusCode = 403;
    throw error;
  }

  await categoria.destroy({ where: { id: id } });
  return true;
};

module.exports = { getAll, getById, create, update, eliminar };
