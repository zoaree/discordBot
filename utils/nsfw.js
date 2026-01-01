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

        // Subreddit Haritası (Genişletilmiş ve GIF Odaklı)
        const subreddits = {
            'ass': ['ass', 'booty', 'pawg', 'BigAss', 'butt', 'BeautifulButts', 'booty_gifs', 'TheRearView', 'girlsinyogapants', 'asstastic'],
            'boobs': ['boobs', 'tits', 'BiggerThanYouThought', 'hugeboobs', 'titdrop', 'boobgifs', 'bigboobsgifs', 'TheHangingBoobs', 'titties'],
            'pussy': ['pussy', 'vagina', 'godpussy', 'rearpussy', 'Innies', 'pussyjobs', 'pussygifs', 'grool'],
            'thighs': ['thighs', 'thickthighs', 'legs', 'thighhighs', 'stockings'],
            'feet': ['feet', 'FeetLoversHeaven', 'FootFetish', 'soles'],
            'anal': ['anal', 'anal_gifs', 'painal', 'AnalGW', 'analvids'],
            'blowjob': ['blowjob', 'oral', 'deepthroat', 'blowjobs', 'oral_gifs', 'throatpies'],
            'couple': ['gettingher', 'hardcoresex', 'Roughsex', 'Lesbian_Gifs', 'straight_girls', 'sex', 'nsfw_gifs'],
            'gif': ['NSFW_GIF', '60fpsporn', 'highqualitygifs', 'porn_gifs', 'adultgifs', 'creampie_gifs', 'cumsluts', 'FacialFun']
        };

        // Kategori Eşleştirme (Regex / Keyword)
        const keywordMap = {
            'ass': ['ass', 'pop', 'kalça', 'göt', 'booty', 'butt', 'twerk'],
            'boobs': ['boobs', 'tits', 'meme', 'göğüs', 'breast'],
            'pussy': ['pussy', 'am', 'vicik', 'vagina', 'pink'],
            'thighs': ['thighs', 'bacak', 'kalın'],
            'feet': ['feet', 'ayak', 'foot'],
            'anal': ['anal', 'göt', 'arkadan'],
            'blowjob': ['blowjob', 'oral', 'sakso', 'yut'],
            'couple': ['couple', 'sevgili', 'ikili', 'sex', 'fuck', 'sikiş', 'lesbian', 'lezyon', 'gay']
        };

        // Sorgu eşleştirme
        if (query) {
            for (const [cat, keywords] of Object.entries(keywordMap)) {
                if (keywords.some(k => lowerQuery.includes(k))) {
                    targetCategory = cat;
                    foundMatch = true;
                    break;
                }
            }
        }

        // STRATEJİ: HİBRİT YAKLAŞIM
        // 1. Önce Nekobot API dene (Kullanıcı isteği: "Eskiden çalışıyordu")
        // 2. Eğer oradan GIF çıkmazsa Reddit'e git (Sınırsız kaynak)

        // --- ADIM 1: NEKOBOT API ---
        const nekobotMap = {
            'ass': 'ass',
            'boobs': 'boobs',
            'pussy': 'pussy',
            'thighs': 'thighs',
            'anal': 'anal',
            'blowjob': 'blowjob',
            'feet': 'feet',
            'gonewild': 'gonewild',
            'gif': 'pgif', // Nekobot "pgif" type
            'random': 'pgif'
        };

        const nekoType = nekobotMap[targetCategory];

        if (nekoType) {
            try {
                const nekoUrl = `https://nekobot.xyz/api/image?type=${nekoType}`;
                console.log(`[NSFW DEBUG] Trying Nekobot API: ${nekoType}`);

                const nekoRes = await fetch(nekoUrl);
                if (nekoRes.ok) {
                    const nekoJson = await nekoRes.json();
                    if (nekoJson.success && nekoJson.message) {
                        const url = nekoJson.message;
                        // GIF Kontrolü
                        if (url.match(/\.(gif|mp4|webm)$/i)) {
                            console.log(`[NSFW DEBUG] Nekobot SUCCESS: ${url}`);
                            let statusText = null;
                            if (query && !foundMatch) {
                                statusText = `⚠️ **"${query}"** için bir şey bulamadım, sana Nekobot'tan **${nekoType}** GIF'i getirdim!`;
                            } else if (foundMatch) {
                                statusText = `✅ **"${query}"** (Nekobot API)`;
                            }
                            return {
                                url: url,
                                title: `🔥 Real ${nekoType.charAt(0).toUpperCase() + nekoType.slice(1)} (GIF)`,
                                author: 'Nekobot API',
                                postLink: url,
                                statusBox: statusText
                            };
                        } else {
                            console.log(`[NSFW DEBUG] Nekobot returned static image, falling back to Reddit...`);
                        }
                    }
                }
            } catch (nekoErr) {
                console.error('Nekobot Error:', nekoErr);
            }
        }


        // --- ADIM 2: REDDIT FALLBACK (Eski Sağlam Sistem) ---
        console.log(`[NSFW DEBUG] Falling back to Reddit Deep Shuffle...`);

        // RETRY MEKANİZMASI (Max 3 Deneme)
        for (let attempt = 0; attempt < 3; attempt++) {

            // Eğer kategori bulunamadıysa veya 'random' seçildiyse:
            if (targetCategory === 'random' || !subreddits[targetCategory]) {
                const keys = Object.keys(subreddits);
                targetCategory = keys[Math.floor(Math.random() * keys.length)];
            }

            // Seçilen kategoriden rastgele bir subreddit seç
            const possibleSubs = subreddits[targetCategory] || subreddits['gif'];
            const selectedSub = possibleSubs[Math.floor(Math.random() * possibleSubs.length)];

            // Çeşitlilik için Sıralama Tipi Seçimi (Rastgele)
            const sortTypes = ['hot', 'new', 'top', 'top', 'rising'];
            const selectedSort = sortTypes[Math.floor(Math.random() * sortTypes.length)];

            let timePeriod = '';
            if (selectedSort === 'top') {
                const periods = ['all', 'year', 'month', 'week'];
                const start = periods[Math.floor(Math.random() * periods.length)];
                timePeriod = `&t=${start}`;
            }

            console.log(`[NSFW DEBUG] Attempt ${attempt + 1}: Category: ${targetCategory}, Subreddit: ${selectedSub}, Sort: ${selectedSort}`);

            try {
                // Reddit JSON isteği
                const response = await fetch(`https://www.reddit.com/r/${selectedSub}/${selectedSort}.json?limit=100${timePeriod}`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });

                if (!response.ok) continue;

                const json = await response.json();

                if (!json.data || !json.data.children || json.data.children.length === 0) continue;

                // GIF/Video Filtreleme
                const candidates = json.data.children.map(post => ({
                    url: post.data.url_overridden_by_dest || post.data.url,
                    title: post.data.title,
                    author: `r/${selectedSub}`,
                    postLink: `https://reddit.com${post.data.permalink}`
                })).filter(item => {
                    const url = item.url;
                    return url && (
                        url.includes('redgifs.com') ||
                        url.includes('.gif') ||
                        url.includes('.mp4') ||
                        url.includes('v.redd.it')
                    );
                });

                if (candidates.length === 0) continue;

                // ÖNCELİK: .gif uzantılı dosyalar
                const pureGifs = candidates.filter(c => c.url.match(/\.gif(\?|$)/i));
                const others = candidates.filter(c => !c.url.match(/\.gif(\?|$)/i));

                let image = null;

                // 1. Sadece GIF varsa al
                if (pureGifs.length > 0) {
                    image = pureGifs[Math.floor(Math.random() * pureGifs.length)];
                    console.log(`[NSFW DEBUG] Found PURE GIF in attempt ${attempt + 1}`);
                }
                // 2. GIF yoksa ve son deneme değilse -> continue (başka sub dene)
                else if (attempt < 2) {
                    console.log(`[NSFW DEBUG] No GIF in ${selectedSub}, retrying...`);
                    continue;
                }
                // 3. Son deneme ve hala GIF yoksa -> Video al (mecburiyet)
                else if (others.length > 0) {
                    image = others[Math.floor(Math.random() * others.length)];

                    // URL Düzeltme (RedGifs v3 -> normal)
                    if (image.url.includes('v3.redgifs.com')) {
                        image.url = image.url.replace('v3.redgifs.com', 'redgifs.com');
                    }
                    console.log(`[NSFW DEBUG] Fallback to VIDEO in final attempt`);
                }

                if (!image) continue;

                // Sonuç bulundu, dön
                let statusText = null;
                if (query && !foundMatch) {
                    statusText = `⚠️ **"${query}"** için GIF bulamadım, sana rastgele **${selectedSub}** getirdim!`;
                } else if (foundMatch) {
                    statusText = `✅ **"${query}"** (r/${selectedSub})`;
                }

                return {
                    ...image,
                    statusBox: statusText
                };

            } catch (err) {
                console.error('NSFW Fetch Error:', err);
                continue;
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
