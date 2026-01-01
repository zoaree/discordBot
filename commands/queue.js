const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');
const queueManager = require('../utils/queue');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Şarkı kuyruğunu gösterir'),

    async execute(interaction) {
        const guildId = interaction.guild.id;

        // Kuyruk var mı kontrol et
        if (!queueManager.hasQueue(guildId)) {
            const embed = new EmbedBuilder()
                .setColor(config.colors.error)
                .setDescription(`${config.emojis.error} Şu anda çalan bir müzik yok!`);

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const queue = queueManager.getQueue(guildId);

        if (!queue.currentSong && queue.songs.length === 0) {
            const embed = new EmbedBuilder()
                .setColor(config.colors.error)
                .setDescription(`${config.emojis.error} Kuyruk boş!`);

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        try {
            let description = '';

            // Şu an çalan şarkı
            if (queue.currentSong) {
                description += `**${config.emojis.play} Şimdi Çalıyor:**\n`;
                description += `[${queue.currentSong.title}](${queue.currentSong.url}) - \`${queue.currentSong.duration}\`\n\n`;
            }

            // Kuyruk
            if (queue.songs.length > 0) {
                description += `**${config.emojis.queue} Sıradaki Şarkılar:**\n`;

                const songsToShow = queue.songs.slice(0, 10);
                songsToShow.forEach((song, index) => {
                    description += `\`${index + 1}.\` [${song.title}](${song.url}) - \`${song.duration}\`\n`;
                });

                if (queue.songs.length > 10) {
                    description += `\n...ve ${queue.songs.length - 10} şarkı daha`;
                }
            }

            const embed = new EmbedBuilder()
                .setColor(config.colors.primary)
                .setTitle(`${config.emojis.music} Müzik Kuyruğu`)
                .setDescription(description)
                .setFooter({ text: `Toplam ${queue.songs.length} şarkı sırada` })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Queue komutu hatası:', error);

            const embed = new EmbedBuilder()
                .setColor(config.colors.error)
                .setDescription(`${config.emojis.error} Bir hata oluştu: ${error.message}`);

            return interaction.reply({ embeds: [embed] });
        }
    }
};
