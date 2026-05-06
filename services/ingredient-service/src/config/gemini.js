const { GoogleGenAI } = require('@google/genai');

let client = null;

function getGeminiClient() {
  if (!client) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY chưa được cấu hình');
    }
    client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { apiVersion: 'v1' },
    });
  }
  return client;
}

module.exports = { getGeminiClient };
