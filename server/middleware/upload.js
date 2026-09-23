const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'sri-sai-properties',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per image
    files: 10, // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type: Only JPEG, PNG, and WebP images are allowed'), false);
    }
  },
});

module.exports = upload;