import { useCallback } from "react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { TitleBar } from "./TitleBar";
import { StatusBar } from "./StatusBar";
import { WaveformDisplay } from "../waveform/WaveformDisplay";
import { TransportBar } from "../controls/TransportBar";
import { FolderBrowser } from "../browser/FolderBrowser";
import { FileList } from "../filelist/FileList";

const INTERACTIVE_TAGS = new Set([
  "BUTTON",
  "INPUT",
  "TEXTAREA",
  "SELECT",
  "A",
  "CANVAS",
]);

const INTERACTIVE_ROLES = new Set(["button", "slider"]);

function isInteractiveElement(
  target: EventTarget | null,
  container: HTMLElement
): boolean {
  let el = target as HTMLElement | null;
  while (el && el !== container) {
    if (INTERACTIVE_TAGS.has(el.tagName)) return true;
    const role = el.getAttribute("role");
    if (role && INTERACTIVE_ROLES.has(role)) return true;
    if (el.hasAttribute("data-no-drag")) return true;
    if (el.hasAttribute("data-panel-resize-handle-id")) return true;
    el = el.parentElement;
  }
  return false;
}

function ResizeHandle({ direction }: { direction: "horizontal" | "vertical" }) {
  return (
    <PanelResizeHandle
      className={`relative flex items-center justify-center ${
        direction === "horizontal" ? "w-[1px]" : "h-[1px]"
      }`}
      style={{ background: "var(--border-color)" }}
    >
      <div
        className={`absolute ${
          direction === "horizontal"
            ? "w-[3px] h-full cursor-col-resize"
            : "h-[3px] w-full cursor-row-resize"
        }`}
      />
    </PanelResizeHandle>
  );
}

export function AppLayout() {
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      if (isInteractiveElement(e.target, e.currentTarget)) return;
      getCurrentWindow().startDragging();
    },
    []
  );

  return (
    <div className="flex flex-col h-full" onMouseDown={handleMouseDown}>
      <TitleBar />
      <PanelGroup direction="vertical" className="flex-1">
        <Panel defaultSize={35} minSize={20}>
          <WaveformDisplay />
        </Panel>
        <ResizeHandle direction="vertical" />
        <Panel defaultSize={65} minSize={30}>
          <div className="flex flex-col h-full">
            <TransportBar />
            <PanelGroup direction="horizontal" className="flex-1">
              <Panel defaultSize={25} minSize={15} maxSize={50}>
                <FolderBrowser />
              </Panel>
              <ResizeHandle direction="horizontal" />
              <Panel defaultSize={75} minSize={30}>
                <FileList />
              </Panel>
            </PanelGroup>
          </div>
        </Panel>
      </PanelGroup>
      <StatusBar />
    </div>
  );
}
