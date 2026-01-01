require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const config = require('./config');
const player = require('./utils/player');
const ai = require('./utils/ai');
const nsfw = require('./utils/nsfw');
const games = require('./utils/games');
const fun = require('./utils/fun');

// Prefix
const PREFIX = '!';

// Discord client oluştur
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Boş kanal kontrol timer'ları
const emptyChannelTimers = new Map();

// Bot hazır olduğunda
client.once('ready', (c) => {
    console.log('');
    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║         🎵 AŞKOLIK MÜZİK BOT 🎵               ║');
    console.log('╠═══════════════════════════════════════════════╣');
    console.log(`║  Bot: ${c.user.tag.padEnd(38)}║`);
    console.log(`║  Sunucu: ${c.guilds.cache.size} sunucuda aktif`.padEnd(47) + '║');
    console.log(`║  Prefix: ${PREFIX}`.padEnd(47) + '║');
    console.log(`║  Versiyon: ${config.bot.version}`.padEnd(47) + '║');
    console.log(`║  AI: Zoare AI Model`.padEnd(47) + '║');
    console.log('╚═══════════════════════════════════════════════╝');
    console.log('');

    // Bot durumu
    c.user.setActivity('!help | 🤖 AI Mix', { type: 2 });
});

// Ses kanalı değişikliklerini dinle (boş kanal kontrolü)
client.on('voiceStateUpdate', (oldState, newState) => {
    const guildId = oldState.guild.id || newState.guild.id;
    const queue = player.getQueue(guildId);

    if (!queue.connection) return;

    const voiceChannel = queue.voiceChannel;
    if (!voiceChannel) return;

    // Kanaldaki bot harici üye sayısı
    const members = voiceChannel.members.filter(m => !m.user.bot);

    if (members.size === 0) {
        // Kanal boşaldı - 30 dakika timer başlat
        if (!emptyChannelTimers.has(guildId)) {
            console.log(`[${guildId}] Kanal boş, 30 dakika sonra ayrılacak...`);

            const timer = setTimeout(() => {
                const q = player.getQueue(guildId);
                if (q.connection) {
                    if (q.textChannel) {
                        const embed = new EmbedBuilder()
                            .setColor(config.colors.warning)
                            .setDescription(`${config.emojis.warning} **30 dakikadır kimse yok!**\nKanaldan ayrılıyorum...`);
                        q.textChannel.send({ embeds: [embed] });
                    }
                    player.deleteQueue(guildId);
                }
                emptyChannelTimers.delete(guildId);
            }, 30 * 60 * 1000); // 30 dakika

            emptyChannelTimers.set(guildId, timer);
        }
    } else {
        // Biri katıldı - timer'ı iptal et
        if (emptyChannelTimers.has(guildId)) {
            clearTimeout(emptyChannelTimers.get(guildId));
            emptyChannelTimers.delete(guildId);
            console.log(`[${guildId}] Biri katıldı, timer iptal edildi.`);
        }
    }
});

