require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testAPI() {
  try {
    console.log('Testing Gemini API...');
    console.log('API Key:', process.env.GEMINI_API_KEY ? 'Set (hidden)' : 'NOT SET');
    
    // Try different model names
    const modelsToTry = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
      'models/gemini-1.5-flash',
      'models/gemini-1.5-pro'
    ];
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`\nTrying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say hello');
        const response = result.response;
        const text = response.text();
        console.log(`✓ SUCCESS with ${modelName}`);
        console.log(`Response: ${text.substring(0, 50)}...`);
        break;
      } catch (error) {
        console.log(`✗ Failed: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();
