import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { merchLayerArt } from '../src/lib/merch-layers.ts';

const file = (type: string, name: string) => ({ type, preview_url: `https://files.cdn.printful.com/files/${name}_preview.png` });

describe('merch break-apart layers', () => {
    test('takes the print design once and each colourway once, across repeated sizes', () => {
        const black = [file('default', 'design'), file('preview', 'black')];
        const steel = [file('default', 'design'), file('preview', 'steel')];
        const art = merchLayerArt({
            sync_variants: [{ files: black }, { files: black }, { files: steel }, { files: steel }],
        });

        assert.equal(art.artwork, 'https://files.cdn.printful.com/files/design_preview.png');
        assert.deepEqual(art.colorways, [
            'https://files.cdn.printful.com/files/black_preview.png',
            'https://files.cdn.printful.com/files/steel_preview.png',
        ]);
    });

    test('ignores placement files that are not the design or a mockup', () => {
        const art = merchLayerArt({
            sync_variants: [{ files: [file('label_inside', 'label'), file('back', 'back'), file('preview', 'white')] }],
        });

        assert.equal(art.artwork, undefined);
        assert.deepEqual(art.colorways, ['https://files.cdn.printful.com/files/white_preview.png']);
    });

    test('nothing loaded yet, or a file without a preview, leaves the layers to the fallback art', () => {
        assert.deepEqual(merchLayerArt(undefined), { artwork: undefined, colorways: [] });
        assert.deepEqual(merchLayerArt({ sync_variants: [{ files: [{ type: 'default', preview_url: null }] }] }), {
            artwork: undefined,
            colorways: [],
        });
    });
});
