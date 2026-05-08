const express = require('express');
const router = express.Router();

const { suggestRecipes, getRecipes, getRecipeById } = require('../controllers/recipeController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/recipes/suggest?ingredients=tôm,tỏi,sả&limit=12
// Gợi ý công thức dựa trên nguyên liệu (yêu cầu đăng nhập)
router.get('/suggest', authenticateToken, suggestRecipes);

// GET /api/recipes?page=1&limit=12&search=...
// Danh sách công thức có phân trang (public)
router.get('/', getRecipes);

// GET /api/recipes/:id
// Chi tiết một công thức (public)
router.get('/:id', getRecipeById);

module.exports = router;
