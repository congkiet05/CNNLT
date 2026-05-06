const jwt = require('jsonwebtoken');

/**
 * Xác thực JWT.
 * Nginx gateway đã xác thực và gắn X-User-ID, X-User-Role vào header.
 * Service này đọc từ header đó thay vì xác thực lại JWT.
 * Fallback: xác thực JWT trực tiếp nếu không có header (dev mode).
 */
function authenticateToken(req, res, next) {
  // Đọc từ header do API Gateway gắn vào
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];

  if (userId && userRole) {
    req.user = { id: parseInt(userId), role: userRole };
    return next();
  }

  // Fallback: xác thực JWT trực tiếp (dùng khi test local không qua gateway)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

module.exports = { authenticateToken };
