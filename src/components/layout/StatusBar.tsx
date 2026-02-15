import { usePlayerStore } from "../../stores/playerStore";
import { formatSampleRate } from "../../lib/timeFormatter";

export function StatusBar() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const meta = currentTrack?.metadata;

  const parts: string[] = [];
  if (meta?.codec) parts.push(meta.codec.toUpperCase());
  if (meta?.sample_rate) parts.push(formatSampleRate(meta.sample_rate));
  if (meta?.bit_depth) parts.push(`${meta.bit_depth}-bit`);
  if (meta?.channels) parts.push(meta.channels === 1 ? "Mono" : meta.channels === 2 ? "Stereo" : `${meta.channels}ch`);

  return (
    <div
      className="flex items-center justify-between"
      style={{
        height: "var(--statusbar-height)",
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 4,
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border-subtle)",
        color: "var(--text-tertiary)",
        fontSize: 11,
      }}
    >
      <span>{parts.join(" · ") || "No track loaded"}</span>
      <span>
        {currentTrack ? (meta?.is_lossless ? "Lossless" : "Lossy") : ""}
      </span>
    </div>
  );
}
