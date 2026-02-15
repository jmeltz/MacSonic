export interface AudioMetadata {
  path: string;
  duration: number | null;
  sample_rate: number | null;
  channels: number | null;
  bit_depth: number | null;
  codec: string | null;
  is_lossless: boolean;
  title: string | null;
  artist: string | null;
  album: string | null;
}

export type RepeatMode = "off" | "one" | "all";

export type PlaybackStatus = "stopped" | "playing" | "paused" | "loading";

export interface Track {
  path: string;
  name: string;
  metadata?: AudioMetadata;
}
