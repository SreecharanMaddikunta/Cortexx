require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
(async () => {
    try {
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-3.5-flash-lite',
            contents: 'Say hi in 2 sentences, then output ---JSON--- then {"key": "value"}',
        });
        for await (const chunk of responseStream) {
            process.stdout.write(chunk.text);
        }
    } catch(e) {
        console.error(e);
    }
})();
