
export interface AlbumConfig {
    id: string;
    name: string;
    price: number;
    bucket: string;
    path: string; // Folder path within bucket, or empty string for root
}

export const ALBUMS: Record<string, AlbumConfig> = {
    'the-commission': {
        id: 'the-commission',
        name: 'The Commission',
        price: 9.99,
        bucket: 'music',
        path: '',
    },
    'more-life': {
        id: 'more-life',
        name: 'More Life',
        price: 9.99,
        bucket: 'more life',
        path: '',
    },
    'lost-city': {
        id: 'lost-city',
        name: 'Lost City',
        price: 9.99,
        bucket: 'Music3',
        path: '',
    },
    'live-from-the-dungeon': {
        id: 'live-from-the-dungeon',
        name: 'Live From The Dungeon',
        price: 9.99,
        bucket: 'music2',
        path: '', // Files are at the root of music2 bucket
    },
};

export function getAlbumBySlug(slug: string): AlbumConfig | undefined {
    return ALBUMS[slug];
}
