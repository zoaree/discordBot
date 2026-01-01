require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Komut dosyalarını yükle
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(`📦 Komut hazırlandı: ${command.data.name}`);
    }
}

// REST client oluştur
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Komutları Discord'a kaydet
(async () => {
    try {
        console.log('');
        console.log(`🔄 ${commands.length} slash komut kaydediliyor...`);

        // Global komutları kaydet
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log(`✅ ${data.length} slash komut başarıyla kaydedildi!`);
        console.log('');
        console.log('Kaydedilen komutlar:');
        data.forEach(cmd => {
            console.log(`  • /${cmd.name}: ${cmd.description}`);
        });
        console.log('');
        console.log('💡 Not: Global komutların aktif olması 1 saat kadar sürebilir.');
        console.log('   Hemen test etmek için botu sunucudan çıkarıp tekrar ekleyin.');

    } catch (error) {
        console.error('❌ Komut kaydedilirken hata oluştu:', error);
    }
})();
