const express = require('express');
const router = express.Router();

const { recognizeIngredients } = require('../controllers/ingredientController');
const { authenticateToken } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// POST /api/ingredients/recognize
// Nhận 1-3 ảnh, trả về danh sách nguyên liệu
router.post(
  '/recognize',
  authenticateToken,
  (req, res, next) => {
    upload.array('images', 3)(req, res, (err) => {
      handleUploadError(err, req, res, next);
    });
  },
  recognizeIngredients
);

module.exports = router;
