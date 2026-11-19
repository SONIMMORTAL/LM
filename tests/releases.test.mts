import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { RELEASES, chargeFor, checkBuyer, formatPrice, newSaleEmail, releaseById } from '../src/lib/releases.ts';

const album = RELEASES['god-is-good'];
const book = RELEASES['god-is-good-audiobook'];

describe('chargeFor', () => {
    test('God Is Good is name-your-price from $10, with no real cap', () => {
        assert.deepEqual(chargeFor(album, 10), { amount: 10 });
        assert.deepEqual(chargeFor(album, '12.50'), { amount: 12.5 });
        assert.deepEqual(chargeFor(album, 1000), { amount: 1000 });
        assert.match((chargeFor(album, 9.99) as { error: string }).error, /least you can pay is \$10/);
        assert.match((chargeFor(album, 10.005) as { error: string }).error, /dollars and cents/);
        assert.ok('error' in chargeFor(album, 'ten'));
        assert.ok('error' in chargeFor(album, undefined));
        assert.ok('error' in chargeFor(album, -50));
    });

    test('the Audio Book is $25 whatever the browser asks', () => {
        assert.deepEqual(chargeFor(book, 1), { amount: 25 });
        assert.deepEqual(chargeFor(book, undefined), { amount: 25 });
    });
});

describe('releaseById', () => {
    test('knows both releases and nothing else', () => {
        assert.equal(releaseById('god-is-good'), album);
        assert.equal(releaseById('god-is-good-audiobook'), book);
        assert.equal(releaseById('toString'), undefined);
        assert.equal(releaseById(42), undefined);
    });
});

describe('checkBuyer', () => {
    test('tidies a good name and email', () => {
        assert.deepEqual(checkBuyer('  Jay   Smith ', ' Jay@Example.COM '), { name: 'Jay Smith', email: 'jay@example.com' });
    });

    test('turns away a missing name or a bad email', () => {
        assert.ok('error' in checkBuyer('', 'jay@example.com'));
        assert.ok('error' in checkBuyer('Jay', 'not-an-email'));
        assert.ok('error' in checkBuyer('Jay', '<script>@x.com'));
    });
});

describe('the NEW SALE email', () => {
    const sale = {
        release: album,
        buyerName: 'Jay <b>Smith</b>',
        buyerEmail: 'jay@example.com',
        amount: 20,
        method: 'PayPal' as const,
        reference: '5TY12345AB678901C',
        confirmed: true,
    };

    test('leads with NEW SALE, the buyer and the amount', () => {
        const email = newSaleEmail(sale);
        assert.equal(email.subject, 'NEW SALE! God Is Good — $20.00 from Jay <b>Smith</b>');
        assert.match(email.text, /^NEW SALE!/);
        assert.match(email.text, /Buyer: Jay <b>Smith<\/b>/);
        assert.match(email.text, /Email: jay@example\.com/);
        assert.match(email.text, /Send the GOD IS GOOD zip \(all 19 tracks\) to jay@example\.com/);
    });

    test("escapes what the buyer typed, and replies to them in one tap", () => {
        const { html } = newSaleEmail(sale);
        assert.ok(!html.includes('<b>Smith</b>'));
        assert.ok(html.includes('Jay &lt;b&gt;Smith&lt;/b&gt;'));
        assert.ok(html.includes('mailto:jay%40example.com?subject=Your%20God%20Is%20Good%20download'));
    });

    test('tells Shadow to check Cash App before sending', () => {
        const email = newSaleEmail({ ...sale, release: book, method: 'Cash App', reference: '$jaysmith', confirmed: false, amount: 25 });
        assert.match(email.text, /Check that \$25\.00 arrived in Cash App \(\$jaysmith\)/);
        assert.match(email.subject, /God Is Good Audio Book — \$25\.00/);
    });
});

describe('formatPrice', () => {
    test('dollars and cents with thousands', () => {
        assert.equal(formatPrice(10), '$10.00');
        assert.equal(formatPrice(1250.5), '$1,250.50');
    });
});
