const express = require('express');
const cors = require('cors');
const hpp = require('hpp');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

dotenv.config();

app.use(helmet());

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

app.use(hpp());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente después de 15 minutos',
});
app.use('/api', limiter);

const corsOptions = {
  origin: ['http://localhost:8080', 'http://localhost:8081'],
  methods: 'GET,PUT,POST,DELETE',
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
app.get('/*splat', (req, res) => {
  res.status(404).send('Recurso no encontrado');
});

const errorHandler = require('./middlewares/errorhandler.middleware');
app.use(errorHandler);

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Aplicación escuchando en el puerto ${process.env.SERVER_PORT}`);
});
