"use client";

import { Music, Plus, Play, ExternalLink, Edit, Trash2, Upload, Loader2, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

interface Track {
    id: string;
    title: string;
    artist: string;
    duration: string | null;
    audio_url: string | null;
    soundcloud_url: string | null;
    album: string | null;
    price: number | null;
    plays: number;
    created_at: string;
}

export default function MusicManagerPage() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [title, setTitle] = useState("");
    const [artist, setArtist] = useState("Shadow The Great");
    const [duration, setDuration] = useState("");
    const [price, setPrice] = useState("");
    const [soundcloudUrl, setSoundcloudUrl] = useState("");
    const [album, setAlbum] = useState("More Life");

    useEffect(() => {
        fetchTracks();
    }, []);

    async function fetchTracks() {
        try {
            const res = await fetch("/api/admin/music");
            const data = await res.json();
            if (data.tracks) {
                setTracks(data.tracks);
            }
        } catch (error) {
            console.error("Failed to fetch tracks:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title || !artist) {
            toast.error("Title and artist are required");
            return;
        }

        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("artist", artist);
            if (duration) formData.append("duration", duration);
            if (price) formData.append("price", price);
            if (soundcloudUrl) formData.append("soundcloud_url", soundcloudUrl);
            if (album) formData.append("album", album);
            if (selectedFile) formData.append("audio", selectedFile);

            const res = await fetch("/api/admin/music", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Track added successfully!");
                setShowAddModal(false);
                resetForm();
                fetchTracks();
            } else {
                toast.error(data.error || "Failed to add track");
            }
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Something went wrong");
        } finally {
            setSubmitting(false);
        }
    }

    async function deleteTrack(id: string) {
        if (!confirm("Are you sure you want to delete this track?")) return;

        try {
            const res = await fetch(`/api/admin/music?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Track deleted");
                fetchTracks();
            } else {
                toast.error("Failed to delete track");
            }
        } catch (error) {
            toast.error("Something went wrong");
        }
    }

    function resetForm() {
        setTitle("");
        setArtist("Shadow The Great");
        setDuration("");
        setPrice("");
        setSoundcloudUrl("");
        setAlbum("More Life");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("audio/")) {
                toast.error("Please select an audio file");
                return;
            }
            setSelectedFile(file);
        }
    }

    return (
        <div className="space-y-6 pt-12 lg:pt-0">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Music Manager</h1>
                    <p className="text-noir-ash text-sm">Manage your tracks and albums</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-cyan text-noir-void font-semibold rounded-lg hover:bg-accent-cyan/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Track
                </button>
            </div>

            {/* Album Card */}
            <div className="bg-noir-charcoal border border-noir-smoke rounded-xl p-5">
                <div className="flex gap-4 items-start">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-noir-slate flex-shrink-0">
                        <Image
                            src="/MORE LIFE VINYL.jpg"
                            alt="More Life Album"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-foreground">More Life</h2>
                        <p className="text-noir-cloud text-sm">Shadow The Great • 2024</p>
                        <p className="text-noir-ash text-xs mt-1">{tracks.length} tracks</p>
                        <div className="flex gap-2 mt-3">
                            <a
                                href="https://soundcloud.com/loafmuzik"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs px-3 py-1 bg-noir-slate rounded-full text-noir-cloud hover:text-foreground transition-colors flex items-center gap-1"
                            >
                                SoundCloud <ExternalLink className="w-3 h-3" />
                            </a>
                            <a
                                href="https://loafrecords.shop"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs px-3 py-1 bg-noir-slate rounded-full text-noir-cloud hover:text-foreground transition-colors flex items-center gap-1"
                            >
                                Shop <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Track List */}
            <div className="bg-noir-charcoal border border-noir-smoke rounded-xl overflow-hidden">
                <div className="p-4 border-b border-noir-smoke">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Music className="w-4 h-4 text-accent-cyan" />
                        Track List
                    </h3>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-accent-cyan" />
                    </div>
                ) : tracks.length === 0 ? (
                    <div className="text-center py-12 text-noir-ash">
                        <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="mb-4">No tracks yet. Add your first track!</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-accent-cyan text-noir-void font-semibold rounded-lg hover:bg-accent-cyan/90 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Track
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-noir-smoke/50">
                        {tracks.map((track) => (
                            <div key={track.id} className="flex items-center justify-between px-4 py-3 hover:bg-noir-slate/30 transition-colors">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <button className="w-8 h-8 flex items-center justify-center rounded-full bg-noir-slate hover:bg-accent-cyan/20 text-noir-cloud hover:text-accent-cyan transition-colors">
                                        <Play className="w-4 h-4 ml-0.5" />
                                    </button>
                                    <div className="min-w-0">
                                        <p className="font-medium text-foreground truncate">{track.title}</p>
                                        <p className="text-xs text-noir-ash truncate">{track.artist}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-noir-ash hidden sm:block">{track.duration || "--:--"}</span>
                                    <span className="text-sm text-noir-cloud hidden md:block">{track.plays} plays</span>
                                    <div className="flex items-center gap-1">
                                        <button className="p-2 text-noir-ash hover:text-foreground transition-colors">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteTrack(track.id)}
                                            className="p-2 text-noir-ash hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Track Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-noir-void/90 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
                    <div className="bg-noir-charcoal border border-noir-smoke rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-foreground">Add New Track</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-1 text-noir-ash hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Audio File Upload */}
                            <div>
                                <label className="block text-sm text-noir-cloud mb-1">Audio File (optional)</label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="audio/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="audio-upload"
                                />
                                <label
                                    htmlFor="audio-upload"
                                    className="flex items-center justify-center gap-2 w-full px-4 py-8 border-2 border-dashed border-noir-smoke rounded-lg cursor-pointer hover:border-accent-cyan/50 transition-colors bg-noir-slate/30"
                                >
                                    {selectedFile ? (
                                        <div className="text-center">
                                            <Music className="w-8 h-8 mx-auto text-accent-cyan mb-2" />
                                            <p className="text-sm text-foreground">{selectedFile.name}</p>
                                            <p className="text-xs text-noir-ash mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <Upload className="w-8 h-8 mx-auto text-noir-ash mb-2" />
                                            <p className="text-sm text-noir-cloud">Click to upload audio</p>
                                            <p className="text-xs text-noir-ash">MP3, WAV, FLAC</p>
                                        </div>
                                    )}
                                </label>
                                {selectedFile && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedFile(null);
                                            if (fileInputRef.current) fileInputRef.current.value = "";
                                        }}
                                        className="mt-2 text-xs text-red-400 hover:underline"
                                    >
                                        Remove file
                                    </button>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm text-noir-cloud mb-1">Track Title *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-3 py-2 bg-noir-slate border border-noir-smoke rounded-lg text-foreground placeholder:text-noir-ash focus:outline-none focus:border-accent-cyan"
                                    placeholder="Enter track title"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-noir-cloud mb-1">Artist / Features *</label>
                                <input
                                    type="text"
                                    value={artist}
                                    onChange={(e) => setArtist(e.target.value)}
                                    className="w-full px-3 py-2 bg-noir-slate border border-noir-smoke rounded-lg text-foreground placeholder:text-noir-ash focus:outline-none focus:border-accent-cyan"
                                    placeholder="Shadow The Great feat. ..."
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-noir-cloud mb-1">Duration</label>
                                    <input
                                        type="text"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="w-full px-3 py-2 bg-noir-slate border border-noir-smoke rounded-lg text-foreground placeholder:text-noir-ash focus:outline-none focus:border-accent-cyan"
                                        placeholder="3:45"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-noir-cloud mb-1">Price</label>
                                    <input
                                        type="text"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="w-full px-3 py-2 bg-noir-slate border border-noir-smoke rounded-lg text-foreground placeholder:text-noir-ash focus:outline-none focus:border-accent-cyan"
                                        placeholder="$1.00"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-noir-cloud mb-1">SoundCloud URL</label>
                                <input
                                    type="url"
                                    value={soundcloudUrl}
                                    onChange={(e) => setSoundcloudUrl(e.target.value)}
                                    className="w-full px-3 py-2 bg-noir-slate border border-noir-smoke rounded-lg text-foreground placeholder:text-noir-ash focus:outline-none focus:border-accent-cyan"
                                    placeholder="https://soundcloud.com/..."
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 border border-noir-smoke text-foreground rounded-lg hover:bg-noir-slate transition-colors"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-accent-cyan text-noir-void font-semibold rounded-lg hover:bg-accent-cyan/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        "Add Track"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
