use crate::models::AudioMetadata;
use std::fs::File;
use std::path::Path;
use symphonia::core::formats::FormatOptions;
use symphonia::core::io::MediaSourceStream;
use symphonia::core::meta::{MetadataOptions, StandardTagKey};
use symphonia::core::probe::Hint;

#[tauri::command]
pub fn read_audio_file(path: String) -> Result<tauri::ipc::Response, String> {
    let bytes = std::fs::read(&path).map_err(|e| format!("Failed to read audio file: {}", e))?;
    Ok(tauri::ipc::Response::new(bytes))
}

fn extract_metadata(path: &str) -> Result<AudioMetadata, String> {
    let file_path = Path::new(path);
    let file = File::open(file_path).map_err(|e| format!("Failed to open file: {}", e))?;

    let mss = MediaSourceStream::new(Box::new(file), Default::default());

    let mut hint = Hint::new();
    if let Some(ext) = file_path.extension().and_then(|e| e.to_str()) {
        hint.with_extension(ext);
    }

    let format_opts = FormatOptions {
        enable_gapless: false,
        ..Default::default()
    };
    let metadata_opts = MetadataOptions::default();

    let mut probed = symphonia::default::get_probe()
        .format(&hint, mss, &format_opts, &metadata_opts)
        .map_err(|e| format!("Failed to probe audio file: {}", e))?;

    let mut metadata = AudioMetadata {
        path: path.to_string(),
        ..Default::default()
    };

    // Extract codec params from the default track
    if let Some(track) = probed.format.default_track() {
        let params = &track.codec_params;

        metadata.sample_rate = params.sample_rate;
        metadata.channels = params.channels.map(|c| c.count() as u32);
        metadata.bit_depth = params.bits_per_sample;

        // Calculate duration from n_frames and sample_rate
        if let (Some(n_frames), Some(sample_rate)) = (params.n_frames, params.sample_rate) {
            if sample_rate > 0 {
                metadata.duration = Some(n_frames as f64 / sample_rate as f64);
            }
        }

        // Get codec name
        let codec_id = params.codec;
        let codec_name = symphonia::default::get_codecs()
            .get_codec(codec_id)
            .map(|d| d.short_name.to_string());
        metadata.codec = codec_name;

        // Determine lossless
        if let Some(ref codec) = metadata.codec {
            let codec_lower = codec.to_lowercase();
            metadata.is_lossless = codec_lower.contains("flac")
                || codec_lower.contains("alac")
                || codec_lower.contains("pcm")
                || codec_lower.contains("wav")
                || codec_lower.contains("aiff");
        }
    }

    // Extract tags from probed metadata
    let mut title: Option<String> = None;
    let mut artist: Option<String> = None;
    let mut album: Option<String> = None;

    // Check metadata from the probe result (e.g., ID3 tags read before format detection)
    if let Some(probed_md) = probed.metadata.get() {
        if let Some(revision) = probed_md.current() {
            for tag in revision.tags() {
                if let Some(std_key) = tag.std_key {
                    match std_key {
                        StandardTagKey::TrackTitle => {
                            title = Some(tag.value.to_string());
                        }
                        StandardTagKey::Artist => {
                            artist = Some(tag.value.to_string());
                        }
                        StandardTagKey::Album => {
                            album = Some(tag.value.to_string());
                        }
                        _ => {}
                    }
                }
            }
        }
    }

    // Also check metadata from the format reader (some formats store tags in-container)
    {
        let format_md = probed.format.metadata();
        if let Some(revision) = format_md.current() {
            for tag in revision.tags() {
                if let Some(std_key) = tag.std_key {
                    match std_key {
                        StandardTagKey::TrackTitle => {
                            if title.is_none() {
                                title = Some(tag.value.to_string());
                            }
                        }
                        StandardTagKey::Artist => {
                            if artist.is_none() {
                                artist = Some(tag.value.to_string());
                            }
                        }
                        StandardTagKey::Album => {
                            if album.is_none() {
                                album = Some(tag.value.to_string());
                            }
                        }
                        _ => {}
                    }
                }
            }
        }
    }

    metadata.title = title;
    metadata.artist = artist;
    metadata.album = album;

    Ok(metadata)
}

#[tauri::command]
pub fn get_audio_metadata(path: String) -> Result<AudioMetadata, String> {
    extract_metadata(&path)
}

#[tauri::command]
pub fn get_audio_metadata_batch(paths: Vec<String>) -> Result<Vec<AudioMetadata>, String> {
    let results: Vec<AudioMetadata> = paths
        .into_iter()
        .map(|path| {
            extract_metadata(&path).unwrap_or_else(|_| AudioMetadata {
                path: path.clone(),
                ..Default::default()
            })
        })
        .collect();

    Ok(results)
}
