const https = require('https');

const endpoints = [
    'anal', 'blowjob', 'cum', 'fuck', 'pussy', 'solo', 'threesome_fff', 'yaoi', 'yuri',
    'ass', 'boobs' // Testing these speculative ones
];

function check(type) {
    const url = `https://purrbot.site/api/img/nsfw/${type}/gif`;
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                if (!json.error) {
                    console.log(`[SUCCESS] Type: ${type}, URL: ${json.link}`);
                } else {
                    console.log(`[FAIL] Type: ${type} - Not found or error`);
                }
            } catch (e) {
                console.log(`[ERROR] Type: ${type}`, e.message);
            }
        });
    }).on('error', err => console.log('Req error:', err.message));
}

endpoints.forEach(e => check(e));
