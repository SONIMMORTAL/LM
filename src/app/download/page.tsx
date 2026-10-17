
import { verifyDownloadToken } from "@/lib/token";
import { getAlbumBySlug } from "@/lib/albums";
import { findCommissionTrackSpec, isCommissionAlbumName } from "@/lib/commission-tracklist";
import { supabaseAdmin } from "@/lib/supabase/admin";
import DownloadPageClient from "./DownloadPageClient";

// Map album slugs to cover images
const ALBUM_COVERS: Record<string, string> = {
    "more-life": "/MORE LIFE VINYL.jpg",
    "the-commission": "/THE COMMISSION.png",
    "lost-city": "/LC1.jpg",
    "live-from-the-dungeon": "/LFTD.jpg",
};

export default async function DownloadPage({
    searchParams,
}: {
    searchParams: Promise<{ token?: string }>;
}) {
    const { token } = await searchParams;

    if (!token) {
        return <DownloadPageClient error="invalid" />;
    }

    const payload = verifyDownloadToken(token);

    if (!payload) {
        return <DownloadPageClient error="expired" />;
    }

    const album = getAlbumBySlug(payload.albumSlug);

    if (!album) {
        return <DownloadPageClient error="not_found" />;
    }

    // List files from Supabase
    const { data: files, error } = await supabaseAdmin
        .storage
        .from(album.bucket)
        .list(album.path || undefined);

    if (error || !files) {
        console.error("Error listing files:", error);
        return <DownloadPageClient error="system" />;
    }

    const isCommission = isCommissionAlbumName(album.name);

    // Filter for audio/media files (ignore empty folders or system files)
    const mediaFiles = files
        .filter(f => f.name && !f.name.startsWith('.') && f.id)
        .sort((a, b) => {
            if (isCommission) {
                const posA = findCommissionTrackSpec({ filename: a.name })?.position ?? 999;
                const posB = findCommissionTrackSpec({ filename: b.name })?.position ?? 999;
                if (posA !== posB) return posA - posB;
            }
            return a.name.localeCompare(b.name, undefined, { numeric: true });
        });

    // Generate signed URLs for each file
    const tracksWithUrls = await Promise.all(mediaFiles.map(async (file) => {
        const filePath = album.path ? `${album.path}/${file.name}` : file.name;
        const { data } = await supabaseAdmin
            .storage
            .from(album.bucket)
            .createSignedUrl(filePath, 60 * 60 * 24); // 24 hour link validity

        const spec = isCommission ? findCommissionTrackSpec({ filename: file.name }) : undefined;
        const ext = file.name.split('.').pop() || 'mp3';
        const displayName = spec ? `${spec.title}.${ext}` : file.name;

        return {
            name: displayName,
            url: data?.signedUrl || null,
            size: (file.metadata?.size || 0) as number,
        };
    }));

    // Get album cover
    const cover = ALBUM_COVERS[payload.albumSlug] || "/MORE LIFE VINYL.jpg";

    // Calculate expiration
    const expiresAt = new Date(payload.exp * 1000).toISOString();

    return (
        <DownloadPageClient
            albumData={{
                name: album.name,
                cover,
                tracks: tracksWithUrls,
                expiresAt,
            }}
        />
    );
}
