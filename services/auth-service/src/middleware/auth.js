const jwt = require('jsonwebtoken');

/**
 * Middleware xác thực JWT.
 * Đọc token từ header Authorization: Bearer <token>
 * Gắn req.user = { id, email, role } nếu hợp lệ.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token không được cung cấp' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

/**
 * Middleware kiểm tra quyền Admin.
 * Phải dùng sau authenticateToken.
 */
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
  }
  next();
}

module.exports = { authenticateToken, requireAdmin };
