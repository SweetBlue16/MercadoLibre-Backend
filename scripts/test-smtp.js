const path = require('node:path');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const sanitize = (value) => {
  if (!value) return value;
  let sanitized = String(value);
  if (process.env.SMTP_PASSWORD) {
    sanitized = sanitized.split(process.env.SMTP_PASSWORD).join('[REDACTED]');
  }
  return sanitized;
};

const printConfig = () => {
  const password = process.env.SMTP_PASSWORD || '';
  console.log(`current working directory: ${process.cwd()}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || ''}`);
  console.log(`SMTP_HOST: ${process.env.SMTP_HOST || ''}`);
  console.log(`SMTP_PORT: ${process.env.SMTP_PORT || ''}`);
  console.log(`SMTP_SECURE: ${process.env.SMTP_SECURE || ''}`);
  console.log(`SMTP_USER: ${process.env.SMTP_USER || ''}`);
  console.log(`SMTP_FROM: ${process.env.SMTP_FROM || ''}`);
  console.log(`SMTP_PASSWORD configurado: ${password ? 'sí' : 'no'}`);
  console.log(`longitud de SMTP_PASSWORD: ${password.length}`);
  console.log(`EMAIL_CONFIRMATION_ENABLED: ${process.env.EMAIL_CONFIRMATION_ENABLED || ''}`);
  console.log(`EMAIL_DEV_MODE: ${process.env.EMAIL_DEV_MODE || ''}`);
};

const main = async () => {
  printConfig();

  if (!process.env.SMTP_TEST_TO) {
    console.log('Define SMTP_TEST_TO para enviar prueba.');
    process.exitCode = 1;
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_TEST_TO,
      subject: 'Prueba SMTP Mercado Libre PS04',
      text: 'Correo de prueba SMTP. Si recibes este mensaje, la configuracion funciona.',
    });
    console.log('SMTP OK: correo de prueba enviado.');
  } catch (error) {
    console.error(`error.code: ${sanitize(error.code) || ''}`);
    console.error(`error.command: ${sanitize(error.command) || ''}`);
    console.error(`error.responseCode: ${sanitize(error.responseCode) || ''}`);
    console.error(`error.response sanitizada: ${sanitize(error.response) || ''}`);
    process.exitCode = 1;
  }
};

main();