// Mesajları dinle
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Bilmece Cevap Kontrolü (Prefixsiz çalışır)
    await games.checkRiddle(message);

    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    try {
        switch (command) {
            case 'help':
            case 'yardım':
            case 'h':
                await handleHelp(message);
                break;
            case 'play':
            case 'p':
            case 'çal':
                await handlePlay(message, args);
                break;
            case 'mix':
            case 'öneri':
            case 'mood':
            case 'ai':
                await handleMix(message, args);
                break;
            case 'stop':
            case 'dur':
            case 'leave':
            case 'disconnect':
            case 'dc':
                await handleStop(message);
                break;
            case 'skip':
            case 's':
            case 'atla':
            case 'next':
                await handleSkip(message);
                break;
            case 'queue':
            case 'q':
            case 'kuyruk':
            case 'sıra':
            case 'list':
                await handleQueue(message);
                break;
            case 'pause':
            case 'duraklat':
                await handlePause(message);
                break;
            case 'resume':
            case 'devam':
            case 'unpause':
                await handleResume(message);
                break;
            case 'nowplaying':
            case 'np':
            case 'şuan':
            case 'playing':
                await handleNowPlaying(message);
                break;
            case 'clear':
            case 'temizle':
                await handleClear(message);
                break;
            case 'loop':
            case 'tekrar':
            case 'repeat':
                await handleLoop(message);
                break;
            case 'söz':
            case 'soz':
            case 'lyrics':
                await handleLyrics(message);
                break;
            case 'nsfw':
            case '31':
            case 'porno':
                await handleNSFW(message, args);
                break;

            // === OYUNLAR ===
            case 'rulet':
            case 'roulette':
                const target = message.mentions.users.first() || message.author;
                await games.playRoulette(message, target);
                break;
            case 'sik':
            case 'tetik':
                await games.handleTrigger(message);
                break;
            case 'bilmece':
                await games.startRiddle(message);
                break;

            // === EĞLENCE & AI ===
            case 'film':
            case 'movie':
                await handleMovie(message, args);
                break;
            case 'roast':
            case 'gom':
            case 'göm':
                await fun.handleRoast(message, message.mentions.users.first());
                break;
            case 'ov':
            case 'öv':
            case 'compliment':
                await fun.handleCompliment(message, message.mentions.users.first());
                break;
            case 'tod':
            case 'cesaret':
                await fun.handleTruthOrDare(message, Math.random() > 0.5 ? 'truth' : 'dare');
                break;
            case 'ship':
            case 'ask':
                const users = message.mentions.users.first(2);
                if (users.length === 2) {
                    await fun.handleShip(message, users[0], users[1]);
                } else if (users.length === 1) {
                    await fun.handleShip(message, message.author, users[0]);
                } else {
                    message.reply('Kimi shipleyim? Etiketle!');
                }
                break;
        }
    } catch (error) {
        console.error('Komut hatası:', error);
        const embed = new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(`${config.emojis.error} **Hata!**\n\`\`\`${error.message}\`\`\``);
        await message.reply({ embeds: [embed] });
    }
});

// ==================== KOMUT FONKSİYONLARI ====================

async function handleHelp(message) {
    const embed = new EmbedBuilder()
        .setColor(config.colors.info)
        .setAuthor({
            name: '🎵 Aşkolik Müzik Bot',
            iconURL: client.user.displayAvatarURL()
        })
        .setTitle('📖 Komut Listesi')
        .setDescription(`Merhaba **${message.author.username}**! Ben AI destekli bir müzik botuyum.\nRuh haline göre şarkı önerebilirim!`)
        .addFields(
            {
                name: `${config.emojis.sparkles} __AI MİX (30 ŞARKI!)__`,
                value: '```fix\n' +
                    '!mix <ruh hali>  : AI ile mood\'a göre 30 şarkılık playlist\n' +
                    '```\n' +
                    '*Örnek: `!mix aşk acısı çekiyorum`*\n' +
                    '*Örnek: `!mix enerjik dans müzikleri`*\n' +
                    '*Örnek: `!mix hüzünlü yağmurlu gece`*',
                inline: false
            },
            {
                name: `${config.emojis.headphones} __MÜZİK KOMUTLARI__`,
                value: '```yaml\n' +
                    '!play <şarkı>  : Şarkı çalar veya kuyruğa ekler\n' +
                    '!stop          : Müziği durdurur & ayrılır\n' +
                    '!skip          : Sonraki şarkıya geçer\n' +
                    '!pause         : Müziği duraklatır\n' +
                    '!resume        : Müziği devam ettirir\n' +
                    '!loop          : Döngü modunu aç/kapat\n' +
                    '```',
                inline: false
            },
            {
                name: `${config.emojis.queue} __BİLGİ KOMUTLARI__`,
                value: '```yaml\n' +
                    '!queue         : Şarkı kuyruğunu gösterir\n' +
                    '!np            : Çalan şarkıyı gösterir\n' +
                    '!söz           : Şarkı sözleri linki\n' +
                    '!clear         : Kuyruğu temizler\n' +
                    '```',
                inline: false
            },
            {
                name: `${config.emojis.info} __BİLGİ__`,
                value: '• 30 dakika kimse yoksa otomatik ayrılır\n• AI Mix 50 şarkılık playlist oluşturur\n• `!loop` ile sonsuz döngü açabilirsin',
                inline: false
            }
        )
        .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
        .setFooter({
            text: `${config.bot.name} v${config.bot.version} • Powered by @zoare5`,
            iconURL: message.author.displayAvatarURL()
        })
        .setTimestamp();

    await message.reply({ embeds: [embed] });
}

