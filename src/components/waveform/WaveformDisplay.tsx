import { useCallback } from "react";
import { usePlayerStore } from "../../stores/playerStore";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import { WaveformCanvas } from "./WaveformCanvas";
import { PeakMeter } from "./PeakMeter";
import { TimeDisplay } from "./TimeDisplay";

export function WaveformDisplay() {
  const peaks = usePlayerStore((s) => s.peaks);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const isLoadingWaveform = usePlayerStore((s) => s.isLoadingWaveform);
  const status = usePlayerStore((s) => s.status);
  const { seek } = useAudioPlayer();

  const progress = duration > 0 ? currentTime / duration : 0;

  const handleSeek = useCallback(
    (prog: number) => {
      if (duration > 0) {
        seek(prog * duration);
      }
    },
    [duration, seek]
  );

  return (
    <div
      className="flex flex-col h-full relative"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="flex-1 flex items-stretch min-h-0">
        <div className="flex-1 min-w-0">
          {peaks.length > 0 ? (
            <WaveformCanvas
              peaks={peaks}
              progress={progress}
              onSeek={handleSeek}
            />
          ) : (
            <div
              className="flex items-center justify-center h-full text-xs"
              style={{ color: "var(--text-tertiary)" }}
            >
              {isLoadingWaveform
                ? "Decoding waveform..."
                : status === "stopped"
                  ? "No track loaded"
                  : "Loading..."}
            </div>
          )}
        </div>
        <div
          className="shrink-0 flex items-center px-1"
          style={{ borderLeft: "1px solid var(--border-subtle)" }}
        >
          <PeakMeter />
        </div>
      </div>
      <div
        className="absolute bottom-2 right-12"
        style={{ pointerEvents: "none" }}
      >
        <TimeDisplay />
      </div>
    </div>
  );
}
