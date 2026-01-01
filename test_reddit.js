const https = require('https');

function check(subreddit) {
    const options = {
        hostname: 'www.reddit.com',
        path: `/r/${subreddit}/hot.json?limit=25`,
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                if (json.data && json.data.children) {
                    const gifs = json.data.children.filter(post => {
                        const url = post.data.url_overridden_by_dest || post.data.url;
                        return url && (url.includes('.gif') || url.includes('.mp4') || url.includes('redgifs') || url.includes('imgur.com'));
                    });
                    console.log(`[SUCCESS] r/${subreddit}: Found ${gifs.length} GIFs/Videos. Sample: ${gifs[0]?.data.url}`);
                } else {
                    console.log(`[FAIL] r/${subreddit}: No data found.`);
                }
            } catch (e) {
                console.log(`[ERROR] r/${subreddit}`, e.message);
            }
        });
    });

    req.on('error', (e) => console.log('Req error:', e));
    req.end();
}

check('ass');
check('boobs');
check('TittyDrop');
check('gonewild');
