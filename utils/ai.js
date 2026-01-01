const { GoogleGenerativeAI } = require('@google/generative-ai');

// AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    tools: [{ googleSearch: {} }]
});

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
{"mood_description":"kısa açıklama","songs":[{"artist":"X","title":"Y"},{"artist":"X","title":"Y"}]}`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // JSON'u parse et
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('JSON bulunamadı');
        }

        const data = JSON.parse(jsonMatch[0]);

        // Şarkıları arama formatına çevir
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

        // Rate limit hatası
        if (error.status === 429) {
            throw new Error('Çok fazla istek! 30 saniye sonra tekrar dene.');
        }

        // Model bulunamadı
        if (error.status === 404) {
            throw new Error('AI servisi geçici olarak kullanılamıyor.');
        }

        throw new Error('AI şarkı listesi oluşturulamadı. Tekrar dene.');
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
        const result = await model.generateContent(prompt);
        const response = await result.response;
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
    // Sanatçı ve başlık temizle
    const cleanArtist = artist.replace(/\s*-\s*Topic$/, '').trim();
    const cleanTitle = title
        .replace(/\(Official.*?\)/gi, '')
        .replace(/\[Official.*?\]/gi, '')
        .replace(/\(Lyrics.*?\)/gi, '')
        .replace(/\(Audio.*?\)/gi, '')
        .replace(/\(Video.*?\)/gi, '')
        .replace(/\(Clip.*?\)/gi, '')
        .replace(/HD|HQ|4K/gi, '')
        .trim();

    // 1. AI ile Google'da ara
    try {
        const prompt = `Google'da ARA: "${artist} - ${title} lyrics" veya "şarkı sözleri"
        
GÖREV:
Bulduğun şarkı sözlerini eksiksiz ve doğru bir şekilde yaz.

KURALLAR:
1. Sadece şarkı sözlerini yaz.
2. Başlık, giriş cümlesi veya yorum ekleme.
3. Eğer bulamazsan sadece "BULUNAMADI" yaz.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (text.length < 20 || text.includes('BULUNAMADI')) return null;

        return text;
    } catch (error) {
        console.error('Lyrics AI hatası:', error);
        return null;
    }
}

module.exports = {
    generateMixPlaylist,
    chat,
    getLyrics,

    // YENİ ÖZELLİKLER
    recommendMovie: async (genre) => {
        const prompt = `Bana ${genre ? `"${genre}" türünde` : 'rastgele'} 3 tane MÜKEMMEL film öner.
        Her film için:
        - Film Adı (Yıl)
        - IMDb Puanı
        - Neden İzlemeliyim? (Kısa, esprili ve ilgi çekici 1 cümle)
        
        Format:
        🎬 **Film Adı** (Yıl) - ⭐ Puan
        💭 *Yorum*
        `;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    },

    generateRoast: async (targetName) => {
        const prompt = `"${targetName}" adlı kişiye çok yaratıcı, komik ve biraz ağır bir laf sok (roast). Küfür etme ama can yakıcı olsun. Kısa olsun.`;
        const result = await model.generateContent(prompt);
        return (await result.response).text();
    },

    generateCompliment: async (targetName) => {
        const prompt = `"${targetName}" adlı kişiye çok yaratıcı, şiirsel ve abartılı bir övgü yap. Edebiyat parçala. Kısa olsun.`;
        const result = await model.generateContent(prompt);
        return (await result.response).text();
    },

    generateTruthOrDare: async (type) => {
        const prompt = type === 'truth'
            ? 'Zor, utanç verici ve komik bir DOĞRULUK (Truth) sorusu sor.'
            : 'Yapılması biraz cesaret isteyen, komik ve eğlenceli bir CESARET (Dare) görevi ver.';
        const result = await model.generateContent(prompt);
        return (await result.response).text();
    },

    calculateShip: async (name1, name2) => {
        const score = Math.floor(Math.random() * 101);
        const prompt = `İki kişi arasındaki aşk uyumu: %${score}.
        Kişiler: ${name1} ve ${name2}.
        Bu uyum oranına göre çok kısa, komik ve iğneleyici bir yorum yap.`;

        const result = await model.generateContent(prompt);
        return {
            score: score,
            comment: (await result.response).text()
        };
    }
};
