/** The exact encoding used by public/intro-light.mp4 (H.264 baseline, level 3.1). */
export const INTRO_VIDEO_CONFIG = {
    contentType: 'video/mp4; codecs="avc1.42C01F"',
    width: 1280,
    height: 720,
    bitrate: 2_500_000,
    framerate: 24,
};

export interface IntroDeviceHints {
    mobile: boolean;
    reducedMotion: boolean;
    seenIntro: boolean;
    saveData?: boolean;
    effectiveType?: string;
    deviceMemory?: number;
    hardwareConcurrency?: number;
}

/** Optional decoration: skip when resources are limited or CPU hints are absent. */
export function canAttemptIntro(hints: IntroDeviceHints): boolean {
    if (hints.reducedMotion || hints.seenIntro || hints.saveData) return false;
    if (hints.effectiveType && hints.effectiveType !== "4g") return false;
    if (!hints.hardwareConcurrency || hints.hardwareConcurrency < (hints.mobile ? 6 : 4)) return false;
    if (hints.deviceMemory !== undefined && hints.deviceMemory < (hints.mobile ? 8 : 4)) return false;
    return true;
}

export function supportsSmoothIntro(info: {
    supported: boolean;
    smooth: boolean;
    powerEfficient: boolean;
}): boolean {
    return info.supported && info.smooth && info.powerEfficient;
}

/** Ignore startup bookkeeping; stop if more than 10% of a meaningful sample drops. */
export function isIntroDroppingFrames(total: number, dropped: number): boolean {
    return total >= 12 && dropped / total > 0.1;
}
