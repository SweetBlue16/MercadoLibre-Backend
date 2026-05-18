const { archivo } = require('../models');
const fs = require('node:fs');
const path = require('node:path');

const getUploadsPath = (filename) => {
  const safeName = path.basename(filename);
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const fullPath = path.join(uploadsDir, safeName);

  if (!fullPath.startsWith(uploadsDir)) {
    const error = new Error('Ruta de archivo invalida');
    error.statusCode = 400;
    throw error;
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
    const error = new Error('El contenido del archivo no coincide con una imagen permitida.');
    error.statusCode = 400;
    throw error;
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
