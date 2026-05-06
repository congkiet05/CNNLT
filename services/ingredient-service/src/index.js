require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const ingredientRoutes = require('./routes/ingredients');

const app = express();
const PORT = process.env.PORT || 3002;

// ─── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'X-User-Role'],
}));

app.use(express.json({ limit: '1mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau' },
});
app.use(limiter);

// ─── Routes ─────────────────────────────────────────────────
app.use('/api/ingredients', ingredientRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ingredient-service', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint không tồn tại' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(500).json({ success: false, message: 'Lỗi server nội bộ' });
});

// ─── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[ingredient-service] Running on port ${PORT}`);
});
