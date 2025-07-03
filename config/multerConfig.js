import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { file as _file } from '../config/appconfig.js'; 
import { deprecate } from 'util';


// this code is not in use follow FileUpload.js class in utils folder

// Ensure the upload directory exists
if (!existsSync(_file.uploadDir)) {
    mkdirSync(_file.uploadDir, { recursive: true });
}
// Store image in memory before saving to DB
//const storage = multer.memoryStorage(); 
// Multer storage configuration
const storage = diskStorage({
    destination: (req, file, cb) => {
        cb(null, _file.uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
    }
});

deprecate(
storage,
'Multer storage configuration is deprecated. Use the new file upload utility instead.',
'DEP0001'
);
export default {storage};
