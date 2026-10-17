import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

const {
    THE_COMMISSION_TRACKLIST,
    findCommissionTrackSpec,
    normalizeCommissionTracks,
} = await import('../src/lib/commission-tracklist.ts');

describe('The Commission tracklist', () => {
    test('defines the 13 tracks in exact 1-13 running order', () => {
        const titles = THE_COMMISSION_TRACKLIST.map((t) => `${t.position} ${t.title}`);
        assert.deepEqual(titles, [
            '1 Intro (feat. Coyote Beatz & Nathan Morais)',
            '2 Chess (feat. King illa)',
            '3 Pray (feat. King illa)',
            '4 Juice (feat. Grandpadre & Kid Sanchez)',
            '5 Live and Direct (feat. Grandpadre & Laron)',
            '6 Drop Gems (feat. Coyote Beatz)',
            '7 Whoa (feat. Coyote Beatz)',
            '8 Abel (feat. Rah Tha Ruler & Gradis Nice)',
            '9 Hands High (feat. Rah Tha Ruler & Gradis Nice)',
            '10 interlude for God (feat. Grandpadre & Coyote Beatz)',
            '11 Reject (feat. King illa)',
            '12 Words from the wise (feat. Rah Tha Ruler & King illa)',
            '13 Gucciyanna (feat. Kollie)',
        ]);
    });

    test('matches tracks by DB id, storage filename, or legacy title', () => {
        const introById = findCommissionTrackSpec({ id: '84d97152-4350-4c84-ab1c-9a94df42efbe' });
        assert.equal(introById?.position, 1);
        assert.equal(introById?.title, 'Intro (feat. Coyote Beatz & Nathan Morais)');

        const rejectByFile = findCommissionTrackSpec({
            audioUrl: 'https://bnjoouzcnxwdxcgcknoe.supabase.co/storage/v1/object/public/music/GOTHAM%20-%20King%20illa.mp3',
        });
        assert.equal(rejectByFile?.position, 11);
        assert.equal(rejectByFile?.title, 'Reject (feat. King illa)');

        const interludeByLegacyTitle = findCommissionTrackSpec({ title: 'OUTRO For God' });
        assert.equal(interludeByLegacyTitle?.position, 10);
        assert.equal(interludeByLegacyTitle?.title, 'interlude for God (feat. Grandpadre & Coyote Beatz)');
    });

    test('normalizes and reorders out-of-order DB rows for The Commission while preserving other albums', () => {
        const rawTracks = [
            {
                id: '6bad3b52-9b98-48c9-bbdb-d90dd9117b83',
                title: 'GOTHAM',
                artist: 'King illa',
                album: 'The Commission',
                audio_url: '/api/stream?t=gotham',
            },
            {
                id: 'cbd44bad-fc8d-4fde-97d9-0a9948c8f9cd',
                title: 'CHESS',
                artist: 'King illa',
                album: 'The Commission',
                audio_url: '/api/stream?t=chess',
            },
            {
                id: '84d97152-4350-4c84-ab1c-9a94df42efbe',
                title: 'hip hop',
                artist: 'Shadow The Great',
                album: 'The Commission',
                audio_url: '/api/stream?t=intro',
            },
            {
                id: 'other-1',
                title: 'Lost City',
                artist: 'Shadow The Great feat. Grandpadre',
                album: 'Lost City',
                audio_url: '/api/stream?t=lostcity',
            },
        ];

        const normalized = normalizeCommissionTracks(rawTracks);
        assert.deepEqual(
            normalized.map((t) => ({ id: t.id, title: t.title, artist: t.artist, album: t.album })),
            [
                {
                    id: '84d97152-4350-4c84-ab1c-9a94df42efbe',
                    title: 'Intro (feat. Coyote Beatz & Nathan Morais)',
                    artist: 'Shadow The Great',
                    album: 'The Commission',
                },
                {
                    id: 'cbd44bad-fc8d-4fde-97d9-0a9948c8f9cd',
                    title: 'Chess (feat. King illa)',
                    artist: 'Shadow The Great',
                    album: 'The Commission',
                },
                {
                    id: '6bad3b52-9b98-48c9-bbdb-d90dd9117b83',
                    title: 'Reject (feat. King illa)',
                    artist: 'Shadow The Great',
                    album: 'The Commission',
                },
                {
                    id: 'other-1',
                    title: 'Lost City',
                    artist: 'Shadow The Great feat. Grandpadre',
                    album: 'Lost City',
                },
            ]
        );
    });
});
