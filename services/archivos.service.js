const { archivo } = require('../models');
const fs = require('fs');
const path = require('path');

const getUploadsPath = (filename) => {
  return path.join(__dirname, '..', 'uploads', filename);
};

const getAll = async () => {
  return await archivo.findAll({
    attributes: [['id', 'archivoid'], 'mime', 'indb', 'nombre', 'size'],
  });
};

const getDetalle = async (id) => {
  const data = await archivo.findByPk(id, {
    attributes: [['id', 'archivoid'], 'mime', 'indb', 'nombre', 'size'],
  });

  if (!data) {
    const error = new Error('Archivo no encontrado');
    error.statusCode = 404;
    throw error;
  }
  return data;
};

const getContenido = async (id) => {
  const data = await archivo.findByPk(id);

  if (!data) {
    const error = new Error('Archivo no encontrado');
    error.statusCode = 404;
    throw error;
  }

  let imagen = data.datos;
  if (!data.indb) {
    const filePath = getUploadsPath(data.nombre);
    if (!fs.existsSync(filePath)) {
      const error = new Error('El archivo físico ya no existe en el servidor');
      error.statusCode = 404;
      throw error;
    }
    imagen = fs.readFileSync(filePath);
  }

  return { imagen, mime: data.mime };
};

const create = async (fileData) => {
  let binario = null;
  let indb = false;
  const filePath = getUploadsPath(fileData.filename);

  if (process.env.FILES_IN_DB === 'true') {
    binario = fs.readFileSync(filePath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    indb = true;
  }

  const data = await archivo.create({
    mime: fileData.mimetype,
    indb: indb,
    nombre: fileData.filename,
    size: fileData.size,
    datos: binario,
  });

  return {
    id: data.id,
    mime: fileData.mimetype,
    indb: indb,
    nombre: fileData.filename,
  };
};

const update = async (id, fileData) => {
  const imagen = await archivo.findByPk(id);
  const newFilePath = getUploadsPath(fileData.filename);

  if (!imagen) {
    if (fs.existsSync(newFilePath)) fs.unlinkSync(newFilePath);
    const error = new Error('Registro de archivo no encontrado');
    error.statusCode = 404;
    throw error;
  }

  let binario = null;
  let indb = false;
  if (process.env.FILES_IN_DB === 'true') {
    binario = fs.readFileSync(newFilePath);
    if (fs.existsSync(newFilePath)) fs.unlinkSync(newFilePath);
    indb = true;
  }

  await imagen.update({
    mime: fileData.mimetype,
    indb: indb,
    nombre: fileData.filename,
    size: fileData.size,
    datos: binario,
  });

  if (!imagen.indb) {
    const oldFilePath = getUploadsPath(imagen.nombre);
    if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
  }

  return true;
};

const eliminar = async (id) => {
  const imagen = await archivo.findByPk(id);
  if (!imagen) {
    const error = new Error('Archivo no encontrado');
    error.statusCode = 404;
    throw error;
  }

  await imagen.destroy();

  if (!imagen.indb) {
    const filePath = getUploadsPath(imagen.nombre);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  return true;
};

module.exports = { getAll, getDetalle, getContenido, create, update, eliminar };
