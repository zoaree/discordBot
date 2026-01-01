const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');
const queueManager = require('../utils/queue');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Duraklatılmış müziği devam ettirir'),

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

        if (!queue.player) {
            const embed = new EmbedBuilder()
                .setColor(config.colors.error)
                .setDescription(`${config.emojis.error} Devam ettirilecek müzik yok!`);

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (queue.playing) {
            const embed = new EmbedBuilder()
                .setColor(config.colors.warning)
                .setDescription(`${config.emojis.play} Müzik zaten çalıyor!`);

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        try {
            // Müziği devam ettir
            queue.player.unpause();
            queueManager.setPlaying(guildId, true);

            const embed = new EmbedBuilder()
                .setColor(config.colors.success)
                .setDescription(`${config.emojis.play} Müzik devam ediyor!`);

            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Resume komutu hatası:', error);

            const embed = new EmbedBuilder()
                .setColor(config.colors.error)
                .setDescription(`${config.emojis.error} Bir hata oluştu: ${error.message}`);

            return interaction.reply({ embeds: [embed] });
        }
    }
};
