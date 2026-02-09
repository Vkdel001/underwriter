require('dotenv').config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    console.log('Fetching available models...\n');
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error:', error);
      return;
    }

    const data = await response.json();
    
    console.log('Available models:');
    console.log('=================\n');
    
    if (data.models && data.models.length > 0) {
      data.models.forEach(model => {
        console.log(`Name: ${model.name}`);
        console.log(`Display Name: ${model.displayName}`);
        console.log(`Supported methods: ${model.supportedGenerationMethods?.join(', ')}`);
        console.log('---');
      });
      
      // Find models that support generateContent
      const contentModels = data.models.filter(m => 
        m.supportedGenerationMethods?.includes('generateContent')
      );
      
      console.log('\n\nModels supporting generateContent:');
      console.log('===================================');
      contentModels.forEach(m => {
        const modelId = m.name.replace('models/', '');
        console.log(`- ${modelId}`);
      });
    } else {
      console.log('No models found!');
    }
  } catch (error) {
    console.error('Error fetching models:', error.message);
  }
}

listModels();
