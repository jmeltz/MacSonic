import { useCallback, useRef } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useUIStore } from "../../stores/uiStore";
import type { SortField } from "../../types/ui";

interface ColumnHeaderProps {
  field: SortField;
  label: string;
  resizable?: boolean;
  style?: React.CSSProperties;
}

export function ColumnHeader({
  field,
  label,
  resizable = true,
  style,
}: ColumnHeaderProps) {
  const sort = useUIStore((s) => s.sort);
  const toggleSort = useUIStore((s) => s.toggleSort);
  const isActive = sort.field === field;
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const currentWidth = useUIStore.getState().columnWidths[field];
      if (!currentWidth) return; // don't resize flex column (name)
      dragStartX.current = e.clientX;
      dragStartWidth.current = currentWidth;

      const onMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientX - dragStartX.current;
        useUIStore
          .getState()
          .setColumnWidth(field, dragStartWidth.current + delta);
      };

      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [field]
  );

  return (
    <div className="relative flex items-center" style={style}>
      <button
        className="flex items-center gap-1 text-left text-[11px] font-medium uppercase tracking-wider transition-colors duration-100 hover:text-[var(--text-primary)] w-full"
        style={{
          color: isActive ? "var(--text-primary)" : "var(--text-tertiary)",
        }}
        onClick={() => toggleSort(field)}
      >
        <span className="truncate">{label}</span>
        {isActive &&
          (sort.direction === "asc" ? (
            <ArrowUp size={10} className="shrink-0" />
          ) : (
            <ArrowDown size={10} className="shrink-0" />
          ))}
      </button>
      {resizable && field !== "name" && (
        <div className="col-resize-handle" onMouseDown={handleResizeStart} />
      )}
    </div>
  );
}
