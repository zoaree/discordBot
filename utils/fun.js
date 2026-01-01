const { EmbedBuilder } = require('discord.js');
const ai = require('./ai');

async function handleRoast(message, targetUser) {
    if (!targetUser) return message.reply('Kimi gömmemi istersin? Birini etiketle! (Örn: !roast @Ali)');

    const msg = await message.reply('🔥 **Laf hazırlanıyor...**');
    try {
        const roast = await ai.generateRoast(targetUser.displayName);

        const embed = new EmbedBuilder()
            .setColor('#ff4500')
            .setTitle('🔥 ROAST 🔥')
            .setDescription(`${targetUser} ${roast}`)
            .setFooter({ text: 'Acıdı mı? 😎' });

        await msg.edit({ content: null, embeds: [embed] });
    } catch (e) {
        console.error(e);
        await msg.edit('Hata oluştu, laf sokamadım.');
    }
}

async function handleCompliment(message, targetUser) {
    if (!targetUser) return message.reply('Kimi övmemi istersin? Birini etiketle!');

    const msg = await message.reply('✨ **İlham geliyor...**');
    try {
        const compliment = await ai.generateCompliment(targetUser.displayName);

        const embed = new EmbedBuilder()
            .setColor('#e6e6fa') // Lavender
            .setTitle('✨ ÖVGÜ ✨')
            .setDescription(`${targetUser} ${compliment}`)
            .setFooter({ text: 'Şımardın mı? 😉' });

        await msg.edit({ content: null, embeds: [embed] });
    } catch (e) {
        console.error(e);
        await msg.edit('Sözler boğazımda düğümlendi...');
    }
}

async function handleTruthOrDare(message, type) {
    const msg = await message.reply('🎲 **Zarlar atılıyor...**');
    try {
        const content = await ai.generateTruthOrDare(type);

        const embed = new EmbedBuilder()
            .setColor(type === 'truth' ? '#00bfff' : '#ff0000') // Mavi (Truth) - Kırmızı (Dare)
            .setTitle(type === 'truth' ? '😇 DOĞRULUK' : '😈 CESARET')
            .setDescription(content)
            .setFooter({ text: 'Yapamazsan cezalısın!' });

        await msg.edit({ content: null, embeds: [embed] });
    } catch (e) {
        console.error(e);
        await msg.edit('Aklıma bir şey gelmedi.');
    }
}

async function handleShip(message, user1, user2) {
    if (!user1 || !user2) return message.reply('İki kişiyi etiketlemelisin! (Örn: !ship @Ali @Ayşe)');

    const msg = await message.reply('❤️ **Aşk metre çalışıyor...**');
    try {
        const result = await ai.calculateShip(user1.displayName, user2.displayName);

        // Progress bar visual
        const filled = Math.round(result.score / 10);
        const bar = '💖'.repeat(filled) + '🖤'.repeat(10 - filled);

        const embed = new EmbedBuilder()
            .setColor('#ff69b4') // Hot pink
            .setTitle(`❤️ Aşk Uyumu: %${result.score}`)
            .setDescription(`**${user1}** ve **${user2}**\n\n${bar}\n\n*${result.comment}*`)
            .setFooter({ text: 'Aşkolik Aşk Analizi' });

        await msg.edit({ content: null, embeds: [embed] });
    } catch (e) {
        console.error(e);
        await msg.edit('Hesaplayamadım, aşk çok karmaşık...');
    }
}

module.exports = {
    handleRoast,
    handleCompliment,
    handleTruthOrDare,
    handleShip
};
