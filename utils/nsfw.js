const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Anime/Hentai yok. Sadece gerçek kategoriler.
const CATEGORIES = ['ass', 'boobs', 'pussy', 'thighs', 'feet', 'anal', 'blowjob', 'couple', 'gonewild', 'random', 'gif'];

/**
 * Belirtilen kategoriden rastgele bir gerçek GIF/Resim çeker
 * Öncelik her zaman GIF'tir.
 */
async function getNSFWImage(category = 'random') {
    try {
        if (!CATEGORIES.includes(category)) category = 'random';

        // Kategori Eşleştirme (Nekobot Types)
        const typeMap = {
            'ass': ['ass'],
            'boobs': ['boobs'],
            'pussy': ['pussy'],
            'thighs': ['thighs'],
            'feet': ['feet'], // Nekobot feet desteği sınırlı olabilir
            'anal': ['anal'],
            'blowjob': ['blowjob'], // Nekobot'ta varsa
            'gonewild': ['gonewild'],
            'couple': ['anal', 'gonewild', 'pussy'], // Couple için karışık (Anal/Gonewild genelde couple içerir)
            'random': ['ass', 'boobs', 'pussy', 'thighs', 'anal', 'gonewild', '4k'],
            'gif': ['ass', 'boobs', 'pussy', 'anal', 'gonewild']
        };

        // Kategoriye uygun tipleri al
        let possibleTypes = typeMap[category] || typeMap['random'];

        // GIF ZORLAMA DÖNGÜSÜ (Max 15 deneme)
        let lastResult = null;

        for (let i = 0; i < 15; i++) {
            // Her denemede rastgele bir alt tür seç
            const searchType = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];

            // API İsteği
            const searchUrl = `https://nekobot.xyz/api/image?type=${searchType}`;

            try {
                const response = await fetch(searchUrl);
                if (!response.ok) continue;

                const data = await response.json();
                if (data.success && data.message) {
                    const url = data.message;
                    const isGif = url.match(/\.(gif|mp4|webm)$/i);

                    const result = {
                        url: url,
                        title: `🔥 REAL ${category.toUpperCase()} ${isGif ? '(GIF)' : ''}`,
                        author: 'Nekobot API',
                        postLink: url
                    };

                    // Eğer GIF bulduysak DİREKT döndür (Hedefimiz bu!)
                    if (isGif) return result;

                    // GIF değilse, bunu yedekte tut (eğer 15 denemede hiç gif bulamazsak bunu atarız)
                    lastResult = result;
                }
            } catch (e) {
                // Hata olursa devam et
            }
        }

        // Eğer döngü bitti ve hiç GIF bulamadıysak, elimizdeki son resmi ver
        // Hiçbir şey bulamadıysak null döner
        return lastResult;

    } catch (error) {
        console.error('NSFW API Hatası:', error);
        return null;
    }
}

module.exports = {
    getNSFWImage,
    categories: CATEGORIES
};
