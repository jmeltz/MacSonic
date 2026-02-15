import { useEffect, useRef, useCallback } from "react";
import { usePlayerStore } from "../stores/playerStore";
import { readAudioFile } from "../lib/tauriCommands";
import type { Track } from "../types/audio";

let audioElement: HTMLAudioElement | null = null;
let currentBlobUrl: string | null = null;
let audioContext: AudioContext | null = null;
let gainNode: GainNode | null = null;
let sourceNode: MediaElementAudioSourceNode | null = null;

function ensureAudioGraph(audio: HTMLAudioElement) {
  if (audioContext) return;
  audioContext = new AudioContext();
  gainNode = audioContext.createGain();
  sourceNode = audioContext.createMediaElementSource(audio);
  sourceNode.connect(gainNode);
  gainNode.connect(audioContext.destination);
  const state = usePlayerStore.getState();
  gainNode.gain.value = state.muted ? 0 : state.volume;
}

function getMimeType(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "mp3":
      return "audio/mpeg";
    case "flac":
      return "audio/flac";
    case "wav":
      return "audio/wav";
    case "m4a":
    case "aac":
    case "alac":
      return "audio/mp4";
    case "ogg":
    case "opus":
      return "audio/ogg";
    case "weba":
      return "audio/webm";
    case "aiff":
    case "aif":
      return "audio/aiff";
    default:
      return "audio/mpeg";
  }
}

function getAudio(): HTMLAudioElement {
  if (!audioElement) {
    audioElement = new Audio();
    ensureAudioGraph(audioElement);
  }
  return audioElement;
}

usePlayerStore.subscribe((state) => {
  if (gainNode) {
    gainNode.gain.value = state.muted ? 0 : state.volume;
  }
});

export function useAudioPlayer() {
  const store = usePlayerStore();
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(0);

  const {
    status,
    setStatus,
    setCurrentTrack,
    setCurrentTime,
    setDuration,
    setQueue,
    setQueueIndex,
    setPeaks,
    setIsLoadingWaveform,
  } = store;

  useEffect(() => {
    const audio = getAudio();

    const onLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const onEnded = () => {
      const nextIndex = usePlayerStore.getState().getNextIndex();
      const queue = usePlayerStore.getState().queue;
      const currentIndex = usePlayerStore.getState().queueIndex;

      if (
        usePlayerStore.getState().repeatMode === "one"
      ) {
        audio.currentTime = 0;
        audio.play();
        return;
      }

      if (nextIndex !== null && nextIndex !== currentIndex) {
        const nextTrack = queue[nextIndex];
        if (nextTrack) {
          loadTrack(nextTrack, nextIndex);
        }
      } else {
        setStatus("stopped");
        setCurrentTime(0);
        cancelAnimationFrame(rafRef.current);
      }
    };

    const onError = () => {
      setStatus("stopped");
      console.error("Audio playback error");
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, []);

  const startTimeTracking = useCallback(() => {
    const audio = getAudio();

    const update = () => {
      if (audio.currentTime !== lastTimeRef.current) {
        setCurrentTime(audio.currentTime);
        lastTimeRef.current = audio.currentTime;
      }
      rafRef.current = requestAnimationFrame(update);
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(update);
  }, [setCurrentTime]);

  const loadTrack = useCallback(
    async (track: Track, queueIndex?: number) => {
      const audio = getAudio();
      setStatus("loading");
      setCurrentTrack(track);
      setPeaks([]);

      if (queueIndex !== undefined) {
        setQueueIndex(queueIndex);
      }

      try {
        if (currentBlobUrl) {
          URL.revokeObjectURL(currentBlobUrl);
          currentBlobUrl = null;
        }

        const arrayBuffer = await readAudioFile(track.path);
        const blob = new Blob([arrayBuffer], { type: getMimeType(track.path) });
        currentBlobUrl = URL.createObjectURL(blob);

        audio.src = currentBlobUrl;
        audioContext?.resume();
        await audio.play();
        setStatus("playing");
        startTimeTracking();

        setIsLoadingWaveform(true);
        try {
          const { decodeAndExtractPeaks } = await import(
            "../lib/waveformGenerator"
          );
          const waveformBuffer = arrayBuffer.slice(0);
          const peaks = await decodeAndExtractPeaks(waveformBuffer);
          setPeaks(peaks);
        } catch {
          // Waveform decode failure is non-critical
        } finally {
          setIsLoadingWaveform(false);
        }
      } catch (err) {
        console.error("Failed to load track:", err);
        setStatus("stopped");
      }
    },
    [
      setStatus,
      setCurrentTrack,
      setPeaks,
      setQueueIndex,
      setIsLoadingWaveform,
      startTimeTracking,
    ]
  );

  const play = useCallback(async () => {
    const audio = getAudio();
    if (audio.src) {
      await audio.play();
      setStatus("playing");
      startTimeTracking();
    }
  }, [setStatus, startTimeTracking]);

  const pause = useCallback(() => {
    const audio = getAudio();
    audio.pause();
    setStatus("paused");
    cancelAnimationFrame(rafRef.current);
  }, [setStatus]);

  const stop = useCallback(() => {
    const audio = getAudio();
    audio.pause();
    audio.currentTime = 0;
    setStatus("stopped");
    setCurrentTime(0);
    cancelAnimationFrame(rafRef.current);
  }, [setStatus, setCurrentTime]);

  const togglePlayPause = useCallback(() => {
    if (status === "playing") {
      pause();
    } else {
      play();
    }
  }, [status, play, pause]);

  const seek = useCallback(
    (time: number) => {
      const audio = getAudio();
      audio.currentTime = Math.max(0, Math.min(time, audio.duration || 0));
      setCurrentTime(audio.currentTime);
    },
    [setCurrentTime]
  );

  const seekRelative = useCallback(
    (delta: number) => {
      const audio = getAudio();
      seek(audio.currentTime + delta);
    },
    [seek]
  );

  const playNext = useCallback(() => {
    const state = usePlayerStore.getState();
    const nextIndex = state.getNextIndex();
    if (nextIndex !== null) {
      const track = state.queue[nextIndex];
      if (track) loadTrack(track, nextIndex);
    }
  }, [loadTrack]);

  const playPrev = useCallback(() => {
    const audio = getAudio();
    if (audio.currentTime > 3) {
      seek(0);
      return;
    }
    const state = usePlayerStore.getState();
    const prevIndex = state.getPrevIndex();
    if (prevIndex !== null) {
      const track = state.queue[prevIndex];
      if (track) loadTrack(track, prevIndex);
    }
  }, [loadTrack, seek]);

  const playTrackFromList = useCallback(
    (tracks: Track[], index: number) => {
      setQueue(tracks, index);
      const track = tracks[index];
      if (track) loadTrack(track, index);
    },
    [setQueue, loadTrack]
  );

  return {
    loadTrack,
    play,
    pause,
    stop,
    togglePlayPause,
    seek,
    seekRelative,
    playNext,
    playPrev,
    playTrackFromList,
    getAudioElement: getAudio,
  };
}
