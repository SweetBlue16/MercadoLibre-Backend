# Mercado Libre Seguro - Backend

API REST Node.js/Express para el proyecto final de Programacion Segura. Usa MySQL 8, Sequelize, JWT, bcrypt, Swagger y separacion por rutas, controllers, services, modelos, migraciones y middlewares.

## Arquitectura

- `routes/`: contratos HTTP y validaciones con `express-validator`.
- `controllers/`: adaptan request/response y bitacora.
- `services/`: reglas de negocio de auth, usuarios, productos, archivos, carrito, pedidos, correo y politicas de password.
- `models/` y `migrations/`: esquema Sequelize/MySQL.
- `middlewares/`: auth por JWT/rol, uploads seguros, bitacora, validacion y errores JSON centralizados.

## Instalacion

```powershell
npm install
npm run migrate
npm run seed
npm run swagger
npm run start
```

Swagger queda en `http://localhost:3000/swagger`.

## Variables de entorno

Copiar `.env.example` a `.env` y configurar valores reales solo localmente. `.env` esta ignorado por Git.

Claves principales: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `BCRYPT_SALT_ROUNDS`, `CORS_ORIGINS`, `FILES_IN_DB`, `UPLOADS_DIR`, `MAX_IMAGE_SIZE_MB`.

Archivos:

```env
FILES_IN_DB=false
UPLOADS_DIR=./uploads
MAX_IMAGE_SIZE_MB=5
```

Para despliegue con `FILES_IN_DB=false`, configurar `UPLOADS_DIR` apuntando a una carpeta persistente del servidor, por ejemplo `/app/uploads`. MySQL guarda metadata del archivo; el binario vive en esa carpeta. `FILES_IN_DB=true` se conserva por compatibilidad, pero no es la estrategia recomendada para despliegue.

Correo/SMTP:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
EMAIL_CONFIRMATION_ENABLED=true
EMAIL_DEV_MODE=true
```

Para Gmail se debe activar la verificacion en dos pasos y crear una contrasena de aplicacion. Esa contrasena de aplicacion va solo en `SMTP_PASSWORD` del `.env` local. No usar la contrasena normal de Gmail y no copiar `SMTP_PASSWORD` a README, `.env.example`, tests, logs ni commits.
La contrasena de aplicacion debe pegarse sin espacios internos. Despues de cambiar `.env`, reiniciar el backend para que Node vuelva a cargar la configuracion.

Prueba SMTP sin usar el formulario de registro:

```powershell
$env:SMTP_TEST_TO="correo_destino@gmail.com"
npm run test:smtp
```

El diagnostico imprime host, puerto, usuario, remitente, banderas de correo, si `SMTP_PASSWORD` esta configurado y su longitud, pero nunca imprime el valor de `SMTP_PASSWORD`.

Modo desarrollo sin SMTP: dejar `SMTP_*` sin credenciales reales y usar `EMAIL_DEV_MODE=true` en `development`; los codigos de confirmacion y recuperacion se escriben en consola con prefijo `EMAIL_DEV`. En produccion nunca se imprimen codigos. Si `EMAIL_CONFIRMATION_ENABLED=true` en produccion, SMTP debe estar completo o la API no inicia.

## Cuentas de prueba

Las cuentas semilla se configuran con `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_USER_EMAIL` y `SEED_USER_PASSWORD`. Los usuarios semilla quedan con `emailconfirmado=true` para no bloquear la entrega.

## Flujo de imagenes

- El frontend .NET llama a `GET /api/productos`.
- La respuesta de cada producto incluye `archivoId`, `imagenUrl` y `archivoPrincipal` con metadata minima segura cuando existe portada.
- `imagenUrl` es relativa, por ejemplo `/api/archivos/5`; no contiene `localhost`, rutas fisicas ni binarios.
- Razor combina `imagenUrl` con `UrlWebAPI` y renderiza la imagen con `<img src="...">`.
- `GET /api/archivos/{id}` busca metadata en BD, resuelve el archivo dentro de `uploads`, valida ruta segura y responde bytes con el `Content-Type` real.
- Con `FILES_IN_DB=false`, la ruta fisica se resuelve desde `UPLOADS_DIR`; si no existe la variable, se usa `MercadoLibre-Backend/uploads`.
- `wwwroot/images/imagenes-productos` del frontend solo es fallback local o recurso estatico auxiliar. No es la fuente principal para productos con `ArchivoId`.
- No se deben guardar rutas fisicas en BD ni renderizarlas en HTML.
- En localhost cada desarrollador tiene su propia carpeta `uploads`. Para ver las mismas imagenes se necesita misma BD y misma carpeta `uploads`, consumir el backend desplegado o cargar imagenes localmente.

Ejemplo de despliegue con volumen persistente si se usa Docker Compose:

```yaml
services:
  backend:
    environment:
      FILES_IN_DB: 'false'
      UPLOADS_DIR: '/app/uploads'
      MAX_IMAGE_SIZE_MB: '5'
    volumes:
      - uploads_data:/app/uploads

