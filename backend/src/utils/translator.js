const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function translateToLanguage(text, targetLangCode) {
  if (!text || targetLangCode === 'en-IN' || targetLangCode === 'en') return text;
  
  const langMap = {
    'te-IN': 'Telugu',
    'hi-IN': 'Hindi',
    'mr-IN': 'Marathi'
  };
  const targetLanguage = langMap[targetLangCode] || 'English';
  
  if (targetLanguage === 'English') return text;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: `Translate the following agricultural text into ${targetLanguage}. 
Keep technical terms or scientific names accurate.
Do NOT add any extra conversational text, just output the pure translation.

Text:
${text}`
    });
    return response.text.trim();
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Fallback to original
  }
}

async function translateObject(obj, targetLangCode) {
  if (!obj || typeof obj !== 'object' || targetLangCode === 'en-IN' || targetLangCode === 'en') return obj;

  const langMap = {
    'te-IN': 'Telugu',
    'hi-IN': 'Hindi',
    'mr-IN': 'Marathi'
  };
  const targetLanguage = langMap[targetLangCode] || 'English';
  if (targetLanguage === 'English') return obj;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: `Translate the string values in the following JSON object to ${targetLanguage}. 
Preserve the exact JSON structure and keys. 
Only translate the text meant for the user (like messages, descriptions, symptoms, recommendations).
Do not translate the status codes, crop types, icons, or numerical values.
Keep technical terms or scientific names accurate. 
Output ONLY valid JSON.

JSON:
${JSON.stringify(obj)}`
    });

    const translatedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(translatedText);
  } catch (error) {
    console.error('Object translation error:', error);
    return obj; // Fallback to original
  }
}

module.exports = { translateToLanguage, translateObject };
