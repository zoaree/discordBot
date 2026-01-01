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
            loop: false
        });
    }
    return queues.get(guildId);
}

function deleteQueue(guildId) {
    const queue = queues.get(guildId);
    if (queue) {
        if (queue.player) queue.player.stop();
        if (queue.connection) queue.connection.destroy();
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

        const ytdlp = spawn('yt-dlp', [
            searchQuery,
            '--dump-json',
            '--no-playlist',
            '--default-search', 'ytsearch',
            '-f', 'bestaudio'
        ]);

        let stdout = '';
        let stderr = '';

        ytdlp.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        ytdlp.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        ytdlp.on('close', (code) => {
            if (code !== 0 || !stdout.trim()) {
                console.error('yt-dlp stderr:', stderr);
                return reject(new Error('Şarkı bulunamadı'));
            }

            try {
                const info = JSON.parse(stdout.trim().split('\n')[0]);
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
                reject(new Error('Şarkı bilgisi alınamadı'));
            }
        });

        ytdlp.on('error', (err) => {
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
        selfDeaf: true
    });

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
        return connection;
    } catch (error) {
        connection.destroy();
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

    if (!song) {
        if (queue.textChannel) {
            const embed = new EmbedBuilder()
                .setColor(config.colors.warning)
                .setDescription(`${config.emojis.music} Kuyruk bitti!`);
            queue.textChannel.send({ embeds: [embed] });
        }
        deleteQueue(guildId);
        return;
    }

    try {
        // yt-dlp ile ses stream'i al ve ffmpeg'e pipe et
        const ytdlp = spawn('yt-dlp', [
            '-o', '-',
            '-f', 'bestaudio',
            '--no-playlist',
            '-q',
            song.url
        ]);

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
            // Sessiz geç
        });

        ffmpeg.stderr.on('data', (data) => {
            // Sessiz geç  
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

        // Şarkı bilgisini gönder
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

        if (queue.textChannel) {
            queue.textChannel.send({ embeds: [embed] });
        }

        // Hata yakalama
        ytdlp.on('error', (err) => {
            console.error('yt-dlp hatası:', err);
        });

        ffmpeg.on('error', (err) => {
            console.error('ffmpeg hatası:', err);
        });

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

    queue.player.on(AudioPlayerStatus.Idle, async () => {
        // Loop modunda çalan şarkıyı kuyruğun sonuna ekle
        if (queue.loop && queue.currentSong) {
            queue.songs.push(queue.currentSong);
        }

        const nextSong = queue.songs.shift();
        if (nextSong) {
            await playSong(guildId, nextSong);
        } else {
            queue.playing = false;
            queue.currentSong = null;

            // Kuyruk bitti mesajı
            if (queue.textChannel) {
                const { EmbedBuilder } = require('discord.js');
                const config = require('../config');
                const embed = new EmbedBuilder()
                    .setColor(config.colors.warning)
                    .setDescription(`${config.emojis.music} **Kuyruk bitti!**\n\`!play\` veya \`!mix\` ile yeni şarkı ekle.`);
                queue.textChannel.send({ embeds: [embed] }).catch(() => { });
            }
        }
    });

    queue.player.on('error', (error) => {
        console.error('Player hatası:', error);
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
