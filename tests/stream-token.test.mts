import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// The module reads its signing secret at import time, so pin one first.
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-signing-secret-do-not-use-in-prod';

const { generateStreamToken, verifyStreamToken, streamUrlFor } = await import(
    '../src/lib/stream-token.ts'
);

describe('stream tokens', () => {
    test('round-trips a bucket and path', () => {
        const token = generateStreamToken('Music3', '2.Lost City feat. Grandpadre.mp3');
        const payload = verifyStreamToken(token);

        assert.ok(payload, 'expected a valid payload');
        assert.equal(payload.bucket, 'Music3');
        assert.equal(payload.path, '2.Lost City feat. Grandpadre.mp3');
    });

    test('preserves paths with spaces, ampersands and folders', () => {
        const path = 'live sets/5.LIVE & DIRECT feat. Grandpadre.mp3';
        const payload = verifyStreamToken(generateStreamToken('music 2', path));

        assert.ok(payload);
        assert.equal(payload.path, path);
        assert.equal(payload.bucket, 'music 2');
    });

    test('rejects a token whose payload was edited', () => {
        // Re-point a legitimate token at a different bucket, keeping the signature.
        const token = generateStreamToken('Music3', 'track.mp3');
        const [, signature] = token.split('.');
        const forgedPayload = Buffer.from(
            JSON.stringify({ bucket: 'LOAFM', path: 'secret.mp3', exp: Date.now() + 60_000 })
        ).toString('base64url');

        assert.equal(verifyStreamToken(`${forgedPayload}.${signature}`), null);
    });

    test('rejects a token whose signature was edited', () => {
        const [payload] = generateStreamToken('Music3', 'track.mp3').split('.');
        assert.equal(verifyStreamToken(`${payload}.not-a-real-signature`), null);
    });

    test('rejects an expired token', () => {
        assert.equal(verifyStreamToken(generateStreamToken('Music3', 'track.mp3', -1)), null);
    });

    test('rejects malformed input rather than throwing', () => {
        for (const bad of ['', '.', 'nodot', 'a.b.c', 'not-base64.sig']) {
            assert.equal(verifyStreamToken(bad), null, `expected null for ${JSON.stringify(bad)}`);
        }
    });

    test('streamUrlFor produces a URL the route can parse', () => {
        const url = streamUrlFor('Music3', 'a track & thing.mp3');
        assert.ok(url.startsWith('/api/stream?t='));

        // Exactly what the route handler does with it.
        const token = new URL(url, 'http://localhost').searchParams.get('t');
        assert.ok(token);
        const payload = verifyStreamToken(token);
        assert.ok(payload);
        assert.equal(payload.path, 'a track & thing.mp3');
    });

    test('does not leak the storage path into the URL', () => {
        const url = streamUrlFor('Music3', 'Unreleased Master.mp3');
        assert.ok(!url.includes('Unreleased'), 'storage path must not be readable from the URL');
        assert.ok(!url.includes('Music3'));
    });
});