async function handleMix(message, args) {
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(`${config.emojis.error} **Ses kanalına katıl!**\nÖnce bir ses kanalına katılman gerekiyor.`);
        return message.reply({ embeds: [embed] });
    }

    if (!args.length) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.warning)
            .setDescription(`${config.emojis.warning} **Ruh halini yaz!**\n\nÖrnekler:\n• \`!mix aşk acısı çekiyorum\`\n• \`!mix enerjik parti müzikleri\`\n• \`!mix huzurlu akustik\`\n• \`!mix 90lar nostalji\``);
        return message.reply({ embeds: [embed] });
    }

    const mood = args.join(' ');

    const loadingEmbed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setDescription(`${config.emojis.sparkles} **AI çalışıyor...**\n\`${mood}\` için playlist hazırlanıyor...`);
    const loadingMsg = await message.reply({ embeds: [loadingEmbed] });

    try {
        // AI'dan playlist al
        const playlist = await ai.generateMixPlaylist(mood, 10);

        const guildId = message.guild.id;
        const queue = player.getQueue(guildId);

        // Bot bağlı değilse bağlan
        if (!queue.connection) {
            const connection = await player.connectToChannel(voiceChannel);
            const audioPlayer = player.createPlayer();

            connection.subscribe(audioPlayer);
            queue.connection = connection;
            queue.player = audioPlayer;
            queue.textChannel = message.channel;
            queue.voiceChannel = voiceChannel;

            player.setupPlayerEvents(guildId);
        }

        // Playlist embed'i oluştur - sadece ilk 15 şarkıyı göster
        let songList = '';
        const songsToShow = Math.min(playlist.songs.length, 15);
        for (let i = 0; i < songsToShow; i++) {
            const song = playlist.songs[i];
            songList += `\`${i + 1}.\` **${song.artist}** - ${song.title}\n`;
        }
        if (playlist.songs.length > 15) {
            songList += `\n*...ve ${playlist.songs.length - 15} şarkı daha*`;
        }

        const playlistEmbed = new EmbedBuilder()
            .setColor(config.colors.music)
            .setAuthor({
                name: '🤖 AI Mix Playlist',
                iconURL: client.user.displayAvatarURL()
            })
            .setTitle(`${config.emojis.sparkles} ${playlist.moodDescription}`)
            .setDescription(`**"${mood}"** için hazırlandı!\n\n${songList}`)
            .addFields(
                { name: `${config.emojis.music} Şarkı`, value: `\`${playlist.songs.length} adet\``, inline: true },
                { name: `${config.emojis.headphones} DJ`, value: `${message.author}`, inline: true }
            )
            .setFooter({ text: '🎵 Tüm şarkılar bitince playlist sona erecek' })
            .setTimestamp();

        await loadingMsg.edit({ embeds: [playlistEmbed] });

        // İlk şarkıyı hemen al ve çalmaya başla
        const firstSongQuery = playlist.songs[0];
        try {
            const firstSongInfo = await player.getSongInfo(firstSongQuery.query);
            if (firstSongInfo) {
                firstSongInfo.requestedBy = message.author;
                firstSongInfo.aiGenerated = true;

                // İlk şarkıyı hemen çal
                if (!queue.playing) {
                    await player.playSong(guildId, firstSongInfo);
                }
            }
        } catch (e) {
            console.log(`İlk şarkı bulunamadı: ${firstSongQuery.query}`);
        }

        // Geri kalan şarkıları arka planda yükle
        const loadingSongsMsg = await message.channel.send(`⏳ **Kalan şarkılar yükleniyor...** (0/${playlist.songs.length - 1})`);

        let addedCount = 0;
        for (let i = 1; i < playlist.songs.length; i++) {
            const song = playlist.songs[i];
            try {
                const songInfo = await player.getSongInfo(song.query);
                if (songInfo) {
                    songInfo.requestedBy = message.author;
                    songInfo.aiGenerated = true;
                    queue.songs.push(songInfo);
                    addedCount++;

                    // Her 5 şarkıda bir güncelle
                    if (addedCount % 5 === 0) {
                        await loadingSongsMsg.edit(`⏳ **Şarkılar yükleniyor...** (${addedCount}/${playlist.songs.length - 1})`).catch(() => { });
                    }
                }
            } catch (e) {
                console.log(`Şarkı bulunamadı: ${song.query}`);
            }
        }

        // Yükleme mesajını güncelle
        const successEmbed = new EmbedBuilder()
            .setColor(config.colors.success)
            .setDescription(`${config.emojis.success} **${addedCount + 1} şarkı yüklendi!**`);
        await loadingSongsMsg.edit({ content: null, embeds: [successEmbed] }).catch(() => { });

    } catch (error) {
        console.error('Mix hatası:', error);
        const embed = new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(`${config.emojis.error} **AI Hatası!**\n\`${error.message}\``);
        return loadingMsg.edit({ embeds: [embed] });
    }
}

