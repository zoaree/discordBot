require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    console.log('Modeller Test Ediliyor...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const modelsToTest = [
        'gemini-1.5-flash',
        'gemini-1.5-flash-001',
        'gemini-1.5-flash-002',
        'gemini-1.5-flash-8b',
        'gemini-1.0-pro',
        'gemini-pro'
    ];

    for (const modelName of modelsToTest) {
        console.log(`\n--- Deneniyor: ${modelName} ---`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Tek kelimelik cevap ver: Merhaba');
            const response = await result.response;
            console.log(`✅ BAŞARILI: ${modelName} -> ${response.text().trim()}`);
        } catch (e) {
            let msg = e.message.split('\n')[0];
            if (msg.includes('404')) msg = '404 BULUNAMADI';
            if (msg.includes('429')) msg = '429 RATE LIMIT (Kotanız doldu)';
            console.log(`❌ HATA: ${modelName} -> ${msg}`);
        }
    }
}

listModels();
