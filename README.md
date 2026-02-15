# MacSonic

A modern, native audio player for macOS built with Tauri, React, and TypeScript. MacSonic combines the performance of Rust with the elegance of a React-based UI to deliver a powerful audio playback experience.

## Features

- **Native Performance**: Built with Tauri for a lightweight, fast desktop application
- **Folder-Based Library**: Browse and organize your music by folders
- **Waveform Visualization**: Real-time audio waveform display with peak meters
- **Multiple Format Support**: Plays MP3, FLAC, WAV, M4A, AAC, ALAC, OGG, Opus, WebM, and AIFF files
- **Advanced Playback Controls**:
  - Play, pause, skip, and seek
  - Shuffle and repeat modes
  - Volume control with muting
  - Keyboard shortcuts for quick navigation
- **Resizable Panels**: Customizable layout with draggable panel dividers
- **File Management**: Virtual scrolling for smooth performance with large libraries
- **Transparent macOS Integration**: Native window styling with overlay title bar

## Screenshots

*Coming soon*

## Installation

### Prerequisites

- macOS 10.15 or later
- [Node.js](https://nodejs.org/) (v16 or later)
- [pnpm](https://pnpm.io/) package manager
- [Rust](https://www.rust-lang.org/) toolchain

### Building from Source

```bash
# Clone the repository
git clone https://github.com/jmeltz/MacSonic.git
cd MacSonic

# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev

# Build for production
pnpm tauri build
```

## Usage

1. Launch MacSonic
2. Click "Add Folder" to browse and add a music folder
3. Navigate through your folders in the left sidebar
4. Select files from the file list in the center panel
5. Use the transport controls at the bottom to control playback
6. View the waveform visualization in the top panel

### Keyboard Shortcuts

- `Space`: Play/Pause
- `Left/Right Arrow`: Seek backward/forward
- `Up/Down Arrow`: Volume up/down
- `M`: Mute/Unmute
- Additional shortcuts available in the app

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4
- **Backend**: Rust with Tauri 2
- **State Management**: Zustand
- **UI Components**: Lucide React icons, react-resizable-panels
- **Build Tools**: Vite, pnpm

## Project Structure

```
MacSonic/
├── src/                    # React frontend source
│   ├── components/         # UI components
│   │   ├── browser/        # Folder browser
│   │   ├── controls/       # Playback controls
│   │   ├── filelist/       # File list view
│   │   ├── layout/         # App layout
│   │   └── waveform/       # Waveform visualization
│   ├── hooks/              # Custom React hooks
│   ├── stores/             # Zustand state stores
│   ├── types/              # TypeScript type definitions
│   └── lib/                # Utility functions
├── src-tauri/              # Rust backend source
│   ├── src/
│   │   ├── commands/       # Tauri commands
│   │   └── models/         # Rust data models
│   └── Cargo.toml          # Rust dependencies
└── package.json            # Node dependencies
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

Built with [Tauri](https://tauri.app/), [React](https://react.dev/), and [TypeScript](https://www.typescriptlang.org/).

## Author

Created by [@jmeltz](https://github.com/jmeltz)
