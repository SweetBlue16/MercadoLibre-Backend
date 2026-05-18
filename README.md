# Mercado Libre Seguro

Proyecto final de Programacion Segura: frontend ASP.NET Core MVC separado de backend Node.js/Express con MySQL 8 y Sequelize.

## Arquitectura

- `MercadoLibre-Backend`: API REST Express, rutas por recurso, controllers, services, middlewares, modelos Sequelize, migraciones, seeders y Swagger en `/swagger`.
- `MercadoLibre-Frontend`: ASP.NET Core MVC, cookies HttpOnly, servicios `HttpClient`, vistas Razor y autorizacion por roles.
- Roles: `Administrador` gestiona productos, categorias, usuarios, archivos, bitacora y pedidos. `Usuario` compra, usa carrito y confirma pedidos.

## Backend

1. Copiar `.env.example` a `.env`.
2. Configurar `DB_DATABASE=mercadolibre`, `DB_USER=mercadolibre_user`, `DB_PASSWORD`, `JWT_SECRET` fuerte y `CORS_ORIGINS=http://localhost:8080`.
3. Instalar dependencias:

```powershell
npm install
```

4. Crear y poblar base:

```powershell
npm run migrate
npm run seed
```

5. Levantar API:

```powershell
npm run start
```

Scripts utiles: `npm run dev`, `npm run lint`, `npm test`, `npm run swagger`, `npm audit`.

## Frontend

Configurar `UrlWebAPI` en `appsettings.json` o `appsettings.Development.json`:

```json
{
  "UrlWebAPI": "http://localhost:3000"
}
```

Comandos:

```powershell
dotnet restore
dotnet build
dotnet run --urls http://localhost:8080
```

## Endpoints Principales

- `POST /api/auth`: login JWT.
- `GET /api/auth/tiempo`: tiempo restante del token.
- `POST /api/usuarios/registro`: registro publico con rol `Usuario`.
- `GET|POST|PUT|DELETE /api/productos`: CRUD de productos.
- `GET|POST|PUT|DELETE /api/categorias`: CRUD de categorias.
- `GET|POST|PUT|DELETE /api/archivos`: metadatos y subida segura de imagenes.
- `GET /api/archivos/{id}`: binario de imagen.
- `GET|POST|PUT|DELETE /api/carrito`: carrito de usuario autenticado.
- `POST /api/pedidos/confirmar`: crea pedido desde carrito.
- `GET /api/pedidos` y `GET /api/pedidos/{id}`: pedidos recibidos para administrador.
- `GET /api/bitacora`: auditoria.

## Seguridad Implementada

- Passwords con bcrypt y politica minima: 12 caracteres, mayuscula, minuscula, numero y caracter especial.
- JWT con secreto desde `.env`, expiracion, issuer/audience y algoritmo HS256.
- Cookies MVC HttpOnly, SameSite Lax y Secure en produccion.
- Antiforgery global para formularios POST del frontend.
- Helmet, HPP, CORS con allowlist y rate limiting general/login/registro.
- Validacion con `express-validator` y `ModelState`.
- Uploads con UUID, limite 5 MB, extensiones jpg/jpeg/png/webp, MIME y firma binaria basica.
- Sin SQL concatenado: acceso a datos mediante Sequelize.
- Manejo centralizado de errores sin stack trace en produccion.
- Bitacora para login, CRUD, carrito y pedidos.
- `.env`, uploads de usuario y logs ignorados por Git.

## Pruebas Realizadas

```powershell
npm run lint
npm test
npm audit --audit-level=moderate
dotnet build
```

Resultado esperado actual: lint y build sin errores, pruebas estaticas pasando y `npm audit` sin vulnerabilidades moderadas o mayores.

## Evidencias Para Rubrica

- Capturas de Swagger `/swagger`.
- Login admin y usuario.
- Registro publico creando solo rol Usuario.
- Productos con imagen `http://localhost:3000/api/archivos/{ArchivoId}`.
- Carrito: agregar, actualizar cantidad, eliminar, vaciar.
- Confirmacion de compra y pedido visible para administrador.
- Acceso directo a rutas admin rechazado con usuario normal.
- Bitacora registrando eventos.

## Checklist De Entrega

- Backend en `http://localhost:3000`.
- Frontend en `http://localhost:8080`.
- Migraciones aplicadas.
- `.env` no versionado.
- `.env.example` sin secretos reales.
- `uploads/.gitkeep` existe y `uploads/*` esta ignorado.
- Swagger regenerado.
- Build y tests ejecutados.
