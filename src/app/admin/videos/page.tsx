"use client";

import { Video, Plus, Eye, ExternalLink, Edit, Trash2, Upload, Loader2, X, Youtube, Film } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

interface VideoItem {
    id: string;
    title: string;
    youtube_id: string | null;
    video_url: string | null;
    description: string | null;
    thumbnail_url: string | null;
    views: number;
    created_at: string;
}

export default function VideosManagerPage() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadMode, setUploadMode] = useState<"youtube" | "file">("youtube");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [title, setTitle] = useState("");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        fetchVideos();
    }, []);

    async function fetchVideos() {
        try {
            const res = await fetch("/api/admin/videos");
            const data = await res.json();
            if (data.videos) {
                setVideos(data.videos);
            }
        } catch (error) {
            console.error("Failed to fetch videos:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title) {
            toast.error("Title is required");
            return;
        }

        if (uploadMode === "youtube" && !youtubeUrl) {
            toast.error("YouTube URL is required");
            return;
        }

        if (uploadMode === "file" && !selectedFile) {
            toast.error("Video file is required");
            return;
        }

        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("title", title);
            if (description) formData.append("description", description);

            if (uploadMode === "youtube") {
                formData.append("youtube_url", youtubeUrl);
            } else if (selectedFile) {
                formData.append("video", selectedFile);
            }

            const res = await fetch("/api/admin/videos", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Video added successfully!");
                setShowAddModal(false);
                resetForm();
                fetchVideos();
            } else {
                toast.error(data.error || "Failed to add video");
            }
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Something went wrong");
        } finally {
            setSubmitting(false);
        }
    }

    async function deleteVideo(id: string) {
        if (!confirm("Are you sure you want to delete this video?")) return;

        try {
            const res = await fetch(`/api/admin/videos?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Video deleted");
                fetchVideos();
            } else {
                toast.error("Failed to delete video");
            }
        } catch (error) {
            toast.error("Something went wrong");
        }
    }

    function resetForm() {
        setTitle("");
        setYoutubeUrl("");
        setDescription("");
        setSelectedFile(null);
        setUploadMode("youtube");
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("video/")) {
                toast.error("Please select a video file");
                return;
            }
            setSelectedFile(file);
        }
    }

    // Calculate stats
    const totalViews = videos.reduce((sum, v) => sum + v.views, 0);

    return (
        <div className="space-y-6 pt-12 lg:pt-0">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Video Manager</h1>
                    <p className="text-noir-ash text-sm">Manage your YouTube videos and uploads</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-cyan text-noir-void font-semibold rounded-lg hover:bg-accent-cyan/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Video
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-noir-charcoal border border-noir-smoke rounded-xl p-4">
                    <p className="text-2xl font-bold text-foreground">{videos.length}</p>
                    <p className="text-sm text-noir-ash">Total Videos</p>
                </div>
                <div className="bg-noir-charcoal border border-noir-smoke rounded-xl p-4">
                    <p className="text-2xl font-bold text-foreground">{totalViews.toLocaleString()}</p>
                    <p className="text-sm text-noir-ash">Total Views</p>
                </div>
                <div className="bg-noir-charcoal border border-noir-smoke rounded-xl p-4">
                    <p className="text-2xl font-bold text-foreground">{videos.filter(v => v.youtube_id).length}</p>
                    <p className="text-sm text-noir-ash">YouTube Videos</p>
                </div>
                <div className="bg-noir-charcoal border border-noir-smoke rounded-xl p-4">
                    <p className="text-2xl font-bold text-foreground">{videos.filter(v => v.video_url).length}</p>
                    <p className="text-sm text-noir-ash">Uploaded Videos</p>
                </div>
            </div>

            {/* Video Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-accent-cyan" />
                </div>
            ) : videos.length === 0 ? (
                <div className="text-center py-12 text-noir-ash bg-noir-charcoal rounded-xl border border-noir-smoke">
                    <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No videos yet. Add your first video!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.map((video) => (
                        <div key={video.id} className="bg-noir-charcoal border border-noir-smoke rounded-xl overflow-hidden group">
                            {/* Thumbnail */}
                            <div className="relative aspect-video bg-noir-slate">
                                {video.youtube_id ? (
                                    <Image
                                        src={`https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
                                        alt={video.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : video.thumbnail_url ? (
                                    <Image
                                        src={video.thumbnail_url}
                                        alt={video.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Film className="w-12 h-12 text-noir-ash" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-noir-void/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    {video.youtube_id && (
                                        <a
                                            href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-noir-charcoal/90 rounded-full hover:bg-accent-cyan/20 text-foreground transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                    <button className="p-2 bg-noir-charcoal/90 rounded-full hover:bg-accent-cyan/20 text-foreground transition-colors">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteVideo(video.id)}
                                        className="p-2 bg-noir-charcoal/90 rounded-full hover:bg-red-500/20 text-foreground hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                {video.youtube_id && (
                                    <div className="absolute top-2 left-2">
                                        <Youtube className="w-5 h-5 text-[#FF0000]" />
                                    </div>
                                )}
                            </div>
                            {/* Info */}
                            <div className="p-3">
                                <h3 className="font-medium text-foreground text-sm line-clamp-2 mb-1">{video.title}</h3>
                                <div className="flex items-center justify-between text-xs text-noir-ash">
                                    <span className="flex items-center gap-1">
                                        <Eye className="w-3 h-3" />
                                        {video.views.toLocaleString()}
                                    </span>
                                    <span>{new Date(video.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* YouTube Channel Link */}
            <div className="bg-noir-charcoal border border-noir-smoke rounded-xl p-5 text-center">
                <p className="text-noir-cloud mb-3">Manage your full channel on YouTube</p>
                <a
                    href="https://studio.youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2 bg-[#FF0000] text-white font-semibold rounded-lg hover:bg-[#CC0000] transition-colors"
                >
                    Open YouTube Studio
                </a>
            </div>

            {/* Add Video Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-noir-void/90 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
                    <div className="bg-noir-charcoal border border-noir-smoke rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-foreground">Add New Video</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-1 text-noir-ash hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Upload Mode Tabs */}
                        <div className="flex gap-2 mb-4">
                            <button
                                type="button"
                                onClick={() => setUploadMode("youtube")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${uploadMode === "youtube"
                                        ? "bg-[#FF0000]/20 text-[#FF0000] border border-[#FF0000]/50"
                                        : "bg-noir-slate text-noir-cloud"
                                    }`}
                            >
                                <Youtube className="w-4 h-4" />
                                YouTube Link
                            </button>
                            <button
                                type="button"
                                onClick={() => setUploadMode("file")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${uploadMode === "file"
                                        ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50"
                                        : "bg-noir-slate text-noir-cloud"
                                    }`}
                            >
                                <Upload className="w-4 h-4" />
                                Upload File
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {uploadMode === "youtube" ? (
                                <div>
                                    <label className="block text-sm text-noir-cloud mb-1">YouTube URL *</label>
                                    <input
                                        type="text"
                                        value={youtubeUrl}
                                        onChange={(e) => setYoutubeUrl(e.target.value)}
                                        className="w-full px-3 py-2 bg-noir-slate border border-noir-smoke rounded-lg text-foreground placeholder:text-noir-ash focus:outline-none focus:border-accent-cyan"
                                        placeholder="https://youtube.com/watch?v=... or video ID"
                                    />
                                    <p className="text-xs text-noir-ash mt-1">Paste the full URL or just the video ID</p>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm text-noir-cloud mb-1">Video File *</label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="video/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        id="video-upload"
                                    />
                                    <label
                                        htmlFor="video-upload"
                                        className="flex items-center justify-center gap-2 w-full px-4 py-8 border-2 border-dashed border-noir-smoke rounded-lg cursor-pointer hover:border-accent-cyan/50 transition-colors bg-noir-slate/30"
                                    >
                                        {selectedFile ? (
                                            <div className="text-center">
                                                <Film className="w-8 h-8 mx-auto text-accent-cyan mb-2" />
                                                <p className="text-sm text-foreground">{selectedFile.name}</p>
                                                <p className="text-xs text-noir-ash mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <Upload className="w-8 h-8 mx-auto text-noir-ash mb-2" />
                                                <p className="text-sm text-noir-cloud">Click to upload video</p>
                                                <p className="text-xs text-noir-ash">MP4, MOV, AVI</p>
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
                            )}

                            <div>
                                <label className="block text-sm text-noir-cloud mb-1">Video Title *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-3 py-2 bg-noir-slate border border-noir-smoke rounded-lg text-foreground placeholder:text-noir-ash focus:outline-none focus:border-accent-cyan"
                                    placeholder="Shadow The Great - Track Name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-noir-cloud mb-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-3 py-2 bg-noir-slate border border-noir-smoke rounded-lg text-foreground placeholder:text-noir-ash focus:outline-none focus:border-accent-cyan resize-none"
                                    rows={3}
                                    placeholder="Video description..."
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
                                            {uploadMode === "file" ? "Uploading..." : "Adding..."}
                                        </>
                                    ) : (
                                        "Add Video"
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
