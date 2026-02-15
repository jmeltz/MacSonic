import { Volume2, Volume1, VolumeX } from "lucide-react";
import { usePlayerStore } from "../../stores/playerStore";

export function VolumeControl() {
  const volume = usePlayerStore((s) => s.volume);
  const muted = usePlayerStore((s) => s.muted);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="flex items-center gap-1.5">
      <button
        className="icon-btn"
        onClick={toggleMute}
        title={muted ? "Unmute" : "Mute"}
      >
        <VolumeIcon size={14} />
      </button>
      <div className="volume-slider-track">
        <div
          className="volume-slider-fill"
          style={{ width: `${(muted ? 0 : volume) * 100}%` }}
        />
        <input
          type="range"
          min={0}
          max={1}
          step="any"
          value={muted ? 0 : volume}
          onChange={(e) => {
            setVolume(parseFloat(e.target.value));
            if (usePlayerStore.getState().muted) {
              toggleMute();
            }
          }}
          className="volume-slider-input"
        />
      </div>
    </div>
  );
}