async function handlePlay(message, args) {
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(`${config.emojis.error} **Ses kanalına katıl!**\nÖnce bir ses kanalına katılman gerekiyor.`);
        return message.reply({ embeds: [embed] });
    }

    if (!args.length) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.warning)
            .setDescription(`${config.emojis.warning} **Şarkı adı gir!**\nÖrnek: \`!play tarkan şımarık\``);
        return message.reply({ embeds: [embed] });
    }

    const query = args.join(' ');

    const loadingEmbed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setDescription(`${config.emojis.search} **Aranıyor...**\n\`${query}\``);
    const loadingMsg = await message.reply({ embeds: [loadingEmbed] });

    try {
        const songInfo = await player.getSongInfo(query);

        if (!songInfo) {
            const embed = new EmbedBuilder()
                .setColor(config.colors.error)
                .setDescription(`${config.emojis.error} **Şarkı bulunamadı!**\nFarklı bir arama dene.`);
            return loadingMsg.edit({ embeds: [embed] });
        }

        songInfo.requestedBy = message.author;

        const guildId = message.guild.id;
        const queue = player.getQueue(guildId);

        if (!queue.connection) {
            const connection = await player.connectToChannel(voiceChannel);
            const audioPlayer = player.createPlayer();

            connection.subscribe(audioPlayer);
            queue.connection = connection;
            queue.player = audioPlayer;
            queue.textChannel = message.channel;
            queue.voiceChannel = voiceChannel;

            player.setupPlayerEvents(guildId);
        }

        queue.songs.push(songInfo);

        if (!queue.playing) {
            const firstSong = queue.songs.shift();
            await player.playSong(guildId, firstSong);

            const embed = new EmbedBuilder()
                .setColor(config.colors.success)
                .setDescription(`${config.emojis.success} **Bağlandım!** Şarkı çalmaya başlıyor...`);
            return loadingMsg.edit({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setColor(config.colors.queue)
                .setAuthor({ name: '📋 Kuyruğa Eklendi', iconURL: message.author.displayAvatarURL() })
                .setDescription(`**[${songInfo.title}](${songInfo.url})**`)
                .addFields(
                    { name: `${config.emojis.microphone} Kanal`, value: `\`${songInfo.author}\``, inline: true },
                    { name: `⏱️ Süre`, value: `\`${songInfo.duration}\``, inline: true },
                    { name: `#️⃣ Sıra`, value: `\`#${queue.songs.length}\``, inline: true }
                )
                .setThumbnail(songInfo.thumbnail)
                .setFooter({ text: `İsteyen: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
            return loadingMsg.edit({ embeds: [embed] });
        }

    } catch (error) {
        console.error('Play hatası:', error);
        const embed = new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(`${config.emojis.error} **Hata!**\n\`${error.message}\``);
        return loadingMsg.edit({ embeds: [embed] });
    }
}

async function handleStop(message) {
    const guildId = message.guild.id;
    const queue = player.getQueue(guildId);

    if (!queue.connection) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(`${config.emojis.error} **Çalan müzik yok!**`);
        return message.reply({ embeds: [embed] });
    }

    // Timer varsa iptal et
    if (emptyChannelTimers.has(guildId)) {
        clearTimeout(emptyChannelTimers.get(guildId));
        emptyChannelTimers.delete(guildId);
    }

    player.deleteQueue(guildId);

    const embed = new EmbedBuilder()
        .setColor(config.colors.error)
        .setDescription(`${config.emojis.stop} **Müzik durduruldu!**\nKuyruk temizlendi ve kanaldan ayrıldım.`);
    await message.reply({ embeds: [embed] });
}

async function handleSkip(message) {
    const guildId = message.guild.id;
    const queue = player.getQueue(guildId);

    if (!queue.currentSong) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(`${config.emojis.error} **Atlanacak şarkı yok!**`);
        return message.reply({ embeds: [embed] });
    }

    const skippedSong = queue.currentSong;

    if (queue.player) {
        queue.player.stop();
    }

    const embed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setDescription(`${config.emojis.skip} **Atlandı!**\n~~${skippedSong.title}~~`);
    await message.reply({ embeds: [embed] });
}

async function handleQueue(message) {
    const guildId = message.guild.id;
    const queue = player.getQueue(guildId);

    if (!queue.currentSong && queue.songs.length === 0) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.warning)
            .setDescription(`${config.emojis.queue} **Kuyruk boş!**\n\`!play <şarkı>\` veya \`!mix <ruh hali>\` ile ekle.`);
        return message.reply({ embeds: [embed] });
    }

    let description = '';

    if (queue.currentSong) {
        const song = queue.currentSong;
        const requester = song.requestedBy ? `<@${song.requestedBy.id}>` : 'Bilinmiyor';
        const aiTag = song.aiGenerated ? ' `🤖`' : '';
        description += `### ${config.emojis.disc} Şimdi Çalıyor${aiTag}\n`;
        description += `**[${song.title}](${song.url})**\n`;
        description += `\`${song.duration}\` • ${config.emojis.microphone} ${song.author} • ${config.emojis.headphones} ${requester}\n\n`;
    }

    if (queue.songs.length > 0) {
        description += `### ${config.emojis.queue} Sıradakiler\n`;
        const songsToShow = queue.songs.slice(0, 8);
        songsToShow.forEach((song, index) => {
            const requester = song.requestedBy ? song.requestedBy.username : '?';
            const aiTag = song.aiGenerated ? ' 🤖' : '';
            description += `\`${index + 1}.\` **${song.title}**${aiTag} \`${song.duration}\`\n`;
            description += `┗ ${config.emojis.microphone} ${song.author} • ${config.emojis.headphones} ${requester}\n`;
        });

        if (queue.songs.length > 8) {
            description += `\n*...ve ${queue.songs.length - 8} şarkı daha*`;
        }
    }

    // Loop durumu
    const loopStatus = queue.loop ? '🔄 Loop: Açık' : '';

    const embed = new EmbedBuilder()
        .setColor(config.colors.queue)
        .setAuthor({
            name: `${message.guild.name} - Müzik Kuyruğu`,
            iconURL: message.guild.iconURL()
        })
        .setDescription(description)
        .setFooter({
            text: `Toplam ${queue.songs.length + (queue.currentSong ? 1 : 0)} şarkı ${loopStatus}`,
            iconURL: client.user.displayAvatarURL()
        })
        .setTimestamp();

    await message.reply({ embeds: [embed] });
}

