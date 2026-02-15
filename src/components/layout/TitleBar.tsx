import { useCallback } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { usePlayerStore } from "../../stores/playerStore";

export function TitleBar() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    getCurrentWindow().startDragging();
  }, []);

  const title = currentTrack
    ? currentTrack.metadata?.title || currentTrack.name
    : "MacSonic";

  const subtitle =
    currentTrack?.metadata?.artist && currentTrack?.metadata?.album
      ? `${currentTrack.metadata.artist} — ${currentTrack.metadata.album}`
      : currentTrack?.metadata?.artist || "";

  return (
    <div
      data-tauri-drag-region
      onMouseDown={handleMouseDown}
      style={{
        height: "var(--titlebar-height)",
        paddingLeft: 78,
        paddingRight: 16,
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        lineHeight: 1.3,
      }}
    >
      <span
        data-tauri-drag-region
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: "var(--text-primary)",
          pointerEvents: "none",
        }}
      >
        {title}
      </span>
      {subtitle && (
        <span
          data-tauri-drag-region
          style={{
            fontSize: 10,
            color: "var(--text-tertiary)",
            pointerEvents: "none",
          }}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
}
