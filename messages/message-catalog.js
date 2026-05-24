const ErrorCodes = require('./error-codes');

const SafeMessages = Object.freeze({
  [ErrorCodes.VALIDATION_ERROR]: 'Revisa los datos ingresados.',
  [ErrorCodes.AUTH_INVALID_CREDENTIALS]: 'Usuario o contrasena incorrectos.',
  [ErrorCodes.AUTH_EMAIL_NOT_CONFIRMED]: 'Debes confirmar tu correo electronico antes de iniciar sesion.',
  [ErrorCodes.AUTH_SESSION_EXPIRED]: 'Tu sesion expiro. Inicia sesion nuevamente.',
  [ErrorCodes.AUTH_FORBIDDEN]: 'No tienes permisos para realizar esta accion.',
  [ErrorCodes.AUTH_TOKEN_INVALID]: 'Tu sesion expiro. Inicia sesion nuevamente.',
  [ErrorCodes.PASSWORD_CURRENT_INVALID]: 'La contrasena actual no es correcta.',
  [ErrorCodes.PASSWORD_WEAK]: 'La contrasena no cumple la politica de seguridad.',
  [ErrorCodes.PASSWORD_CONFIRMATION_MISMATCH]: 'La nueva contrasena y la confirmacion no coinciden.',
  [ErrorCodes.PASSWORD_REUSE]: 'La nueva contrasena debe ser diferente a la actual.',
  [ErrorCodes.EMAIL_ALREADY_REGISTERED]: 'El correo electronico ya esta registrado.',
  [ErrorCodes.USER_HAS_ASSOCIATED_ORDERS]: 'No se puede eliminar el usuario porque tiene pedidos asociados.',
  [ErrorCodes.EMAIL_CONFIRMATION_INVALID]: 'El codigo de confirmacion es invalido o expiro.',
  [ErrorCodes.EMAIL_CONFIRMATION_EXPIRED]: 'El codigo de confirmacion es invalido o expiro.',
  [ErrorCodes.SMTP_AUTH_FAILED_INTERNAL]: 'No fue posible enviar el correo. Intentalo nuevamente mas tarde.',
  [ErrorCodes.EMAIL_SEND_FAILED]: 'No fue posible enviar el correo. Intentalo nuevamente mas tarde.',
  [ErrorCodes.EMAIL_RESEND_RATE_LIMITED]: 'Espera antes de solicitar otro codigo.',
  [ErrorCodes.PASSWORD_CHANGE_CODE_SENT]: 'Codigo de verificacion enviado.',
  [ErrorCodes.PASSWORD_CHANGE_CODE_INVALID]: 'El codigo no es valido o ha expirado.',
  [ErrorCodes.PASSWORD_CHANGE_CODE_EXPIRED]: 'El codigo no es valido o ha expirado.',
  [ErrorCodes.PASSWORD_CHANGE_CODE_RATE_LIMITED]: 'Espera antes de solicitar otro codigo.',
  [ErrorCodes.PASSWORD_CHANGED]: 'Contrasena actualizada correctamente.',
  [ErrorCodes.SESSION_CLOSED]: 'Tu sesion se cerro correctamente.',
  [ErrorCodes.FILE_NOT_FOUND]: 'El archivo solicitado no esta disponible.',
  [ErrorCodes.FILE_INVALID_TYPE]: 'El archivo no es una imagen permitida.',
  [ErrorCodes.FILE_UPLOAD_FAILED]: 'No fue posible guardar el archivo.',
  [ErrorCodes.IMAGE_NOT_AVAILABLE]: 'La imagen no esta disponible.',
  [ErrorCodes.RESOURCE_NOT_FOUND]: 'El recurso solicitado no existe.',
  [ErrorCodes.ORDER_NOT_FOUND]: 'El pedido solicitado no existe.',
  [ErrorCodes.ORDER_INVALID_STATUS]: 'El estado del pedido no es valido.',
  [ErrorCodes.PRODUCT_NOT_FOUND]: 'El producto solicitado no esta disponible.',
  [ErrorCodes.CART_EMPTY]: 'El carrito esta vacio.',
  [ErrorCodes.SERVER_UNAVAILABLE]: 'El servidor no esta disponible en este momento. Intentalo mas tarde.',
  [ErrorCodes.INTERNAL_ERROR]: 'No fue posible procesar la solicitud. Intentalo nuevamente.',
});

const getSafeMessage = (code) => SafeMessages[code] || SafeMessages[ErrorCodes.INTERNAL_ERROR];

module.exports = {
  SafeMessages,
  getSafeMessage,
};
