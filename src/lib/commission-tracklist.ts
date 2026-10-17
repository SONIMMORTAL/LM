export interface CommissionTrackSpec {
    position: number;
    title: string;
    artist: string;
    id: string;
    storageFilename: string;
    legacyTitle: string;
}

/**
 * Canonical tracklist and ordering for "The Commission".
 * Maps legacy storage filenames / DB row IDs to the official 1–13 track titles and running order.
 */
export const THE_COMMISSION_TRACKLIST: readonly CommissionTrackSpec[] = [
    {
        position: 1,
        title: "Intro (feat. Coyote Beatz & Nathan Morais)",
        artist: "Shadow The Great",
        id: "84d97152-4350-4c84-ab1c-9a94df42efbe",
        storageFilename: "1. hip hop.mp3",
        legacyTitle: "hip hop",
    },
    {
        position: 2,
        title: "Chess (feat. King illa)",
        artist: "Shadow The Great",
        id: "cbd44bad-fc8d-4fde-97d9-0a9948c8f9cd",
        storageFilename: "2.CHESS - King illa.mp3",
        legacyTitle: "CHESS",
    },
    {
        position: 3,
        title: "Pray (feat. King illa)",
        artist: "Shadow The Great",
        id: "fb53bc4c-32bd-4f6e-903c-c6c1cb23dc64",
        storageFilename: "3.PRAY.mp3",
        legacyTitle: "PRAY",
    },
    {
        position: 4,
        title: "Juice (feat. Grandpadre & Kid Sanchez)",
        artist: "Shadow The Great",
        id: "f9091000-4273-437c-9224-6b1b3dbf5b64",
        storageFilename: "4.JUICE feat. Grandpadre.mp3",
        legacyTitle: "JUICE",
    },
    {
        position: 5,
        title: "Live and Direct (feat. Grandpadre & Laron)",
        artist: "Shadow The Great",
        id: "0c866637-bfa0-49cf-8345-caf420a423f4",
        storageFilename: "5.LIVE & DIRECT feat. Grandpadre.mp3",
        legacyTitle: "LIVE & DIRECT",
    },
    {
        position: 6,
        title: "Drop Gems (feat. Coyote Beatz)",
        artist: "Shadow The Great",
        id: "5b66a551-fd7b-4cd2-a1b7-659236eba304",
        storageFilename: "6.DROP GEMS - COYOTE .mp3",
        legacyTitle: "DROP GEMS",
    },
    {
        position: 7,
        title: "Whoa (feat. Coyote Beatz)",
        artist: "Shadow The Great",
        id: "23507047-30cc-468c-ac1a-8ab76cb3b16b",
        storageFilename: "7.WHOA - Coyote .mp3",
        legacyTitle: "WHOA",
    },
    {
        position: 8,
        title: "Abel (feat. Rah Tha Ruler & Gradis Nice)",
        artist: "Shadow The Great",
        id: "9c5ec0ce-4b3f-424f-bddf-c7c45bfeab87",
        storageFilename: "8.  ABEL feat. Rah the Ruler.mp3",
        legacyTitle: "ABEL",
    },
    {
        position: 9,
        title: "Hands High (feat. Rah Tha Ruler & Gradis Nice)",
        artist: "Shadow The Great",
        id: "f30da024-41a3-4979-875b-93fd1a40597f",
        storageFilename: "9. Hands High - Rah & Shadow .mp3",
        legacyTitle: "Hands High",
    },
    {
        position: 10,
        title: "interlude for God (feat. Grandpadre & Coyote Beatz)",
        artist: "Shadow The Great",
        id: "3cc43ff0-1327-403f-ac7e-f3e4d3f7587e",
        storageFilename: "OUTRO For God feat. Dre , Coyote Beatz.mp3",
        legacyTitle: "OUTRO For God",
    },
    {
        position: 11,
        title: "Reject (feat. King illa)",
        artist: "Shadow The Great",
        id: "6bad3b52-9b98-48c9-bbdb-d90dd9117b83",
        storageFilename: "GOTHAM - King illa.mp3",
        legacyTitle: "GOTHAM",
    },
    {
        position: 12,
        title: "Words from the wise (feat. Rah Tha Ruler & King illa)",
        artist: "Shadow The Great",
        id: "efcb8387-80d0-46a3-b90b-be98768a3fb2",
        storageFilename: "Words from the Wise feat Rah Tha Ruler.mp3",
        legacyTitle: "Words from the Wise",
    },
    {
        position: 13,
        title: "Gucciyanna (feat. Kollie)",
        artist: "Shadow The Great",
        id: "d2fffbb5-fc50-4652-9136-500b2692acf6",
        storageFilename: "Gucciyanna - Kollie x Shadow.mp3",
        legacyTitle: "Gucciyanna",
    },
];

