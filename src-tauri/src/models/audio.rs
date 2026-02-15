use serde::Serialize;

#[derive(Debug, Clone, Serialize, Default)]
pub struct AudioMetadata {
    pub path: String,
    pub duration: Option<f64>,
    pub sample_rate: Option<u32>,
    pub channels: Option<u32>,
    pub bit_depth: Option<u32>,
    pub codec: Option<String>,
    pub is_lossless: bool,
    pub title: Option<String>,
    pub artist: Option<String>,
    pub album: Option<String>,
}
