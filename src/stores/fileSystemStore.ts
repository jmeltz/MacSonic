import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DirectoryEntry } from "../types/fileSystem";

interface FileSystemState {
  rootFolders: string[];
  directoryCache: Record<string, DirectoryEntry[]>;
  expandedFolders: Set<string>;
  selectedFolder: string | null;
  isInitialized: boolean;

  addRootFolder: (path: string) => void;
  removeRootFolder: (path: string) => void;
  setDirectoryCache: (path: string, entries: DirectoryEntry[]) => void;
  toggleExpanded: (path: string) => void;
  setSelectedFolder: (path: string | null) => void;
  setInitialized: () => void;
}

export const useFileSystemStore = create<FileSystemState>()(
  persist(
    (set) => ({
      rootFolders: [],
      directoryCache: {},
      expandedFolders: new Set<string>(),
      selectedFolder: null,
      isInitialized: false,

      addRootFolder: (path) =>
        set((s) => {
          if (s.rootFolders.includes(path)) return s;
          return { rootFolders: [...s.rootFolders, path] };
        }),

      removeRootFolder: (path) =>
        set((s) => {
          const clearSelection =
            s.selectedFolder === path ||
            (s.selectedFolder !== null && s.selectedFolder.startsWith(path + "/"));
          return {
            rootFolders: s.rootFolders.filter((f) => f !== path),
            selectedFolder: clearSelection ? null : s.selectedFolder,
          };
        }),

      setDirectoryCache: (path, entries) =>
        set((s) => ({
          directoryCache: { ...s.directoryCache, [path]: entries },
        })),

      toggleExpanded: (path) =>
        set((s) => {
          const next = new Set(s.expandedFolders);
          if (next.has(path)) {
            next.delete(path);
          } else {
            next.add(path);
          }
          return { expandedFolders: next };
        }),

      setSelectedFolder: (path) => set({ selectedFolder: path }),

      setInitialized: () => set({ isInitialized: true }),
    }),
    {
      name: "macsonic-filesystem",
      partialize: (state) => ({
        rootFolders: state.rootFolders,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<FileSystemState>),
      }),
    }
  )
);
