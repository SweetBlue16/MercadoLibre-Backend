const express = require('express');
const cors = require('cors');
const hpp = require('hpp');
const dotenv = require('dotenv');
const path = require('node:path');
const helmet = require('helmet');
const crypto = require('node:crypto');

dotenv.config({ path: path.join(__dirname, '.env'), quiet: true });

const ErrorCodes = require('./messages/error-codes');
const emailService = require('./services/email.service');
const { apiDefaultLimiter, authGeneralLimiter, productReadLimiter } = require('./middlewares/rate-limiters.middleware');

const app = express();
app.set('trust proxy', 1);
const serverPort = process.env.PORT || process.env.SERVER_PORT || 3000;
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_SECRET debe estar definido y tener al menos 32 caracteres.');
}

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: { policy: 'no-referrer' },
  })
);

emailService.validateEmailConfiguration();

app.use((req, res, next) => {
  const incomingCorrelationId = req.header('X-Correlation-Id');
  const correlationId = /^[a-zA-Z0-9._-]{8,80}$/.test(incomingCorrelationId || '')
    ? incomingCorrelationId
    : crypto.randomUUID();
  req.correlationId = correlationId;
  res.locals.correlationId = correlationId;
  res.setHeader('X-Correlation-Id', correlationId);
  next();
});

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(hpp());

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

app.use('/api/categorias', apiDefaultLimiter, require('./routes/categorias.routes'));
app.use('/api/productos', productReadLimiter, require('./routes/productos.routes'));
app.use('/api/usuarios', apiDefaultLimiter, require('./routes/usuarios.routes'));
app.use('/api/auth', authGeneralLimiter, require('./routes/auth.routes'));
app.use('/api/bitacora', apiDefaultLimiter, require('./routes/bitacora.routes'));
app.use('/api/roles', apiDefaultLimiter, require('./routes/roles.routes'));
app.use('/api/archivos', require('./routes/archivos.routes'));
app.use('/api/carrito', apiDefaultLimiter, require('./routes/carrito.routes'));
app.use('/api/pedidos', apiDefaultLimiter, require('./routes/pedidos.routes'));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '¡API de Mercado Libre funcionando perfectamente en la nube!',
    environment: process.env.NODE_ENV,
  });
});

app.use((req, res) => {
  // #swagger.ignore = true
  res.status(404).json({
    success: false,
    code: ErrorCodes.RESOURCE_NOT_FOUND,
    message: 'El recurso solicitado no existe.',
    correlationId: req.correlationId || res.locals.correlationId,
  });
});

const errorHandler = require('./middlewares/errorhandler.middleware');
app.use(errorHandler);

app.listen(serverPort, () => {
  console.log(`Aplicacion escuchando en el puerto ${serverPort}`);
});
