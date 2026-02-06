// Upload middleware

const multer = require("multer");

// Upload settings
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 6 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "images") {
      if (file.mimetype.startsWith("image/")) cb(null, true);
      else cb(new Error("Only image files allowed"), false);
    } else if (file.fieldname === "pdfDocument") {
      if (file.mimetype === "application/pdf") cb(null, true);
      else cb(new Error("Only PDF files allowed"), false);
    } else {
      cb(null, true);
    }
  },
});

module.exports = upload;

