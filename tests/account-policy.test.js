const assert = require('node:assert/strict');
const test = require('node:test');
const { getPasswordPolicyErrors } = require('../services/password-policy.service');
const { PedidoEstadosPermitidos } = require('../config/constants');

test('password debil es rechazada por politica compartida', () => {
  assert.notEqual(getPasswordPolicyErrors('user@example.com', 'weak').length, 0);
});

test('password igual al email es rechazada', () => {
  assert.ok(getPasswordPolicyErrors('patito@uv.mx', 'patito@uv.mx').includes('igual_email'));
});

test('password fuerte cumple politica compartida', () => {
  assert.deepEqual(getPasswordPolicyErrors('user@example.com', 'Zx3&Pv$Mn7!aRbT2'), []);
});

test('estados de pedido solo incluyen lista blanca del flujo visual', () => {
  assert.deepEqual(PedidoEstadosPermitidos, ['Recibido', 'Procesado', 'Enviado', 'En ruta de entrega', 'Entregado']);
});
