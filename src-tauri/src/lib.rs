mod commands;
mod models;

use commands::audio::*;
use commands::filesystem::*;
use commands::system::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            read_directory,
            read_directory_tree,
            read_audio_file,
            get_audio_metadata,
            get_audio_metadata_batch,
            get_music_directory,
            get_home_directory,
            reveal_in_finder
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
