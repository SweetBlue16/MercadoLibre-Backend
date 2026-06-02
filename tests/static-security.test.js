const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('producto archivoid se valida como entero y no como UUID', () => {
  const routes = read('routes/productos.routes.js');
  assert.match(routes, /body\('archivoid'\)[\s\S]*isInt/);
  assert.doesNotMatch(routes, /archivoid'[\s\S]*isUUID/);
});

test('registro publico no permite asignar rol', () => {
  const routes = read('routes/usuarios.routes.js');
  assert.match(routes, /registroRules[\s\S]*body\('rol'\)\.not\(\)\.exists/);
});

test('registro publico no crea usuario definitivo antes de confirmar', () => {
  const service = read('services/usuarios.service.js');
  const account = read('services/account.service.js');
  assert.match(service, /crearRegistroPendiente/);
  assert.match(account, /pendinguserregistration\.create/);
  assert.match(account, /usuario\.create/);
  assert.match(account, /sequelize\.transaction/);
});

test('flujos de password y correo usan tokens hasheados', () => {
  const account = read('services/account.service.js');
  assert.match(account, /hashToken\(code\)/);
  assert.match(account, /hashToken\(token\)/);
  assert.doesNotMatch(account, /codehash:\s*code/);
  assert.doesNotMatch(account, /resettokenhash:\s*code/);
});

test('normalizacion de email se usa para login y usuarios', () => {
  const auth = read('services/auth.service.js');
  const users = read('services/usuarios.service.js');
  const normalizer = read('services/email-normalization.service.js');
  assert.match(auth, /normalizeEmailForLookup/);
  assert.match(users, /normalizedemail/);
  assert.match(normalizer, /gmail\.com/);
  assert.match(normalizer, /replaceAll\('\.', ''\)/);
});

test('pedido tiene estados permitidos y endpoint admin para actualizar', () => {
  const constants = read('config/constants.js');
  const routes = read('routes/pedidos.routes.js');
  assert.match(constants, /Recibido/);
  assert.match(constants, /En ruta de entrega/);
  assert.match(routes, /Authorize\('Administrador'\)/);
  assert.match(routes, /\/:id\/estado/);
});

test('servicio de pedidos valida ownership para mis pedidos', () => {
  const service = read('services/pedidos.service.js');
  assert.match(service, /getByIdParaUsuario/);
  assert.match(service, /where: \{ id, usuarioid: user\.id \}/);
});

test('recuperacion de password devuelve mensaje generico', () => {
  const controller = read('controllers/auth.controller.js');
  assert.match(controller, /Si el correo está registrado, recibirás instrucciones/);
});

test('uploads ignora archivos de usuario y conserva .gitkeep', () => {
  const gitignore = read('.gitignore');
  assert.match(gitignore, /uploads\/\*/);
  assert.match(gitignore, /!uploads\/\.gitkeep/);
});

test('env example no contiene secretos reales del entorno local', () => {
  const envExample = read('.env.example');
  assert.match(envExample, /change_this_local_password/);
  assert.match(envExample, /replace_with_strong_admin_password/);
  assert.match(envExample, /replace_with_strong_user_password/);
  assert.match(envExample, /SMTP_PASSWORD=\s*(\r?\n|$)/);
  assert.match(envExample, /EMAIL_DEV_MODE=true/);
});

test('api usa errores estructurados y codigos centrales', () => {
  const errorHandler = read('middlewares/errorhandler.middleware.js');
  const codes = read('messages/error-codes.js');
  assert.match(errorHandler, /success: false/);
  assert.match(errorHandler, /correlationId/);
  assert.match(codes, /INVALID_CREDENTIALS/);
  assert.match(codes, /USER_NOT_FOUND/);
  assert.match(codes, /EMAIL_SEND_FAILED/);
});

test('eliminacion de usuario valida pedidos asociados antes de destroy', () => {
  const service = read('services/usuarios.service.js');
  const codes = read('messages/error-codes.js');
  const messages = read('messages/message-catalog.js');
  assert.match(service, /pedido\.count\(\{\s*where:\s*\{\s*usuarioid:\s*data\.id\s*\}\s*\}\)/);
  assert.match(service, /USER_HAS_ASSOCIATED_ORDERS/);
  assert.match(codes, /USER_HAS_ASSOCIATED_ORDERS/);
  assert.match(messages, /No se puede eliminar el usuario porque tiene pedidos asociados/);
});

test('usuarios no permite cambio de rol ni eliminacion sobre el actor autenticado', () => {
  const controller = read('controllers/usuarios.controller.js');
  const service = read('services/usuarios.service.js');
  assert.match(controller, /getActorEmail/);
  assert.match(service, /actorNormalizedEmail === targetNormalizedEmail/);
  assert.match(service, /normalizeEmailForLookup\(actorEmail\) === normalizedemail/);
  assert.match(service, /AUTH_FORBIDDEN/);
});

test('imagenes tienen rate limiter separado del bucket general', () => {
  const index = read('index.js');
  const archivosRoutes = read('routes/archivos.routes.js');
  const limiters = read('middlewares/rate-limiters.middleware.js');
  assert.doesNotMatch(index, /app\.use\('\/api',\s*limiter\)/);
  assert.match(archivosRoutes, /router\.get\('\/:id',\s*imageContentLimiter/);
  assert.match(archivosRoutes, /router\.post\('\/',\s*fileMutationLimiter/);
  assert.match(limiters, /const imageContentLimiter[\s\S]*max:\s*600/);
});

test('helmet permite imagenes cross origin desde el frontend', () => {
  const index = read('index.js');
  assert.match(index, /crossOriginResourcePolicy:\s*\{\s*policy:\s*'cross-origin'\s*\}/);
});
