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
});
