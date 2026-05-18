const multer = require('multer');
const path = require('node:path');
const crypto = require('node:crypto');
const fs = require('node:fs');

const uploadsDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomUUID();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();

  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  const isValidExtension = allowedExtensions.includes(ext);
  const isValidMimeType = allowedMimeTypes.includes(file.mimetype);

  if (isValidExtension && isValidMimeType) {
    cb(null, true);
  } else {
    const error = new Error('Tipo de archivo no permitido. Solo se aceptan imágenes (JPG, PNG, WEBP).');
    error.statusCode = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

module.exports = upload;
