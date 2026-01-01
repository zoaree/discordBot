const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');
const queueManager = require('../utils/queue');
const player = require('../utils/player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Şarkıyı atlar ve sonraki şarkıya geçer'),

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

        if (!queue.currentSong) {
            const embed = new EmbedBuilder()
                .setColor(config.colors.error)
                .setDescription(`${config.emojis.error} Atlanacak şarkı yok!`);

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        try {
            const skippedSong = queue.currentSong;

            // Player'ı durdur (bu otomatik olarak sonraki şarkıya geçirecek)
            if (queue.player) {
                queue.player.stop();
            }

            const embed = new EmbedBuilder()
                .setColor(config.colors.success)
                .setDescription(`${config.emojis.skip} **${skippedSong.title}** atlandı!`);

            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Skip komutu hatası:', error);

            const embed = new EmbedBuilder()
                .setColor(config.colors.error)
                .setDescription(`${config.emojis.error} Bir hata oluştu: ${error.message}`);

            return interaction.reply({ embeds: [embed] });
        }
    }
};
