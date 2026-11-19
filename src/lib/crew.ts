/**
 * Who's who at Loaf Records: the label, the Loaf Muzik collective and its members.
 *
 * The bio, the artist pages, the structured data search engines read and /llms.txt all
 * draw on this file, so Google, AI answer engines and the people on the page are told the
 * same story. Keep it to what's on the record: the crew's own bio, their releases and the
 * press listed below. Nothing here should be a guess.
 */

export interface CrewMember {
    /** Their page lives at /artists/<slug> */
    slug: string;
    name: string;
    /** Other ways people write the name, for search engines */
    alternateNames: string[];
    roles: string[];
    /** Co-founded Loaf Records */
    founder: boolean;
    /** One line: who they are */
    summary: string;
    /** The longer story, a paragraph each */
    story: string[];
    homeLocation?: string;
    /** Has an artist page of their own (the rest are linked to the bio) */
    hasPage: boolean;
    /** Official profiles elsewhere that are theirs alone */
    sameAs: string[];
}

export const SHADOW_THE_GREAT: CrewMember = {
    slug: "shadow-the-great",
    name: "Shadow The Great",
    alternateNames: ["Shadow the Great", "ShadowTheGreat"],
    roles: ["Artist", "Producer", "Director", "Psalm Writer"],
    founder: true,
    summary:
        "Independent underground hip-hop artist, producer and director from Bushwick, Brooklyn, co-founder of Loaf Records and a member of Loaf Muzik.",
    story: [
        "An independent underground hip-hop artist, producer and director from Bushwick, Brooklyn, and a psalm writer.",
        "His music journey began around 2009 through a Brooklyn after-school program. He went on to build his own basement studio, The Dungeon, where he produces, mixes and masters his own projects, and crafts a few for others.",
    ],
    homeLocation: "Bushwick, Brooklyn, New York",
    hasPage: true,
    sameAs: ["https://open.spotify.com/artist/0if6Vx2WY48XgtW14QzcWU", "https://www.last.fm/music/Shadow+The+Great"],
};

export const OSO_DOPE: CrewMember = {
    slug: "oso-dope",
    name: "Oso Dope",
    alternateNames: ["OSO Dope"],
    roles: ["Artist", "Musician", "On screen"],
    founder: true,
    summary: "Brooklyn hip-hop artist and musician, co-founder of Loaf Records and a member of Loaf Muzik.",
    story: [
        "A Brooklyn-based hip-hop artist and musician, and a member of Loaf Muzik.",
        "On screen he's credited with roles or appearances in Raising Kanan (Starz), The Equalizer (CBS), Wu-Tang: An American Saga and NBA Top Shot ads.",
    ],
    homeLocation: "Brooklyn, New York",
    hasPage: true,
    sameAs: ["https://open.spotify.com/artist/6qyGqFPq241MRREsTt3399"],
};

/** The members of Loaf Muzik, founders first */
export const CREW: CrewMember[] = [SHADOW_THE_GREAT, OSO_DOPE];

const sameName = (list: string[], name: string) => list.some((entry) => entry.toLowerCase() === name.trim().toLowerCase());

/**
 * Credited on some of the catalogue's songs, but not to be featured: the site leaves them out
 * of its credits, guest lists, descriptions, structured data and /llms.txt.
 */
export const NOT_FEATURED = ["Shine Sinatra"];

/**
 * Not on the roster, but credited on the albums they're on (Kidaf: Live From The Dungeon and
 * Knowledge Born). Named there and nowhere else: not in the bio, the crew or the artist pages.
 */
export const ALBUM_CREDIT_ONLY = ["Kidaf"];

export function isFeatured(name: string): boolean {
    return !sameName(NOT_FEATURED, name);
}

/** Whether a name can be listed among an artist's collaborators */
export function isListedCollaborator(name: string): boolean {
    return isFeatured(name) && !sameName(ALBUM_CREDIT_ONLY, name);
}

