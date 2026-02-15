use std::env;
use std::path::PathBuf;
use std::process::Command;

#[tauri::command]
pub fn get_music_directory() -> Result<String, String> {
    let home = env::var("HOME").map_err(|_| "Could not determine home directory".to_string())?;
    let music_path = PathBuf::from(&home).join("Music");
    Ok(music_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn get_home_directory() -> Result<String, String> {
    let home = env::var("HOME").map_err(|_| "Could not determine home directory".to_string())?;
    Ok(home)
}

#[tauri::command]
pub fn reveal_in_finder(path: String) -> Result<(), String> {
    Command::new("open")
        .arg("-R")
        .arg(&path)
        .spawn()
        .map_err(|e| format!("Failed to reveal in Finder: {}", e))?;
    Ok(())
}
