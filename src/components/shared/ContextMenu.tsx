import { useEffect, useRef } from "react";
import type { ContextMenuItem } from "../../types/contextMenu";

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
}

export function ContextMenu({ items, position, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Escape key and click-outside dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleMouseDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, [onClose]);

  // Clamp position so menu stays on-screen
  const menuWidth = 200;
  const menuHeight = items.length * 30 + 8;
  const x = Math.min(position.x, window.innerWidth - menuWidth - 8);
  const y = Math.min(position.y, window.innerHeight - menuHeight - 8);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 py-1 rounded-lg"
      style={{
        left: x,
        top: y,
        background: "rgba(40, 40, 40, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        minWidth: 180,
      }}
    >
      {items.map((item, i) =>
        item.separator ? (
          <div
            key={`sep-${i}`}
            style={{
              height: 1,
              background: "rgba(255, 255, 255, 0.1)",
              margin: "4px 8px",
            }}
          />
        ) : (
          <button
            key={item.label}
            className="w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors duration-75"
            style={{
              color: item.disabled ? "var(--text-tertiary)" : "var(--text-primary)",
              cursor: item.disabled ? "default" : "pointer",
              background: "transparent",
              border: "none",
              outline: "none",
              borderRadius: 4,
              margin: "0 4px",
              width: "calc(100% - 8px)",
            }}
            onMouseEnter={(e) => {
              if (!item.disabled)
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255, 255, 255, 0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
            onClick={() => {
              if (!item.disabled) {
                item.onClick();
                if (!item.keepOpen) onClose();
              }
            }}
            disabled={item.disabled}
          >
            <span>
              {item.checked !== undefined && (
                <span style={{ display: "inline-block", width: 16, opacity: item.checked ? 1 : 0 }}>✓</span>
              )}
              {item.label}
            </span>
            {item.shortcut && (
              <span style={{ color: "var(--text-tertiary)", fontSize: 10 }}>
                {item.shortcut}
              </span>
            )}
          </button>
        )
      )}
    </div>
  );
}
