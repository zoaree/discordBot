const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Aktif Oyunlar
const riddleSessions = new Map();
const rouletteSessions = new Map();

const RIDDLES = [
    { q: 'Bilgi verir ağzı yok, her yeri görür gözü yok.', a: ['kitap', 'harita'], h: 'Okumak veya yön bulmakla ilgili.' },
    { q: 'Ben giderim o gider, arkamdan tın tın eder.', a: ['baston', 'gölge'], h: 'Yaşlıların kullandığı veya güneşte oluşan bir şey.' },
    { q: 'Çarşıdan aldım bir tane, eve geldim bin tane.', a: ['nar'], h: 'Kırmızı, taneli bir meyve.' },
    { q: 'Küçücük fıçıcık, içi dolu turşucuk.', a: ['limon'], h: 'Ekşi bir narenciye.' },
    { q: 'En çok kardeşi olan meyve hangisidir?', a: ['üzüm'], h: 'Salkım salkım olur.' },
    { q: 'Ateş olmayan yerde ne olmaz?', a: ['duman'], h: 'Yangın çıkınca gökyüzüne yükselir.' },
    { q: 'Hangi macun yenmez?', a: ['lahmacun'], h: 'Türk mutfağının sevilen bir yiyeceği.' },
    { q: 'Yolun altından gider, üstünden gider, ama hiç hareket etmez.', a: ['yol'], h: 'Arabaların gittiği yer.' },
    { q: 'Dışı var, içi yok; tekme yer, suçu yok.', a: ['top'], h: 'Futbol veya basketbol için gerekli.' },
    { q: 'Yer altında sakallı dede.', a: ['pırasa'], h: 'Soğana benzeyen bir sebze.' },
    { q: 'Kanadı var uçamaz, peteği var bal yapamaz.', a: ['araba', 'radyatör'], h: 'Isınmak veya ulaşım için.' },
    { q: 'Hiç bozulmayan şey nedir?', a: ['ad', 'isim'], h: 'Sahip olduğun ve herkesin kullandığı şey.' },
    { q: 'Bakınca görünür, bakmayınca kaybolur.', a: ['ayna'], h: 'Kendini gördüğün cisim.' },
    { q: 'Kuyruğu var at değil, kanadı var kuş değil.', a: ['balık'], h: 'Suda yaşar.' },
    { q: 'Etten kantar, altın tartar.', a: ['kulak'], h: 'Duyma organımız.' },
    { q: 'Dağdan gelir taştan gelir, bir kükrerse arştan gelir.', a: ['sel', 'heyelan'], h: 'Doğal afet.' },
    { q: 'Uzun yoldan kuş gelir, ne söylese hoş gelir.', a: ['mektup'], h: 'Eskiden haberleşmek için yazılırdı.' },
    { q: 'Benim bir hayvanım var, kuyruğundan uzun burnu var.', a: ['fil'], h: 'Hortumu olan büyük hayvan.' },
    { q: 'Gökte açık pencere, kalaylı bir tencere.', a: ['ay'], h: 'Gece gökyüzünde parlar.' },
    { q: 'Sıra sıra odalar, birbirini kovalar.', a: ['tren'], h: 'Raylarda gider.' },
    { q: 'Ne ağzı var ne dili, konuşur insan gibi.', a: ['radyo', 'televizyon'], h: 'Haber dinlediğimiz cihaz.' },
    { q: 'Elemeden geçer, her deliği seçer.', a: ['su'], h: 'Hayat kaynağı sıvı.' },
    { q: 'Bir sapı var, yüz topu var.', a: ['üzüm'], h: 'Meyve.' }
];

// === RUS RULETİ ===
async function playRoulette(message, targetUser) {
    if (rouletteSessions.has(message.channel.id)) {
        return message.reply(`⚠️ Bu kanalda zaten bir düello var! Önce onu bitirin. (Sıradaki: ${rouletteSessions.get(message.channel.id).turn})`);
    }

    if (!targetUser || targetUser.id === message.author.id) {
        return message.reply('🔫 Kendine mi sıkacaksın yoksa birini mi düelloya davet edeceksin? `!rulet @kurban`');
    }

    // Oyunu Başlat
    const bullet = Math.floor(Math.random() * 6) + 1; // 1-6 arası dolu mermi
    rouletteSessions.set(message.channel.id, {
        p1: message.author,
        p2: targetUser,
        turn: message.author,
        bullet: bullet,
        chamber: 1
    });

    const embed = new EmbedBuilder()
        .setTitle('🔫 RUS RULETİ BAŞLADI')
        .setDescription(`**${message.author}** vs **${targetUser}**\n\n6 yuva, 1 mermi.\n\nSıra sende **${message.author}**!\nTetiği çekmek için: **!sik**`)
        .setColor('#000000')
        .setImage('https://media.tenor.com/M_S/revolver-load.gif');

    message.channel.send({ embeds: [embed] });
}

