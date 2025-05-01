import multer, { memoryStorage, diskStorage } from "multer";
import { extname } from "path";
import appconfig from "../config/appconfig.js";
import { existsSync, mkdirSync } from 'fs';

class FileUpload {
  constructor(options) {
    const {
      storageType = "disk",
      fileFilter,
      sizeLimit = 5 * 1024 * 1024, // 5MB
      fields = []
    } = options;

    // Ensure the upload directory exists
    if (!existsSync(appconfig.file.uploadDir)) {
      mkdirSync(appconfig.file.uploadDir, { recursive: true });
    }

    // Choose the storage method dynamically
    this.storage =
      storageType === "memory"
        ? memoryStorage()
        : diskStorage({
            destination: (req, file, cb) => {
              cb(null, appconfig.file.uploadDir);
            },
            filename: (req, file, cb) => {
              const uniqueSuffix =
                Date.now() + "-" + Math.round(Math.random() * 1e9);
              cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
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
export default FileUpload;  //  exporting the class
