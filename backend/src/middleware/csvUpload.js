// backend/src/middleware/csvUpload.js
//
// File upload validation for CSV import (master prompt section 35):
// checks extension, MIME type, and size limit. Stores in memory (not
// disk) since we only need to read and parse it once, then discard.

const multer = require("multer");

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB - plenty for a price CSV

function fileFilter(req, file, cb) {
  const isCsvExtension = file.originalname.toLowerCase().endsWith(".csv");
  const isCsvMime = [
    "text/csv",
    "application/vnd.ms-excel", // some browsers/OSes report CSV as this
    "text/plain",
  ].includes(file.mimetype);

  if (!isCsvExtension) {
    return cb(new Error("File must have a .csv extension."));
  }
  if (!isCsvMime) {
    return cb(new Error(`Unsupported file type: ${file.mimetype}. Expected a CSV file.`));
  }
  cb(null, true);
}

const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter,
});

module.exports = { csvUpload };
