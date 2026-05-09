const { producto, categoria, Sequelize } = require('../models');
const { body, validationResult } = require('express-validator');
const Op = Sequelize.Op;

const productoValidator = [
  body('titulo', 'El campo titulo es obligatorio').not().isEmpty(),
  body('descripcion', 'El campo descripcion es obligatorio').not().isEmpty(),
  body('precio', 'El campo precio es obligatorio').not().isEmpty().isDecimal({ force_decimal: false }),
];

const getAll = async (req, res, next) => {
  try {
    const { s } = req.query;
    const filters = {};
    if (s) {
      filters.titulo = {
        [Op.like]: `%${s}%`,
      };
    }

    const data = await producto.findAll({
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
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const get = async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = await producto.findByPk(id, {
      attributes: [['id', 'productoId'], 'titulo', 'descripcion', 'precio', 'archivoid'],
      include: {
        model: categoria,
        as: 'categorias',
        attributes: [['id', 'categoriaId'], 'nombre', 'protegida'],
        through: { attributes: [] },
      },
    });

    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error(JSON.stringify(errors));

    const data = await producto.create({
      titulo: req.body.titulo,
      descripcion: req.body.descripcion,
      precio: req.body.precio,
      archivoid: req.body.archivoid || null,
    });

    req.bitacora('producto.crear', data.id);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error(JSON.stringify(errors));

    const id = req.params.id;
    const bodyReq = req.body;
    const data = await producto.update(bodyReq, { where: { id: id } });

    if (data[0] === 0) {
      return res.status(404).send();
    }
    req.bitacora('producto.editar', id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const id = req.params.id;
    let data = await producto.findByPk(id);
    if (!data) {
      return res.status(404).send();
    }

    data = await producto.destroy({ where: { id: id } });
    if (data === 1) {
      req.bitacora('producto.eliminar', id);
      return res.status(204).send();
    }
    res.status(404).send();
  } catch (error) {
    next(error);
  }
};

const asignaCategoria = async (req, res, next) => {
  try {
    const itemToAssign = await categoria.findByPk(req.body.categoriaid);
    if (!itemToAssign) {
      return res.status(404).send();
    }

    const item = await producto.findByPk(req.params.id);
    if (!item) {
      return res.status(404).send();
    }

    await item.addCategoria(itemToAssign);
    req.bitacora('productocategoria.agregar', `${req.params.id}:${req.body.categoriaid}`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const eliminaCategoria = async (req, res, next) => {
  try {
    const itemToRemove = await categoria.findByPk(req.body.categoriaid);
    if (!itemToRemove) {
      return res.status(404).send();
    }

    const item = await producto.findByPk(req.params.id);
    if (!item) {
      return res.status(404).send();
    }

    await item.removeCategoria(itemToRemove);
    req.bitacora('productocategoria.eliminar', `${req.params.id}:${req.body.categoriaid}`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  productoValidator,
  getAll,
  get,
  create,
  update,
  asignaCategoria,
  eliminaCategoria,
  delete: eliminar,
};
