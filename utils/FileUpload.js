const multer = require("multer");
const path = require("path");
const config = require("../config/appconfig");
const fs = require('fs');

class FileUpload {
  constructor(options) {
    const {
      storageType = "disk",
      fileFilter,
      sizeLimit = 5 * 1024 * 1024, // 5MB
      fields = []
    } = options;

    // Ensure the upload directory exists
    if (!fs.existsSync(config.file.uploadDir)) {
      fs.mkdirSync(config.file.uploadDir, { recursive: true });
    }

    // Choose the storage method dynamically
    this.storage =
      storageType === "memory"
        ? multer.memoryStorage()
        : multer.diskStorage({
            destination: (req, file, cb) => {
              cb(null, config.file.uploadDir);
            },
            filename: (req, file, cb) => {
              const uniqueSuffix =
                Date.now() + "-" + Math.round(Math.random() * 1e9);
              cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
            },
          });

    this.upload = multer({
      storage: this.storage,
      fileFilter,
      limits: {
        fileSize: sizeLimit,
      },
    }).fields(fields); // Accept multiple fields for file uploads
  }

  middleware() {
    return this.upload; // Return multer middleware
  }
}
module.exports = FileUpload;  //  exporting the class
