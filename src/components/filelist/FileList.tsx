import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useFileSystemStore } from "../../stores/fileSystemStore";
import { usePlayerStore } from "../../stores/playerStore";
import { useUIStore } from "../../stores/uiStore";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import {
  readDirectory,
  getAudioMetadataBatch,
  revealInFinder,
} from "../../lib/tauriCommands";
import { COLUMN_CONFIGS, compareByField, renderCell } from "../../lib/columns";
import type { DirectoryEntry } from "../../types/fileSystem";
import type { AudioMetadata, Track } from "../../types/audio";
import type { SortField } from "../../types/ui";
import type { ContextMenuItem } from "../../types/contextMenu";
import { ContextMenu } from "../shared/ContextMenu";
import { FormatBadge } from "./FormatBadge";
import { ColumnHeader } from "./ColumnHeader";
import { Search, X } from "lucide-react";

export function FileList() {
  const selectedFolder = useFileSystemStore((s) => s.selectedFolder);
  const currentTrackPath = usePlayerStore((s) => s.currentTrack?.path);
  const sort = useUIStore((s) => s.sort);
  const columnWidths = useUIStore((s) => s.columnWidths);
  const visibleColumns = useUIStore((s) => s.visibleColumns);
  const toggleColumnVisibility = useUIStore((s) => s.toggleColumnVisibility);
  const showContextMenu = useUIStore((s) => s.showContextMenu);
  const contextMenuPath = useUIStore((s) => s.contextMenuPath);
  const contextMenuPosition = useUIStore((s) => s.contextMenuPosition);
  const hideContextMenu = useUIStore((s) => s.hideContextMenu);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const { playTrackFromList } = useAudioPlayer();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<DirectoryEntry[]>([]);
  const [metadata, setMetadata] = useState<Record<string, AudioMetadata>>({});
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [headerMenuPosition, setHeaderMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  // Compute active columns in canonical order, filtered by visibility
  const activeColumns = useMemo(
    () => COLUMN_CONFIGS.filter((col) => visibleColumns.includes(col.field)),
    [visibleColumns]
  );

  useEffect(() => {
    if (!selectedFolder) {
      setFiles([]);
      setMetadata({});
      return;
    }

    let cancelled = false;
    setLoading(true);
    setSelectedIndex(null);

    (async () => {
      try {
        const entries = await readDirectory(selectedFolder);
        if (cancelled) return;
        const audioFiles = entries.filter((e) => !e.is_dir);
        setFiles(audioFiles);
        setMetadata({});

        if (audioFiles.length > 0) {
          const paths = audioFiles.map((f) => f.path);
          const batchSize = 50;
          for (let i = 0; i < paths.length; i += batchSize) {
            if (cancelled) return;
            const batch = paths.slice(i, i + batchSize);
            const results = await getAudioMetadataBatch(batch);
            if (cancelled) return;
            setMetadata((prev) => {
              const next = { ...prev };
              results.forEach((m) => {
                next[m.path] = m;
              });
              return next;
            });
          }
        }
      } catch (err) {
        console.error("Failed to read directory:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedFolder]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery) return files;
    const q = searchQuery.toLowerCase();
    return files.filter((f) => {
      if (f.name.toLowerCase().includes(q)) return true;
      const meta = metadata[f.path];
      if (meta) {
        if (meta.title?.toLowerCase().includes(q)) return true;
        if (meta.artist?.toLowerCase().includes(q)) return true;
        if (meta.album?.toLowerCase().includes(q)) return true;
      }
      return false;
    });
  }, [files, metadata, searchQuery]);

  const sortedFiles = useMemo(() => {
    const sorted = [...filteredFiles];
    const dir = sort.direction === "asc" ? 1 : -1;

    sorted.sort((a, b) => {
      return dir * compareByField(sort.field, a, b, metadata[a.path], metadata[b.path]);
    });
    return sorted;
  }, [filteredFiles, metadata, sort]);

  const tracks: Track[] = useMemo(
    () =>
      sortedFiles.map((f) => ({
        path: f.path,
        name: f.name,
        metadata: metadata[f.path],
      })),
    [sortedFiles, metadata]
  );

  // Reset selected index when search query changes
  useEffect(() => {
    setSelectedIndex(null);
  }, [searchQuery]);

  // Clear search when folder changes
  useEffect(() => {
    setSearchQuery("");
  }, [selectedFolder, setSearchQuery]);

  // Listen for Cmd+F focus event
  useEffect(() => {
    const handleFocusSearch = () => {
      searchInputRef.current?.focus();
    };
    window.addEventListener("macsonic:focus-search", handleFocusSearch);
    return () => window.removeEventListener("macsonic:focus-search", handleFocusSearch);
  }, []);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setSearchQuery("");
        searchInputRef.current?.blur();
      }
    },
    [setSearchQuery]
  );

  const handleClick = useCallback(
    (index: number) => {
      setSelectedIndex(index);
    },
    []
  );

  const handleDoubleClick = useCallback(
    (index: number) => {
      playTrackFromList(tracks, index);
    },
    [tracks, playTrackFromList]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && selectedIndex !== null) {
        e.preventDefault();
        playTrackFromList(tracks, selectedIndex);
      } else if (e.key === "ArrowDown" && selectedIndex !== null) {
        e.preventDefault();
        setSelectedIndex(Math.min(selectedIndex + 1, sortedFiles.length - 1));
      } else if (e.key === "ArrowUp" && selectedIndex !== null) {
        e.preventDefault();
        setSelectedIndex(Math.max(selectedIndex - 1, 0));
      }
    },
    [selectedIndex, tracks, sortedFiles.length, playTrackFromList]
  );

  const contextMenuType = useUIStore((s) => s.contextMenuType);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, path: string, index: number) => {
      e.preventDefault();
      setSelectedIndex(index);
      showContextMenu(path, e.clientX, e.clientY, "file");
    },
    [showContextMenu]
  );

  const handleHeaderContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setHeaderMenuPosition({ x: e.clientX, y: e.clientY });
    },
    []
  );

  const headerMenuItems: ContextMenuItem[] = useMemo(
    () =>
      COLUMN_CONFIGS.filter((col) => !col.alwaysVisible).map((col) => ({
        label: col.label,
        checked: visibleColumns.includes(col.field),
        keepOpen: true,
        onClick: () => toggleColumnVisibility(col.field),
      })),
    [visibleColumns, toggleColumnVisibility]
  );

  const virtualizer = useVirtualizer({
    count: sortedFiles.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 28,
    overscan: 20,
  });

  // Column style helper
  const colStyle = (
    field: SortField,
    extra?: React.CSSProperties
  ): React.CSSProperties =>
    field === "name"
      ? { flex: 1, minWidth: 0, ...extra }
      : { width: columnWidths[field], flexShrink: 0, ...extra };

  if (!selectedFolder) {
    return (
      <div
        className="flex items-center justify-center h-full text-xs"
        style={{ color: "var(--text-tertiary)" }}
      >
        Select a folder to view files
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" data-filelist data-no-drag onKeyDown={handleKeyDown} tabIndex={0} style={{ outline: "none" }}>
      {/* Search bar */}
      <div
        className="flex items-center gap-3 px-4 py-2 shrink-0"
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--bg-secondary)",
        }}
      >
        <Search size={16} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search files..."
          className="flex-1 bg-transparent outline-none"
          style={{
            color: "var(--text-primary)",
            minWidth: 0,
            fontSize: 14,
          }}
        />
        {searchQuery && (
          <>
            <span
              className="tabular-nums shrink-0"
              style={{ color: "var(--text-tertiary)", fontSize: 13 }}
            >
              {filteredFiles.length} of {files.length}
            </span>
            <button
              onClick={() => setSearchQuery("")}
              className="flex items-center justify-center shrink-0"
              style={{
                color: "var(--text-tertiary)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 2,
              }}
            >
              <X size={15} />
            </button>
          </>
        )}
      </div>

      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 shrink-0"
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--bg-secondary)",
        }}
        onContextMenu={handleHeaderContextMenu}
      >
        <div style={{ width: 16, flexShrink: 0 }} />
        {activeColumns.map((col) => (
          <ColumnHeader
            key={col.field}
            field={col.field}
            label={col.label}
            resizable={col.field !== "name"}
            style={colStyle(
              col.field,
              col.align === "right" ? { justifyContent: "flex-end" } : undefined
            )}
          />
        ))}
      </div>

      {/* File rows */}
      <div ref={parentRef} className="flex-1 overflow-y-auto">
        {loading && files.length === 0 ? (
          <div
            className="flex items-center justify-center py-8 text-xs"
            style={{ color: "var(--text-tertiary)" }}
          >
            Loading...
          </div>
        ) : (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const file = sortedFiles[virtualRow.index];
              const meta = metadata[file.path];
              const isPlaying = file.path === currentTrackPath;
              const isSelected = virtualRow.index === selectedIndex;

              return (
                <div
                  key={file.path}
                  className="flex items-center gap-2 px-3 cursor-default transition-colors duration-75"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                    background: isPlaying
                      ? "var(--bg-selected)"
                      : isSelected
                        ? "var(--bg-active)"
                        : "transparent",
                    fontSize: 12,
                  }}
                  onClick={() => handleClick(virtualRow.index)}
                  onDoubleClick={() => handleDoubleClick(virtualRow.index)}
                  onContextMenu={(e) => handleContextMenu(e, file.path, virtualRow.index)}
                  onMouseEnter={(e) => {
                    if (!isPlaying && !isSelected)
                      (e.currentTarget as HTMLDivElement).style.background =
                        "var(--bg-hover)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isPlaying && !isSelected)
                      (e.currentTarget as HTMLDivElement).style.background =
                        "transparent";
                  }}
                >
                  <div
                    style={{ width: 16, flexShrink: 0 }}
                    className="flex justify-center"
                  >
                    {meta && <FormatBadge isLossless={meta.is_lossless} />}
                  </div>
                  {activeColumns.map((col) => {
                    const value = renderCell(col.field, file, meta);

                    if (col.field === "name") {
                      return (
                        <div
                          key={col.field}
                          className="truncate"
                          style={{
                            ...colStyle(col.field),
                            color: isPlaying
                              ? "var(--accent)"
                              : "var(--text-primary)",
                          }}
                        >
                          {value}
                        </div>
                      );
                    }

                    if (col.field === "format") {
                      return (
                        <div
                          key={col.field}
                          className="uppercase"
                          style={{
                            ...colStyle(col.field),
                            color: "var(--text-secondary)",
                            fontSize: 10,
                          }}
                        >
                          {value}
                        </div>
                      );
                    }

                    if (col.field === "size") {
                      return (
                        <div
                          key={col.field}
                          className="text-right tabular-nums"
                          style={{
                            ...colStyle(col.field),
                            color: "var(--text-tertiary)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {value}
                        </div>
                      );
                    }

                    if (col.align === "right") {
                      return (
                        <div
                          key={col.field}
                          className="text-right tabular-nums"
                          style={{
                            ...colStyle(col.field),
                            color: "var(--text-secondary)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {value}
                        </div>
                      );
                    }

                    // Left-aligned non-special columns (artist, album)
                    return (
                      <div
                        key={col.field}
                        className="truncate"
                        style={{
                          ...colStyle(col.field),
                          color: "var(--text-secondary)",
                        }}
                      >
                        {value}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* File context menu */}
      {contextMenuType === "file" && contextMenuPath && contextMenuPosition && (
        <ContextMenu
          position={contextMenuPosition}
          onClose={hideContextMenu}
          items={(() => {
            const idx = tracks.findIndex((t) => t.path === contextMenuPath);
            const menuItems: ContextMenuItem[] = [
              {
                label: "Play",
                onClick: () => {
                  if (idx >= 0) playTrackFromList(tracks, idx);
                },
                disabled: idx < 0,
              },
              {
                label: "Reveal in Finder",
                shortcut: "⌘⇧R",
                onClick: () => revealInFinder(contextMenuPath),
              },
              { label: "", onClick: () => {}, separator: true },
              {
                label: "Copy Path",
                shortcut: "⌘⇧C",
                onClick: () => navigator.clipboard.writeText(contextMenuPath),
              },
            ];
            return menuItems;
          })()}
        />
      )}

      {/* Header column toggle context menu */}
      {headerMenuPosition && (
        <ContextMenu
          position={headerMenuPosition}
          onClose={() => setHeaderMenuPosition(null)}
          items={headerMenuItems}
        />
      )}
    </div>
  );
}
