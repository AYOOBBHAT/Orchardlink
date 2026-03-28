const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

const limits = { fileSize: 5 * 1024 * 1024 };

const allowedFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif'];

/** Cloudinary stream upload default is 60s — slow networks / large files hit Request Timeout (499). */
const uploadTimeoutMs = Math.min(
  Math.max(Number(process.env.CLOUDINARY_UPLOAD_TIMEOUT_MS) || 180000, 60000),
  600000
);

function createUpload() {
  if (isCloudinaryConfigured()) {
    const storage = new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'orchardlink/trees',
        allowed_formats: allowedFormats,
        timeout: uploadTimeoutMs,
      },
    });
    return multer({ storage, limits });
  }

  return multer({
    limits,
    fileFilter(_req, file, cb) {
      cb(
        new Error(
          'Image upload is not configured. In the server .env set CLOUD_NAME, API_KEY, and API_SECRET (or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).'
        )
      );
    },
  });
}

const upload = createUpload();

module.exports = { upload };
