const express = require('express');
const router = express.Router();

const { suggestRecipes, getRecipes, getRecipeById, getRecipeVideos } = require('../controllers/recipeController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/recipes/suggest?ingredients=tôm,tỏi,sả&limit=12
router.get('/suggest', authenticateToken, suggestRecipes);

// GET /api/recipes?page=1&limit=12&search=...
router.get('/', getRecipes);

// GET /api/recipes/:id/videos — tìm video YouTube cho món ăn
router.get('/:id/videos', getRecipeVideos);

// GET /api/recipes/:id
router.get('/:id', getRecipeById);

module.exports = router;
