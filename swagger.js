const swaggerAutogen = require('swagger-autogen')({ language: 'es' });

const doc = {
  info: {
    title: 'Mercado Libre Seguro - API Backend',
    description:
      'Documentación oficial de la API de Mercado Libre Seguro. Incluye validaciones estrictas, auditoría y blindaje contra CWEs.',
    version: '1.0.0',
    contact: {
      name: 'Equipo de Desarrollo IOException Team',
      url: 'https://github.com/SweetBlue16/MercadoLibre-Backend',
    },
  },
  host: 'localhost:3000',
  basePath: '/',
  schemes: ['http'],
  consumes: ['application/json', 'multipart/form-data'],
  produces: ['application/json'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'Introduce el token JWT con el formato: Bearer <token>',
    },
  },
  tags: [
    { name: 'Autenticación', description: 'Endpoints para inicio de sesión y gestión de tokens.' },
    { name: 'Usuarios', description: 'Operaciones de CRUD para la gestión de usuarios y roles.' },
    { name: 'Productos', description: 'Catálogo de productos y gestión de categorías asociadas.' },
    { name: 'Categorías', description: 'Administración de categorías del sistema.' },
    { name: 'Archivos', description: 'Subida y visualización segura de imágenes binarias.' },
    { name: 'Bitácora', description: 'Consulta de logs de auditoría (Solo Administradores).' },
  ],
  definitions: {
    ErrorResponse: {
      status: 'error',
      statusCode: 400,
      message: 'Mensaje de error descriptivo',
    },
    LoginRequest: {
      email: 'admin@uv.mx',
      password: 'Password123!',
    },
  },
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./index.js'];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log('Documentación Swagger generada exitosamente.');
});
