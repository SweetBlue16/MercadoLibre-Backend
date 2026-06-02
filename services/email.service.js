const ErrorCodes = require('../messages/error-codes');
const { createError } = require('../utils/app-error');

const isProduction = () => process.env.NODE_ENV === 'production';
const confirmationEnabled = () => process.env.EMAIL_CONFIRMATION_ENABLED !== 'false';
const devModeEnabled = () => process.env.EMAIL_DEV_MODE === 'true';

const hasSmtpConfig = () =>
  Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD &&
    process.env.SMTP_FROM
  );

const validateEmailConfiguration = () => {
  if (isProduction() && confirmationEnabled() && !hasSmtpConfig()) {
    throw new Error('SMTP configuration is required in production when email confirmation is enabled.');
  }
};

const sendMail = async ({ to, subject, text, correlationId }) => {
  if (!hasSmtpConfig()) {
    if (!isProduction() && devModeEnabled()) {
      console.info(`[EMAIL_DEV] Para: ${to} | Asunto: ${subject} | ${text}`);
      return true;
    }

    throw createError(ErrorCodes.EMAIL_SEND_FAILED, 503);
  }

  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch {
    throw createError(ErrorCodes.EMAIL_SEND_FAILED, 503);
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
    });
    return true;
  } catch (error) {
    console.error(
      `[EMAIL_ERROR] code=${error.code || error.name || 'SMTP_ERROR'} responseCode=${error.responseCode || 'N/A'} correlationId=${correlationId || 'N/A'}`
    );
    throw createError(ErrorCodes.EMAIL_SEND_FAILED, 503);
  }
};

const sendConfirmationCode = async (to, code, correlationId) =>
  sendMail({
    to,
    subject: 'Código de confirmación de cuenta',
    text: `Mercado Libre PS04: tu código de confirmación es ${code}. Expira en 15 minutos. No compartas este código.`,
    correlationId,
  });

const sendPasswordResetCode = async (to, code, correlationId) =>
  sendMail({
    to,
    subject: 'Recuperación de contraseña',
    text: `Mercado Libre PS04: tu código para restablecer la contraseña es ${code}. Expira en 30 minutos. No compartas este código.`,
    correlationId,
  });

const sendPasswordChangeCode = async (to, code, correlationId) =>
  sendMail({
    to,
    subject: 'Verificación para cambio de contraseña',
    text: `Mercado Libre PS04: tu código para cambiar la contraseña es ${code}. Expira en 15 minutos. No compartas este código.`,
    correlationId,
  });

module.exports = {
  hasSmtpConfig,
  validateEmailConfiguration,
  sendConfirmationCode,
  sendPasswordResetCode,
  sendPasswordChangeCode,
};
