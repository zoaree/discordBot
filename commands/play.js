const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const config = require('../config');
const queue = require('../utils/queue');
const player = require('../utils/player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('YouTube\'dan müzik çalar')
        .addStringOption(option =>
            option.setName('şarkı')
                .setDescription('Şarkı adı veya YouTube linki')
                .setRequired(true)),

    async execute(interaction) {
        const query = interaction.options.getString('şarkı');
        const member = interaction.member;
        const voiceChannel = member.voice.channel;

        // Kullanıcı ses kanalında mı kontrol et
        if (!voiceChannel) {
            const embed = new EmbedBuilder()
                .setColor(config.colors.error)
                .setDescription(`${config.emojis.error} Önce bir ses kanalına katılmalısın!`);

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Bot izinlerini kontrol et
        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!permissions.has('Connect') || !permissions.has('Speak')) {
            const embed = new EmbedBuilder()
                .setColor(config.colors.error)
                .setDescription(`${config.emojis.error} Ses kanalına bağlanma veya konuşma iznim yok!`);

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        await interaction.deferReply();

        try {
            // Şarkı bilgisini al
            const songInfo = await player.getSongInfo(query);

            if (!songInfo) {
                const embed = new EmbedBuilder()
                    .setColor(config.colors.error)
                    .setDescription(`${config.emojis.error} Şarkı bulunamadı!`);

                return interaction.editReply({ embeds: [embed] });
            }

            const guildId = interaction.guild.id;
            const guildQueue = queue.getQueue(guildId);

            // Eğer bot zaten bağlı değilse bağlan
            if (!guildQueue.connection) {
                const connection = await player.connectToChannel(voiceChannel);
                const audioPlayer = player.createPlayer();

                connection.subscribe(audioPlayer);
                queue.setConnection(guildId, connection, audioPlayer);
                queue.setChannels(guildId, interaction.channel, voiceChannel);

                // Player event'lerini ayarla
                player.setupPlayerEvents(guildId, audioPlayer);

                // Bağlantı kopma event'i
                connection.on('stateChange', (oldState, newState) => {
                    if (newState.status === 'disconnected') {
                        queue.deleteQueue(guildId);
                    }
                });
            }

            // Şarkıyı kuyruğa ekle
            const position = queue.addSong(guildId, songInfo);

            // Eğer bu ilk şarkıysa çalmaya başla
            if (!guildQueue.playing && guildQueue.songs.length === 1) {
                const firstSong = queue.removeSong(guildId);
                await player.playSong(guildId, firstSong);

                const embed = new EmbedBuilder()
                    .setColor(config.colors.success)
                    .setDescription(`${config.emojis.success} Çalmaya başlıyor...`);

                return interaction.editReply({ embeds: [embed] });
            } else {
                // Kuyruğa eklendi
                const embed = new EmbedBuilder()
                    .setColor(config.colors.primary)
                    .setTitle(`${config.emojis.music} Kuyruğa Eklendi`)
                    .setDescription(`**[${songInfo.title}](${songInfo.url})**`)
                    .addFields(
                        { name: 'Kanal', value: songInfo.author, inline: true },
                        { name: 'Süre', value: songInfo.duration, inline: true },
                        { name: 'Sıra', value: `#${position}`, inline: true }
                    )
                    .setThumbnail(songInfo.thumbnail);

                return interaction.editReply({ embeds: [embed] });
            }

        } catch (error) {
            console.error('Play komutu hatası:', error);

            const embed = new EmbedBuilder()
                .setColor(config.colors.error)
                .setDescription(`${config.emojis.error} Bir hata oluştu: ${error.message}`);

            return interaction.editReply({ embeds: [embed] });
        }
    }
};
