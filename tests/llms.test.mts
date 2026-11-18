import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { buildLlmsTxt } from '../src/lib/llms.ts';
import { jsonLd, albumNode, crewGraph, faqNode } from '../src/lib/structured-data.ts';
import { albumBySlug, albumTrackCredits } from '../src/lib/discography.ts';

const TRACKS = [
    { album: 'Live From The Dungeon', title: 'Nitty Gritty (feat. Kidaf & Laron)', artist: 'Shadow The Great' },
    { album: 'Lost City', title: 'Killa', artist: 'Shadow The Great feat. Grandpadre , Paydro' },
];

const text = buildLlmsTxt({
    tracks: TRACKS,
    tapes: [{ slug: 'darkside', name: 'Darkside', artist: 'Shadow The Great', cover: '/d.jpg', youtubeId: 'abc' }],
    tapeTracklists: { Darkside: ['Intro', 'Outro'] },
    uploads: [{ youtubeId: 'xyz', title: 'Get Money - Shadow The Great', description: '', published: '2026-10-01T12:00:00Z' }],
});

describe('llms.txt', () => {
    test('opens the way llmstxt.org asks: a title, then a one-paragraph summary', () => {
        const [title, blank, summary] = text.split('\n');
        assert.equal(title, '# Loaf Records: Home of Loaf Muzik');
        assert.equal(blank, '');
        assert.match(summary, /^> Loaf Records is the Brooklyn independent hip-hop label/);
    });

    test('names everyone, with the spellings people search for', () => {
        for (const name of ['Shadow The Great', 'Oso Dope', 'Loaf Music', 'Loaf Musik']) {
            assert.ok(text.includes(name), name);
        }
        assert.match(text, /\[Oso Dope\]\(https:\/\/[^)]+\/artists\/oso-dope\)/);
        assert.ok(!/shine sinatra/i.test(text));
        // Kidaf only where his albums are: never in the crew, the answers or the links
        const albums = text.slice(text.indexOf('## Albums'), text.indexOf('## Mixtapes'));
        assert.ok(!/kidaf/i.test(text.replace(albums, '')));
        assert.ok(albums.includes('featuring Kidaf'));
    });

    test("lists each album's songs with who's on them", () => {
        assert.match(text, /### \[Live From The Dungeon\]\([^)]+\/music\/live-from-the-dungeon\)/);
        assert.ok(text.includes('1. Nitty Gritty (feat. Kidaf & Laron)'));
        assert.ok(text.includes('### [Knowledge Born]'));
        assert.ok(text.includes('1. Killa (feat. Grandpadre & Paydro)'));
    });

    test('carries the tapes and the latest uploads', () => {
        assert.ok(text.includes('- Darkside by Shadow The Great ([watch on YouTube](https://www.youtube.com/watch?v=abc)): Intro, Outro'));
        assert.ok(text.includes('- [Get Money - Shadow The Great](https://www.youtube.com/watch?v=xyz): Oct 1, 2026'));
    });
});

describe('structured data', () => {
    test('is safe to drop into a script tag', () => {
        const out = jsonLd([{ '@type': 'Thing', name: '</script><b>' }]);
        assert.ok(!out.includes('<'));
        assert.equal(JSON.parse(out)['@graph'][0].name, '</script><b>');
    });

    test('the crew points at one another by @id', () => {
        const graph = crewGraph();
        const group = graph.find((node) => node['@type'] === 'MusicGroup')!;
        const people = graph.filter((node) => node['@type'] === 'Person');
        assert.equal(people.length, 2);
        assert.deepEqual(
            (group.member as Array<{ '@id': string }>).map((ref) => ref['@id']).sort(),
            people.map((person) => person['@id'] as string).sort(),
        );
        assert.deepEqual(group.alternateName, ['Loaf Music', 'Loaf Musik', 'Meatloaf Muzik']);
    });

    test('an album credits everyone on each song, crew by @id', () => {
        const lftd = albumBySlug('live-from-the-dungeon')!;
        const node = albumNode(lftd, albumTrackCredits(lftd, TRACKS));
        const track = (node.track as { itemListElement: Array<{ item: { name: string; byArtist: Array<Record<string, string>> } }> })
            .itemListElement[0].item;
        assert.equal(track.name, 'Nitty Gritty');
        assert.match(track.byArtist[0]['@id'], /\/bio#loaf-muzik$/);
        assert.deepEqual(track.byArtist[1], { '@type': 'Person', name: 'Kidaf' });
        assert.deepEqual(track.byArtist[2], { '@type': 'Person', name: 'Laron' });
        assert.match(node.description as string, /featuring Kidaf/);
        assert.equal(node.datePublished, '2015-10-01');
    });

    test('the FAQ marks up every question', () => {
        const faq = faqNode('x');
        assert.ok((faq.mainEntity as unknown[]).length >= 5);
    });
});
