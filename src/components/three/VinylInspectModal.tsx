"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Play, Pause, Volume2, Sparkles, Disc } from "lucide-react";
import { VinylCanvas3D } from "./VinylCanvas3D";
import type { Track } from "@/lib/tracks-server";
import { cn } from "@/lib/utils";

export interface InspectableAlbum {
  name: string;
  artist: string;
  cover: string;
  vinylUrl?: string;
  tracks: Track[];
  price?: number;
}

export interface VinylInspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: InspectableAlbum | null;
  isPlaying: boolean;
  currentTrackTitle?: string;
  onPlayTrack: (trackIndex: number) => void;
  onOpenPurchaseModal?: (album: InspectableAlbum) => void;
}

export function VinylInspectModal({
  isOpen,
  onClose,
  album,
  isPlaying,
  currentTrackTitle,
  onPlayTrack,
  onOpenPurchaseModal,
}: VinylInspectModalProps) {

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!album) return null;

  const vinylTextureUrl = album.vinylUrl || album.cover;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-b from-noir-charcoal via-noir-slate/90 to-noir-void border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close 3D vinyl inspector"
              className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-noir-cloud hover:text-white border border-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column: 3D WebGL Vinyl Studio */}
            <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto flex flex-col items-center justify-center p-6 bg-gradient-to-b from-transparent to-black/40">
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>3D WebGL Studio</span>
              </div>

              {/* 3D Vinyl Canvas with grooving and scratch physics */}
              <div className="w-full h-full max-w-[340px] max-h-[340px] flex items-center justify-center">
                <VinylCanvas3D
                  coverUrl={vinylTextureUrl}
                  isPlaying={isPlaying}
                  interactive={true}
                  enableParallax={true}
                  className="w-full h-full"
                />
              </div>

              <div className="mt-2 text-center text-[11px] text-noir-ash font-mono uppercase tracking-wider">
                Click & drag to scratch · Tilt mouse for 3D sheen
              </div>
            </div>

            {/* Right Column: Album Details & Tracklist */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10 overflow-y-auto max-h-[50vh] md:max-h-[85vh]">
              <div>
                <div className="flex items-center gap-2 text-accent-cyan text-xs tracking-widest uppercase font-mono mb-1">
                  <Disc className="w-3.5 h-3.5" />
                  <span>Deluxe 12&quot; Vinyl Edition</span>
                </div>

                <h2 className="text-3xl font-display font-bold tracking-tight text-white mb-1">
                  {album.name}
                </h2>
                <p className="text-sm text-noir-cloud mb-6 font-mono">
                  {album.artist} · {album.tracks.length} Tracks
                </p>

                {/* Tracklist */}
                <div className="space-y-1.5 mb-6">
                  <div className="text-xs uppercase tracking-widest font-mono text-noir-ash pb-1 border-b border-white/10">
                    Track Selection
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {album.tracks.map((track, idx) => {
                      const isCurrent = currentTrackTitle === track.title;
                      return (
                        <button
                          key={track.id || idx}
                          onClick={() => onPlayTrack(idx)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm transition-all group",
                            isCurrent
                              ? "bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30"
                              : "hover:bg-white/5 text-noir-cloud hover:text-white"
                          )}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span className="text-xs font-mono opacity-50 w-5">
                              {(idx + 1).toString().padStart(2, "0")}
                            </span>
                            <span className="truncate font-medium">{track.title}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {isCurrent && isPlaying ? (
                              <Volume2 className="w-4 h-4 text-accent-cyan animate-pulse" />
                            ) : (
                              <Play className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-white" />
                            )}
                            <span className="text-xs font-mono text-noir-ash">
                              {track.duration || "--:--"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                {album.price && onOpenPurchaseModal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPurchaseModal(album);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-accent-cyan hover:bg-accent-cyan/90 text-black font-semibold text-sm transition-all shadow-glow-sm hover:shadow-glow-md text-center"
                  >
                    Buy Vinyl & Download (${album.price.toFixed(2)})
                  </button>
                )}
                <button
                  onClick={() => onPlayTrack(0)}
                  className="py-3 px-5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play All</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
