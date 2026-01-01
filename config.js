module.exports = {
    // Bot embed renkleri - Gradient benzeri premium renkler
    colors: {
        primary: 0x5865F2,    // Discord Blurple
        success: 0x57F287,    // Yeşil
        warning: 0xFEE75C,    // Sarı
        error: 0xED4245,      // Kırmızı
        music: 0xFF006E,      // Neon Pembe
        queue: 0x8B5CF6,      // Mor
        info: 0x00D4FF        // Cyan
    },

    // Müzik ayarları
    music: {
        maxQueueSize: 100,
        defaultVolume: 100,
        leaveOnEmpty: true,
        leaveOnEmptyDelay: 120000
    },

    // Premium Emoji'ler
    emojis: {
        // Müzik kontrolleri
        play: '<:play:1234567890> ' || '▶️',
        pause: '⏸️',
        stop: '⏹️',
        skip: '⏭️',
        previous: '⏮️',

        // Durum
        music: '🎵',
        queue: '📋',
        loading: '⏳',
        search: '🔍',

        // Sonuç
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',

        // Ekstra
        heart: '❤️',
        fire: '🔥',
        star: '⭐',
        sparkles: '✨',
        headphones: '🎧',
        microphone: '🎤',
        speaker: '🔊',
        mute: '🔇',
        repeat: '🔁',
        shuffle: '🔀',
        playlist: '📃',
        disc: '💿',
        notes: '🎶',

        // Progress bar
        barStart: '▰',
        barEnd: '▱',
        barFull: '━',
        barEmpty: '─',
        barPoint: '🔘'
    },

    // Bot bilgileri
    bot: {
        name: 'Aşkolik Müzik',
        version: '2.0.0',
        developer: 'Zoare',
        supportServer: null,
        inviteUrl: 'https://discord.com/api/oauth2/authorize?client_id=1382304923479183370&permissions=3147776&scope=bot'
    }
};
