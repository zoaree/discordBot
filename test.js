
const { spawn } = require('child_process');

async function getSongInfo(query) {
  return new Promise((resolve, reject) => {
    const isUrl = query.startsWith('http://') || query.startsWith('https://');
    const searchQuery = isUrl ? query : `ytsearch:${query}`;

    console.log(`[YT-DLP] Searching for: ${searchQuery}`);

    const ytdlp = spawn('yt-dlp', [
        searchQuery,
        '--dump-json',
        '--no-playlist',
        '--default-search', 'ytsearch',
        '-f', 'bestaudio',
        '--no-check-certificate',
        '--socket-timeout', '30',
        '--quiet',
        '--no-warnings',
        '--force-ipv4'
    ], { timeout: 60000 });

    let stdout = '';
    let stderr = '';

    ytdlp.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log(`[YT-DLP] STDOUT CHUNK: ${data.toString()}`);
    });

    ytdlp.stderr.on('data', (data) => {
      stderr += data.toString();
      console.log(`[YT-DLP] STDERR CHUNK: ${data.toString()}`);
    });

    ytdlp.on('close', (code) => {
      console.log(`[YT-DLP] EXITED WITH CODE: ${code}`);
      console.log(`[YT-DLP] FULL STDOUT: ${stdout}`);
      console.log(`[YT-DLP] FULL STDERR: ${stderr}`);
      if (code !== 0 || !stdout.trim()) {
        console.error('yt-dlp stderr:', stderr);
        return reject(new Error('Şarkı bulunamadı'));
      }

      try {
        const info = JSON.parse(stdout.trim().split('\n')[0]);
        resolve({
          title: info.title || 'Bilinmeyen Şarkı',
          url: info.webpage_url || info.url,
          streamUrl: info.url,
          duration: formatDuration(info.duration || 0),
          thumbnail: info.thumbnail || null,
          author: info.uploader || info.channel || 'Bilinmiyor'
        });
      } catch (e) {
        console.error('JSON parse hatası:', e);
        reject(new Error('Şarkı bilgisi alınamadı'));
      }
    });

    ytdlp.on('error', (err) => {
      console.log(`[YT-DLP] SPAWN ERROR: ${err.message}`);
      reject(err);
    });
  });
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

console.log('Testing getSongInfo...');
getSongInfo('çağırdığın kızlar nerdeler osman')
  .then((song) => {
    console.log('SUCCESS! Song info:', song);
  })
  .catch((err) => {
    console.error('ERROR:', err);
  });
