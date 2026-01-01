require('dotenv').config();
const ai = require('./utils/ai');

async function test() {
    console.log('Testing Lyrics Fetch...');
    try {
        const artist = "Orhan Gencebay";
        const title = "Batsın Bu Dünya";
        console.log(`Searching for: ${artist} - ${title}`);

        const result = await ai.getLyrics(artist, title);
        console.log('\n--- RESULT ---');
        console.log(result);
        console.log('----------------');
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