volumes:
  uploads_data:
```

## Cuenta

- Registro publico: `POST /api/usuarios/registro`, siempre crea rol `Usuario`; rechaza rol enviado por el cliente.
- Password fuerte: minimo 12 caracteres, mayuscula, minuscula, numero y caracter especial; no puede ser igual al email.
- Correo duplicado responde `El correo electrónico ya está registrado.`.
- Confirmacion: `POST /api/auth/confirmar-correo` y `POST /api/auth/reenviar-confirmacion`.
- Login rechaza cuentas sin confirmar con `Debes confirmar tu correo electrónico antes de iniciar sesión.`.
- Recuperacion: `POST /api/auth/olvide-password` devuelve mensaje generico y `POST /api/auth/restablecer-password` valida token hasheado y expiracion.
- Cambio de password autenticado: primero `POST /api/auth/cambiar-password/enviar-codigo`; luego `POST /api/auth/cambiar-password` con codigo, password actual, nueva password y confirmacion. El codigo se guarda hasheado, expira en 15 minutos, tiene limite de intentos y se invalida al usarse.

## Carrito y pedidos

- `POST /api/pedidos/confirmar` crea un pedido desde el carrito con estado inicial `Recibido`.
- `GET /api/pedidos/mios` y `GET /api/pedidos/mios/{id}` devuelven solo pedidos del usuario autenticado.
- Admin usa `GET /api/pedidos`, `GET /api/pedidos/{id}` y `PUT /api/pedidos/{id}/estado`.
- Estados permitidos: `Recibido`, `Procesado`, `Enviado`, `En ruta de entrega`, `Entregado`.
- No hay pago real; el flujo de compra es visual/simulado.

## Seguridad

- Helmet, HPP, CORS con allowlist, `express.json` limitado y rate limits por ruta. Las imagenes (`GET /api/archivos/{id}`) tienen un bucket separado y mas amplio para que la carga normal del catalogo no bloquee productos, logout ni subida de archivos. Login, registro, confirmacion, recuperacion y cambio de contrasena mantienen limiters estrictos.
- Las imagenes se pueden embeber desde el frontend MVC porque Helmet usa `Cross-Origin-Resource-Policy: cross-origin` y CORS mantiene allowlist.
- JWT con secreto desde `.env`, issuer/audience, expiracion y roles.
- Passwords con bcrypt; nunca se devuelve `passwordhash`.
- Tokens/codigos de cuenta se guardan hasheados.
- Uploads con UUID, limite 5 MB, MIME/extensiones permitidas, firma binaria y proteccion contra path traversal.
- Errores centralizados en JSON seguro: `{ success, code, message, correlationId, errors? }`. Los codigos viven en `messages/error-codes.js` y los mensajes seguros en `messages/message-catalog.js`.
- Sequelize evita SQL concatenado.
- Bitacora registra eventos sin passwords/JWT/tokens.

## Pruebas

```powershell
npm run lint
npm test
npm audit --audit-level=moderate
```

## Checklist de entrega

- Migraciones aplicadas.
- Swagger regenerado.
- `.env` ignorado y `.env.example` sin secretos reales.
- `uploads/*` ignorado y `uploads/.gitkeep` conservado.
- `/api/archivos/1` responde imagen valida cuando existe metadata y archivo fisico.
- Registro, confirmacion, recuperacion, carrito, Mis pedidos y estados de pedido verificados.
