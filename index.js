process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('dotenv').config();
require('@snazzah/davey');
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
    ],
    rest: {
        retries: 5,
        timeout: 120_000 // 2 dakika
    }
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

            // === RADYO ===
            case 'radyo':
            case 'radio':
                await handleRadio(message, args);
                break;

            // === SES & SOUNDBOARD ===
            case 's':
            case 'ses':
                await handleSoundboard(message, args);
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
                name: `🎤 __SOUNDBOARD (YENİ!)__`,
                value: '```yaml\n' +
                    '!s gora        : Bir Cisim Yaklaşıyor\n' +
                    '!s naber       : Aykut Elmas Naber\n' +
                    '!s recep       : Recep İvedik Böhöhöyt\n' +
                    '!s cay         : Çaylarrrrrr\n' +
                    '!s bruh        : Bruh Moment\n' +
                    '!s sad         : Sad Violin\n' +
                    '!s de <mesaj>  : Bot Türkçe konuşur\n' +
                    '!s <herhangi>  : "var dediler" gibi ara bulur!\n' +
                    '!s list        : Hepsini sırala\n' +
                    '```',
                inline: false
            },
            {
                name: `📻 __RADYO MODU (Sonsuz)__`,
                value: '```yaml\n' +
                    '!radyo arabesk : Damar & Baba Şarkılar\n' +
                    '!radyo ask     : Slow Aşk & Duygusal\n' +
                    '!radyo huzun   : Dertli & Hüzünlü\n' +
                    '!radyo pop     : Türkçe Pop Hit\n' +
                    '!radyo rock    : Türkçe Rock\n' +
                    '!radyo rap     : Türkçe Rap & Hip-Hop\n' +
                    '!radyo akustik : Sakin & Cover\n' +
                    '!radyo nostalji: 70-80-90lar Plak\n' +
                    '!radyo yabanci : Global Hit Songs\n' +
                    '!radyo party   : Hareketli & Kopmalık\n' +
                    '!radyo karisik : Ortaya Karışık Her Şey\n' +
                    '```',
                inline: false
            },
            {
                name: `🎮 __OYUNLAR__`,
                value: '```yaml\n' +
                    '!rulet @kurban : Rus Ruleti (Kaybeden atılır!)\n' +
                    '!sik           : Rulet tetiğini çeker\n' +
                    '!bilmece       : Zamana karşı yarışma\n' +
                    '```',
                inline: false
            },
            {
                name: `🎭 __EĞLENCE & AI__`,
                value: '```yaml\n' +
                    '!roast @kisi   : Kişiye laf sokar (AI)\n' +
                    '!öv @kisi      : Kişiyi över (AI)\n' +
                    '!ship @1 @2    : Aşk uyumu ölçer\n' +
                    '!film <tür>    : Film önerisi al\n' +
                    '!tod           : Doğruluk mu Cesaret mi?\n' +
                    '```',
                inline: false
            },
            {
                name: `🔞 __NSFW (GIF)__`,
                value: '```yaml\n' +
                    '!nsfw <kategori>: ass, boobs, couple, feet...\n' +
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

// === RADYO HANDLER ===
const radioSongs = require('./utils/radio_songs');

async function handleRadio(message, args) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
        return message.reply(`❌ **Hata:** Önce bir ses kanalına katılmalısın!`);
    }

    let category = args[0] ? args[0].toLowerCase() : null;
    const availableStations = Object.keys(radioSongs);

    // Kategori kontrolü
    if (!category || (!availableStations.includes(category) && category !== 'karisik' && category !== 'mix')) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.info)
            .setTitle('📻 Zoare Radyo İstasyonları')
            .setDescription('**Arşiv Modu Aktif:** Bot kendi dev arşivinden rastgele şarkılar çalar!\n\n' +
                availableStations.map(c => `• \`!radyo ${c}\``).join('\n') +
                '\n• `!radyo karisik` (Tüm arşivden rastgele)')
            .setFooter({ text: 'Sonsuz döngü! Durdurana kadar çalmaya devam eder.' });
        return message.reply({ embeds: [embed] });
    }

    try {
        let selectedSongName;
        let displayCategory;
        let targetList = [];

        // Karışık mod veya normal mod
        if (category === 'karisik' || category === 'mix') {
            displayCategory = 'KARIŞIK (Tüm Arşiv)';
            // Tüm şarkıları tek bir havuzda topla
            Object.values(radioSongs).forEach(list => targetList.push(...list));
            category = 'karisik'; // Queue için işaretle
        } else {
            displayCategory = category.toUpperCase();
            targetList = radioSongs[category];
        }

        // İlk şarkıyı seç
        selectedSongName = targetList[Math.floor(Math.random() * targetList.length)];

        await message.reply(`📻 **${displayCategory} Radyosu** frekansına bağlanılıyor...\n🎶 *İlk parça:* \`${selectedSongName}\``);

        // Şarkı bilgisini al
        const songInfo = await player.getSongInfo(selectedSongName);
        songInfo.requestedBy = {
            id: 'radio',
            username: 'Zoare Radyo',
            displayAvatarURL: () => 'https://cdn-icons-png.flaticon.com/512/3083/3083417.png'
        };

        // Kuyruğu al ve ayarla
        const queue = player.getQueue(message.guild.id);
        queue.textChannel = message.channel;
        queue.voiceChannel = voiceChannel;
        queue.radioCategory = category; // Radyo modunu aktif et (player.js bunu kontrol edecek)
        queue.loop = false; // Loop kapalı olmalı ki şarkı bitince next'e geçsin ve biz yenisini ekleyelim

        // Eğer başka bir şey çalıyorsa kuyruğu temizle (Radyo önceliklidir)
        if (queue.playing) {
            queue.songs = []; // Kuyruğu sil
            queue.player.stop(); // Mevcut şarkıyı durdur (Idle tetiklenir, radyo başlar)
        }

        // Şarkıyı kuyruğa ekle ve başlat
        queue.songs.push(songInfo);

        queue.connection = await player.connectToChannel(voiceChannel);
        queue.player = player.createPlayer();
        queue.connection.subscribe(queue.player);
        player.setupPlayerEvents(message.guild.id);
        await player.playSong(message.guild.id, queue.songs.shift());

    } catch (error) {
        console.error('Radyo hatası:', error);
        message.reply(`❌ Radyo frekansı yakalanamadı: ${error.message}`);
    }
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

        if (lyrics === 'LIMIT_EXCEEDED') {
            const embed = new EmbedBuilder()
                .setColor(config.colors.error)
                .setDescription(`${config.emojis.error} **Günlük AI Kotası Doldu!**\nGoogle Gemini 2.5 servisi şu an yanıt vermiyor (429 Too Many Requests).\nLütfen daha sonra tekrar dene.`);
            return loadingMsg.edit({ embeds: [embed] });
        }

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
                .setFooter({ text: `${song.author} • @zoare5 tarafından geliştirildi` })
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

    // Full sorguyu al (artık tek kelime değil)
    const requestQuery = args.join(' ');

    // Kategori listesi (Sadece 'list' veya 'help' yazarsa)
    if (!requestQuery || requestQuery === 'list' || requestQuery === 'help') {
        const embed = new EmbedBuilder()
            .setColor('#ff0066') // Özel sexy renk
            .setTitle('🔥 NSFW Komutları')
            .setDescription('İstediğin şeyi özgürce yazabilirsin! (Türkçe/İngilizce)')
            .addFields(
                { name: '🔍 Akıllı Arama', value: '`!nsfw lesbian kiss`, `!nsfw anal sex`, `!nsfw büyük popo`', inline: false },
                { name: '🎲 Karışık', value: '`!nsfw` (Sürpriz Karışık)', inline: false }
            )
            .setFooter({ text: 'Not: Eğer tam aradığını bulamazsam sana en yakın güzel şeyi getiririm! 😉' });
        return message.reply({ embeds: [embed] });
    }

    // Yükleniyor...
    const loadingMsg = await message.reply(`🔍 **"${requestQuery}" aranıyor tatlım...**`);

    try {
        // Full sorguyu gönder
        const image = await nsfw.getNSFWImage(requestQuery);

        if (!image) {
            await loadingMsg.edit('❌ **Üzgünüm, bu konuda hiçbir şey bulamadım!**');
            return;
        }

        const embed = new EmbedBuilder()
            .setColor('#ff0066')
            .setTitle(image.title)
            .setURL(image.postLink)
            .setFooter({ text: `Resource: ${image.author}` });

        // Eğer bir durum mesajı varsa (Random fallback vs)
        let contentStr = image.statusBox ? `${image.statusBox}\n` : '';

        // VIDEO/REDGIFS KONTROLÜ
        // Video linklerini embed içine değil, mesaja direkt yazmalıyız ki oynatıcı çıksın.
        const isVideo = image.url.includes('redgifs') || image.url.includes('.mp4') || image.url.includes('v.redd.it');

        if (isVideo) {
            // Videoyu mesaja ekle
            contentStr += `\n${image.url}`;
        } else {
            // Resim/GIF ise embed'e koy
            embed.setImage(image.url);
        }

        // Eğer video ise embed göndermeyelim (ya da minimal gönderelim), 
        // çünkü video zaten kocaman yer kaplayacak.
        // Ama başlık/author bilgisi için embed kalsın, sadece image olmasın.

        await loadingMsg.edit({ content: contentStr, embeds: [embed] });

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

const soundLib = require('./utils/sounds');

async function handleSoundboard(message, args) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
        return message.reply(`❌ **Ses kanalına girmen lazım baba!**`);
    }

    const command = args[0] ? args[0].toLowerCase() : null;

    // YARDIM MENÜSÜ
    if (!command || command === 'list' || command === 'help') {
        const soundList = Object.keys(soundLib.sounds).map(key => `\`${key}\`: ${soundLib.sounds[key].name}`).join('\n');

        const embed = new EmbedBuilder()
            .setColor('#00ff00') // Neon Yeşil
            .setTitle('🎤 Soundboard & Ses Efektleri')
            .setDescription('Anlık tepki vermek için kullan!\n\n**🗣️ Botu Konuştur:**\n`!s de Naber müdür` -> Bot "Naber müdür" der.\n\n**🔊 Hazır Sesler:**\n' + soundList)
            .setFooter({ text: 'Kullanım: !s <efekt> veya !s de <mesaj>' });
        return message.reply({ embeds: [embed] });
    }

    let audioUrl = null;
    let title = '';

    // TTS KONTROLÜ
    if (command === 'de' || command === 'say' || command === 'soyle') {
        const textToSay = args.slice(1).join(' ');
        if (!textToSay) return message.reply('❌ **Ne söyleyeyim baba?** `!s de Selam` gibi yaz.');

        audioUrl = soundLib.getTTSUrl(textToSay, 'tr');
        title = `🗣️ Söyleniyor: "${textToSay}"`;
    }
    // HAZIR SES KONTROLÜ
    else if (soundLib.sounds[command]) {
        audioUrl = soundLib.sounds[command].url;
        title = `🔊 Çalınıyor: ${soundLib.sounds[command].name}`;
    }
    // DİNAMİK ARAMA (Listede yoksa ara bul)
    else {
        // Komutun kendisi bir arama terimidir (örn: !s var dediler)
        const searchQuery = args.join(' ');

        // Kullanıcıya bilgi ver
        const searchMsg = await message.reply(`🔎 **"${searchQuery}" için kısa ses aranıyor...**`);

        try {
            const result = await soundLib.findDynamicSound(searchQuery);

            if (result && result.url) {
                audioUrl = result.url;
                title = `🔊 Bulundu: ${result.title}`;
                await searchMsg.delete().catch(() => { });
            } else {
                await searchMsg.edit('❌ **Kısa (12sn altı) bir ses bulunamadı!** Daha spesifik yazmayı dene.');
                return;
            }
        } catch (err) {
            console.error('Arama hatası:', err);
            await searchMsg.edit('❌ **Arama sırasında hata oluştu!**');
            return;
        }
    }

    try {
        // Player işlemleri
        const queue = player.getQueue(message.guild.id);

        // Eğer zaten bağlı değilse bağlan
        if (!queue.connection) {
            queue.textChannel = message.channel;
            queue.voiceChannel = voiceChannel;
            queue.connection = await player.connectToChannel(voiceChannel);
            queue.player = player.createPlayer();
            queue.connection.subscribe(queue.player);
            player.setupPlayerEvents(message.guild.id);
        }

        // Soundboard önceliklidir!
        const soundEffect = {
            title: title,
            url: audioUrl,
            duration: 'Efekt',
            thumbnail: 'https://cdn-icons-png.flaticon.com/512/3204/3204961.png',
            author: 'Soundboard',
            requestedBy: message.author,
            isSoundboard: true
        };

        // Şarkı listesinin BAŞINA ekle
        queue.songs.unshift(soundEffect);

        // Mevcut çalanı durdur (Idle olunca sıradaki çalacak)
        if (queue.playing) {
            queue.player.stop();
        } else {
            // Çalmıyorsa direkt başlat
            await player.playSong(message.guild.id, queue.songs.shift());
        }

        message.react('✅');

    } catch (error) {
        console.error('Soundboard hatası:', error);
        message.reply('❌ Ses çalınamadı!');
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
