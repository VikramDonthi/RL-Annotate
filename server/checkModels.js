require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function checkAvailableModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.error("❌ GEMINI_API_KEY is missing in your .env file!");
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.list();
    
    // Search the object for an array (the models list)
    let models = [];
    if (Array.isArray(response)) {
      models = response;
    } else {
      // Look for any key that holds an array
      const keyWithArray = Object.keys(response).find(k => Array.isArray(response[k]));
      if (keyWithArray) models = response[keyWithArray];
    }
    
    // Filter for Gemini models specifically
    const geminiModels = models.filter(m => m.name && m.name.toLowerCase().includes('gemini'));
    
    console.log(`\n✅ Found ${geminiModels.length} Gemini models:`);
    console.table(geminiModels.map(m => ({
      id: m.name,
      title: m.displayName || m.name,
      methods: m.supportedGenerationMethods?.join(', ') || 'N/A'
    })));
  } catch (error) {
    console.error("❌ Failed to fetch models:", error.message);
    if (error.status === 429) {
      console.error("💡 Tip: You are currently Rate Limited (429). Wait a few minutes and try again.");
    }
  }
}

checkAvailableModels();
