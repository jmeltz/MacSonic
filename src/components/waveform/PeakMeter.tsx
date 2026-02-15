import { useRef, useEffect, useCallback } from "react";
import { usePlayerStore } from "../../stores/playerStore";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";

export function PeakMeter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);
  const status = usePlayerStore((s) => s.status);
  const { getAudioElement } = useAudioPlayer();

  const setupAnalyser = useCallback(() => {
    if (analyserRef.current) return;

    try {
      const audio = getAudioElement();
      if (!audio) return;

      const ctx = new AudioContext();
      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;

      source.connect(analyser);
      analyser.connect(ctx.destination);

      audioContextRef.current = ctx;
      sourceRef.current = source;
      analyserRef.current = analyser;
    } catch {
      // May fail if source already created
    }
  }, [getAudioElement]);

  const drawMeter = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const dataArray = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(dataArray);

    let sumSq = 0;
    let peak = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i];
      sumSq += v * v;
      const abs = Math.abs(v);
      if (abs > peak) peak = abs;
    }
    const rms = Math.sqrt(sumSq / dataArray.length);

    ctx.clearRect(0, 0, width, height);

    // RMS bar
    const rmsHeight = Math.min(rms * 3, 1) * height;
    const rmsGrad = ctx.createLinearGradient(0, height, 0, 0);
    rmsGrad.addColorStop(0, "rgba(59, 130, 246, 0.6)");
    rmsGrad.addColorStop(0.7, "rgba(59, 130, 246, 0.8)");
    rmsGrad.addColorStop(1, "rgba(239, 68, 68, 0.8)");
    ctx.fillStyle = rmsGrad;
    ctx.fillRect(0, height - rmsHeight, width * 0.45, rmsHeight);

    // Peak bar
    const peakHeight = Math.min(peak * 2, 1) * height;
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillRect(width * 0.55, height - peakHeight, width * 0.45, peakHeight);

    rafRef.current = requestAnimationFrame(drawMeter);
  }, []);

  useEffect(() => {
    if (status === "playing") {
      setupAnalyser();
      rafRef.current = requestAnimationFrame(drawMeter);
    } else {
      cancelAnimationFrame(rafRef.current);
    }

    return () => cancelAnimationFrame(rafRef.current);
  }, [status, setupAnalyser, drawMeter]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full"
      style={{ width: 20 }}
    />
  );
}
