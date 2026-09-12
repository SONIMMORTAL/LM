import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

const { VIDEO_TAPES, isVideoTapeAlbum } = await import('../src/lib/video-tapes.ts');
const { ALBUMS } = await import('../src/lib/albums.ts');

describe('video tapes', () => {
    test('recognises tape albums by their exact tracks-table name', () => {
        assert.equal(isVideoTapeAlbum('Darkside'), true);
        assert.equal(isVideoTapeAlbum('darkside'), false);
        assert.equal(isVideoTapeAlbum('Lost City'), false);
        assert.equal(isVideoTapeAlbum(null), false);
    });

    // getTracks() hides tape albums, so a release listed in both places would
    // quietly vanish from the crate it's supposed to be sold in.
    test('no tape is also a sold album', () => {
        const sold = new Set(Object.values(ALBUMS).flatMap((a) => [a.id, a.name]));
        for (const tape of VIDEO_TAPES) {
            assert.equal(sold.has(tape.name), false, `${tape.name} is in lib/albums.ts`);
            assert.equal(sold.has(tape.slug), false, `${tape.slug} is in lib/albums.ts`);
        }
    });

    // The videos page ignores ?v= values that don't match this, so a bad id
    // would turn the old album redirect into a page that plays nothing.
    test('every tape id survives the videos page ?v= check', () => {
        for (const tape of VIDEO_TAPES) {
            assert.match(tape.youtubeId, /^[\w-]{6,20}$/);
        }
    });
});
