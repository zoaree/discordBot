const { spawn } = require('child_process');
const {
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    NoSubscriberBehavior,
    joinVoiceChannel,
    VoiceConnectionStatus,
    entersState,
    StreamType
} = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const config = require('../config');

// Guild bazlı kuyruklar
const queues = new Map();

/**
 * Kuyruk al veya oluştur
 */
function getQueue(guildId) {
    if (!queues.has(guildId)) {
        queues.set(guildId, {
            songs: [],
            currentSong: null,
            connection: null,
            player: null,
            textChannel: null,
            voiceChannel: null,
            playing: false,
            volume: 100,
            loop: false,
            idleTimer: null,
            radioCategory: null,
            currentYtdlp: null,
            currentFfmpeg: null
        });
    }
    return queues.get(guildId);
}

function deleteQueue(guildId) {
    const queue = queues.get(guildId);
    if (queue) {
        if (queue.player) queue.player.stop();
        if (queue.connection) queue.connection.destroy();
        if (queue.currentYtdlp) {
            try {
                queue.currentYtdlp.kill('SIGKILL');
            } catch (e) {}
        }
        if (queue.currentFfmpeg) {
            try {
                queue.currentFfmpeg.kill('SIGKILL');
            } catch (e) {}
        }
    }
    queues.delete(guildId);
}

/**
 * yt-dlp ile şarkı bilgisi al
 */
async function getSongInfo(query) {
    return new Promise((resolve, reject) => {
        const isUrl = query.startsWith('http://') || query.startsWith('https://');
        const searchQuery = isUrl ? query : `ytsearch:${query}`;

        console.log(`[YT-DLP] Searching for: ${searchQuery}`);

        const ytdlp = spawn('yt-dlp', [
            searchQuery,
            '--dump-json',
            '--no-playlist',
            '--default-search', 'ytsearch',
            '-f', 'bestaudio/best',
            '--no-check-certificate',
            '--socket-timeout', '60',
            '--quiet',
            '--force-ipv4',
            '--ignore-config',
            '--extractor-args', 'youtube:player_client=web,android;player_skip=webpage',
            '--js-runtimes', 'deno',
            '--remote-components', 'ejs:github'
        ], { 
            timeout: 120000,
            env: {
                ...process.env,
                PATH: `${process.env.PATH}:/home/kadiroski/.deno/bin`,
                NODE_OPTIONS: '--no-warnings'
            }
        });

        let stdout = '';
        let stderr = '';

        ytdlp.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        ytdlp.stderr.on('data', (data) => {
            stderr += data.toString();
            // Only log actual errors, not warnings
            if (data.toString().toLowerCase().includes('error')) {
                console.log(`[YT-DLP] stderr: ${data.toString()}`);
            }
        });

        ytdlp.on('close', (code) => {
            console.log(`[YT-DLP] Process closed with code ${code}`);
            if (code !== 0 || !stdout.trim()) {
                console.error('yt-dlp stderr:', stderr);
                return reject(new Error('Şarkı bulunamadı'));
            }

            try {
                const info = JSON.parse(stdout.trim().split('\n')[0]);
                console.log(`[YT-DLP] Found song: ${info.title}`);
                resolve({
                    title: info.title || 'Bilinmeyen Şarkı',
                    url: info.webpage_url || info.url,
                    streamUrl: info.url,
                    duration: formatDuration(info.duration || 0),
                    thumbnail: info.thumbnail || null,
                    author: info.uploader || info.channel || 'Bilinmiyor'
                });
            } catch (e) {
                console.error('JSON parse hatası:', e);
                console.error('stdout:', stdout);
                reject(new Error('Şarkı bilgisi alınamadı'));
            }
        });

        ytdlp.on('error', (err) => {
            console.error('yt-dlp error:', err);
            reject(err);
        });
    });
}

/**
 * Süreyi formatla
 */
function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Ses kanalına bağlan
 */
async function connectToChannel(voiceChannel) {
    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        selfDeaf: true,
        selfMute: false
    });

    try {
        console.log('[Voice] Bağlanılıyor: Ses kanalı ID:', voiceChannel.id, 'Guild:', voiceChannel.guild.id);
        await entersState(connection, VoiceConnectionStatus.Ready, 300_000); // 5 dakika (daha uzun)
        console.log('[Voice] Bağlantı başarılı!');
        return connection;
    } catch (error) {
        console.error('[Voice] Bağlantı hatası:', error);
        try {
            connection.destroy();
        } catch (e) {}
        throw error;
    }
}

