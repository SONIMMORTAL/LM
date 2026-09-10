import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-signing-secret-do-not-use-in-prod';

const { generateDownloadToken, verifyDownloadToken } = await import('../src/lib/token.ts');

const order = {
    orderId: 'ord_123',
    albumSlug: 'lost-city',
    customerEmail: 'buyer@example.com',
};

describe('download tokens', () => {
    test('round-trips an order', () => {
        const payload = verifyDownloadToken(generateDownloadToken(order));

        assert.ok(payload);
        assert.equal(payload.orderId, 'ord_123');
        assert.equal(payload.albumSlug, 'lost-city');
        assert.equal(payload.customerEmail, 'buyer@example.com');
    });

    test('cannot be re-pointed at a different album', () => {
        // The whole point: a buyer of one album must not reach another.
        const [, signature] = generateDownloadToken(order).split('.');
        const forged = Buffer.from(
            JSON.stringify({ ...order, albumSlug: 'the-commission', exp: Date.now() + 60_000 })
        ).toString('base64url');

        assert.equal(verifyDownloadToken(`${forged}.${signature}`), null);
    });

    test('expires', () => {
        assert.equal(verifyDownloadToken(generateDownloadToken(order, -1)), null);
    });

    test('rejects malformed input rather than throwing', () => {
        for (const bad of ['', '.', 'nodot', 'a.b.c']) {
            assert.equal(verifyDownloadToken(bad), null);
        }
    });
});
