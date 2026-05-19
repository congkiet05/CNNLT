const express = require('express');
const router = express.Router();
const { suggestByWeather } = require('../controllers/weatherController');

router.get('/suggest', suggestByWeather);

module.exports = router;
