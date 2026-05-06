const multer = require('multer');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 3;

const storage = multer.memoryStorage(); // Lưu vào RAM, không ghi ra disk

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      Object.assign(new Error('Định dạng file không được hỗ trợ'), { code: 'INVALID_FORMAT' }),
      false
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
});

/**
 * Middleware xử lý lỗi từ multer.
 * Phải đặt sau upload middleware.
 */
function handleUploadError(err, req, res, next) {
  if (!err) return next();

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'File ảnh vượt quá giới hạn 10MB',
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Chỉ được upload tối đa 3 ảnh',
    });
  }

  if (err.code === 'INVALID_FORMAT') {
    return res.status(400).json({
      success: false,
      message: 'Định dạng file không được hỗ trợ. Chỉ chấp nhận JPEG, PNG, WEBP',
    });
  }

  next(err);
}

module.exports = { upload, handleUploadError };
