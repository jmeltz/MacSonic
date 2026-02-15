import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SortState, SortField } from "../types/ui";
import { getDefaultVisibleColumns, getDefaultColumnWidths } from "../lib/columns";

interface UIState {
  sort: SortState;
  columnWidths: Record<SortField, number>;
  visibleColumns: SortField[];
  contextMenuPath: string | null;
  contextMenuPosition: { x: number; y: number } | null;
  contextMenuType: "file" | "folder" | null;
  searchQuery: string;

  setSort: (sort: SortState) => void;
  toggleSort: (field: SortField) => void;
  setColumnWidth: (field: SortField, width: number) => void;
  toggleColumnVisibility: (field: SortField) => void;
  showContextMenu: (path: string, x: number, y: number, type: "file" | "folder") => void;
  hideContextMenu: () => void;
  setSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sort: { field: "name", direction: "asc" },
      columnWidths: getDefaultColumnWidths(),
      visibleColumns: getDefaultVisibleColumns(),
      contextMenuPath: null,
      contextMenuPosition: null,
      contextMenuType: null,
      searchQuery: "",

      setSort: (sort) => set({ sort }),
      toggleSort: (field) =>
        set((s) => ({
          sort: {
            field,
            direction:
              s.sort.field === field && s.sort.direction === "asc"
                ? "desc"
                : "asc",
          },
        })),
      setColumnWidth: (field, width) =>
        set((s) => ({
          columnWidths: { ...s.columnWidths, [field]: Math.max(32, width) },
        })),
      toggleColumnVisibility: (field) =>
        set((s) => {
          if (field === "name") return s; // name is always visible
          const visible = s.visibleColumns.includes(field);
          return {
            visibleColumns: visible
              ? s.visibleColumns.filter((f) => f !== field)
              : [...s.visibleColumns, field],
          };
        }),
      showContextMenu: (path, x, y, type) =>
        set({ contextMenuPath: path, contextMenuPosition: { x, y }, contextMenuType: type }),
      hideContextMenu: () =>
        set({ contextMenuPath: null, contextMenuPosition: null, contextMenuType: null }),
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: "macsonic-ui",
      partialize: (state) => ({
        sort: state.sort,
        columnWidths: state.columnWidths,
        visibleColumns: state.visibleColumns,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<UIState>),
      }),
    }
  )
);
