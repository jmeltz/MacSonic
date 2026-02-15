import { useState, useCallback } from "react";
import { ChevronRight, ChevronDown, Folder, X } from "lucide-react";
import { useFileSystemStore } from "../../stores/fileSystemStore";
import { useUIStore } from "../../stores/uiStore";
import { readDirectory } from "../../lib/tauriCommands";

interface FolderNodeProps {
  path: string;
  name: string;
  level: number;
  isRoot?: boolean;
}

export function FolderNode({ path, name, level, isRoot }: FolderNodeProps) {
  const expanded = useFileSystemStore((s) => s.expandedFolders.has(path));
  const selected = useFileSystemStore((s) => s.selectedFolder === path);
  const children = useFileSystemStore((s) => s.directoryCache[path]);
  const toggleExpanded = useFileSystemStore((s) => s.toggleExpanded);
  const setSelectedFolder = useFileSystemStore((s) => s.setSelectedFolder);
  const setDirectoryCache = useFileSystemStore((s) => s.setDirectoryCache);
  const removeRootFolder = useFileSystemStore((s) => s.removeRootFolder);
  const showContextMenu = useUIStore((s) => s.showContextMenu);

  const [hovered, setHovered] = useState(false);

  const handleToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleExpanded(path);
      if (!expanded && !children) {
        try {
          const entries = await readDirectory(path);
          setDirectoryCache(path, entries);
        } catch (err) {
          console.error("Failed to read directory:", err);
        }
      }
    },
    [path, expanded, children, toggleExpanded, setDirectoryCache]
  );

  const handleSelect = useCallback(async () => {
    setSelectedFolder(path);
    if (!children) {
      try {
        const entries = await readDirectory(path);
        setDirectoryCache(path, entries);
      } catch (err) {
        console.error("Failed to read directory:", err);
      }
    }
  }, [path, children, setSelectedFolder, setDirectoryCache]);

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      removeRootFolder(path);
    },
    [path, removeRootFolder]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      showContextMenu(path, e.clientX, e.clientY, "folder");
    },
    [path, showContextMenu]
  );

  const dirs = children?.filter((e) => e.is_dir) || [];

  return (
    <div>
      <div
        className="flex items-center gap-1 py-[3px] pr-2 cursor-pointer transition-colors duration-100"
        style={{
          paddingLeft: `${level * 16 + 8}px`,
          background: selected ? "var(--bg-selected)" : "transparent",
          borderRadius: "var(--radius-sm)",
          margin: "0 4px",
        }}
        onClick={handleSelect}
        onDoubleClick={handleToggle}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          className="w-4 h-4 flex items-center justify-center shrink-0"
          onClick={handleToggle}
          style={{ color: "var(--text-tertiary)" }}
        >
          {expanded ? (
            <ChevronDown size={12} />
          ) : (
            <ChevronRight size={12} />
          )}
        </button>
        <Folder
          size={14}
          className="shrink-0"
          style={{ color: "var(--text-secondary)" }}
        />
        <span className="truncate text-xs" style={{ flex: 1, minWidth: 0 }}>
          {name}
        </span>
        {isRoot && hovered && (
          <button
            className="w-4 h-4 flex items-center justify-center shrink-0 rounded"
            onClick={handleRemove}
            style={{
              color: "var(--text-tertiary)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color =
                "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color =
                "var(--text-tertiary)";
            }}
            title="Remove from Browser"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {expanded &&
        dirs.map((dir) => (
          <FolderNode
            key={dir.path}
            path={dir.path}
            name={dir.name}
            level={level + 1}
          />
        ))}
    </div>
  );
}
