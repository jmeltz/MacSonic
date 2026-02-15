import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { usePlayerStore } from "../../stores/playerStore";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";

export function PlaybackControls() {
  const status = usePlayerStore((s) => s.status);
  const { togglePlayPause, stop, playNext, playPrev } = useAudioPlayer();

  return (
    <div className="flex items-center gap-0.5">
      <button className="transport-btn" onClick={playPrev} title="Previous (P)">
        <SkipBack size={15} fill="currentColor" />
      </button>
      <button className="transport-btn" onClick={stop} title="Stop (S)">
        <Square size={12} fill="currentColor" />
      </button>
      <button
        className="transport-btn transport-btn-primary"
        onClick={togglePlayPause}
        title={status === "playing" ? "Pause" : "Play"}
      >
        {status === "playing" ? (
          <Pause size={18} fill="currentColor" />
        ) : (
          <Play size={18} fill="currentColor" className="ml-0.5" />
        )}
      </button>
      <button className="transport-btn" onClick={playNext} title="Next (N)">
        <SkipForward size={15} fill="currentColor" />
      </button>
    </div>
  );
}
