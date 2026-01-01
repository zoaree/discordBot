module.exports = {
    // Ses Efektleri Kütüphanesi
    sounds: {
        // --- TÜRKÇE MİMLER ---
        'naber': {
            url: 'ytsearch1:aykut elmas naber müdür vine',
            name: '😎 Naber Müdür (Aykut Elmas)'
        },
        'recep': {
            url: 'ytsearch1:recep ivedik gülüşü böhöhöyt short',
            name: '🐻 Recep İvedik (Böhöhöyt)'
        },
        'gora': {
            url: 'ytsearch1:gora arif ışık bir cisim yaklaşıyor',
            name: '👽 Bir Cisim Yaklaşıyor'
        },
        'cay': {
            url: 'ytsearch1:çaycı hüseyin çaylar',
            name: '☕ Çaylarrrrrr'
        },
        'adana': {
            url: 'https://www.youtube.com/watch?v=k_a1Y2K3J4E', // Isyan Tetick - Adana Merkez (Official)
            name: '💣 Adana Merkez'
        },
        'beyin': {
            url: 'ytsearch1:beyin bedava nihat hatipoğlu',
            name: '🧠 Beyin Bedava'
        },
        'cendere': {
            url: 'ytsearch1:kurtlar vadisi cendere kısa',
            name: '🐺 Cendere (Kurtlar Vadisi)'
        },
        'yilan': {
            url: 'ytsearch1:çok sevdim yalan oldu yılan serdar kısa',
            name: '🐍 Çok Sevdim Yalan Oldu'
        },

        // --- GLOBAL MİMLER ---
        'bruh': {
            url: 'https://www.youtube.com/watch?v=2ZIpFizPTTE',
            name: '🗿 Bruh Moment'
        },
        'sad': {
            url: 'ytsearch1:sad violin sound effect short',
            name: '🎻 Sad Violin'
        },
        'cricket': {
            url: 'ytsearch1:cricket sound effect short',
            name: '🦗 Cırcır Böceği'
        },
        'thug': {
            url: 'ytsearch1:thug life song short',
            name: '😎 Thug Life'
        },
        'fbi': {
            url: 'ytsearch1:fbi open up sound effect short',
            name: '👮 FBI Open Up'
        },
        'coffin': {
            url: 'https://www.youtube.com/watch?v=kYv-WgWvW_8',
            name: '⚰️ Coffin Dance'
        },
        'run': {
            url: 'ytsearch1:run vine sound effect',
            name: '🏃 Run'
        },
        'wow': {
            url: 'ytsearch1:anime wow sound effect',
            name: '😲 Anime Wow'
        },
        'fail': {
            url: 'ytsearch1:spongebob fail sound effect',
            name: '❌ Fail (Spongebob)'
        },
        'horn': {
            url: 'ytsearch1:mlg airhorn sound effect',
            name: '📣 Airhorn'
        },
        'fart': {
            url: 'ytsearch1:fart reverb sound effect',
            name: '💨 Fart (Reverb)'
        },
        'alkis': {
            url: 'ytsearch1:applause sound effect short',
            name: '👏 Alkış'
        },
        'error': {
            url: 'ytsearch1:windows xp error sound',
            name: '💻 Windows Error'
        }
    },

    // Dinamik Arama (En çok izlenen ve kısa olanı bulur)
    findDynamicSound: async (query) => {
        const { spawn } = require('child_process');

        return new Promise((resolve, reject) => {
            // yt-dlp ile JSON dökümü al (--dump-json)
            // ytsearch10: 10 tane aday bul (En iyisini seçmek için havuzu arttırdık)
            // --match-filter "duration <= 12": Sadece 12 saniye altı

            const searchProcess = spawn('yt-dlp', [
                '--dump-json',
                '--match-filter', 'duration <= 12',
                '--no-playlist',
                '--no-warnings',
                `ytsearch10:${query}` // "short" veya "sound effect" eklemiyorum, bazen bozuyor. Direkt ne ararsa o.
            ]);

            let output = '';

            searchProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            searchProcess.on('close', (code) => {
                if (code === 0 && output.trim()) {
                    try {
                        // Çıktı her satırda bir JSON objesi şeklindedir
                        const distinctLines = output.trim().split('\n');
                        const results = [];

                        for (const line of distinctLines) {
                            try {
                                const json = JSON.parse(line);
                                results.push({
                                    url: json.webpage_url || json.url,
                                    title: json.title,
                                    view_count: json.view_count || 0,
                                    duration: json.duration
                                });
                            } catch (e) {
                                // JSON parse hatası olursa bu satırı geç
                            }
                        }

                        // Hiç sonuç yoksa
                        if (results.length === 0) {
                            resolve(null);
                            return;
                        }

                        // İZLENME SAYISINA GÖRE SIRALA (Büyükten küçüğe)
                        // Böylece en popüler (doğru) sonucu bulma ihtimalimiz artar.
                        results.sort((a, b) => b.view_count - a.view_count);

                        // En çok izleneni döndür
                        resolve(results[0]);

                    } catch (err) {
                        console.error('JSON Process Error:', err);
                        resolve(null);
                    }
                } else {
                    resolve(null);
                }
            });

            searchProcess.on('error', (err) => {
                console.error('Dynamic Sound Search Error:', err);
                resolve(null);
            });
        });
    },

    // TTS URL Oluşturucu (Google Translate)
    getTTSUrl: (text, lang = 'tr') => {
        // Metni URL için güvenli hale getir (max 200 karakter)
        const safeText = encodeURIComponent(text.slice(0, 200));
        return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${safeText}&tl=${lang}`;
    }
};
