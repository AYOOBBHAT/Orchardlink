const express = require('express');
const multer = require('multer');
const {
  getTrees,
  getMyAdoptedTrees,
  getTreeById,
  adoptTree,
  createTree,
} = require('../controllers/treeController');
const { upload } = require('../middleware/treeImagesUpload');

const router = express.Router();

function treeUploadMiddleware(req, res, next) {
  upload.array('images', 3)(req, res, (err) => {
    if (!err) return next();

    console.error('[POST /api/trees] upload error:', err);

    const inner = err && typeof err === 'object' ? err.error || err : null;
    const errName = inner && typeof inner === 'object' ? inner.name : undefined;
    const errMsg =
      inner && typeof inner === 'object' && typeof inner.message === 'string'
        ? inner.message
        : typeof err?.message === 'string'
          ? err.message
          : 'Image upload failed';

    let message = errMsg;
    let status = 500;

    if (err instanceof multer.MulterError) {
      status = 400;
      if (err.code === 'LIMIT_FILE_SIZE') {
        message = 'Each image must be under 5MB.';
      } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        message = 'Unexpected file field; only "images" is allowed.';
      }
    } else if (
      errName === 'TimeoutError' ||
      errMsg === 'Request Timeout' ||
      inner?.http_code === 499
    ) {
      status = 504;
      message =
        'Upload timed out before the image reached Cloudinary. Try a smaller photo or a faster connection. If it keeps happening, set CLOUDINARY_UPLOAD_TIMEOUT_MS in your server .env (e.g. 300000) and ensure firewalls/VPN allow outbound HTTPS to api.cloudinary.com.';
    }

    return res.status(status).json({ message });
  });
}

router.get('/', getTrees);
router.post('/', treeUploadMiddleware, createTree);
router.get('/my/:userId', getMyAdoptedTrees);
router.post('/:id/adopt', adoptTree);
router.get('/:id', getTreeById);

module.exports = router;
