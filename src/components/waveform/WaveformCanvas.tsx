import { useRef, useEffect, useCallback } from "react";
import { downsamplePeaks } from "../../lib/waveformGenerator";

interface WaveformCanvasProps {
  peaks: number[];
  progress: number; // 0-1
  onSeek: (progress: number) => void;
}

export function WaveformCanvas({ peaks, progress, onSeek }: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef<number | null>(null);
  const sizeRef = useRef({ width: 0, height: 0 });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = sizeRef.current;
    if (width === 0 || height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    if (peaks.length === 0) return;

    const downsampled = downsamplePeaks(peaks, width);
    const centerY = height / 2;
    const barWidth = Math.max(1, width / downsampled.length - 0.5);
    const progressX = progress * width;
    const hoverX = hoverRef.current;

    for (let i = 0; i < downsampled.length; i++) {
      const x = (i / downsampled.length) * width;
      const peakHeight = downsampled[i] * centerY * 0.9;

      const isPlayed = x < progressX;

      if (isPlayed) {
        const gradient = ctx.createLinearGradient(x, centerY - peakHeight, x, centerY + peakHeight);
        gradient.addColorStop(0, "rgba(59, 130, 246, 0.9)");
        gradient.addColorStop(0.5, "rgba(96, 165, 250, 1)");
        gradient.addColorStop(1, "rgba(59, 130, 246, 0.9)");
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
      }

      ctx.fillRect(x, centerY - peakHeight, barWidth, peakHeight);
      ctx.fillRect(x, centerY, barWidth, peakHeight);
    }

    // Cursor line
    if (progressX > 0) {
      ctx.fillStyle = "var(--waveform-cursor)";
      ctx.fillRect(progressX - 0.5, 0, 1, height);
    }

    // Hover preview cursor
    if (hoverX !== null && hoverX !== progressX) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fillRect(hoverX - 0.5, 0, 1, height);
    }
  }, [peaks, progress]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        sizeRef.current = {
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        };
        draw();
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const prog = x / rect.width;
      onSeek(Math.max(0, Math.min(1, prog)));
    },
    [onSeek]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      hoverRef.current = e.clientX - rect.left;
      draw();
    },
    [draw]
  );

  const handleMouseLeave = useCallback(() => {
    hoverRef.current = null;
    draw();
  }, [draw]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full cursor-pointer"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
