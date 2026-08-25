import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

type Props = {
  blob: Blob;
  variant?: "exam" | "script";
};

export function OomWavePlayer({
  blob,
  variant = "script",
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const waveRef = useRef<WaveSurfer | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const url = URL.createObjectURL(blob);

    const wave = WaveSurfer.create({
      container: containerRef.current,
      url,
      height: variant === "exam" ? 38 : 64,
      normalize: true,

      // Replace these with actual OOM theme tokens.
      waveColor: "rgba(148, 163, 184, 0.24)",
      progressColor: "rgba(139, 128, 255, 0.95)",

      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      cursorWidth: 0,

      dragToSeek: variant === "script",
      autoScroll: false,
      autoCenter: false,
    });

    waveRef.current = wave;

    wave.on("play", () => setPlaying(true));
    wave.on("pause", () => setPlaying(false));
    wave.on("finish", () => setPlaying(false));

    return () => {
      wave.destroy();
      waveRef.current = null;
      URL.revokeObjectURL(url);
    };
  }, [blob, variant]);

  return (
    <div className={`oom-wave-player oom-wave-player--${variant}`}>
      <button
        type="button"
        aria-label={playing ? "일시정지" : "재생"}
        onClick={() => waveRef.current?.playPause()}
      >
        {playing ? "Ⅱ" : "▶"}
      </button>

      <div ref={containerRef} className="oom-wave-player__wave" />
    </div>
  );
}
