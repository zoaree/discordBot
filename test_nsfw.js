const https = require('https');

function check(type) {
    const url = `https://nekobot.xyz/api/image?type=${type}`;
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                console.log(`Type: ${type}, URl: ${json.message}, IsGIF: ${json.message.match(/\.(gif|mp4|webm)$/i) ? 'YES' : 'NO'}`);
            } catch (e) {
                console.log('Error parsing:', e);
            }
        });
    });
}

for (let i = 0; i < 10; i++) {
    check('ass');
    check('boobs');
}
