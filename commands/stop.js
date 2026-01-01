const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');
const queueManager = require('../utils/queue');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Müziği durdurur ve kuyruğu temizler'),

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

        try {
            // Müziği durdur
            if (queue.player) {
                queue.player.stop();
            }

            // Bağlantıyı kes
            if (queue.connection) {
                queue.connection.destroy();
            }

            // Kuyruğu sil
            queueManager.deleteQueue(guildId);

            const embed = new EmbedBuilder()
                .setColor(config.colors.success)
                .setDescription(`${config.emojis.stop} Müzik durduruldu ve kuyruk temizlendi!`);

            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Stop komutu hatası:', error);

            const embed = new EmbedBuilder()
                .setColor(config.colors.error)
                .setDescription(`${config.emojis.error} Bir hata oluştu: ${error.message}`);

            return interaction.reply({ embeds: [embed] });
        }
    }
};
