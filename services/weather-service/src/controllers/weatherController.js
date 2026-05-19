const { getPool, sql } = require('../config/db');

// WMO Weather interpretation codes
function getWeatherCondition(code, temp) {
  // Mưa, bão, tuyết hoặc lạnh
  if ([51, 53, 55, 61, 63, 65, 71, 73, 75, 80, 81, 82, 95, 96, 99].includes(code) || temp < 22) {
    return {
      type: 'cold_rain',
      label: temp < 22 ? 'Trời có vẻ lạnh' : 'Trời đang mưa',
      message: 'Làm ngay một món nóng hổi, đậm đà để ấm bụng nhé!',
      keywords: ['canh', 'súp', 'kho', 'hầm', 'lẩu'],
      icon: temp < 22 ? '❄️' : '🌧️'
    };
  }
  
  // Nắng nóng
  if (temp > 30 || code === 0) {
    return {
      type: 'hot',
      label: 'Trời khá oi bức',
      message: 'Giải nhiệt với những món thanh mát, nhẹ nhàng nào!',
      keywords: ['gỏi', 'salad', 'cuốn', 'chè', 'hấp', 'tráng miệng'],
      icon: '☀️'
    };
  }

  // Mát mẻ, nhiều mây
  return {
    type: 'mild',
    label: 'Thời tiết mát mẻ',
    message: 'Thời tiết lý tưởng cho các món chiên xào hoặc nướng đậm vị!',
    keywords: ['xào', 'chiên', 'nướng', 'ram', 'rim'],
    icon: '⛅'
  };
}

async function suggestByWeather(req, res) {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ success: false, message: 'Thiếu tọa độ lat/lon' });
    }

    // Lấy thời tiết từ Open-Meteo (Miễn phí, không cần API Key)
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
    
    if (!weatherRes.ok) {
      throw new Error('Lỗi gọi API thời tiết');
    }

    const weatherData = await weatherRes.json();
    const current = weatherData.current_weather; // { temperature, weathercode }
    
    const condition = getWeatherCondition(current.weathercode, current.temperature);

    const pool = await getPool();
    
    // Tạo câu query linh động dựa trên keywords
    const likeConditions = condition.keywords
      .map((_, i) => `name LIKE @kw${i}`)
      .join(' OR ');

    const request = pool.request();
    condition.keywords.forEach((kw, i) => {
      request.input(`kw${i}`, sql.NVarChar(100), `%${kw}%`);
    });

    // Lấy random 4 món ăn phù hợp
    const result = await request.query(`
      SELECT TOP 4 id, name, cook_time, difficulty, image_url 
      FROM recipes 
      WHERE is_active = 1 AND (${likeConditions})
      ORDER BY NEWID()
    `);

    let recipes = result.recordset;

    // Fallback nếu không đủ món
    if (recipes.length < 4) {
      const fallback = await pool.request().query(`
        SELECT TOP ${4 - recipes.length} id, name, cook_time, difficulty, image_url 
        FROM recipes 
        WHERE is_active = 1 
        ORDER BY NEWID()
      `);
      recipes = [...recipes, ...fallback.recordset];
    }

    return res.status(200).json({
      success: true,
      weather: {
        temp: current.temperature,
        code: current.weathercode,
        condition: condition
      },
      recipes: recipes
    });

  } catch (error) {
    console.error('[suggestByWeather]', error);
    return res.status(500).json({ success: false, message: 'Lỗi xử lý thời tiết' });
  }
}

module.exports = { suggestByWeather };