async function handlePause(message) {
    const guildId = message.guild.id;
    const queue = player.getQueue(guildId);

    if (!queue.player || !queue.playing) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(`${config.emojis.error} **Duraklatılacak şarkı yok!**`);
        return message.reply({ embeds: [embed] });
    }

    queue.player.pause();

    const embed = new EmbedBuilder()
        .setColor(config.colors.warning)
        .setDescription(`${config.emojis.pause} **Duraklatıldı!**\nDevam etmek için \`!resume\` yaz.`);
    await message.reply({ embeds: [embed] });
}

async function handleResume(message) {
    const guildId = message.guild.id;
    const queue = player.getQueue(guildId);

    if (!queue.player) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(`${config.emojis.error} **Devam ettirilecek şarkı yok!**`);
        return message.reply({ embeds: [embed] });
    }

    queue.player.unpause();

    const embed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setDescription(`${config.emojis.play} **Devam ediyor!**`);
    await message.reply({ embeds: [embed] });
}

async function handleNowPlaying(message) {
    const guildId = message.guild.id;
    const queue = player.getQueue(guildId);

    if (!queue.currentSong) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(`${config.emojis.error} **Çalan şarkı yok!**`);
        return message.reply({ embeds: [embed] });
    }

    const song = queue.currentSong;
    const requester = song.requestedBy ? song.requestedBy : message.author;
    const aiTag = song.aiGenerated ? '🤖 AI Mix' : '';

    const progress = '━━━━━━━━━━━━━━━🔘─────────────';

    const embed = new EmbedBuilder()
        .setColor(config.colors.music)
        .setAuthor({
            name: `🎵 Şimdi Çalıyor ${aiTag}`,
            iconURL: client.user.displayAvatarURL()
        })
        .setTitle(song.title)
        .setURL(song.url)
        .setDescription(`${progress}\n\`0:00 / ${song.duration}\``)
        .addFields(
            { name: `${config.emojis.microphone} Kanal`, value: `\`${song.author}\``, inline: true },
            { name: `⏱️ Süre`, value: `\`${song.duration}\``, inline: true },
            { name: `${config.emojis.headphones} İsteyen`, value: `${requester}`, inline: true }
        )
        .setImage(song.thumbnail)
        .setFooter({
            text: `Sırada ${queue.songs.length} şarkı var ${queue.loop ? '• 🔄 Loop Açık' : ''}`,
            iconURL: requester.displayAvatarURL ? requester.displayAvatarURL() : null
        })
        .setTimestamp();

    await message.reply({ embeds: [embed] });
}

