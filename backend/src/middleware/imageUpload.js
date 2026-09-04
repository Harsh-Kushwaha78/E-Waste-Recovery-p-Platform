// backend/src/middleware/imageUpload.js
//
// File upload validation for device/component photos (master prompt
// section 35): extension + MIME type check, size limit. Actual decode
// verification happens in cv-service (Pillow confirms the bytes are a
// real image) - this middleware does the cheap checks first.

const multer = require("multer");

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

function fileFilter(req, file, cb) {
  const lowerName = file.originalname.toLowerCase();
  const hasAllowedExtension = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));

  if (!hasAllowedExtension) {
    return cb(new Error(`File must have one of these extensions: ${ALLOWED_EXTENSIONS.join(", ")}`));
  }
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error(`Unsupported file type: ${file.mimetype}`));
  }
  cb(null, true);
}

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter,
});

module.exports = { imageUpload };