export const LOAF_MUZIK = {
    name: "Loaf Muzik",
    /** Loaf Music and Loaf Musik are how people often type it; Meatloaf Muzik was the first name */
    alternateNames: ["Loaf Music", "Loaf Musik", "Meatloaf Muzik"],
    summary:
        "Independent underground hip-hop collective from Brooklyn, New York, home to Shadow The Great and Oso Dope.",
    history: [
        "Loaf Muzik started out as Meatloaf Muzik and won AFROPUNK's Battle of the Bands, which put the crew on the festival's bill.",
        "They've performed at AfroPunk, the Apollo Theater, Hot 97's Hot Box and, outside New York, Higher Ground in Burlington, VT.",
    ],
    location: "Brooklyn, New York",
    genres: ["Hip-hop", "Underground hip-hop", "East Coast hip-hop"],
    sameAs: [
        "https://open.spotify.com/artist/2BvJc1CBYB5KRCzJfweIiK",
        "https://music.apple.com/us/artist/loaf-muzik/1060484178",
        "https://www.deezer.com/artist/9294324",
        "https://loafmuzik.bandcamp.com",
        "https://www.last.fm/music/LOAF+MUZIK",
    ],
};

export const LOAF_RECORDS = {
    name: "Loaf Records",
    summary:
        "Brooklyn independent hip-hop record label founded by Shadow The Great and Oso Dope, and the home of Loaf Muzik and Loaf Films.",
    location: "Brooklyn, New York",
    sameAs: [
        "https://www.instagram.com/loafrecords",
        "https://www.youtube.com/@LoafRecords",
        "https://www.facebook.com/loafrecords",
        "https://soundcloud.com/loafmuzik",
    ],
};

/** Coverage of the collective, newest first. Check the links still work before adding to this. */
export const PRESS = [
    {
        outlet: "RESPECT.",
        title: "Loaf Muzik Kill Their Group Cypher at TeamBackpack's LiveArtNY",
        url: "https://respect-mag.com/2015/07/loaf-muzik-kill-their-group-cypher-at-teambackpacks-liveartny",
    },
    {
        outlet: "Exclaim!",
        title: "Loaf Muzik, \"The Dungeon\" on Exclaim! TV",
        url: "https://exclaim.ca/music/article/loaf_muzik-the_dungeon_on_exclaim_tv",
    },
    {
        outlet: "Girls Write Now",
        title: "Now Introducing: Meatloaf Muzik",
        url: "https://girlswritenow.org/news/now-introducing-meatloaf-muzik/",
    },
];

/** "A, B & C" */
export function listNames(names: string[]): string {
    if (names.length < 2) return names.join("");
    return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
}

/** The crew member a credited name belongs to, if any */
export function findCrewMember(name: string): CrewMember | undefined {
    const key = name.trim().toLowerCase();
    return CREW.find(
        (member) => member.name.toLowerCase() === key || member.alternateNames.some((alt) => alt.toLowerCase() === key)
    );
}

export function crewMemberBySlug(slug: string): CrewMember | undefined {
    return CREW.find((member) => member.slug === slug);
}

/** Where a crew member's story lives: their own page, or their spot in the bio */
export function crewMemberPath(member: CrewMember): string {
    return member.hasPage ? `/artists/${member.slug}` : `/bio#${member.slug}`;
}

/**
 * The questions people actually ask about the crew, answered in a sentence or two.
 * Shown on the bio page, marked up for search engines and repeated in /llms.txt.
 */
export const LOAF_FAQ: Array<{ question: string; answer: string }> = [
    {
        question: "What is Loaf Muzik?",
        answer: "Loaf Muzik (sometimes written Loaf Music or Loaf Musik) is an independent underground hip-hop collective from Brooklyn, New York, home to Shadow The Great and Oso Dope, who founded its label, Loaf Records.",
    },
    {
        question: "Who founded Loaf Records?",
        answer: "Loaf Records was founded by Shadow The Great and Oso Dope. It's the Brooklyn label behind Loaf Muzik and Loaf Films.",
    },
    {
        question: "Who is Shadow The Great?",
        answer: SHADOW_THE_GREAT.summary,
    },
    {
        question: "Who is Oso Dope?",
        answer: `${OSO_DOPE.summary} On screen he's been in Raising Kanan, The Equalizer and Wu-Tang: An American Saga.`,
    },
    {
        question: "What albums has Shadow The Great released?",
        answer: "His newest is God Is Good, produced by Ruggz. Before it: Lost City, The Commission and More Life, plus the mixtapes Darkside, Lord Knows and The Munchies. With Loaf Muzik he made Live From The Dungeon (2015) and Knowledge Born (2017).",
    },
    {
        question: "Where can I listen to Loaf Muzik and Shadow The Great?",
        answer: "Shadow The Great's albums and Live From The Dungeon stream free on loafrecords.shop, where you can also buy the downloads. Loaf Muzik is on Spotify, Apple Music and Bandcamp, and the videos are on the Loaf Records YouTube channel and the site's Videos page.",
    },
];
