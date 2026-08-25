import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import type { WaveStyle } from "../lib/types";

type Props = {
  blob: Blob;
  style: WaveStyle;
  accent?: "cyan" | "violet";
};

const STYLE_OPTIONS: Record<
  WaveStyle,
  {
    height: number;
    barWidth?: number;
    barGap?: number;
    barRadius?: number;
    cursorWidth: number;
  }
> = {
  studio: {
    height: 70,
    barWidth: 2,
    barGap: 2,
    barRadius: 2,
    cursorWidth: 0,
  },
  soft: {
    height: 72,
    cursorWidth: 1,
  },
  voiceprint: {
    height: 60,
    barWidth: 1,
    barGap: 1,
    barRadius: 1,
    cursorWidth: 0,
  },
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export function WavePlayer({ blob, style, accent = "cyan" }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const waveRef = useRef<WaveSurfer | null>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const url = URL.createObjectURL(blob);
    const config = STYLE_OPTIONS[style];

    const wave = WaveSurfer.create({
      container: containerRef.current,
      url,
      height: config.height,
      normalize: true,
      waveColor: "rgba(148, 163, 184, 0.22)",
      progressColor:
        accent === "cyan"
          ? "rgba(77, 208, 225, 0.95)"
          : "rgba(139, 128, 255, 0.95)",
      cursorColor: "rgba(255,255,255,0.45)",
      cursorWidth: config.cursorWidth,
      barWidth: config.barWidth,
      barGap: config.barGap,
      barRadius: config.barRadius,
      dragToSeek: true,
      autoScroll: false,
      autoCenter: false,
    });

    waveRef.current = wave;

    wave.on("ready", (seconds) => {
      setDuration(seconds);
      setCurrent(0);
    });
    wave.on("play", () => setPlaying(true));
    wave.on("pause", () => setPlaying(false));
    wave.on("finish", () => {
      setPlaying(false);
      setCurrent(wave.getDuration());
    });
    wave.on("timeupdate", (seconds) => setCurrent(seconds));

    return () => {
      wave.destroy();
      waveRef.current = null;
      URL.revokeObjectURL(url);
    };
  }, [accent, blob, style]);

  return (
    <div className="wave-player">
      <button
        className="play-button"
        type="button"
        onClick={() => waveRef.current?.playPause()}
        aria-label={playing ? "일시정지" : "재생"}
      >
        {playing ? "Ⅱ" : "▶"}
      </button>

      <div className="wave-shell">
        <div className="wave-canvas" ref={containerRef} />
        <div className="wave-times">
          <span>{formatTime(current)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
