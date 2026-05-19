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

module.exports = {
  Roles,
  PedidoEstados,
  PedidoEstadosPermitidos,
};
