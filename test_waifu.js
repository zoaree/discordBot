const https = require('https');

function check(tag) {
    const url = `https://api.waifu.im/search?included_tags=${tag}&gif=true`;
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                if (json.images && json.images.length > 0) {
                    console.log(`[SUCCESS] Tag: ${tag}, URL: ${json.images[0].url}`);
                } else {
                    console.log(`[FAIL] Tag: ${tag} - ${JSON.stringify(json)}`);
                }
            } catch (e) {
                console.log(`[ERROR] Tag: ${tag}`, e.message);
            }
        });
    });
}

const tags = ['ass', 'boobs', 'paizuri', 'ecchi', 'ero', 'milf', 'oral'];
tags.forEach(t => check(t));
