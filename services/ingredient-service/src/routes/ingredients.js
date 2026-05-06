const express = require('express');
const router = express.Router();

const { recognizeIngredients } = require('../controllers/ingredientController');
const { createScanSession, getScanSessions, getScanSessionById } = require('../controllers/sessionController');
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

// POST /api/ingredients/sessions
// Lưu scan session sau khi người dùng chốt danh sách (Req 2.9)
router.post('/sessions', authenticateToken, createScanSession);

// GET /api/ingredients/sessions
// Lấy lịch sử scan sessions của user (Req 5.2)
router.get('/sessions', authenticateToken, getScanSessions);

// GET /api/ingredients/sessions/:id
// Lấy chi tiết một scan session (Req 5.3)
router.get('/sessions/:id', authenticateToken, getScanSessionById);

module.exports = router;
