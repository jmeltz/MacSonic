import { create } from "zustand";
import type { AudioMetadata, PlaybackStatus, RepeatMode, Track } from "../types/audio";

interface PlayerState {
  status: PlaybackStatus;
  currentTrack: Track | null;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  queue: Track[];
  queueIndex: number;
  shuffleEnabled: boolean;
  shuffledIndices: number[];
  repeatMode: RepeatMode;
  peaks: number[];
  isLoadingWaveform: boolean;

  setStatus: (status: PlaybackStatus) => void;
  setCurrentTrack: (track: Track | null) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  setQueueIndex: (index: number) => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  setPeaks: (peaks: number[]) => void;
  setIsLoadingWaveform: (loading: boolean) => void;
  updateTrackMetadata: (metadata: AudioMetadata) => void;
  getNextIndex: () => number | null;
  getPrevIndex: () => number | null;
}

function shuffleArray(length: number): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  status: "stopped",
  currentTrack: null,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  muted: false,
  queue: [],
  queueIndex: -1,
  shuffleEnabled: false,
  shuffledIndices: [],
  repeatMode: "off",
  peaks: [],
  isLoadingWaveform: false,

  setStatus: (status) => set({ status }),
  setCurrentTrack: (track) => set({ currentTrack: track }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  setQueue: (tracks, startIndex = 0) => {
    const shuffledIndices = shuffleArray(tracks.length);
    set({ queue: tracks, queueIndex: startIndex, shuffledIndices });
  },
  setQueueIndex: (index) => set({ queueIndex: index }),
  toggleShuffle: () =>
    set((s) => {
      const enabled = !s.shuffleEnabled;
      return {
        shuffleEnabled: enabled,
        shuffledIndices: enabled ? shuffleArray(s.queue.length) : [],
      };
    }),
  cycleRepeatMode: () =>
    set((s) => {
      const modes: RepeatMode[] = ["off", "one", "all"];
      const idx = modes.indexOf(s.repeatMode);
      return { repeatMode: modes[(idx + 1) % modes.length] };
    }),
  setPeaks: (peaks) => set({ peaks }),
  setIsLoadingWaveform: (loading) => set({ isLoadingWaveform: loading }),
  updateTrackMetadata: (metadata) =>
    set((s) => {
      if (s.currentTrack && s.currentTrack.path === metadata.path) {
        return { currentTrack: { ...s.currentTrack, metadata } };
      }
      return {};
    }),

  getNextIndex: () => {
    const { queue, queueIndex, shuffleEnabled, shuffledIndices, repeatMode } =
      get();
    if (queue.length === 0) return null;

    if (repeatMode === "one") return queueIndex;

    if (shuffleEnabled) {
      const currentShufflePos = shuffledIndices.indexOf(queueIndex);
      const nextShufflePos = currentShufflePos + 1;
      if (nextShufflePos < shuffledIndices.length) {
        return shuffledIndices[nextShufflePos];
      }
      return repeatMode === "all" ? shuffledIndices[0] : null;
    }

    const nextIndex = queueIndex + 1;
    if (nextIndex < queue.length) return nextIndex;
    return repeatMode === "all" ? 0 : null;
  },

  getPrevIndex: () => {
    const { queue, queueIndex, shuffleEnabled, shuffledIndices, repeatMode } =
      get();
    if (queue.length === 0) return null;

    if (shuffleEnabled) {
      const currentShufflePos = shuffledIndices.indexOf(queueIndex);
      const prevShufflePos = currentShufflePos - 1;
      if (prevShufflePos >= 0) {
        return shuffledIndices[prevShufflePos];
      }
      return repeatMode === "all"
        ? shuffledIndices[shuffledIndices.length - 1]
        : null;
    }

    const prevIndex = queueIndex - 1;
    if (prevIndex >= 0) return prevIndex;
    return repeatMode === "all" ? queue.length - 1 : null;
  },
}));
