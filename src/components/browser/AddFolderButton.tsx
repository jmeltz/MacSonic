import { FolderPlus } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import { useFileSystemStore } from "../../stores/fileSystemStore";

export function AddFolderButton() {
  const addRootFolder = useFileSystemStore((s) => s.addRootFolder);

  const handleClick = async () => {
    const path = await open({ directory: true, multiple: false });
    if (path) {
      addRootFolder(path as string);
    }
  };

  return (
    <button
      className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md transition-colors duration-150 hover:bg-[var(--bg-hover)]"
      onClick={handleClick}
      style={{ color: "var(--text-secondary)" }}
      title="Add folder (⌘O)"
    >
      <FolderPlus size={13} />
      <span>Add Folder</span>
    </button>
  );
}
