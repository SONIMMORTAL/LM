"use client";

import { useState, useCallback } from "react";

export interface Track {
    id: string;
    title: string;
    artist: string;
    albumArt: string;
    audioUrl: string;
    duration: number;
}

interface MusicPlayerState {
    currentTrack: Track | null;
    isPlaying: boolean;
    progress: number;
    volume: number;
    isExpanded: boolean;
}

/**
 * Custom hook for managing music player state
 * Provides controls for playback, volume, and UI state
 */
export function useMusicPlayer() {
    const [state, setState] = useState<MusicPlayerState>({
        currentTrack: null,
        isPlaying: false,
        progress: 0,
        volume: 80,
        isExpanded: false,
    });

    const setTrack = useCallback((track: Track) => {
        setState((prev) => ({
            ...prev,
            currentTrack: track,
            progress: 0,
            isPlaying: true,
        }));
    }, []);

    const togglePlay = useCallback(() => {
        setState((prev) => ({
            ...prev,
            isPlaying: !prev.isPlaying,
        }));
    }, []);

    const setProgress = useCallback((progress: number) => {
        setState((prev) => ({
            ...prev,
            progress: Math.max(0, Math.min(100, progress)),
        }));
    }, []);

    const setVolume = useCallback((volume: number) => {
        setState((prev) => ({
            ...prev,
            volume: Math.max(0, Math.min(100, volume)),
        }));
    }, []);

    const toggleExpanded = useCallback(() => {
        setState((prev) => ({
            ...prev,
            isExpanded: !prev.isExpanded,
        }));
    }, []);

    const setExpanded = useCallback((expanded: boolean) => {
        setState((prev) => ({
            ...prev,
            isExpanded: expanded,
        }));
    }, []);

    return {
        ...state,
        setTrack,
        togglePlay,
        setProgress,
        setVolume,
        toggleExpanded,
        setExpanded,
    };
}
