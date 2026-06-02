const ErrorCodes = require('./error-codes');

const SafeMessages = Object.freeze({
  [ErrorCodes.VALIDATION_ERROR]: 'Revisa los datos ingresados.',
  [ErrorCodes.AUTH_INVALID_CREDENTIALS]: 'Credenciales incorrectas.',
  [ErrorCodes.USER_NOT_FOUND]: 'Para acceder al sistema primero debes registrarte.',
  [ErrorCodes.AUTH_EMAIL_NOT_CONFIRMED]: 'Debes confirmar tu correo electrónico antes de iniciar sesión.',
  [ErrorCodes.AUTH_SESSION_EXPIRED]: 'Tu sesión expiró. Inicia sesión nuevamente.',
  [ErrorCodes.AUTH_FORBIDDEN]: 'No tienes permisos para realizar esta acción.',
  [ErrorCodes.AUTH_TOKEN_INVALID]: 'Tu sesión expiró. Inicia sesión nuevamente.',
  [ErrorCodes.PASSWORD_CURRENT_INVALID]: 'La contraseña actual no es correcta.',
  [ErrorCodes.PASSWORD_WEAK]: 'La contraseña no cumple la política de seguridad.',
  [ErrorCodes.PASSWORD_CONFIRMATION_MISMATCH]: 'La nueva contraseña y la confirmación no coinciden.',
  [ErrorCodes.PASSWORD_REUSE]: 'La nueva contraseña debe ser diferente a la actual.',
  [ErrorCodes.EMAIL_ALREADY_REGISTERED]: 'El correo electrónico ya está registrado.',
  [ErrorCodes.USER_HAS_ASSOCIATED_ORDERS]: 'No se puede eliminar el usuario porque tiene pedidos asociados.',
  [ErrorCodes.EMAIL_VERIFICATION_REQUIRED]: 'No hay una verificación de correo pendiente. Regístrate nuevamente.',
  [ErrorCodes.EMAIL_CONFIRMATION_INVALID]: 'El código de verificación no es válido.',
  [ErrorCodes.EMAIL_CONFIRMATION_EXPIRED]: 'El código de verificación expiró. Solicita uno nuevo.',
  [ErrorCodes.SMTP_AUTH_FAILED_INTERNAL]: 'No fue posible enviar el correo. Inténtalo nuevamente más tarde.',
  [ErrorCodes.EMAIL_SEND_FAILED]: 'No fue posible enviar el correo. Inténtalo nuevamente más tarde.',
  [ErrorCodes.EMAIL_RESEND_RATE_LIMITED]: 'Espera antes de solicitar otro código.',
  [ErrorCodes.PASSWORD_CHANGE_CODE_SENT]: 'Código de verificación enviado.',
  [ErrorCodes.PASSWORD_CHANGE_CODE_INVALID]: 'El código no es válido o ha expirado.',
  [ErrorCodes.PASSWORD_CHANGE_CODE_EXPIRED]: 'El código no es válido o ha expirado.',
  [ErrorCodes.PASSWORD_CHANGE_CODE_RATE_LIMITED]: 'Espera antes de solicitar otro código.',
  [ErrorCodes.PASSWORD_CHANGED]: 'Contraseña actualizada correctamente.',
  [ErrorCodes.SESSION_CLOSED]: 'Tu sesión se cerró correctamente.',
  [ErrorCodes.FILE_NOT_FOUND]: 'El archivo solicitado no está disponible.',
  [ErrorCodes.FILE_INVALID_TYPE]: 'El archivo no es una imagen permitida.',
  [ErrorCodes.FILE_TOO_LARGE]: 'El archivo supera el tamaño máximo permitido.',
  [ErrorCodes.FILE_UPLOAD_FAILED]: 'No fue posible guardar el archivo.',
  [ErrorCodes.IMAGE_NOT_AVAILABLE]: 'La imagen no está disponible.',
  [ErrorCodes.RESOURCE_NOT_FOUND]: 'El recurso solicitado no existe.',
  [ErrorCodes.ORDER_NOT_FOUND]: 'El pedido solicitado no existe.',
  [ErrorCodes.ORDER_INVALID_STATUS]: 'El estado del pedido no es válido.',
  [ErrorCodes.PRODUCT_NOT_FOUND]: 'El producto solicitado no está disponible.',
  [ErrorCodes.CART_EMPTY]: 'El carrito está vacío.',
  [ErrorCodes.SERVER_UNAVAILABLE]: 'El servidor no está disponible en este momento. Inténtalo más tarde.',
  [ErrorCodes.INTERNAL_ERROR]: 'No fue posible procesar la solicitud. Inténtalo nuevamente.',
});

const getSafeMessage = (code) => SafeMessages[code] || SafeMessages[ErrorCodes.INTERNAL_ERROR];

module.exports = {
  SafeMessages,
  getSafeMessage,
};
