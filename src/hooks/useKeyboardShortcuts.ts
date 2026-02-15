import { useEffect } from "react";
import { useAudioPlayer } from "./useAudioPlayer";
import { usePlayerStore } from "../stores/playerStore";
import { open } from "@tauri-apps/plugin-dialog";
import { useFileSystemStore } from "../stores/fileSystemStore";

export function useKeyboardShortcuts() {
  const {
    togglePlayPause,
    stop,
    seekRelative,
    playNext,
    playPrev,
  } = useAudioPlayer();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      // If a focusable container (like the file list) has focus,
      // let arrow keys be handled locally for navigation.
      const isInFileList =
        target.closest("[data-filelist]") !== null;

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlayPause();
          break;
        case "ArrowLeft":
          if (!isInFileList) {
            e.preventDefault();
            seekRelative(-5);
          }
          break;
        case "ArrowRight":
          if (!isInFileList) {
            e.preventDefault();
            seekRelative(5);
          }
          break;
        case "ArrowUp":
          if (!isInFileList) {
            e.preventDefault();
            usePlayerStore.getState().setVolume(
              usePlayerStore.getState().volume + 0.05
            );
          }
          break;
        case "ArrowDown":
          if (!isInFileList) {
            e.preventDefault();
            usePlayerStore.getState().setVolume(
              usePlayerStore.getState().volume - 0.05
            );
          }
          break;
        case "s":
          if (!e.metaKey) {
            e.preventDefault();
            stop();
          }
          break;
        case "n":
          if (!e.metaKey) {
            e.preventDefault();
            playNext();
          }
          break;
        case "p":
          if (!e.metaKey) {
            e.preventDefault();
            playPrev();
          }
          break;
        case "f":
          if (e.metaKey) {
            e.preventDefault();
            window.dispatchEvent(new Event("macsonic:focus-search"));
          }
          break;
        case "o":
          if (e.metaKey) {
            e.preventDefault();
            open({ directory: true, multiple: false }).then((path) => {
              if (path) {
                useFileSystemStore.getState().addRootFolder(path as string);
              }
            });
          }
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePlayPause, stop, seekRelative, playNext, playPrev]);
}