/**
 * Audio player oluştur
 */
function createPlayer() {
    return createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Play
        }
    });
}

/**
 * Şarkıyı çal - yt-dlp + ffmpeg pipeline
 */
async function playSong(guildId, song) {
    const queue = getQueue(guildId);

    // Önceki süreçleri temizle
    if (queue.currentYtdlp) {
        try {
            queue.currentYtdlp.kill('SIGKILL');
        } catch (e) {}
        queue.currentYtdlp = null;
    }
    if (queue.currentFfmpeg) {
        try {
            queue.currentFfmpeg.kill('SIGKILL');
        } catch (e) {}
        queue.currentFfmpeg = null;
    }

    if (!song) {
        if (queue.textChannel) {
            const embed = new EmbedBuilder()
                .setColor(config.colors.warning)
                .setDescription(`${config.emojis.music} Kuyruk bitti!`);
            queue.textChannel.send({ embeds: [embed] }).catch(() => { });
        }
        // Şarkı yoksa hemen silme, timer başlat (Idle eventi halledecek)
        return;
    }

    // Yeni şarkı geldi, varsa idle timer'ı iptal et
    if (queue.idleTimer) {
        clearTimeout(queue.idleTimer);
        queue.idleTimer = null;
    }

    try {
        // yt-dlp ile ses stream'i al ve ffmpeg'e pipe et
        const ytdlp = spawn('yt-dlp', [
            '-o', '-',
            '-f', 'bestaudio/best',
            '--no-playlist',
            '-q',
            '--no-check-certificate',
            '--socket-timeout', '60',
            '--force-ipv4',
            '--ignore-config',
            '--extractor-args', 'youtube:player_client=web,android;player_skip=webpage',
            '--js-runtimes', 'deno',
            '--remote-components', 'ejs:github',
            song.url
        ], {
            timeout: 120000,
            env: {
                ...process.env,
                PATH: `${process.env.PATH}:/home/kadiroski/.deno/bin`,
                NODE_OPTIONS: '--no-warnings'
            }
        });

        const ffmpeg = spawn('ffmpeg', [
            '-i', 'pipe:0',
            '-analyzeduration', '0',
            '-loglevel', '0',
            '-f', 's16le',
            '-ar', '48000',
            '-ac', '2',
            'pipe:1'
        ]);

        ytdlp.stdout.pipe(ffmpeg.stdin);

        ytdlp.stderr.on('data', (data) => {
            console.log(`[YT-DLP Playback] stderr: ${data.toString()}`);
        });

        ffmpeg.stderr.on('data', (data) => {
            console.log(`[FFMPEG] stderr: ${data.toString()}`);
        });

        const resource = createAudioResource(ffmpeg.stdout, {
            inputType: StreamType.Raw,
            inlineVolume: true
        });

        if (resource.volume) {
            resource.volume.setVolume(queue.volume / 100);
        }

        queue.player.play(resource);
        queue.currentSong = song;
        queue.playing = true;
        queue.currentYtdlp = ytdlp;
        queue.currentFfmpeg = ffmpeg;

        // Şarkı bilgisini gönder (Soundboard ise gönderme)
        if (!song.isSoundboard && queue.textChannel) {
            const requester = song.requestedBy ? song.requestedBy : null;
            const embed = new EmbedBuilder()
                .setColor(config.colors.music)
                .setAuthor({ name: '🎵 Şimdi Çalıyor', iconURL: requester?.displayAvatarURL?.() || null })
                .setTitle(song.title)
                .setURL(song.url)
                .setDescription(`${config.emojis.microphone} **${song.author}**`)
                .addFields(
                    { name: '⏱️ Süre', value: `\`${song.duration}\``, inline: true },
                    { name: `${config.emojis.headphones} İsteyen`, value: requester ? `<@${requester.id}>` : 'Bilinmiyor', inline: true }
                )
                .setThumbnail(song.thumbnail)
                .setTimestamp();

            queue.textChannel.send({ embeds: [embed] });
        }

        // Hata yakalama
        ytdlp.on('error', (err) => {
            console.error('yt-dlp hatası:', err);
        });

        ffmpeg.on('error', (err) => {
            console.error('ffmpeg hatası:', err);
        });

        // Stream hatalarını sessizce yakala (write EPIPE gibi)
        ytdlp.stdout.on('error', () => {});
        ffmpeg.stdin.on('error', () => {});
        ffmpeg.stdout.on('error', () => {});

    } catch (error) {
        console.error('Şarkı çalma hatası:', error);

        if (queue.textChannel) {
            const errorEmbed = new EmbedBuilder()
                .setColor(config.colors.error)
                .setDescription(`${config.emojis.error} Şarkı çalınırken hata: ${error.message}`);
            queue.textChannel.send({ embeds: [errorEmbed] });
        }

        // Sonraki şarkıya geç
        const nextSong = queue.songs.shift();
        await playSong(guildId, nextSong);
    }
}

