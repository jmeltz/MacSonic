export type SortField =
  | "name"
  | "duration"
  | "format"
  | "sample_rate"
  | "bit_depth"
  | "size"
  | "date_modified"
  | "artist"
  | "album"
  | "channels";

export type SortDirection = "asc" | "desc";

export interface SortState {
  field: SortField;
  direction: SortDirection;
}
