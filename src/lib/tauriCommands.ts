import { invoke } from "@tauri-apps/api/core";
import type { DirectoryEntry } from "../types/fileSystem";
import type { AudioMetadata } from "../types/audio";

export async function readDirectory(path: string): Promise<DirectoryEntry[]> {
  return invoke<DirectoryEntry[]>("read_directory", { path });
}

export async function readDirectoryTree(
  path: string,
  depth: number
): Promise<DirectoryEntry[]> {
  return invoke<DirectoryEntry[]>("read_directory_tree", { path, depth });
}

export async function readAudioFile(path: string): Promise<ArrayBuffer> {
  return invoke<ArrayBuffer>("read_audio_file", { path });
}

export async function getAudioMetadata(
  path: string
): Promise<AudioMetadata> {
  return invoke<AudioMetadata>("get_audio_metadata", { path });
}

export async function getAudioMetadataBatch(
  paths: string[]
): Promise<AudioMetadata[]> {
  return invoke<AudioMetadata[]>("get_audio_metadata_batch", { paths });
}

export async function getMusicDirectory(): Promise<string> {
  return invoke<string>("get_music_directory");
}

export async function getHomeDirectory(): Promise<string> {
  return invoke<string>("get_home_directory");
}

export async function revealInFinder(path: string): Promise<void> {
  return invoke<void>("reveal_in_finder", { path });
}