async function handleTrigger(message) {
    const session = rouletteSessions.get(message.channel.id);
    if (!session) return message.reply('Burada aktif bir oyun yok. Başlatmak için `!rulet @kurban`');

    if (message.author.id !== session.turn.id) {
        return message.reply(`Sıra sende değil koçum! Sıra: **${session.turn.username}**`);
    }

    // Tetiği Çek
    let embed = new EmbedBuilder().setColor('#000000');

    if (session.chamber === session.bullet) {
        // VURULDU
        embed.setColor('#ff0000')
            .setTitle('💥 BAM!')
            .setDescription(`**${message.author}** kafasına sıktı ve öldü! 💀\n\nKazanan: **${session.turn.id === session.p1.id ? session.p2 : session.p1}**`)
            .setImage('https://media.tenor.com/_4y8jD-F-1AAAAAC/gun-pistol.gif');

        message.channel.send({ embeds: [embed] });

        // Voice Disconnect İşlemi (Kick yerine)
        try {
            const member = await message.guild.members.fetch(message.author.id);

            if (member.voice.channel) {
                // Kullanıcı ses kanalındaysa at
                await member.voice.disconnect('Rus Ruleti Kaybedeni');
                message.channel.send(`🧹 **${message.author}** kafasına sıktı ve ses kanalından uçuruldu!`);
            } else {
                // Seste değilse sadece mesaj at
                message.channel.send(`💀 **${message.author}** zaten seste değildi, ama manevi olarak aramızdan ayrıldı.`);
            }
        } catch (e) {
            console.error('Disconnect Hatası:', e);
            message.channel.send('⚠️ Bir hata oldu, ses kanalından atılamadı.');
        }

        rouletteSessions.delete(message.channel.id);
    } else {
        // BOŞ
        const nextPlayer = session.turn.id === session.p1.id ? session.p2 : session.p1;
        session.turn = nextPlayer;
        session.chamber++;

        embed.setTitle('💨 ÇIT!')
            .setDescription(`Mermi boştu. Şanslısın.\n\n🔫 Silahı **${nextPlayer}** kişisine veriyorsun.\nSıra sende **${nextPlayer}**! Yaz: **!sik**`)
            .setColor('#00ff00');

        message.channel.send({ embeds: [embed] });
    }
}


// === BILMECE ===
async function startRiddle(message) {
    if (riddleSessions.has(message.channel.id)) {
        return message.reply('Zaten bu kanalda aktif bir bilmece var!');
    }

    const riddle = RIDDLES[Math.floor(Math.random() * RIDDLES.length)];
    const endTime = Date.now() + 60000; // 60 saniye süre

    const embed = new EmbedBuilder()
        .setTitle('🧠 Bilmece Zamanı!')
        .setDescription(`**Soru:** ${riddle.q}\n\n*💡 İpucu: ${riddle.h}*\n\n⏳ **Süre:** 60 Saniye!`)
        .setColor('#ffff00')
        .setFooter({ text: 'Cevabı sohbete yazın!' });

    await message.channel.send({ embeds: [embed] });

    // Timer Başlat
    const timeoutId = setTimeout(async () => {
        if (riddleSessions.has(message.channel.id)) {
            const endEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('⌛ Süre Doldu!')
                .setDescription(`Kimse bilemedi! Yazıklar olsun.\n\nDoğru Cevap: **${riddle.a[0]}**`);

            message.channel.send({ embeds: [endEmbed] });
            riddleSessions.delete(message.channel.id);
        }
    }, 60000);

    riddleSessions.set(message.channel.id, {
        question: riddle.q,
        answer: riddle.a,
        strikes: {},
        active: true,
        startTime: Date.now(),
        timer: timeoutId
    });
}

async function checkRiddle(message) {
    const session = riddleSessions.get(message.channel.id);
    if (!session || !session.active || message.author.bot) return;

    if (message.content.length > 20) return;

    const answer = message.content.toLocaleLowerCase('tr').trim();
    const isCorrect = session.answer.some(a => answer.includes(a.toLocaleLowerCase('tr')));

    if (isCorrect) {
        clearTimeout(session.timer); // Timer'ı iptal et
        riddleSessions.delete(message.channel.id);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🎉 Tebrikler!')
            .setDescription(`**${message.author}** doğru bildi!\nCevap: **${session.answer[0]}**`);

        return message.channel.send({ embeds: [embed] });
    }

    // Yanlış cevap ve timeout sistemi
    if (!session.strikes[message.author.id]) session.strikes[message.author.id] = 0;
    session.strikes[message.author.id]++;

    // Yanlış cevap tepkisi
    await message.react('❌');

    if (session.strikes[message.author.id] >= 3) {
        try {
            if (message.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {

                const member = await message.guild.members.fetch(message.author.id);
                if (member.moderatable) {
                    await member.timeout(60 * 1000, 'Bilmece: 3 Yanlış Cevap'); // 1 dakika
                    message.reply(`🚫 **${message.author}** 3 yanlış yaptın! 1 dakika susturuldun. Şansına küs.`);
                } else {
                    message.reply(`🚫 **${message.author}** 3 yanlış yaptın!`);
                }
            }
            session.strikes[message.author.id] = 0;
        } catch (e) {
            console.error('Timeout hatası:', e);
        }
    }
}

module.exports = {
    playRoulette,
    handleTrigger,
    startRiddle,
    checkRiddle
};
