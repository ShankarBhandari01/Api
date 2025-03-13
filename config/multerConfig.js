const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/appconfig'); 

// this code is not in use follow FileUpload.js class in utils folder

// Ensure the upload directory exists
if (!fs.existsSync(config.file.uploadDir)) {
    fs.mkdirSync(config.file.uploadDir, { recursive: true });
}
// Store image in memory before saving to DB
//const storage = multer.memoryStorage(); 

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.file.uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

module.exports = {storage};
