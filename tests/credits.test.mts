import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { creditedTitle, isCredited, trackCredits, withoutUnfeatured } from '../src/lib/credits.ts';
import { albumBySlug, albumDescription, albumGuests, albumTrackCredits, artistAlbumCredits, artistCollaborators } from '../src/lib/discography.ts';
import { findCrewMember, listNames } from '../src/lib/crew.ts';

// Rows as the live catalogue has them
const CATALOGUE = [
    { album: 'The Commission', title: 'Chess (feat. King illa)', artist: 'Shadow The Great' },
    { album: 'The Commission', title: 'Abel (feat. Rah Tha Ruler & Gradis Nice)', artist: 'Shadow The Great' },
    { album: 'More Life', title: '- Proceed', artist: 'Shadow The Great' },
    { album: 'Lost City', title: 'Killa', artist: 'Shadow The Great feat. Grandpadre , Paydro' },
    { album: 'Lost City', title: 'Jamie', artist: 'Shadow The Great feat. . Brynae' },
    { album: 'Live From The Dungeon', title: 'The Dungeon (feat. Shadow The Great, Kidaf, Shine Sinatra & Oso Dope)', artist: 'Shadow The Great' },
    { album: 'Live From The Dungeon', title: 'Nitty Gritty (feat. Kidaf & Laron)', artist: 'Shadow The Great' },
    { album: 'Live From The Dungeon', title: 'Toasters (feat. Oso Dope)', artist: 'Shadow The Great' },
    {
        album: 'Live From The Dungeon',
        title: 'Slide off kid (feat. King illa, Kidaf, Shadow The Great, Oso Dope & Shine Sinatra) (Live)',
        artist: 'Shadow The Great',
    },
];

describe('trackCredits', () => {
    test('takes the features out of the title', () => {
        assert.deepEqual(trackCredits(CATALOGUE[1]), {
            title: 'Abel',
            main: 'Shadow The Great',
            featured: ['Rah Tha Ruler', 'Gradis Nice'],
        });
    });

    test('takes the features out of the artist field, stray dots and all', () => {
        assert.deepEqual(trackCredits(CATALOGUE[3]).featured, ['Grandpadre', 'Paydro']);
        assert.deepEqual(trackCredits(CATALOGUE[4]), { title: 'Jamie', main: 'Shadow The Great', featured: ['Brynae'] });
    });

    test('drops the dash some titles keep from their file name', () => {
        assert.equal(trackCredits(CATALOGUE[2]).title, 'Proceed');
    });

    test("keeps the rest of the title, like (Live)", () => {
        assert.equal(trackCredits(CATALOGUE[8]).title, 'Slide off kid (Live)');
    });

    test("on someone else's album, the album artist leads and the title says who's on it", () => {
        const song = trackCredits(CATALOGUE[5], 'Loaf Muzik');
        assert.equal(song.main, 'Loaf Muzik');
        assert.equal(isCredited(song, 'oso dope'), true);
        assert.equal(isCredited(trackCredits(CATALOGUE[6], 'Loaf Muzik'), 'Shadow The Great'), false);
    });

    test('creditedTitle puts it back together tidily', () => {
        assert.equal(creditedTitle(trackCredits(CATALOGUE[3])), 'Killa (feat. Grandpadre & Paydro)');
        assert.equal(creditedTitle(trackCredits(CATALOGUE[2])), 'Proceed');
    });
});

