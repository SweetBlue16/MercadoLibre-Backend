const multer = require('multer');
const path = require('node:path');
const crypto = require('node:crypto');
const ErrorCodes = require('../messages/error-codes');
const { createError } = require('../utils/app-error');
const {
  allowedImageExtensions,
  allowedImageMimeTypes,
  ensureUploadDir,
  maxImageSizeBytes,
  uploadDir,
} = require('../config/storage');

ensureUploadDir();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomUUID();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedImageExtensions.includes(ext) && allowedImageMimeTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(createError(ErrorCodes.FILE_INVALID_TYPE, 400), false);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: maxImageSizeBytes,
    files: 1,
  },
});

module.exports = upload;
