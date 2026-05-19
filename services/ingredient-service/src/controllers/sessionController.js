const { getPool, sql } = require('../config/db');

/**
 * POST /api/ingredients/sessions
 * Lưu scan session sau khi người dùng "Chốt danh sách" (Req 2.9)
 *
 * Body: { ingredient_list: [...] }
 * Header: X-User-ID (từ Gateway) hoặc JWT
 */
async function createScanSession(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    const { ingredient_list } = req.body;

    // Validate
    if (!ingredient_list || !Array.isArray(ingredient_list) || ingredient_list.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách nguyên liệu không hợp lệ',
      });
    }

    // Validate từng item trong ingredient_list
    for (const item of ingredient_list) {
      if (!item.ten_nguyen_lieu || typeof item.ten_nguyen_lieu !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Mỗi nguyên liệu phải có trường ten_nguyen_lieu',
        });
      }
    }

    const pool = await getPool();

    // Insert scan session
    const result = await pool.request()
      .input('user_id', sql.Int, userId)
      .input('ingredient_list', sql.NVarChar(sql.MAX), JSON.stringify(ingredient_list))
      .input('status', sql.NVarChar(30), 'ingredient_confirmed')
      .query(`
        INSERT INTO scan_sessions (user_id, ingredient_list, status)
        OUTPUT INSERTED.id, INSERTED.created_at
        VALUES (@user_id, @ingredient_list, @status)
      `);

    const session = result.recordset[0];

    // Dọn dẹp session cũ nếu vượt quá 50 (Req 5.4)
    await pool.request()
      .input('user_id', sql.Int, userId)
      .execute('sp_cleanup_old_scan_sessions');

    return res.status(201).json({
      success: true,
      message: 'Đã lưu danh sách nguyên liệu',
      session_id: session.id,
      created_at: session.created_at,
    });
  } catch (err) {
    console.error('[createScanSession]', err);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lưu session' });
  }
}

/**
 * GET /api/ingredients/sessions
 * Lấy lịch sử scan sessions của user (Req 5.2)
 * Query: ?page=1&limit=10
 */
async function getScanSessions(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const pool = await getPool();

    // Lấy tổng số
    const countResult = await pool.request()
      .input('user_id', sql.Int, userId)
      .query('SELECT COUNT(*) AS total FROM scan_sessions WHERE user_id = @user_id');

    const total = countResult.recordset[0].total;

    // Lấy danh sách có phân trang, sắp xếp mới nhất trước
    const listResult = await pool.request()
      .input('user_id', sql.Int, userId)
      .input('limit', sql.Int, limit)
      .input('offset', sql.Int, offset)
      .query(`
        SELECT id, status, ingredient_list, dish_name, created_at, updated_at
        FROM scan_sessions
        WHERE user_id = @user_id
        ORDER BY created_at DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);

    const sessions = listResult.recordset.map(session => {
      try {
        return {
          ...session,
          ingredient_list: JSON.parse(session.ingredient_list)
        };
      } catch {
        return session;
      }
    });

    return res.status(200).json({
      success: true,
      sessions,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[getScanSessions]', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

/**
 * GET /api/ingredients/sessions/:id
 * Lấy chi tiết một scan session (Req 5.3)
 */
async function getScanSessionById(req, res) {
  try {
    const userId = req.user?.id;
    const sessionId = parseInt(req.params.id);

    if (!sessionId || isNaN(sessionId)) {
      return res.status(400).json({ success: false, message: 'Session ID không hợp lệ' });
    }

    const pool = await getPool();

    const result = await pool.request()
      .input('id', sql.Int, sessionId)
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT id, status, ingredient_list, recipes_result, video_results, dish_name, created_at, updated_at
        FROM scan_sessions
        WHERE id = @id AND user_id = @user_id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy session' });
    }

    const session = result.recordset[0];

    // Parse JSON fields
    try {
      session.ingredient_list = JSON.parse(session.ingredient_list);
      if (session.recipes_result) session.recipes_result = JSON.parse(session.recipes_result);
      if (session.video_results) session.video_results = JSON.parse(session.video_results);
    } catch {
      // Giữ nguyên nếu parse lỗi
    }

    return res.status(200).json({ success: true, session });
  } catch (err) {
    console.error('[getScanSessionById]', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

module.exports = { createScanSession, getScanSessions, getScanSessionById };
