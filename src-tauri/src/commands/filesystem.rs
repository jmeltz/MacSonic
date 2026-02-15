use crate::models::DirectoryEntry;
use std::fs;
use walkdir::WalkDir;

const AUDIO_EXTENSIONS: &[&str] = &[
    "mp3", "flac", "wav", "aiff", "aif", "m4a", "aac", "ogg", "wma", "alac", "opus", "wv",
];

fn is_audio_file(ext: &str) -> bool {
    AUDIO_EXTENSIONS.contains(&ext.to_lowercase().as_str())
}

#[tauri::command]
pub fn read_directory(path: String) -> Result<Vec<DirectoryEntry>, String> {
    let entries = fs::read_dir(&path).map_err(|e| format!("Failed to read directory: {}", e))?;

    let mut dirs: Vec<DirectoryEntry> = Vec::new();
    let mut files: Vec<DirectoryEntry> = Vec::new();

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let metadata = entry
            .metadata()
            .map_err(|e| format!("Failed to read metadata: {}", e))?;
        let name = entry.file_name().to_string_lossy().to_string();

        // Skip hidden files/directories
        if name.starts_with('.') {
            continue;
        }

        let entry_path = entry.path();
        let is_dir = metadata.is_dir();
        let extension = entry_path
            .extension()
            .map(|e| e.to_string_lossy().to_string());

        let modified_time = metadata.modified().ok()
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|d| d.as_secs() as i64);

        if is_dir {
            dirs.push(DirectoryEntry {
                name,
                path: entry_path.to_string_lossy().to_string(),
                is_dir: true,
                size: 0,
                extension: None,
                modified_time,
            });
        } else if let Some(ref ext) = extension {
            if is_audio_file(ext) {
                files.push(DirectoryEntry {
                    name,
                    path: entry_path.to_string_lossy().to_string(),
                    is_dir: false,
                    size: metadata.len(),
                    extension: Some(ext.to_lowercase()),
                    modified_time,
                });
            }
        }
    }

    // Sort dirs alphabetically (case-insensitive)
    dirs.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    // Sort files alphabetically (case-insensitive)
    files.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

    // Dirs first, then files
    dirs.extend(files);
    Ok(dirs)
}

#[tauri::command]
pub fn read_directory_tree(path: String, depth: u32) -> Result<Vec<DirectoryEntry>, String> {
    let mut entries: Vec<DirectoryEntry> = Vec::new();

    for entry in WalkDir::new(&path)
        .min_depth(1)
        .max_depth(depth as usize)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let metadata = match entry.metadata() {
            Ok(m) => m,
            Err(_) => continue,
        };

        if !metadata.is_dir() {
            continue;
        }

        let name = entry.file_name().to_string_lossy().to_string();

        // Skip hidden directories
        if name.starts_with('.') {
            continue;
        }

        entries.push(DirectoryEntry {
            name,
            path: entry.path().to_string_lossy().to_string(),
            is_dir: true,
            size: 0,
            extension: None,
            modified_time: None,
        });
    }

    // Sort alphabetically (case-insensitive)
    entries.sort_by(|a, b| a.path.to_lowercase().cmp(&b.path.to_lowercase()));

    Ok(entries)
}
