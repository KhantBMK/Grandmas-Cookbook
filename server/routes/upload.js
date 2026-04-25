const express = require('express');
const router = express.Router();
const multer = require('multer');
const {upload} = require('../controllers/upload');

const storage = multer.memoryStorage();
const fileUpload = multer({
    storage,
    limits: {fileSize: 5 * 1024 * 1024},
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

router.post('/', fileUpload.single('image'), upload);

module.exports = router;