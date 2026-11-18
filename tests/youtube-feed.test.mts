import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { parseChannelFeed, splitVideoTitle, tidyTitle } from '../src/lib/youtube-feed.ts';

const entry = (id: string, title: string, published: string, link = `https://www.youtube.com/watch?v=${id}`) => `
 <entry>
  <id>yt:video:${id}</id>
  <yt:videoId>${id}</yt:videoId>
  <title>${title}</title>
  <link rel="alternate" href="${link}"/>
  <published>${published}</published>
  <media:group>
   <media:title>${title}</media:title>
   <media:description>Produced by King illa

www.loafrecords.shop</media:description>
  </media:group>
 </entry>`;

const feed = (...entries: string[]) =>
    `<?xml version="1.0" encoding="UTF-8"?><feed xmlns:yt="http://www.youtube.com/xml/schemas/2015"><title>LOAF RECORDS</title>${entries.join('')}</feed>`;

describe('Loaf Records channel feed', () => {
    test('reads each upload, newest first, with titles decoded', () => {
        const uploads = parseChannelFeed(feed(
            entry('URO4985l4Zc', 'Rasclat - Shadow The Great , Rah Tha Ruler | Prod by Ruggz', '2026-09-15T18:00:00+00:00'),
            entry('o8t1Jrc1lHs', 'Lost City - Ruggz &amp; Shadow The Great &#39;Live&#39;', '2026-09-30T19:30:59+00:00'),
        ));

        assert.deepEqual(uploads.map((u) => u.youtubeId), ['o8t1Jrc1lHs', 'URO4985l4Zc']);
        assert.equal(uploads[0].title, "Lost City - Ruggz & Shadow The Great 'Live'");
        assert.equal(uploads[0].published, '2026-09-30T19:30:59+00:00');
        assert.equal(uploads[0].description, 'Produced by King illa');
    });

    test('leaves Shorts out, so a vertical clip never takes the New Release spot', () => {
        const uploads = parseChannelFeed(feed(
            entry('8qgxx9yzBJI', 'Lost City teaser', '2026-10-10T12:00:00+00:00', 'https://www.youtube.com/shorts/8qgxx9yzBJI'),
            entry('o8t1Jrc1lHs', 'Get Money', '2026-09-30T19:30:59+00:00'),
        ));

        assert.deepEqual(uploads.map((u) => u.youtubeId), ['o8t1Jrc1lHs']);
    });

    test('an empty or broken feed gives no uploads rather than throwing', () => {
        assert.deepEqual(parseChannelFeed(''), []);
        assert.deepEqual(parseChannelFeed('<html>consent page</html>'), []);
        assert.deepEqual(parseChannelFeed(feed(entry('not-an-id', 'x', '2026-01-01'))), []);
    });

    test('skips a bare link or hashtags at the top of a description', () => {
        const linkFirst = entry('URO4985l4Zc', 'Rasclat', '2026-09-15T18:00:00+00:00')
            .replace('Produced by King illa', 'www.loafrecords.shop\n#loafrecords #brooklyn\nDirected by Loaf Films');
        assert.equal(parseChannelFeed(feed(linkFirst))[0].description, 'Directed by Loaf Films');
    });

    test('splits the credits off a title at the bar', () => {
        assert.deepEqual(splitVideoTitle('Rasclat - Shadow The Great | Prod by Ruggz'), {
            headline: 'Rasclat - Shadow The Great',
            credits: 'Prod by Ruggz',
        });
        assert.deepEqual(splitVideoTitle('Get Money - Shadow The Great'), { headline: 'Get Money - Shadow The Great', credits: undefined });
    });
});

describe('tidyTitle', () => {
    test('closes up the space YouTube titles leave before a comma', () => {
        assert.equal(tidyTitle('Get Money - Shadow The Great , Rah Tha Ruler'), 'Get Money - Shadow The Great, Rah Tha Ruler');
        assert.equal(tidyTitle('Shadow The Great - Darkside  (Full Mixtape)'), 'Shadow The Great - Darkside (Full Mixtape)');
        assert.equal(tidyTitle('Abel feat Rah Tha Ruler ,Shadow The Great'), 'Abel feat Rah Tha Ruler, Shadow The Great');
    });
});

describe('descriptions', () => {
    const feed = (description: string) => `<feed><entry>
  <yt:videoId>abcdefghijk</yt:videoId><title>T</title>
  <link rel="alternate" href="https://www.youtube.com/watch?v=abcdefghijk"/>
  <published>2026-01-01T00:00:00+00:00</published>
  <media:group><media:description>${description}</media:description></media:group>
</entry></feed>`;

    test('skip the tracklist to find the line that says something', () => {
        assert.equal(parseChannelFeed(feed('1.Desperado 0:00\n2.Lost City 3:10'))[0].description, '');
        assert.equal(parseChannelFeed(feed('1 Intro (feat. Coyote Beatz)\nDirected by Sage Wolf'))[0].description, 'Directed by Sage Wolf');
        assert.equal(parseChannelFeed(feed('00:00 Intro\nOfficial video'))[0].description, 'Official video');
    });

    test('keep a line that only starts with a year', () => {
        assert.equal(parseChannelFeed(feed('2026 visual by Loaf Films'))[0].description, '2026 visual by Loaf Films');
    });
});
