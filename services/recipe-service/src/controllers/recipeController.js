const { getPool, sql } = require('../config/db');

/**
 * Tính % phù hợp giữa nguyên liệu user có và nguyên liệu công thức cần.
 * Dùng so khớp tên (lowercase, loại bỏ khoảng trắng thừa).
 *
 * @param {string[]} userIngredients  - Tên nguyên liệu user có
 * @param {Array}    recipeIngredients - Mảng { ten_nguyen_lieu, ... } của công thức
 * @returns {{ matchPercentage: number, missingIngredients: string[] }}
 */
function calcMatch(userIngredients, recipeIngredients) {
  const userSet = new Set(
    userIngredients.map((n) => n.toLowerCase().trim())
  );

  const missing = [];
  let matched = 0;

  for (const ing of recipeIngredients) {
    const name = ing.ten_nguyen_lieu?.toLowerCase().trim() ?? '';
    // Kiểm tra khớp chính xác hoặc user có nguyên liệu chứa tên này
    const isMatch = userSet.has(name) ||
      [...userSet].some((u) => u.includes(name) || name.includes(u));

    if (isMatch) {
      matched++;
    } else {
      missing.push(ing.ten_nguyen_lieu);
    }
  }

  const total = recipeIngredients.length;
  const matchPercentage = total === 0 ? 0 : Math.round((matched / total) * 100);

  return { matchPercentage, missingIngredients: missing };
}

/**
 * GET /api/recipes/suggest
 * Query params:
 *   - ingredients: chuỗi tên nguyên liệu cách nhau bởi dấu phẩy
 *                  VD: "tôm,tỏi,sả,hành lá"
 *   - limit: số kết quả tối đa (default: 12, max: 20)
 *
 * Response:
 * {
 *   success: true,
 *   recipes: [
 *     {
 *       id, name, cook_time, difficulty, matchPercentage,
 *       missingIngredients, ingredients, steps
 *     }
 *   ],
 *   total: number
 * }
 */
async function suggestRecipes(req, res) {
  try {
    const { ingredients: ingredientsParam } = req.query;
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 12));

    if (!ingredientsParam || ingredientsParam.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách nguyên liệu (query param: ingredients)',
      });
    }

    // Parse danh sách nguyên liệu từ query string
    const userIngredients = ingredientsParam
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (userIngredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách nguyên liệu không hợp lệ',
      });
    }

    const pool = await getPool();

    // Tìm công thức có chứa ít nhất 1 nguyên liệu của user
    // Dùng LIKE trên ingredients_text để lọc sơ bộ (nhanh hơn scan toàn bộ)
    // Sau đó tính matchPercentage chính xác ở tầng JS
    const likeConditions = userIngredients
      .map((_, i) => `ingredients_text LIKE @ing${i}`)
      .join(' OR ');

    const request = pool.request();
    userIngredients.forEach((ing, i) => {
      request.input(`ing${i}`, sql.NVarChar(100), `%${ing}%`);
    });

    const result = await request.query(`
      SELECT TOP 50
        id, name, ingredients, steps, cook_time, difficulty, image_url
      FROM recipes
      WHERE is_active = 1
        AND (${likeConditions})
      ORDER BY created_at DESC
    `);

    const rows = result.recordset;

    if (rows.length === 0) {
      // Fallback: trả về công thức mới nhất nếu không tìm thấy khớp
      const fallback = await pool.request().query(`
        SELECT TOP ${limit}
          id, name, ingredients, steps, cook_time, difficulty, image_url
        FROM recipes
        WHERE is_active = 1
        ORDER BY created_at DESC
      `);

      const fallbackRecipes = fallback.recordset.map((row) => {
        let recipeIngredients = [];
        try { recipeIngredients = JSON.parse(row.ingredients); } catch {}
        let steps = [];
        try { steps = JSON.parse(row.steps); } catch {}
        return {
          id: row.id,
          name: row.name,
          cook_time: row.cook_time,
          difficulty: row.difficulty,
          image_url: row.image_url || null,
          matchPercentage: 0,
          missingIngredients: recipeIngredients.map((i) => i.ten_nguyen_lieu),
          ingredients: recipeIngredients,
          steps,
        };
      });

      return res.status(200).json({
        success: true,
        recipes: fallbackRecipes,
        total: fallbackRecipes.length,
        note: 'Không tìm thấy công thức khớp, hiển thị công thức mới nhất',
      });
    }

    // Tính matchPercentage cho từng công thức
    const scored = rows.map((row) => {
      let recipeIngredients = [];
      try { recipeIngredients = JSON.parse(row.ingredients); } catch {}
      let steps = [];
      try { steps = JSON.parse(row.steps); } catch {}

      const { matchPercentage, missingIngredients } = calcMatch(
        userIngredients,
        recipeIngredients
      );

      return {
        id: row.id,
        name: row.name,
        cook_time: row.cook_time,
        difficulty: row.difficulty,
        image_url: row.image_url || null,
        matchPercentage,
        missingIngredients,
        ingredients: recipeIngredients,
        steps,
      };
    });

    // Sắp xếp: matchPercentage cao nhất trước, cùng % thì ưu tiên ít thiếu nhất
    scored.sort((a, b) => {
      if (b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage;
      }
      return a.missingIngredients.length - b.missingIngredients.length;
    });

    const topRecipes = scored.slice(0, limit);

    return res.status(200).json({
      success: true,
      recipes: topRecipes,
      total: topRecipes.length,
    });
  } catch (err) {
    console.error('[suggestRecipes]', err);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tìm công thức' });
  }
}

/**
 * GET /api/recipes
 * Lấy danh sách công thức có phân trang (dùng cho trang Món Ăn)
 * Query: ?page=1&limit=12&search=tên món
 */
async function getRecipes(req, res) {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const offset = (page - 1) * limit;
    const search = req.query.search?.trim() || '';

    const pool = await getPool();
    const request = pool.request()
      .input('limit', sql.Int, limit)
      .input('offset', sql.Int, offset);

    let whereClause = 'WHERE is_active = 1';
    if (search) {
      request.input('search', sql.NVarChar(200), `%${search}%`);
      whereClause += ' AND (name LIKE @search OR ingredients_text LIKE @search)';
    }

    const countResult = await pool.request()
      .input('search2', sql.NVarChar(200), search ? `%${search}%` : null)
      .query(`
        SELECT COUNT(*) AS total FROM recipes
        WHERE is_active = 1
        ${search ? 'AND (name LIKE @search2 OR ingredients_text LIKE @search2)' : ''}
      `);

    const total = countResult.recordset[0].total;

    const listResult = await request.query(`
      SELECT id, name, cook_time, difficulty, ingredients_text, created_at
      FROM recipes
      ${whereClause}
      ORDER BY created_at DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);

    return res.status(200).json({
      success: true,
      recipes: listResult.recordset,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[getRecipes]', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

/**
 * GET /api/recipes/:id
 * Lấy chi tiết một công thức
 */
async function getRecipeById(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT id, name, ingredients, steps, cook_time, difficulty,
               source_url, source_name, created_at
        FROM recipes
        WHERE id = @id AND is_active = 1
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy công thức' });
    }

    const recipe = result.recordset[0];
    try { recipe.ingredients = JSON.parse(recipe.ingredients); } catch {}
    try { recipe.steps = JSON.parse(recipe.steps); } catch {}

    return res.status(200).json({ success: true, recipe });
  } catch (err) {
    console.error('[getRecipeById]', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

module.exports = { suggestRecipes, getRecipes, getRecipeById };
