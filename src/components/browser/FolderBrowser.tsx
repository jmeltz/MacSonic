import { useEffect, useCallback } from "react";
import { useFileSystemStore } from "../../stores/fileSystemStore";
import { useUIStore } from "../../stores/uiStore";
import { getMusicDirectory, revealInFinder } from "../../lib/tauriCommands";
import { FolderNode } from "./FolderNode";
import { AddFolderButton } from "./AddFolderButton";
import { ContextMenu } from "../shared/ContextMenu";
import type { ContextMenuItem } from "../../types/contextMenu";

export function FolderBrowser() {
  const rootFolders = useFileSystemStore((s) => s.rootFolders);
  const isInitialized = useFileSystemStore((s) => s.isInitialized);
  const addRootFolder = useFileSystemStore((s) => s.addRootFolder);
  const removeRootFolder = useFileSystemStore((s) => s.removeRootFolder);
  const setInitialized = useFileSystemStore((s) => s.setInitialized);

  const contextMenuType = useUIStore((s) => s.contextMenuType);
  const contextMenuPath = useUIStore((s) => s.contextMenuPath);
  const contextMenuPosition = useUIStore((s) => s.contextMenuPosition);
  const hideContextMenu = useUIStore((s) => s.hideContextMenu);

  useEffect(() => {
    if (isInitialized) return;

    const init = async () => {
      if (rootFolders.length === 0) {
        try {
          const musicDir = await getMusicDirectory();
          addRootFolder(musicDir);
        } catch {
          // Music directory may not exist
        }
      }
      setInitialized();
    };

    init();
  }, [isInitialized, rootFolders.length, addRootFolder, setInitialized]);

  const getFolderMenuItems = useCallback((): ContextMenuItem[] => {
    if (!contextMenuPath) return [];
    const isRootFolder = rootFolders.includes(contextMenuPath);

    const items: ContextMenuItem[] = [];
    if (isRootFolder) {
      items.push({
        label: "Remove from Browser",
        onClick: () => removeRootFolder(contextMenuPath),
      });
      items.push({ label: "", onClick: () => {}, separator: true });
    }
    items.push({
      label: "Reveal in Finder",
      onClick: () => revealInFinder(contextMenuPath),
    });
    return items;
  }, [contextMenuPath, rootFolders, removeRootFolder]);

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ background: "var(--bg-tertiary)" }}
    >
      <div
        className="flex items-center justify-between px-3 py-1.5 shrink-0"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <span
          className="text-[11px] font-medium uppercase tracking-wider"
          style={{ color: "var(--text-tertiary)" }}
        >
          Browser
        </span>
        <AddFolderButton />
      </div>
      <div className="flex-1 overflow-y-auto py-1" data-no-drag>
        {rootFolders.length === 0 ? (
          <div
            className="flex items-center justify-center h-full text-xs"
            style={{ color: "var(--text-tertiary)" }}
          >
            No folders added
          </div>
        ) : (
          rootFolders.map((folder) => {
            const name = folder.split("/").pop() || folder;
            return (
              <FolderNode
                key={folder}
                path={folder}
                name={name}
                level={0}
                isRoot
              />
            );
          })
        )}
      </div>

      {/* Folder context menu */}
      {contextMenuType === "folder" && contextMenuPath && contextMenuPosition && (
        <ContextMenu
          position={contextMenuPosition}
          onClose={hideContextMenu}
          items={getFolderMenuItems()}
        />
      )}
    </div>
  );
}