async function handleClear(message) {
    const guildId = message.guild.id;
    const queue = player.getQueue(guildId);

    if (queue.songs.length === 0) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.warning)
            .setDescription(`${config.emojis.warning} **Kuyruk zaten boş!**`);
        return message.reply({ embeds: [embed] });
    }

    const count = queue.songs.length;
    queue.songs = [];

    const embed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setDescription(`${config.emojis.success} **Kuyruk temizlendi!**\n${count} şarkı silindi.`);
    await message.reply({ embeds: [embed] });
}

async function handleLoop(message) {
    const guildId = message.guild.id;
    const queue = player.getQueue(guildId);

    if (!queue.connection) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(`${config.emojis.error} **Çalan müzik yok!**`);
        return message.reply({ embeds: [embed] });
    }

    queue.loop = !queue.loop;

    const embed = new EmbedBuilder()
        .setColor(queue.loop ? config.colors.success : config.colors.warning)
        .setDescription(queue.loop
            ? `${config.emojis.repeat} **Döngü açıldı!**\nŞarkılar sürekli çalmaya devam edecek.`
            : `${config.emojis.repeat} **Döngü kapatıldı!**\nKuyruk bitince duracak.`);
    await message.reply({ embeds: [embed] });
}

async function handleLyrics(message) {
    const guildId = message.guild.id;
    const queue = player.getQueue(guildId);

    if (!queue.currentSong) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(`${config.emojis.error} **Çalan şarkı yok!**`);
        return message.reply({ embeds: [embed] });
    }

    const song = queue.currentSong;

    // Yükleniyor mesajı
    const loadingEmbed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setDescription(`${config.emojis.loading} **Şarkı sözleri aranıyor...**\n${song.title}`);
    const loadingMsg = await message.reply({ embeds: [loadingEmbed] });

    try {
        // AI'dan şarkı sözlerini al
        const lyrics = await ai.getLyrics(song.author, song.title);

        if (lyrics && !lyrics.includes('bulamadım')) {
            // Sözler çok uzunsa böl
            const maxLength = 4000;
            let lyricsText = lyrics.substring(0, maxLength);
            if (lyrics.length > maxLength) {
                lyricsText += '\n\n*...devamı için Google\'da ara*';
            }

            const embed = new EmbedBuilder()
                .setColor(config.colors.info)
                .setAuthor({ name: '📝 Şarkı Sözleri', iconURL: client.user.displayAvatarURL() })
                .setTitle(song.title)
                .setDescription(lyricsText)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `${song.author} • AI tarafından getirildi` })
                .setTimestamp();

            await loadingMsg.edit({ embeds: [embed] });
        } else {
            // Hiçbir şekilde bulunamadıysa link ver
            const searchQuery = encodeURIComponent(`${song.title} şarkı sözleri`);
            const embed = new EmbedBuilder()
                .setColor(config.colors.warning)
                .setAuthor({ name: '📝 Şarkı Sözleri', iconURL: client.user.displayAvatarURL() })
                .setTitle(song.title)
                .setDescription(`**${song.author}**\n\nMaalesef bu şarkının sözlerini bulamadım. Aşağıdaki linklerden bakabilirsin:`)
                .addFields(
                    {
                        name: '🔗 Arama Linkleri',
                        value: `[Google](https://www.google.com/search?q=${searchQuery})\n[Genius](https://genius.com/search?q=${encodeURIComponent(song.title)})`,
                        inline: false
                    }
                )
                .setThumbnail(song.thumbnail)
                .setTimestamp();

            await loadingMsg.edit({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Lyrics hatası:', error);
        const embed = new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(`${config.emojis.error} **Şarkı sözleri alınamadı!**`);
        await loadingMsg.edit({ embeds: [embed] });
    }
}

async function handleNSFW(message, args) {
    // Kanal NSFW mi kontrol et
    if (!message.channel.nsfw) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.error)
            .setTitle('🔞 Hata: Yanlış Kanal')
            .setDescription('Bu komut sadece **NSFW (Age-Restricted)** olarak işaretlenmiş kanallarda kullanılabilir!\n\n*Lütfen ayarlardan kanalın NSFW özelliğini açın veya NSFW odasına gidin.*')
            .setImage('https://media1.tenor.com/m/x8v1oNUOmg4AAAAd/rickroll-roll.gif');
        return message.reply({ embeds: [embed] });
    }

    const requestedCategory = args[0] ? args[0].toLowerCase() : null;

    // Kategori listesi
    if (!requestedCategory || requestedCategory === 'list' || requestedCategory === 'help') {
        const embed = new EmbedBuilder()
            .setColor('#ff0066') // Özel sexy renk
            .setTitle('🔥 NSFW Komutları')
            .setDescription('İstediğin kategoriyi seç yavrum:')
            .addFields(
                { name: '🍑 Vücut', value: '`ass`, `boobs`, `thighs`, `feet`, `pussy`, `anal`', inline: true },
                { name: '🔞 Özel', value: '`blowjob`, `couple`, `gif` (Hepsi GIF)', inline: true },
                { name: '🎲 Karışık', value: '`random` (Sürpriz)', inline: true }
            )
            .setFooter({ text: 'Kullanım: !nsfw <kategori> | GIF önceliklidir!' });
        return message.reply({ embeds: [embed] });
    }

    // Yükleniyor...
    const loadingMsg = await message.reply('🔍 **Arıyorum tatlım...**');

    try {
        const image = await nsfw.getNSFWImage(requestedCategory);

        if (!image) {
            await loadingMsg.edit('❌ **Üzgünüm, bu kategoride bir şey bulamadım veya Reddit hata verdi.**');
            return;
        }

        const embed = new EmbedBuilder()
            .setColor('#ff0066')
            .setTitle(image.title || '🔥 Hot Image')
            .setURL(image.postLink)
            .setImage(image.url)
            .setFooter({ text: `Kategori: ${requestedCategory} • yazar: ${image.author}` });

        await loadingMsg.edit({ content: null, embeds: [embed] });

    } catch (error) {
        console.error('NSFW Error:', error);
        await loadingMsg.edit('❌ **Bir hata oluştu aşkım!**');
    }
}

async function handleMovie(message, args) {
    const genre = args.join(' ');
    const msg = await message.reply(`🍿 **${genre ? genre + ' türünde ' : ''}film aranıyor...**`);

    try {
        const recommendations = await ai.recommendMovie(genre);

        const embed = new EmbedBuilder()
            .setColor('#ffd700') // Gold
            .setTitle('🎬 AI Film Önerileri')
            .setDescription(recommendations)
            .setFooter({ text: 'İyi seyirler patron! 🍿' });

        await msg.edit({ content: null, embeds: [embed] });
    } catch (error) {
        console.error('Film AI Hatası:', error);
        await msg.edit('❌ **Film önerisi alırken bir hata oluştu!**');
    }
}

// Botu başlat
client.login(process.env.DISCORD_TOKEN)
    .then(() => {
        console.log('🔗 Discord\'a bağlanılıyor...');
    })
    .catch((error) => {
        console.error('❌ Discord\'a bağlanılamadı:', error);
        process.exit(1);
    });

// Hata yakalama
process.on('unhandledRejection', (error) => {
    console.error('İşlenmemiş Promise hatası:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Yakalanmamış hata:', error);
});
