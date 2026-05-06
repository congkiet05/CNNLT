const { validationResult } = require('express-validator');

/**
 * Middleware kiểm tra kết quả validation từ express-validator.
 * Nếu có lỗi, trả về 400 với danh sách lỗi.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = { validate };
