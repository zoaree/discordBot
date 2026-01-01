const { GoogleGenerativeAI } = require('@google/generative-ai');

// AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    tools: [{ googleSearch: {} }]
});

// === RATE LIMITER (İstek Kuyruğu) ===
// Google Free Tier: Dakikada 15 istek (4 saniyede 1)
// Hata almamak için istekleri sıraya diziyoruz.
class RequestQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
        this.lastRequestTime = 0;
        this.minDelay = 4000; // 4 saniye bekleme
    }

    async add(task) {
        return new Promise((resolve, reject) => {
            this.queue.push({ task, resolve, reject });
            this.process();
        });
    }

    async process() {
        if (this.processing) return;
        if (this.queue.length === 0) return;

        this.processing = true;

        while (this.queue.length > 0) {
            const now = Date.now();
            const timeSinceLast = now - this.lastRequestTime;

            if (timeSinceLast < this.minDelay) {
                const waitTime = this.minDelay - timeSinceLast;
                await new Promise(r => setTimeout(r, waitTime));
            }

            const { task, resolve, reject } = this.queue.shift();

            try {
                this.lastRequestTime = Date.now();
                const result = await task();
                resolve(result);
            } catch (error) {
                // Rate Limit alırsak (429), ekstra bekle ve tekrar dene (1 kez)
                if (error.message.includes('429')) {
                    console.log('⚠️ Rate Limit (429)! 10sn bekleyip tekrar deneniyor...');
                    await new Promise(r => setTimeout(r, 10000));
                    try {
                        const retryResult = await task();
                        this.lastRequestTime = Date.now();
                        resolve(retryResult);
                    } catch (retryError) {
                        reject(retryError);
                    }
                } else {
                    reject(error);
                }
            }
        }

        this.processing = false;
    }
}

const aiQueue = new RequestQueue();

// Yardımcı fonksiyon: Kuyruğa istek ekle
async function queueRequest(prompt) {
    return aiQueue.add(async () => {
        const result = await model.generateContent(prompt);
        return await result.response;
    });
}

/**
 * Ruh haline göre şarkı listesi oluştur
 */
async function generateMixPlaylist(mood, count = 30) {
    const prompt = `Sen bir Türk müzik uzmanısın. Kullanıcının ruh hali: "${mood}"

TAM OLARAK ${count} adet Türkçe şarkı listesi oluştur. Daha az olamaz!
    - YouTube'da bulunabilir şarkılar
    - Farklı sanatçılardan seç (aynı sanatçıdan max 2)
    - Hem nostaljik hem güncel şarkılar karışık

HİÇBİR AÇIKLAMA YAZMA. SADECE JSON DÖNDÜR:
{ "mood_description": "kısa açıklama", "songs": [{ "artist": "X", "title": "Y" }, { "artist": "X", "title": "Y" }] }`;

    try {
        const response = await queueRequest(prompt);
        const text = response.text();

        // JSON'u parse et
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('JSON bulunamadı');

        const data = JSON.parse(jsonMatch[0]);

        const playlist = data.songs.map(song => ({
            query: `${song.artist} ${song.title}`,
            artist: song.artist,
            title: song.title
        }));

        return {
            moodDescription: data.mood_description,
            songs: playlist
        };
    } catch (error) {
        console.error('AI API hatası:', error);
        throw new Error('AI şu an meşgul, lütfen biraz bekle.');
    }
}

/**
 * Sohbet yanıtı oluştur
 */
async function chat(message) {
    const prompt = `Sen Aşkolik adında eğlenceli bir Discord müzik botusun. 
Kısa ve samimi cevaplar ver. Emoji kullan.
    Kullanıcı: ${message}`;

    try {
        const response = await queueRequest(prompt);
        return response.text();
    } catch (error) {
        console.error('AI chat hatası:', error);
        return null;
    }
}

/**
 * Şarkı sözlerini getir (API + AI Fallback)
 */
async function getLyrics(artist, title) {
    const cleanArtist = artist.replace(/\s*-\s*Topic$/, '').trim();
    const cleanTitle = title.replace(/\(Official.*?\)/gi, '').trim();

    try {
        const prompt = `Google Search Tool kullanarak şu şarkının sözlerini bul ve getir: "${cleanArtist} - ${cleanTitle}"
        
GÖREV: Bulduğun şarkı sözlerini eksiksiz aşağıya yaz.
- Link verme, direkt sözleri yaz.
- Kısa kesme, tamamını yaz.
- Başlık ekleme, sadece sözler.`;

        const response = await queueRequest(prompt);
        const text = response.text();

        if (text.length < 20 || text.includes('BULUNAMADI')) {
            console.log('[DEBUG] Text too short or has BULUNAMADI:', text);
            return null;
        }
        return text;
    } catch (error) {
        console.error('[DEBUG] getLyrics Exception:', error);
        return null;
    }
}


module.exports = {
    generateMixPlaylist,
    chat,
    getLyrics,

    // YENİ ÖZELLİKLER
    recommendMovie: async (genre) => {
        const prompt = `Bana ${genre ? `"${genre}" türünde` : 'rastgele'} 3 film öner. Format: 🎬 **İsim** (Yıl) - Yorum`;
        const response = await queueRequest(prompt);
        return response.text();
    },

    generateRoast: async (targetName) => {
        const prompt = `"${targetName}" kişisine komik, kısa, yaratıcı bir laf sok (roast).`;
        const response = await queueRequest(prompt);
        return response.text();
    },

    generateCompliment: async (targetName) => {
        const prompt = `"${targetName}" kişisine abartılı, şiirsel, komik bir övgü yap. Kısa olsun.`;
        const response = await queueRequest(prompt);
        return response.text();
    },

    generateTruthOrDare: async (type) => {
        const prompt = type === 'truth' ? 'Zor bir Doğruluk sorusu sor.' : 'Komik bir Cesaret görevi ver.';
        const response = await queueRequest(prompt);
        return response.text();
    },

    calculateShip: async (name1, name2) => {
        const score = Math.floor(Math.random() * 101);
        const prompt = `Aşk uyumu %${score}. ${name1} ve ${name2}. Kısa, komik yorum yap.`;

        const response = await queueRequest(prompt);
        return {
            score: score,
            comment: response.text()
        };
    }
};
