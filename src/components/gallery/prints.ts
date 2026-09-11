/**
 * The archive, in the order it's read — through the book, and left to right,
 * top to bottom across the wall.
 *
 * Files live in public/gallery, processed from the phone exports: orientation
 * baked in, every bit of metadata (GPS included) stripped, long edge capped at
 * 2000px. Originals are kept out of the repo in local-assets/gallery-originals.
 * `blur` is a 12px webp of the same frame for the placeholder while it loads.
 *
 * Captions are what someone would scrawl under the print; alt text describes
 * what's in the frame without inventing names or places. A new print added
 * here shows up in the book straight away, and on the wall along the bottom
 * until it's given a spot in PasteUpWall's PLACEMENTS.
 */
export interface GalleryPrint {
    id: string;
    src: string;
    alt: string;
    caption: string;
    width: number;
    height: number;
    blur: string;
}

export const galleryPrints: GalleryPrint[] = [
    {
        id: "trailer-dusk",
        src: "/gallery/trailer-dusk.jpg",
        alt: "A writer up a stepladder painting a big blue and magenta piece along the side of a trailer at dusk",
        caption: "Trailer, at dusk",
        width: 2000,
        height: 1500,
        blur: "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAADwAQCdASoMAAkAA4BaJagCdADcrDDX9QAA/grDXXq229U+eB1bkoTTY+PKV9GeW5qMcM4MybvUn4ZRQ5Q+IzUR2D02tEMvrgAAAA==",
    },
    {
        id: "trailer-night",
        src: "/gallery/trailer-night.jpg",
        alt: "The same trailer piece after dark under work lights, a character painted at one end and a pickup truck at the other",
        caption: "Same wall, after dark",
        width: 2000,
        height: 1500,
        blur: "data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAADwAQCdASoMAAkAA4BaJbAC7ADhcpNgCgAA/oo1STuv/1HEH44Qq7EbmeNaukKkZeynI0yU6GkTSdMxy4kjnXwauAAAAA==",
    },
    {
        id: "hallway-record",
        src: "/gallery/hallway-record.jpg",
        alt: "Three men in a hallway, one holding up a record sleeve and another a white-label twelve-inch",
        caption: "Record in hand",
        width: 1320,
        height: 1786,
        blur: "data:image/webp;base64,UklGRogAAABXRUJQVlA4IHwAAACwAgCdASoMABAAA4BaJYgCdIHAgqyt8W3DN9e/sAAA/ubQZGeHUtfxuLcid6XfzmWzZM9+eZkEwpAZ0j7NKd53beMvegHRJnrfFvAZLAXJmoU8rVZbbiU9tBT374JycYO+bhQ14tByLpaYRfHydBtU8GpzFUyZgXWtAAAA",
    },
    {
        id: "blackbook-spread",
        src: "/gallery/blackbook-spread.jpg",
        alt: "A blackbook open to a two-page spread of black marker throw-ups and characters over yellow",
        caption: "Blackbook, full spread",
        width: 2000,
        height: 1465,
        blur: "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAABQAgCdASoMAAkAA4BaJbACdLoAAnaRSx7YuAAA/moBFUmZmLe8R9AB2jqrlyG42K8h3xjOf2sQv/ylfOPWbkB+cYKPFibI3UgAAA==",
    },
    {
        id: "dj-set",
        src: "/gallery/dj-set.jpg",
        alt: "A DJ in glasses and a cap behind a controller, a second man at the mic, roses projected on the red curtain behind them",
        caption: "On the decks",
        width: 1500,
        height: 2000,
        blur: "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAAAQAgCdASoMABAAA4BaJbACdAD0Yar9NdgAAP7loJZ9ZlYbpXRKncLORHL4NzE3pZBPX58j9+eyX4hP/5LAXGfZ+aIVyhLSgAA=",
    },
    {
        id: "noxer-canvas",
        src: "/gallery/noxer-canvas.jpg",
        alt: "Painting on canvas of four masked characters holding spray cans, a roller and an extinguisher above orange bubble letters",
        caption: "On canvas",
        width: 1320,
        height: 1033,
        blur: "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAADwAQCdASoMAAkAA4BaJbACdDBHQWbwX+wA/r4bjxde4LJl34/d05dbx2hMHDABkYLAtjnZNgJ1XOc1dNTvwb7kNDDmh/qZT5IjNtp32x0nRBuAAAA=",
    },
    {
        id: "box-truck-ladder",
        src: "/gallery/box-truck-ladder.jpg",
        alt: "A box truck being painted at night, one writer up an orange ladder while people walk past",
        caption: "Box truck, night shift",
        width: 1500,
        height: 2000,
        blur: "data:image/webp;base64,UklGRmoAAABXRUJQVlA4IF4AAAAwAgCdASoMABAAA4BaJZgCsH8AGBT21eProAD++FMoEdfFxyDT+yB6ohylLNZuFDPzalxB7J4HK9FR/buu/2jVBSXavXOT4SGqgPnY3wh6AwiCMs7SaGR1StCLgAAA",
    },
    {
        id: "box-truck-portrait",
        src: "/gallery/box-truck-portrait.jpg",
        alt: "Two men standing in front of the painted box truck, spray cans lined up on the ground beside them",
        caption: "In front of the truck",
        width: 1495,
        height: 2000,
        blur: "data:image/webp;base64,UklGRn4AAABXRUJQVlA4IHIAAAAwAgCdASoMABAAA4BaJbACdAD8LjxRv7kpwAD7pU2xnt0T8fWSpjMhmHKINTVIczqej5kugj9ihHd72FPdgVphlFf0D0h/BCaoqWlXSQ0SIjuQn1SdgFC+0OypMB9L7WOyq5S8TNWyB7SJkSN6gR2AAAA=",
    },
    {
        id: "rooftop-throwies",
        src: "/gallery/rooftop-throwies.jpg",
        alt: "Black outline throw-ups across a pale wall on a rooftop",
        caption: "Rooftop throwies",
        width: 1500,
        height: 2000,
        blur: "data:image/webp;base64,UklGRmIAAABXRUJQVlA4IFYAAACwAQCdASoMABAAA4BaJZwAAsaUb5ZwAP7GB6EWJOuio2qHWCdPfWU/AHoPDyNf3iQ2iBPRM2nViPDPMYrOLiNG44I3mYxLr/iTFlSO76llhUEqgjdAAA==",
    },
    {
        id: "blackbook-extra-ketchup",
        src: "/gallery/blackbook-extra-ketchup.jpg",
        alt: "Blackbook page with red, yellow and purple marker pieces around an Extra Ketchup sticker",
        caption: "Extra Ketchup page",
        width: 1500,
        height: 2000,
        blur: "data:image/webp;base64,UklGRnwAAABXRUJQVlA4IHAAAAAQAgCdASoMABAAA4BaJbACdADhfqACoH6AAPxn1hZr/ZyLH4jlPBdIXhowlX+M4CfukcLi144A6yovaxcu3cfkyJLtiJy+igd73fYOM7Qpr8G4bUkJZBa6r4z5n6M92o4aLccMl+EzsDYUo+VvvSAA",
    },
    {
        id: "blackbook-portrait-piece",
        src: "/gallery/blackbook-portrait-piece.jpg",
        alt: "Blackbook page of pink and red dripping letters with a drawn portrait sitting on top of the first one",
        caption: "Portrait piece",
        width: 1500,
        height: 2000,
        blur: "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAADwAQCdASoMABAAA4BaJbAC7ADhALDyogAA/agm5W1QQBmOHo3wqEZ9MR20lAGK+H/2jF9od26QfmTKSG0sRPuVtvzKmIs9t1efhkSywop/TkAA",
    },
];
