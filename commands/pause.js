const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');
const config = require('../config');
const queueManager = require('../utils/queue');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Müziği duraklatır'),

    async execute(interaction) {
        const member = interaction.member;
        const voiceChannel = member.voice.channel;
        const guildId = interaction.guild.id;

        // Kullanıcı ses kanalında mı kontrol et
        if (!voiceChannel) {
            const embed = new EmbedBuilder()
                .setColor(config.colors.error)
                .setDescription(`${config.emojis.error} Önce bir ses kanalına katılmalısın!`);

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Kuyruk var mı kontrol et
        if (!queueManager.hasQueue(guildId)) {
            const embed = new EmbedBuilder()
                .setColor(config.colors.error)
                .setDescription(`${config.emojis.error} Şu anda çalan bir müzik yok!`);

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const queue = queueManager.getQueue(guildId);

        if (!queue.player || !queue.playing) {
            const embed = new EmbedBuilder()
                .setColor(config.colors.error)
                .setDescription(`${config.emojis.error} Duraklatılacak müzik yok!`);

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        try {
            // Müziği duraklat
            queue.player.pause();
            queueManager.setPlaying(guildId, false);

            const embed = new EmbedBuilder()
                .setColor(config.colors.warning)
                .setDescription(`${config.emojis.pause} Müzik duraklatıldı!`);

            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Pause komutu hatası:', error);

            const embed = new EmbedBuilder()
                .setColor(config.colors.error)
                .setDescription(`${config.emojis.error} Bir hata oluştu: ${error.message}`);

            return interaction.reply({ embeds: [embed] });
        }
    }
};
