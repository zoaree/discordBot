const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Anime/Hentai yok. Sadece gerçek kategoriler.
const CATEGORIES = ['ass', 'boobs', 'pussy', 'thighs', 'feet', 'anal', 'blowjob', 'couple', 'gonewild', 'random', 'gif'];

/**
 * Belirtilen kategoriden rastgele bir gerçek GIF/Resim çeker
 * Öncelik her zaman GIF'tir.
 */
async function getNSFWImage(query = '') {
    try {
        const lowerQuery = query.toLowerCase();
        let targetCategory = 'random';
        let foundMatch = false;

        // Kategori Eşleştirme (Nekobot Types) - Basit bir NLP benzeri arama
        const typeMap = {
            'ass': ['ass', 'pop', 'kalça', 'göt', 'booty', 'butt'],
            'boobs': ['boobs', 'tits', 'meme', 'göğüs', 'breast'],
            'pussy': ['pussy', 'am', 'vicik', 'vagina'],
            'thighs': ['thighs', 'bacak', 'kalın'],
            'feet': ['feet', 'ayak', 'foot'],
            'anal': ['anal', 'göt', 'arkadan'],
            'blowjob': ['blowjob', 'oral', 'sakso'],
            'gonewild': ['gonewild', 'çıplak', 'nude'],
            'couple': ['couple', 'sevgili', 'ikili', 'sex', 'fuck', 'sikiş', 'lesbian', 'lezyon', 'gay'] // Kullanıcı "gay with lesbian" dediği için lesbian'ı buraya map'liyoruz
        };

        // Sorgu içindeki kelimelere bakarak kategori bulmaya çalış
        if (query) {
            for (const [cat, keywords] of Object.entries(typeMap)) {
                if (keywords.some(k => lowerQuery.includes(k))) {
                    targetCategory = cat;
                    foundMatch = true;
                    break;
                }
            }
        }

        // API için alt türleri belirle
        const apiTypeMap = {
            'ass': ['ass'],
            'boobs': ['boobs'],
            'pussy': ['pussy'],
            'thighs': ['thighs'],
            'feet': ['feet'],
            'anal': ['anal'],
            'blowjob': ['blowjob'],
            'gonewild': ['gonewild'],
            'couple': ['anal', 'gonewild', 'pussy'], // Couple tam yoksa mix yap
            'random': ['ass', 'boobs', 'pussy', 'thighs', 'anal', 'gonewild', '4k']
        };

        let possibleTypes = apiTypeMap[targetCategory] || apiTypeMap['random'];

        // GIF ZORLAMA DÖNGÜSÜ (Max 15 deneme)
        let lastResult = null;

        for (let i = 0; i < 15; i++) {
            const searchType = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
            const searchUrl = `https://nekobot.xyz/api/image?type=${searchType}`;

            try {
                const response = await fetch(searchUrl);
                if (!response.ok) continue;

                const data = await response.json();
                if (data.success && data.message) {
                    const url = data.message;
                    const isGif = url.match(/\.(gif|mp4|webm)$/i);

                    // Eğer GIF değilse geç (Kullanıcı kesinlikle GIF istiyor)
                    if (!isGif) continue;

                    let titleText = `🔥 REAL ${searchType.toUpperCase()} (GIF)`;
                    let statusText = null;

                    // Eğer kullanıcı bir şey aradı ama biz bulamayıp random verdiysek
                    if (query && !foundMatch) {
                        statusText = `⚠️ **"${query}"** için GIF bulamadım, sana rastgele ateşli bir şey getirdim!`;
                    } else if (foundMatch) {
                        statusText = `✅ **"${query}"** isteğine uygun içerik bulundu!`;
                    }

                    return {
                        url: url,
                        title: titleText,
                        author: 'Nekobot API',
                        postLink: url,
                        statusBox: statusText
                    };
                }
            } catch (e) {
                // Hata
            }
        }

        return null;

    } catch (error) {
        console.error('NSFW API Hatası:', error);
        return null;
    }
}

module.exports = {
    getNSFWImage,
    categories: CATEGORIES
};
