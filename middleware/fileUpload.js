const multer = require('multer');
const {storage} = require('../config/multerConfig');
const config = require('../config/appconfig'); 

// File filter function
const fileFilter = (req, file, cb) => {
    if (config.file.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and JPG are allowed.'));
    }
};

// Multer upload middleware
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB file size limit
    }
}).fields([
    { name: "image", maxCount: 1 },
]);

module.exports = upload;
