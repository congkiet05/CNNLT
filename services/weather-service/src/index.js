require('dotenv').config();
const express = require('express');
const cors = require('cors');

const weatherRoutes = require('./routes/weather');

const app = express();
const port = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/weather', weatherRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'weather-service' });
});

app.listen(port, () => {
  console.log(`[Weather Service] running on port ${port}`);
});
