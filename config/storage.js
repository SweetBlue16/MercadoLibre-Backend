const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_MAX_IMAGE_SIZE_MB = 5;
const BYTES_PER_MB = 1024 * 1024;

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const resolveUploadDir = () => {
  const configuredDir = (process.env.UPLOADS_DIR || '').trim();
  return configuredDir ? path.resolve(configuredDir) : path.resolve(__dirname, '..', 'uploads');
};

const uploadDir = resolveUploadDir();
const maxImageSizeMb = parsePositiveInteger(process.env.MAX_IMAGE_SIZE_MB, DEFAULT_MAX_IMAGE_SIZE_MB);
const maxImageSizeBytes = maxImageSizeMb * BYTES_PER_MB;

const allowedImageMimeTypes = Object.freeze(['image/jpeg', 'image/png', 'image/webp']);
const allowedImageExtensions = Object.freeze(['.jpg', '.jpeg', '.png', '.webp']);

const ensureUploadDir = () => {
  fs.mkdirSync(uploadDir, { recursive: true });
};

const resolveUploadPath = (filename) => {
  const safeName = path.basename(filename || '');
  const fullPath = path.resolve(uploadDir, safeName);
  const relative = path.relative(uploadDir, fullPath);

  if (!safeName || relative.startsWith('..') || path.isAbsolute(relative)) {
    return null;
  }

  return fullPath;
};

module.exports = {
  uploadDir,
  maxImageSizeMb,
  maxImageSizeBytes,
  allowedImageMimeTypes,
  allowedImageExtensions,
  ensureUploadDir,
  resolveUploadPath,
};