/**
 * Player event'lerini ayarla
 */
function setupPlayerEvents(guildId) {
    const queue = getQueue(guildId);

    const radioSongs = require('./radio_songs');

    queue.player.on(AudioPlayerStatus.Idle, async () => {
        // Loop modunda çalan şarkıyı kuyruğun sonuna ekle
        if (queue.loop && queue.currentSong) {
            queue.songs.push(queue.currentSong);
        }

        const nextSong = queue.songs.shift();
        if (nextSong) {
            await playSong(guildId, nextSong);
        } else {
            // === RADYO MODU KONTROLÜ ===
            if (queue.radioCategory) {
                try {
                    // Kategori listesini al
                    let songList = [];
                    if (queue.radioCategory === 'karisik') {
                        // Tüm kategorileri birleştir
                        Object.values(radioSongs).forEach(list => songList.push(...list));
                    } else if (radioSongs[queue.radioCategory]) {
                        songList = radioSongs[queue.radioCategory];
                    }

                    if (songList.length > 0) {
                        // Rastgele şarkı seç
                        const randomSongName = songList[Math.floor(Math.random() * songList.length)];

                        // Bilgi mesajı güncellemesi için text kanalı kontrolü
                        // (Kullanıcıya spam yapmamak için sadece çalıyor embed'i playSong içinde gidiyor)

                        // Şarkı bilgisini al
                        const songInfo = await getSongInfo(randomSongName);
                        // Radyo botu tarafından istenmiş gibi göster
                        songInfo.requestedBy = {
                            id: 'radio',
                            username: 'Zoare Radyo',
                            displayAvatarURL: () => 'https://cdn-icons-png.flaticon.com/512/3083/3083417.png'
                        };

                        await playSong(guildId, songInfo);
                        return; // Fonksiyondan çık, bitti mesajı atma
                    }
                } catch (err) {
                    console.error('Radyo oto-çalma hatası:', err);
                }
            }

            queue.playing = false;
            queue.currentSong = null;
            queue.radioCategory = null; // Radyo bitti

            // Kuyruk bitti mesajı
            if (queue.textChannel) {
                const { EmbedBuilder } = require('discord.js');
                const config = require('../config');
                const embed = new EmbedBuilder()
                    .setColor(config.colors.warning)
                    .setDescription(`${config.emojis.music} **Kuyruk bitti!**\n\`!play\` veya \`!mix\` ile yeni şarkı ekle.`);
                queue.textChannel.send({ embeds: [embed] }).catch(() => { });

                // 2 Dakika (120000ms) Idle Timer başlat
                if (queue.idleTimer) clearTimeout(queue.idleTimer);

                queue.idleTimer = setTimeout(() => {
                    const currentQ = queues.get(guildId);
                    if (currentQ && currentQ.connection) {
                        if (currentQ.textChannel) {
                            const disconnectEmbed = new EmbedBuilder()
                                .setColor(config.colors.error)
                                .setDescription('💤 **2 dakikadır işlem yapılmadığı için ayrılıyorum.**');
                            currentQ.textChannel.send({ embeds: [disconnectEmbed] }).catch(() => { });
                        }
                        deleteQueue(guildId);
                    }
                }, 120000);
            }
        }
    });

    queue.player.on('error', (error) => {
        console.error('Player hatası:', error);
        // Hata durumunda radyo devam etsin (bir sonrakine geçsin)
        if (queue.radioCategory) {
            queue.player.stop(); // Idle tetikler, döngüye girer
        }
    });
}

module.exports = {
    getQueue,
    deleteQueue,
    getSongInfo,
    connectToChannel,
    createPlayer,
    playSong,
    setupPlayerEvents
};
