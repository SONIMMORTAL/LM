import { client } from './client';

// GROQ Queries for Sanity CMS

// Get all albums/releases
export const getAllAlbumsQuery = `
  *[_type == "album"] | order(releaseDate desc) {
    _id,
    title,
    slug,
    "cover": coverImage.asset->url,
    releaseDate,
    type,
    trackCount,
    duration,
    spotifyUrl,
    appleMusicUrl,
    featured
  }
`;

// Get single album by slug
export const getAlbumBySlugQuery = `
  *[_type == "album" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    "cover": coverImage.asset->url,
    releaseDate,
    type,
    description,
    tracks[] {
      title,
      duration,
      featuring
    },
    spotifyUrl,
    appleMusicUrl
  }
`;

// Get gallery images
export const getGalleryQuery = `
  *[_type == "galleryItem"] | order(date desc) {
    _id,
    title,
    "src": image.asset->url,
    type,
    size,
    date
  }
`;

// Fetch functions
export async function getAllAlbums() {
    return client.fetch(getAllAlbumsQuery);
}

export async function getAlbumBySlug(slug: string) {
    return client.fetch(getAlbumBySlugQuery, { slug });
}

export async function getGalleryItems() {
    return client.fetch(getGalleryQuery);
}
