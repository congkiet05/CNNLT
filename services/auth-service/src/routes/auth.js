const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { register, login, refreshToken, logout, getMe, updateMe } = require('../controllers/authController');
const { validate } = require('../middleware/validate');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/register
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    body('display_name').trim().notEmpty().withMessage('Tên hiển thị không được để trống'),
  ],
  validate,
  register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
    body('password').notEmpty().withMessage('Mật khẩu không được để trống'),
  ],
  validate,
  login
);

// POST /api/auth/refresh
router.post('/refresh', refreshToken);

// POST /api/auth/logout
router.post('/logout', logout);

// GET /api/auth/me  (yêu cầu đăng nhập)
router.get('/me', authenticateToken, getMe);

// PUT /api/auth/me  (yêu cầu đăng nhập)
router.put('/me', authenticateToken, updateMe);

// GET /api/auth/validate  (dùng nội bộ bởi Nginx auth_request)
// Trả về 200 + X-User-ID, X-User-Role nếu token hợp lệ, 401 nếu không
router.get('/validate', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).end();
  }

  const jwt = require('jsonwebtoken');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.set('X-User-ID', String(decoded.id));
    res.set('X-User-Role', decoded.role);
    return res.status(200).end();
  } catch {
    return res.status(401).end();
  }
});

module.exports = router;
