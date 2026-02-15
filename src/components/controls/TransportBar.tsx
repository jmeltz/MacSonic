import { PlaybackControls } from "./PlaybackControls";
import { VolumeControl } from "./VolumeControl";
import { ShuffleRepeat } from "./ShuffleRepeat";
import { usePlayerStore } from "../../stores/playerStore";
import { formatTime } from "../../lib/timeFormatter";

export function TransportBar() {
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);

  return (
    <div
      className="flex items-center justify-between shrink-0"
      style={{
        height: "var(--transport-height)",
        paddingLeft: 20,
        paddingRight: 20,
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div
        className="flex items-center gap-1 min-w-[80px] text-xs tabular-nums"
        style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
      >
        <span>{formatTime(currentTime)}</span>
        <span style={{ color: "var(--text-tertiary)" }}>/</span>
        <span style={{ color: "var(--text-tertiary)" }}>
          {formatTime(duration)}
        </span>
      </div>

      <PlaybackControls />

      <div className="flex items-center gap-3">
        <ShuffleRepeat />
        <VolumeControl />
      </div>
    </div>
  );
}
