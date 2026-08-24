import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { LoaderCircle, Pause, Play, RotateCcw } from "lucide-react";
import WaveSurfer from "wavesurfer.js";
import { cn } from "../../lib/utils";

export type OomWavePlayerHandle = {
  stop: () => void;
  playFromStart: () => Promise<void>;
};

type OomWavePlayerProps = {
  blob?: Blob | null;
  variant?: "exam" | "script";
  controls?: boolean;
  autoPlayRequest?: number;
  surface?: "default" | "console";
  className?: string;
  onPlaybackChange?: (playing: boolean) => void;
  onFinish?: () => void;
  onError?: (error: Error) => void;
  shellState?: "idle" | "loading" | "ready" | "fallback" | "error";
  statusText?: string;
  onRequestPlay?: () => void;
  onRequestStop?: () => void;
};

function formatAudioTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function readWaveColors(container: HTMLElement) {
  const styles = getComputedStyle(container);
  return {
    waveColor: styles.getPropertyValue("--oom-wave-neutral").trim() || "#a1a1aa",
    progressColor: styles.getPropertyValue("--oom-wave-progress").trim() || "#6366f1",
  };
}

export const OomWavePlayer = forwardRef<OomWavePlayerHandle, OomWavePlayerProps>(
  function OomWavePlayer(
    {
      blob,
      variant = "script",
      controls = true,
      autoPlayRequest = 0,
      surface = "default",
      className,
      onPlaybackChange,
      onFinish,
      onError,
      shellState = blob ? "ready" : "idle",
      statusText = "재생하면 음성을 준비합니다.",
      onRequestPlay,
      onRequestStop,
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const waveRef = useRef<WaveSurfer | null>(null);
    const readyRef = useRef(false);
    const latestPlayRequestRef = useRef(autoPlayRequest);
    const handledPlayRequestRef = useRef(0);
    const callbacksRef = useRef({ onPlaybackChange, onFinish, onError });
    callbacksRef.current = { onPlaybackChange, onFinish, onError };
    const [playing, setPlaying] = useState(false);
    const [finished, setFinished] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const playFromStart = async () => {
      const wave = waveRef.current;
      if (!wave || !readyRef.current) return;
      wave.setTime(0);
      setFinished(false);
      await wave.play();
    };

    useImperativeHandle(
      ref,
      () => ({
        stop: () => {
          waveRef.current?.stop();
          setPlaying(false);
          setFinished(false);
        },
        playFromStart,
      }),
      [],
    );

    useEffect(() => {
      latestPlayRequestRef.current = autoPlayRequest;
      if (
        autoPlayRequest > handledPlayRequestRef.current &&
        readyRef.current &&
        waveRef.current
      ) {
        handledPlayRequestRef.current = autoPlayRequest;
        void playFromStart().catch((error) => {
          callbacksRef.current.onError?.(
            error instanceof Error ? error : new Error(String(error)),
          );
        });
      }
    }, [autoPlayRequest]);

    useEffect(() => {
      const container = containerRef.current;
      if (!container || !blob) return;

      readyRef.current = false;
      setPlaying(false);
      setFinished(false);
      setCurrentTime(0);
      setDuration(0);

      const url = URL.createObjectURL(blob);
      const colors = readWaveColors(container);
      const wave = WaveSurfer.create({
        container,
        url,
        height: variant === "exam" ? 34 : 54,
        normalize: true,
        waveColor: colors.waveColor,
        progressColor: colors.progressColor,
        barWidth: 2,
        barGap: 2,
        barRadius: 2,
        barMinHeight: 1,
        cursorWidth: 0,
        interact: variant === "script",
        dragToSeek: variant === "script",
        autoScroll: false,
        autoCenter: false,
      });

      waveRef.current = wave;

      wave.on("ready", (nextDuration) => {
        readyRef.current = true;
        setDuration(nextDuration);
        const request = latestPlayRequestRef.current;
        if (request > handledPlayRequestRef.current) {
          handledPlayRequestRef.current = request;
          void playFromStart().catch((error) => {
            callbacksRef.current.onError?.(
              error instanceof Error ? error : new Error(String(error)),
            );
          });
        }
      });
      wave.on("play", () => {
        setPlaying(true);
        setFinished(false);
        callbacksRef.current.onPlaybackChange?.(true);
      });
      wave.on("pause", () => {
        setPlaying(false);
        callbacksRef.current.onPlaybackChange?.(false);
      });
      wave.on("finish", () => {
        setPlaying(false);
        setFinished(true);
        callbacksRef.current.onPlaybackChange?.(false);
        callbacksRef.current.onFinish?.();
      });
      wave.on("timeupdate", setCurrentTime);
      wave.on("error", (error) => callbacksRef.current.onError?.(error));

      const observer = new MutationObserver(() => {
        const nextColors = readWaveColors(container);
        wave.setOptions(nextColors);
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

      return () => {
        observer.disconnect();
        readyRef.current = false;
        wave.destroy();
        waveRef.current = null;
        URL.revokeObjectURL(url);
      };
    }, [blob, variant]);

    const togglePlayback = async () => {
      const wave = waveRef.current;
      if (!wave || !readyRef.current) return;
      if (finished) {
        await playFromStart();
        return;
      }
      await wave.playPause();
    };

    const consoleSurface = surface === "console";
    const hasAudio = Boolean(blob);
    const waveHeightClass = variant === "exam" ? "h-[34px]" : "h-[54px]";
    const placeholderAction =
      shellState === "loading" || shellState === "fallback" ? onRequestStop : onRequestPlay;
    const placeholderActionLabel =
      shellState === "loading"
        ? "음성 준비 중지"
        : shellState === "fallback"
          ? "시스템 음성 정지"
          : "영어 스크립트 재생";

    return (
      <div
        className={cn(
          "grid min-w-0 items-center gap-2",
          controls ? "grid-cols-[auto_minmax(0,1fr)]" : "grid-cols-1",
          className,
        )}
        data-seek-enabled={variant === "script"}
        data-state={shellState}
        data-testid={`oom-wave-player-${variant}`}
      >
        {controls ? (
          <button
            aria-label={
              hasAudio
                ? playing
                  ? "음성 일시정지"
                  : finished
                    ? "음성 다시 재생"
                    : "음성 재생"
                : placeholderActionLabel
            }
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
              consoleSurface
                ? "border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-indigo-500 hover:text-indigo-300"
                : "border-zinc-200 bg-white text-zinc-800 hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-indigo-600 dark:hover:text-indigo-300",
            )}
            onClick={() => {
              if (!hasAudio) {
                placeholderAction?.();
                return;
              }
              void togglePlayback().catch((error) => callbacksRef.current.onError?.(error));
            }}
            type="button"
          >
            {!hasAudio && shellState === "loading" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : !hasAudio && shellState === "fallback" ? (
              <Pause className="h-4 w-4" />
            ) : playing ? (
              <Pause className="h-4 w-4" />
            ) : finished ? (
              <RotateCcw className="h-4 w-4" />
            ) : (
              <Play className="ml-0.5 h-4 w-4 fill-current" />
            )}
          </button>
        ) : null}

        <div className="min-w-0">
          <div className={cn("relative w-full min-w-0 overflow-hidden", waveHeightClass)}>
            {blob ? (
              <div
                aria-label="생성된 음성 파형"
                className={cn("w-full min-w-0 overflow-hidden", waveHeightClass)}
                ref={containerRef}
                role="img"
              />
            ) : (
              <div
                aria-live="polite"
                className={cn(
                  "flex h-full flex-col justify-center gap-2",
                  shellState === "loading" && "animate-pulse",
                )}
                role="status"
              >
                <div aria-hidden="true" className="flex items-center gap-1">
                  {Array.from({ length: 18 }, (_, index) => (
                    <span
                      className={cn(
                        "h-px min-w-1 flex-1 rounded-full",
                        consoleSurface
                          ? "bg-zinc-700"
                          : "bg-zinc-300 dark:bg-zinc-700",
                        index % 4 === 0 && "opacity-50",
                      )}
                      key={index}
                    />
                  ))}
                </div>
                <p
                  className={cn(
                    "truncate text-[10px] font-semibold",
                    shellState === "error" || shellState === "fallback"
                      ? "text-amber-700 dark:text-amber-300"
                      : consoleSurface
                        ? "text-zinc-400"
                        : "text-zinc-500 dark:text-zinc-400",
                  )}
                >
                  {statusText}
                </p>
              </div>
            )}
          </div>
          <p
            className={cn(
              "mt-1 text-right font-mono text-[10px]",
              consoleSurface ? "text-zinc-400" : "text-zinc-500 dark:text-zinc-400",
            )}
          >
            {formatAudioTime(hasAudio ? currentTime : 0)} /{" "}
            {formatAudioTime(hasAudio ? duration : 0)}
          </p>
        </div>
      </div>
    );
  },
);
