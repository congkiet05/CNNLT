const { getGeminiClient } = require('../config/gemini');

const GEMINI_MODEL = 'gemini-2.0-flash';

// Prompt chi tiết gửi kèm ảnh cho Gemini
const INGREDIENT_PROMPT = `Hãy đóng vai một chuyên gia ẩm thực. Nhìn vào bức ảnh này và liệt kê tất cả nguyên liệu nấu ăn bạn thấy.

BẮT BUỘC phải trả về kết quả dưới định dạng JSON sau, không giải thích gì thêm, không có markdown code block:
[{"ten_nguyen_lieu": "Cà chua", "so_luong": 2, "don_vi": "quả"}]

Quy tắc:
- Chỉ liệt kê nguyên liệu thực phẩm (rau, củ, quả, thịt, cá, gia vị, v.v.)
- Ước tính số lượng hợp lý nếu không rõ ràng
- Đơn vị phổ biến: quả, củ, lá, gram, kg, ml, lít, muỗng, chén, bó, miếng, con
- Nếu không nhận diện được nguyên liệu nào, trả về mảng rỗng: []`;

/**
 * Gộp và loại bỏ nguyên liệu trùng lặp từ nhiều ảnh.
 */
function mergeIngredients(lists) {
  const map = new Map();
  for (const list of lists) {
    for (const item of list) {
      const key = item.ten_nguyen_lieu.toLowerCase().trim();
      if (!map.has(key)) {
        map.set(key, item);
      }
    }
  }
  return Array.from(map.values());
}

/**
 * POST /api/ingredients/recognize
 * Multipart form-data: images[] (1-3 files)
 */
async function recognizeIngredients(req, res) {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng upload ít nhất 1 ảnh' });
    }

    // MOCK MODE: bật khi GEMINI_MOCK=true trong .env (dùng để test UI khi quota hết)
    if (process.env.GEMINI_MOCK === 'true') {
      return res.status(200).json({
        success: true,
        ingredients: [
          { ten_nguyen_lieu: 'Cà chua', so_luong: 2, don_vi: 'quả' },
          { ten_nguyen_lieu: 'Trứng gà', so_luong: 3, don_vi: 'quả' },
          { ten_nguyen_lieu: 'Hành lá', so_luong: 1, don_vi: 'bó' },
          { ten_nguyen_lieu: 'Tỏi', so_luong: 3, don_vi: 'tép' },
          { ten_nguyen_lieu: 'Thịt bò', so_luong: 200, don_vi: 'gram' },
        ],
        count: 5,
        mock: true,
      });
    }

    const ai = getGeminiClient();
    const allIngredientLists = [];

    // Xử lý từng ảnh
    for (const file of files) {
      const base64Data = file.buffer.toString('base64');

      const result = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            parts: [
              { text: INGREDIENT_PROMPT },
              {
                inlineData: {
                  mimeType: file.mimetype,
                  data: base64Data,
                },
              },
            ],
          },
        ],
      });

      const responseText = result.text?.trim() ?? '';

      // Parse JSON từ response
      let ingredients = [];
      try {
        const cleaned = responseText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        ingredients = JSON.parse(cleaned);

        if (!Array.isArray(ingredients)) ingredients = [];
        ingredients = ingredients.filter(
          (item) =>
            item &&
            typeof item.ten_nguyen_lieu === 'string' &&
            item.ten_nguyen_lieu.trim() !== ''
        );
      } catch (parseErr) {
        console.warn('[ingredientController] JSON parse error:', parseErr.message);
        ingredients = [];
      }

      allIngredientLists.push(ingredients);
    }

    // Gộp kết quả từ tất cả ảnh
    const merged = mergeIngredients(allIngredientLists);

    if (merged.length === 0) {
      return res.status(422).json({
        success: false,
        message: 'Không nhận diện được nguyên liệu từ ảnh. Vui lòng thử lại với ảnh rõ hơn',
      });
    }

    return res.status(200).json({
      success: true,
      ingredients: merged,
      count: merged.length,
    });
  } catch (err) {
    console.error('[recognizeIngredients]', err);

    if (err.message?.includes('GEMINI_API_KEY')) {
      return res.status(500).json({ success: false, message: 'Cấu hình AI chưa đúng' });
    }

    if (err.status === 429 || err.message?.includes('429') || err.message?.includes('quota')) {
      return res.status(429).json({
        success: false,
        message: 'AI đang quá tải, vui lòng thử lại sau vài giây',
      });
    }

    return res.status(500).json({ success: false, message: 'Lỗi server khi xử lý ảnh' });
  }
}

module.exports = { recognizeIngredients };
