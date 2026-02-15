import { usePlayerStore } from "../../stores/playerStore";
import { formatTime } from "../../lib/timeFormatter";

export function TimeDisplay() {
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);

  return (
    <div
      className="flex items-center gap-1 text-sm tabular-nums"
      style={{
        fontFamily: "var(--font-mono)",
        color: "var(--text-primary)",
      }}
    >
      <span>{formatTime(currentTime)}</span>
      <span style={{ color: "var(--text-tertiary)", fontSize: 10 }}>/</span>
      <span style={{ color: "var(--text-secondary)" }}>
        {formatTime(duration)}
      </span>
    </div>
  );
}
