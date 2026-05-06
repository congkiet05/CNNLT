const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

function getGeminiClient() {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY chưa được cấu hình');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

/**
 * Lấy model Gemini multimodal (hỗ trợ ảnh + text)
 */
function getVisionModel() {
  return getGeminiClient().getGenerativeModel({ model: 'gemini-1.5-flash' });
}

module.exports = { getVisionModel };