describe('discography', () => {
    const lftd = albumBySlug('live-from-the-dungeon')!;

    test("Live From The Dungeon is Loaf Muzik's", () => {
        assert.equal(lftd.artist, 'Loaf Muzik');
        assert.ok(albumTrackCredits(lftd, CATALOGUE).every((song) => song.main === 'Loaf Muzik'));
    });

    test('guests are counted across the album, most first', () => {
        const guests = albumGuests(albumTrackCredits(lftd, CATALOGUE));
        assert.deepEqual(guests.slice(0, 3), ['Kidaf', 'Oso Dope', 'Shadow The Great']);
    });

    test('Shine Sinatra is left out of the credits everywhere', () => {
        const songs = albumTrackCredits(lftd, CATALOGUE);
        assert.ok(songs.every((song) => !song.featured.includes('Shine Sinatra')));
        assert.ok(!albumDescription(lftd, songs).includes('Shine Sinatra'));
    });

    test("Kidaf keeps his credit on his albums, and they say so in their bios", () => {
        const songs = albumTrackCredits(lftd, CATALOGUE);
        assert.deepEqual(songs[1].featured, ['Kidaf', 'Laron']);
        const kb = albumBySlug('knowledge-born')!;
        for (const album of [lftd, kb]) assert.match(album.about!.join(' '), /featuring Kidaf/);
    });

    test('Knowledge Born carries its own tracklist, minus Shine Sinatra', () => {
        const kb = albumBySlug('knowledge-born')!;
        const songs = albumTrackCredits(kb, []);
        assert.equal(songs.length, 16);
        assert.deepEqual(songs[0], { title: '1865', main: 'Loaf Muzik', featured: ['Shadow The Great', 'Kidz in Brooklyn'] });
        assert.match(albumDescription(kb, songs), /^Knowledge Born \(2017\) by Loaf Muzik, .* Listen on Spotify, Apple Music & Deezer\.$/);
    });

    test('an artist gets the songs they are on, or the whole album when it is theirs', () => {
        const oso = artistAlbumCredits('Oso Dope', CATALOGUE);
        assert.deepEqual(oso.map((credit) => credit.album.name), ['God Is Good', 'Live From The Dungeon', 'Knowledge Born']);
        // On Shadow's new album for one song, Crunch Time
        assert.deepEqual(oso[0].songs.map((song) => song.title), ['Crunch Time']);
        assert.equal(oso[0].total, 19);
        assert.deepEqual(oso[1].songs.map((song) => song.title), ['The Dungeon', 'Toasters', 'Slide off kid (Live)']);
        assert.equal(oso[1].total, 4);
        assert.equal(oso[2].songs.length, 8);

        const shadow = artistAlbumCredits('Shadow The Great', CATALOGUE);
        const lostCity = shadow.find((credit) => credit.album.name === 'Lost City')!;
        assert.equal(lostCity.lead, true);
        assert.equal(lostCity.songs.length, 2);
        // On the collective's album only where the title says so
        assert.equal(shadow.find((credit) => credit.album.name === 'Live From The Dungeon')!.songs.length, 2);
    });

    test('collaborators leave the artist out and count the producer', () => {
        const names = artistCollaborators('Shadow The Great', artistAlbumCredits('Shadow The Great', CATALOGUE));
        assert.ok(!names.includes('Shadow The Great'));
        assert.ok(names.includes('Ruggz') && names.includes('King illa') && names.includes('Loaf Muzik'));
        // Credited on the albums, but not listed on an artist's page
        assert.ok(!names.includes('Kidaf') && !names.includes('Shine Sinatra'));
    });

    test('the description says who made it and what is on it', () => {
        const text = albumDescription(lftd, albumTrackCredits(lftd, CATALOGUE));
        assert.match(text, /^Live From The Dungeon \(2015\) by Loaf Muzik, with Kidaf, Oso Dope, Shadow The Great /);
        assert.match(text, /4 tracks including The Dungeon, Nitty Gritty & Toasters\./);
    });
});

describe('crew', () => {
    test('names are matched however they are cased', () => {
        assert.equal(findCrewMember('shadow the great')?.slug, 'shadow-the-great');
        assert.equal(findCrewMember('OSO Dope')?.slug, 'oso-dope');
        assert.equal(findCrewMember('Laron'), undefined);
    });

    test('listNames', () => {
        assert.equal(listNames(['A']), 'A');
        assert.equal(listNames(['A', 'B', 'C']), 'A, B & C');
    });
});

describe('withoutUnfeatured', () => {
    test('takes the names out and leaves the rest of the credit', () => {
        assert.equal(withoutUnfeatured(CATALOGUE[5]).title, 'The Dungeon (feat. Shadow The Great, Kidaf & Oso Dope)');
        assert.equal(withoutUnfeatured(CATALOGUE[8]).title, 'Slide off kid (feat. King illa, Kidaf, Shadow The Great & Oso Dope) (Live)');
        assert.equal(withoutUnfeatured({ title: 'Smoked out Convos (feat. Shine Sinatra)', artist: 'X' }).title, 'Smoked out Convos');
        assert.equal(withoutUnfeatured({ title: 'Jeeps', artist: 'Shadow The Great feat. Shine Sinatra , Paydro' }).artist, 'Shadow The Great feat. Paydro');
    });

    test('leaves rows without them exactly as they were', () => {
        assert.equal(withoutUnfeatured(CATALOGUE[1]), CATALOGUE[1]);
        assert.equal(withoutUnfeatured(CATALOGUE[6]), CATALOGUE[6]);
        assert.equal(withoutUnfeatured(CATALOGUE[3]), CATALOGUE[3]);
    });
});
