import type { SortField } from "../types/ui";
import type { DirectoryEntry } from "../types/fileSystem";
import type { AudioMetadata } from "../types/audio";
import { formatTime, formatFileSize, formatSampleRate, formatDate } from "./timeFormatter";

export interface ColumnConfig {
  field: SortField;
  label: string;
  defaultWidth: number; // 0 = flex
  align: "left" | "right";
  alwaysVisible?: boolean;
  defaultVisible?: boolean;
}

export const COLUMN_CONFIGS: ColumnConfig[] = [
  { field: "name", label: "Name", defaultWidth: 0, align: "left", alwaysVisible: true, defaultVisible: true },
  { field: "duration", label: "Time", defaultWidth: 64, align: "right", defaultVisible: true },
  { field: "format", label: "Format", defaultWidth: 60, align: "left", defaultVisible: true },
  { field: "sample_rate", label: "Rate", defaultWidth: 72, align: "right", defaultVisible: true },
  { field: "bit_depth", label: "Bits", defaultWidth: 48, align: "right", defaultVisible: true },
  { field: "size", label: "Size", defaultWidth: 72, align: "right", defaultVisible: true },
  { field: "artist", label: "Artist", defaultWidth: 120, align: "left", defaultVisible: false },
  { field: "album", label: "Album", defaultWidth: 120, align: "left", defaultVisible: false },
  { field: "channels", label: "Ch", defaultWidth: 40, align: "right", defaultVisible: false },
  { field: "date_modified", label: "Modified", defaultWidth: 100, align: "right", defaultVisible: false },
];

export function getDefaultVisibleColumns(): SortField[] {
  return COLUMN_CONFIGS.filter((c) => c.defaultVisible).map((c) => c.field);
}

export function getDefaultColumnWidths(): Record<SortField, number> {
  const widths = {} as Record<SortField, number>;
  for (const col of COLUMN_CONFIGS) {
    widths[col.field] = col.defaultWidth;
  }
  return widths;
}

function getFieldValue(
  field: SortField,
  file: DirectoryEntry,
  meta: AudioMetadata | undefined
): string | number | null {
  switch (field) {
    case "name":
      return meta?.title || file.name;
    case "duration":
      return meta?.duration ?? null;
    case "format":
      return meta?.codec ?? file.extension ?? null;
    case "sample_rate":
      return meta?.sample_rate ?? null;
    case "bit_depth":
      return meta?.bit_depth ?? null;
    case "size":
      return file.size;
    case "artist":
      return meta?.artist ?? null;
    case "album":
      return meta?.album ?? null;
    case "channels":
      return meta?.channels ?? null;
    case "date_modified":
      return file.modified_time ?? null;
  }
}

export function compareByField(
  field: SortField,
  a: DirectoryEntry,
  b: DirectoryEntry,
  metaA: AudioMetadata | undefined,
  metaB: AudioMetadata | undefined
): number {
  const va = getFieldValue(field, a, metaA);
  const vb = getFieldValue(field, b, metaB);

  if (va === null && vb === null) return 0;
  if (va === null) return 1;
  if (vb === null) return -1;

  if (typeof va === "string" && typeof vb === "string") {
    return va.localeCompare(vb, undefined, { sensitivity: "base" });
  }
  return (va as number) - (vb as number);
}

export function renderCell(
  field: SortField,
  file: DirectoryEntry,
  meta: AudioMetadata | undefined
): string {
  switch (field) {
    case "name":
      return meta?.title || file.name;
    case "duration":
      return meta?.duration ? formatTime(meta.duration) : "";
    case "format":
      return meta?.codec || file.extension || "";
    case "sample_rate":
      return meta?.sample_rate ? formatSampleRate(meta.sample_rate) : "";
    case "bit_depth":
      return meta?.bit_depth ? `${meta.bit_depth}` : "";
    case "size":
      return formatFileSize(file.size);
    case "artist":
      return meta?.artist || "";
    case "album":
      return meta?.album || "";
    case "channels":
      return meta?.channels ? `${meta.channels}` : "";
    case "date_modified":
      return file.modified_time ? formatDate(file.modified_time) : "";
  }
}
