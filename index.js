const express = require('express');
const cors = require('cors');
const hpp = require('hpp');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const serverPort = process.env.SERVER_PORT || process.env.PORT || 3000;
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_SECRET debe estar definido y tener al menos 32 caracteres.');
}

app.use(
  helmet({
    contentSecurityPolicy: false,
    referrerPolicy: { policy: 'no-referrer' },
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(hpp());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente despues de 15 minutos',
});
app.use('/api', limiter);

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:8080')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origen no permitido por CORS.'));
  },
  methods: ['GET', 'PUT', 'POST', 'DELETE'],
  exposedHeaders: ['Set-Authorization'],
};
app.use(cors(corsOptions));

const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json');
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use(require('./middlewares/bitacora.middleware'));

app.use('/api/categorias', require('./routes/categorias.routes'));
app.use('/api/productos', require('./routes/productos.routes'));
app.use('/api/usuarios', require('./routes/usuarios.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/bitacora', require('./routes/bitacora.routes'));
app.use('/api/roles', require('./routes/roles.routes'));
app.use('/api/archivos', require('./routes/archivos.routes'));
app.use('/api/carrito', require('./routes/carrito.routes'));
app.use('/api/pedidos', require('./routes/pedidos.routes'));

app.use((req, res) => {
  // #swagger.ignore = true
  res.status(404).json({
    status: 'error',
    statusCode: 404,
    message: 'El recurso o endpoint solicitado no existe en el servidor.',
  });
});

const errorHandler = require('./middlewares/errorhandler.middleware');
app.use(errorHandler);

app.listen(serverPort, () => {
  console.log(`Aplicacion escuchando en el puerto ${serverPort}`);
});
