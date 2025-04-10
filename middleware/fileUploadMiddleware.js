const FileUpload = require("../utils/FileUpload");
const config = require("../config/appconfig");

// File filter function
const fileFilter = (req, file, cb) => {
  if (config.file.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG, svg,and JPG are allowed.")
    );
  }
};

// Image upload (5MB limit)
const uploadImage = new FileUpload({
  storageType: "memory",
  fileFilter,
  sizeLimit: 5 * 1024 * 1024, // 5MB
  fields: [
    { name: "image", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ],
}).middleware();

// Document upload (10MB limit)
const uploadStock = new FileUpload({
  storageType: "disk", // Store on disk instead of memory
  fileFilter,
  sizeLimit: 5 * 1024 * 1024, // 5MB
  fields: [{ name: "image", maxCount: 1 }],
}).middleware();

module.exports = { uploadImage, uploadStock };
