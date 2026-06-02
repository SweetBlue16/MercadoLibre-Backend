const Roles = Object.freeze({
  Administrador: 'Administrador',
  Usuario: 'Usuario',
});

const PedidoEstados = Object.freeze({
  Recibido: 'Recibido',
  Procesado: 'Procesado',
  Enviado: 'Enviado',
  EnRuta: 'En ruta de entrega',
  Entregado: 'Entregado',
});

const PedidoEstadosPermitidos = Object.freeze(Object.values(PedidoEstados));

const ProductoTextLimits = Object.freeze({
  Default: 40,
  Descripcion: 300,
});

module.exports = {
  Roles,
  PedidoEstados,
  PedidoEstadosPermitidos,
  ProductoTextLimits,
};
