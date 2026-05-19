const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getPool, sql } = require('../config/db');

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRES = '1h';
const REFRESH_TOKEN_EXPIRES_DAYS = 7;

// ─── Helpers ────────────────────────────────────────────────

function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES }
  );
}

async function generateRefreshToken(userId) {
  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);

  const pool = await getPool();
  await pool.request()
    .input('userId', sql.Int, userId)
    .input('token', sql.NVarChar(500), token)
    .input('expiresAt', sql.DateTime2, expiresAt)
    .query(`
      INSERT INTO refresh_tokens (user_id, token, expires_at)
      VALUES (@userId, @token, @expiresAt)
    `);

  return token;
}

// ─── Controllers ────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Body: { email, password, display_name }
 */
async function register(req, res) {
  try {
    const { email, password, display_name } = req.body;
    const pool = await getPool();

    // Kiểm tra email đã tồn tại
    const existing = await pool.request()
      .input('email', sql.NVarChar(255), email)
      .query('SELECT id FROM users WHERE email = @email');

    if (existing.recordset.length > 0) {
      return res.status(409).json({ success: false, message: 'Email đã được sử dụng' });
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Tạo user mới
    const result = await pool.request()
      .input('email', sql.NVarChar(255), email)
      .input('password', sql.NVarChar(255), hashedPassword)
      .input('display_name', sql.NVarChar(255), display_name)
      .query(`
        INSERT INTO users (email, password, display_name)
        OUTPUT INSERTED.id, INSERTED.email, INSERTED.display_name, INSERTED.role
        VALUES (@email, @password, @display_name)
      `);

    const newUser = result.recordset[0];

    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      user: {
        id: newUser.id,
        email: newUser.email,
        display_name: newUser.display_name,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error('[register]', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const pool = await getPool();

    // Tìm user
    const result = await pool.request()
      .input('email', sql.NVarChar(255), email)
      .query('SELECT id, email, password, display_name, role, is_active FROM users WHERE email = @email');

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    // Kiểm tra tài khoản bị vô hiệu hóa
    if (!user.is_active) {
      return res.status(401).json({ success: false, message: 'Tài khoản đã bị vô hiệu hóa' });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    // Tạo tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user.id);

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

/**
 * POST /api/auth/refresh
 * Body: { refresh_token }
 */
async function refreshToken(req, res) {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res.status(400).json({ success: false, message: 'Refresh token không được cung cấp' });
    }

    const pool = await getPool();

    // Tìm refresh token trong DB
    const result = await pool.request()
      .input('token', sql.NVarChar(500), refresh_token)
      .query(`
        SELECT rt.id, rt.user_id, rt.expires_at,
               u.email, u.role, u.is_active
        FROM refresh_tokens rt
        JOIN users u ON rt.user_id = u.id
        WHERE rt.token = @token
      `);

    const record = result.recordset[0];

    if (!record) {
      return res.status(401).json({ success: false, message: 'Refresh token không hợp lệ' });
    }

    if (new Date() > new Date(record.expires_at)) {
      // Xóa token hết hạn
      await pool.request()
        .input('token', sql.NVarChar(500), refresh_token)
        .query('DELETE FROM refresh_tokens WHERE token = @token');
      return res.status(401).json({ success: false, message: 'Refresh token đã hết hạn, vui lòng đăng nhập lại' });
    }

    if (!record.is_active) {
      return res.status(401).json({ success: false, message: 'Tài khoản đã bị vô hiệu hóa' });
    }

    // Cấp access token mới
    const newAccessToken = generateAccessToken({
      id: record.user_id,
      email: record.email,
      role: record.role,
    });

    return res.status(200).json({
      success: true,
      access_token: newAccessToken,
    });
  } catch (err) {
    console.error('[refreshToken]', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

/**
 * POST /api/auth/logout
 * Body: { refresh_token }
 */
async function logout(req, res) {
  try {
    const { refresh_token } = req.body;
    if (refresh_token) {
      const pool = await getPool();
      await pool.request()
        .input('token', sql.NVarChar(500), refresh_token)
        .query('DELETE FROM refresh_tokens WHERE token = @token');
    }
    return res.status(200).json({ success: true, message: 'Đăng xuất thành công' });
  } catch (err) {
    console.error('[logout]', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 */
async function getMe(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.user.id)
      .query('SELECT id, email, display_name, role, avatar_url, created_at FROM users WHERE id = @id');

    const user = result.recordset[0];
    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('[getMe]', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

/**
 * PUT /api/auth/me
 * Header: Authorization: Bearer <token>
 * Body: { display_name }
 */
async function updateMe(req, res) {
  try {
    const { display_name } = req.body;
    if (!display_name || display_name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Tên hiển thị không được để trống' });
    }

    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, req.user.id)
      .input('display_name', sql.NVarChar(255), display_name.trim())
      .query('SET QUOTED_IDENTIFIER ON; UPDATE users SET display_name = @display_name WHERE id = @id');

    return res.status(200).json({ success: true, message: 'Cập nhật hồ sơ thành công' });
  } catch (err) {
    console.error('[updateMe]', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

module.exports = { register, login, refreshToken, logout, getMe, updateMe };
