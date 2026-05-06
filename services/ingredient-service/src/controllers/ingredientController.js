const { getVisionModel } = require('../config/gemini');

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
 * Chuyển buffer ảnh sang định dạng Gemini yêu cầu (inlineData)
 */
function bufferToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType,
    },
  };
}

/**
 * Gộp và loại bỏ nguyên liệu trùng lặp từ nhiều ảnh.
 * So sánh tên không phân biệt hoa thường.
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

    const model = getVisionModel();
    const allIngredientLists = [];

    // Xử lý từng ảnh
    for (const file of files) {
      const imagePart = bufferToGenerativePart(file.buffer, file.mimetype);

      const result = await model.generateContent([INGREDIENT_PROMPT, imagePart]);
      const responseText = result.response.text().trim();

      // Parse JSON từ response
      let ingredients = [];
      try {
        // Loại bỏ markdown code block nếu model vẫn trả về
        const cleaned = responseText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        ingredients = JSON.parse(cleaned);

        // Validate cấu trúc
        if (!Array.isArray(ingredients)) {
          ingredients = [];
        }
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

    // Lỗi từ Gemini API
    if (err.message?.includes('API_KEY') || err.message?.includes('GEMINI_API_KEY')) {
      return res.status(500).json({ success: false, message: 'Cấu hình AI chưa đúng' });
    }

    return res.status(500).json({ success: false, message: 'Lỗi server khi xử lý ảnh' });
  }
}

module.exports = { recognizeIngredients };
