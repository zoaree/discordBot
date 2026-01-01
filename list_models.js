require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Unfortunately the Node SDK doesn't have a direct listModels method exposed easily on the client instance in some versions, 
    // but let's try to infer or use a known working one.
    // Actually, I'll just try 'gemini-pro' which is the old reliable one.
    // But wait, the error message said "Call ListModels".
    // Let's try raw fetch since SDK might hide it.

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        console.log('Available Models:');
        if (data.models) {
            data.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods})`));
        } else {
            console.log(data);
        }
    } catch (e) {
        console.error(e);
    }
}

listModels();
