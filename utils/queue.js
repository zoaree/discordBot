// Guild bazlı kuyruk yönetimi
const queues = new Map();

/**
 * Guild için kuyruk oluştur veya mevcut kuyruğu getir
 */
function getQueue(guildId) {
    if (!queues.has(guildId)) {
        queues.set(guildId, {
            songs: [],
            currentSong: null,
            connection: null,
            player: null,
            textChannel: null,
            voiceChannel: null,
            playing: false,
            loop: false
        });
    }
    return queues.get(guildId);
}

/**
 * Kuyruğa şarkı ekle
 */
function addSong(guildId, song) {
    const queue = getQueue(guildId);
    queue.songs.push(song);
    return queue.songs.length;
}

/**
 * Kuyruktan şarkı çıkar (ilk şarkıyı)
 */
function removeSong(guildId) {
    const queue = getQueue(guildId);
    return queue.songs.shift();
}

/**
 * Kuyruğu temizle
 */
function clearQueue(guildId) {
    const queue = getQueue(guildId);
    queue.songs = [];
    queue.currentSong = null;
}

/**
 * Kuyruğu sil
 */
function deleteQueue(guildId) {
    queues.delete(guildId);
}

/**
 * Mevcut şarkıyı ayarla
 */
function setCurrentSong(guildId, song) {
    const queue = getQueue(guildId);
    queue.currentSong = song;
}

/**
 * Bağlantı bilgilerini ayarla
 */
function setConnection(guildId, connection, player) {
    const queue = getQueue(guildId);
    queue.connection = connection;
    queue.player = player;
}

/**
 * Kanal bilgilerini ayarla
 */
function setChannels(guildId, textChannel, voiceChannel) {
    const queue = getQueue(guildId);
    queue.textChannel = textChannel;
    queue.voiceChannel = voiceChannel;
}

/**
 * Çalma durumunu ayarla
 */
function setPlaying(guildId, playing) {
    const queue = getQueue(guildId);
    queue.playing = playing;
}

/**
 * Kuyruk var mı kontrol et
 */
function hasQueue(guildId) {
    return queues.has(guildId);
}

module.exports = {
    getQueue,
    addSong,
    removeSong,
    clearQueue,
    deleteQueue,
    setCurrentSong,
    setConnection,
    setChannels,
    setPlaying,
    hasQueue
};
