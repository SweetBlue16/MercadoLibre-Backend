const { decodeStoredText } = require('./text.service');

const buildImagenUrl = (archivoId) => {
  if (!archivoId) {
    return null;
  }

  return `/api/archivos/${archivoId}`;
};

const mapArchivoPrincipal = (archivoData, archivoId) => {
  if (!archivoData || !archivoId) {
    return null;
  }

  return {
    archivoId,
    mime: archivoData.mime,
    nombre: archivoData.nombre,
    size: archivoData.size,
    imagenUrl: buildImagenUrl(archivoId),
  };
};

const mapProducto = (item) => {
  const plain = typeof item.get === 'function' ? item.get({ plain: true }) : item;
  const archivoId = plain.archivoId || plain.archivoid || plain.archivo?.id || null;
  const imagenUrl = buildImagenUrl(archivoId);

  return {
    productoId: plain.productoId || plain.id,
    titulo: decodeStoredText(plain.titulo),
    descripcion: decodeStoredText(plain.descripcion),
    precio: plain.precio,
    archivoId,
    imagenUrl,
    archivoPrincipal: mapArchivoPrincipal(plain.archivo, archivoId),
    categorias: plain.categorias || [],
  };
};

module.exports = {
  buildImagenUrl,
  mapProducto,
};
