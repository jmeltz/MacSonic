export interface DirectoryEntry {
  name: string;
  path: string;
  is_dir: boolean;
  size: number;
  extension: string | null;
  modified_time: number | null;
}
