const FileUpload = require('../utils/FileUpload');  // Assuming FileUpload class is in utils folder
const config = require('../config/appconfig');

// File filter function
const fileFilter = (req, file, cb) => {
    if (config.file.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and JPG are allowed.'));
    }
};

// Image upload (5MB limit)
const uploadImage = new FileUpload({
    storageType: 'memory',
    fileFilter,
    sizeLimit: 5 * 1024 * 1024, // 5MB
    fields: [{ name: 'image', maxCount: 1 }]
}).middleware();

// Document upload (10MB limit)
const uploadDocument = new FileUpload({
    storageType: 'disk', // Store on disk instead of memory
    fileFilter,
    sizeLimit: 10 * 1024 * 1024, // 10MB
    fields: [{ name: 'image', maxCount: 1 }]
}).middleware();

module.exports = { uploadImage, uploadDocument };
