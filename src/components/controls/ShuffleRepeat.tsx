import { Shuffle, Repeat, Repeat1 } from "lucide-react";
import { usePlayerStore } from "../../stores/playerStore";

export function ShuffleRepeat() {
  const shuffleEnabled = usePlayerStore((s) => s.shuffleEnabled);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const cycleRepeatMode = usePlayerStore((s) => s.cycleRepeatMode);

  return (
    <div className="flex items-center gap-0.5">
      <button
        className={`icon-btn ${shuffleEnabled ? "icon-btn-active" : ""}`}
        onClick={toggleShuffle}
        title="Shuffle"
      >
        <Shuffle size={13} />
      </button>
      <button
        className={`icon-btn ${repeatMode !== "off" ? "icon-btn-active" : ""}`}
        onClick={cycleRepeatMode}
        title={`Repeat: ${repeatMode}`}
      >
        {repeatMode === "one" ? <Repeat1 size={13} /> : <Repeat size={13} />}
      </button>
    </div>
  );
}