function safeDecode(value: string): string {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

function extractFilename(urlOrFilename: string | null | undefined): string {
    if (!urlOrFilename) return "";
    const lastSegment = urlOrFilename.split("/").pop() || urlOrFilename;
    return safeDecode(lastSegment).trim().toLowerCase();
}

export function findCommissionTrackSpec(input: {
    id?: string | null;
    title?: string | null;
    audioUrl?: string | null;
    filename?: string | null;
}): CommissionTrackSpec | undefined {
    if (input.id) {
        const byId = THE_COMMISSION_TRACKLIST.find((spec) => spec.id === input.id);
        if (byId) return byId;
    }

    const candidateFile = extractFilename(input.filename || input.audioUrl);
    if (candidateFile) {
        const byFile = THE_COMMISSION_TRACKLIST.find(
            (spec) => spec.storageFilename.trim().toLowerCase() === candidateFile
        );
        if (byFile) return byFile;
    }

    if (input.title) {
        const normalizedTitle = input.title.trim().toLowerCase();
        const byTitle = THE_COMMISSION_TRACKLIST.find(
            (spec) =>
                spec.title.toLowerCase() === normalizedTitle ||
                spec.legacyTitle.toLowerCase() === normalizedTitle
        );
        if (byTitle) return byTitle;
    }

    return undefined;
}

export function isCommissionAlbumName(album: string | null | undefined): boolean {
    if (!album) return false;
    return album.trim().toLowerCase() === "the commission";
}

/**
 * Normalizes titles, artists, and 1–13 running order for "The Commission" tracks
 * while leaving all other albums untouched in their original slots.
 */
export function normalizeCommissionTracks<
    T extends {
        id?: string;
        title: string;
        artist: string;
        album: string | null;
        audio_url?: string | null;
    },
>(tracks: readonly T[], rawAudioUrlById?: ReadonlyMap<string, string | null>): T[] {
    const commissionIndices: number[] = [];
    const commissionItems: Array<{ track: T; position: number; originalOrder: number }> = [];

    const result = tracks.map((track, index) => {
        const belongsToCommission =
            isCommissionAlbumName(track.album) ||
            (!track.album && track.title !== "Lost City");

        if (!belongsToCommission) {
            return track;
        }

        const rawUrl = (track.id && rawAudioUrlById?.get(track.id)) ?? track.audio_url;
        const spec = findCommissionTrackSpec({
            id: track.id,
            title: track.title,
            audioUrl: rawUrl,
        });

        const updated: T = spec
            ? {
                  ...track,
                  title: spec.title,
                  artist: spec.artist,
                  album: "The Commission",
              }
            : {
                  ...track,
                  album: "The Commission",
              };

        commissionIndices.push(index);
        commissionItems.push({
            track: updated,
            position: spec?.position ?? 999,
            originalOrder: index,
        });

        return updated;
    });

    commissionItems.sort(
        (a, b) => a.position - b.position || a.originalOrder - b.originalOrder
    );

    commissionIndices.forEach((slotIndex, i) => {
        result[slotIndex] = commissionItems[i].track;
    });

    return result;
}
