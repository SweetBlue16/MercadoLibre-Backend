const { archivo } = require('../models');
const fs = require('node:fs');
const path = require('node:path');
const ErrorCodes = require('../messages/error-codes');
const { createError } = require('../utils/app-error');

const uploadsDir = path.resolve(__dirname, '..', 'uploads');

const getUploadsPath = (filename) => {
  const safeName = path.basename(filename || '');
  const fullPath = path.resolve(uploadsDir, safeName);
  const relative = path.relative(uploadsDir, fullPath);

  if (!safeName || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw createError(ErrorCodes.FILE_NOT_FOUND, 404);
  }

  return fullPath;
};

const validarFirmaImagen = (filePath, mime) => {
  const buffer = fs.readFileSync(filePath);
  const isJpeg = buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng =
    buffer.length > 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;
  const isWebp =
    buffer.length > 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';

  const valid =
    (mime === 'image/jpeg' && isJpeg) || (mime === 'image/png' && isPng) || (mime === 'image/webp' && isWebp);

  if (!valid) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw createError(ErrorCodes.FILE_INVALID_TYPE, 400);
  }
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
    throw createError(ErrorCodes.FILE_NOT_FOUND, 404);
  }
  return data;
};

const getContenido = async (id) => {
  const data = await archivo.findByPk(id);

  if (!data) {
    throw createError(ErrorCodes.FILE_NOT_FOUND, 404);
  }

  let imagen = data.datos;
  if (!data.indb) {
    const filePath = getUploadsPath(data.nombre);
    if (!fs.existsSync(filePath)) {
      console.warn(`[ARCHIVO_NO_DISPONIBLE] id=${id} nombre=${path.basename(data.nombre)}`);
      throw createError(ErrorCodes.IMAGE_NOT_AVAILABLE, 404);
    }
    imagen = fs.readFileSync(filePath);
  }

  if (!imagen) {
    throw createError(ErrorCodes.IMAGE_NOT_AVAILABLE, 404);
  }

  return { imagen, mime: data.mime || 'application/octet-stream' };
};

const create = async (fileData) => {
  let binario = null;
  let indb = false;
  const filePath = getUploadsPath(fileData.filename);
  validarFirmaImagen(filePath, fileData.mimetype);

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
  validarFirmaImagen(newFilePath, fileData.mimetype);

  if (!imagen) {
    if (fs.existsSync(newFilePath)) fs.unlinkSync(newFilePath);
    throw createError(ErrorCodes.FILE_NOT_FOUND, 404);
  }

  let binario = null;
  let indb = false;
  if (process.env.FILES_IN_DB === 'true') {
    binario = fs.readFileSync(newFilePath);
    if (fs.existsSync(newFilePath)) fs.unlinkSync(newFilePath);
    indb = true;
  }

  const oldName = imagen.nombre;
  const oldInDb = imagen.indb;

  await imagen.update({
    mime: fileData.mimetype,
    indb: indb,
    nombre: fileData.filename,
    size: fileData.size,
    datos: binario,
  });

  if (!oldInDb) {
    const oldFilePath = getUploadsPath(oldName);
    if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
  }

  return true;
};

const eliminar = async (id) => {
  const imagen = await archivo.findByPk(id);
  if (!imagen) {
    throw createError(ErrorCodes.FILE_NOT_FOUND, 404);
  }

  await imagen.destroy();

  if (!imagen.indb) {
    const filePath = getUploadsPath(imagen.nombre);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  return true;
};

module.exports = { getAll, getDetalle, getContenido, create, update, eliminar };
