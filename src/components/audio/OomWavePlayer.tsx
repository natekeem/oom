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
  audioUrl?: string | null;
  precomputedPeaks?: number[] | null;
  precomputedDuration?: number;
  variant?: "exam" | "script";
  playbackRate?: number;
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
  actionLabel?: string;
  requestPlayLabel?: string;
};

export const OOM_IDLE_WAVEFORM_PEAKS = [
  0.04, 0.06, 0.05, 0.08, 0.04, 0.07, 0.05, 0.06, 0.04, 0.05, 0.07, 0.04,
  0.06, 0.05, 0.08, 0.04, 0.06, 0.05,
];

const OOM_IDLE_WAVEFORM_DURATION_SECONDS = 1;

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
      audioUrl,
      precomputedPeaks,
      precomputedDuration,
      variant = "script",
      playbackRate = 1,
      controls = true,
      autoPlayRequest = 0,
      surface = "default",
      className,
      onPlaybackChange,
      onFinish,
      onError,
      shellState = blob || audioUrl ? "ready" : "idle",
      statusText = "",
      onRequestPlay,
      onRequestStop,
      actionLabel = "음성",
      requestPlayLabel = "영어 스크립트 재생",
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const waveRef = useRef<WaveSurfer | null>(null);
    const hasAudioRef = useRef(Boolean(blob || audioUrl));
    const playbackRateRef = useRef(playbackRate);
    const objectUrlRef = useRef<string | null>(null);
    const loadedAudioRef = useRef(false);
    const readyRef = useRef(false);
    const latestPlayRequestRef = useRef(autoPlayRequest);
    const handledPlayRequestRef = useRef(0);
    const callbacksRef = useRef({ onPlaybackChange, onFinish, onError });
    callbacksRef.current = { onPlaybackChange, onFinish, onError };
    const [playing, setPlaying] = useState(false);
    const [finished, setFinished] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    hasAudioRef.current = Boolean(blob || audioUrl);
    playbackRateRef.current = playbackRate;

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
      if (!container) return;

      const colors = readWaveColors(container);
      const wave = WaveSurfer.create({
        container,
        peaks: [OOM_IDLE_WAVEFORM_PEAKS],
        duration: OOM_IDLE_WAVEFORM_DURATION_SECONDS,
        height: variant === "exam" ? 34 : 54,
        normalize: false,
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
        audioRate: playbackRateRef.current,
      });

      waveRef.current = wave;
      wave.setPlaybackRate(playbackRateRef.current, true);

      wave.on("ready", (nextDuration) => {
        const hasAudio = hasAudioRef.current;
        readyRef.current = hasAudio;
        setDuration(hasAudio ? nextDuration : 0);
        wave.setPlaybackRate(playbackRateRef.current, true);
        if (!hasAudio) return;
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
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }
      };
    }, [variant]);

    useEffect(() => {
      const wave = waveRef.current;
      if (!wave) return;

      readyRef.current = false;
      setPlaying(false);
      setFinished(false);
      setCurrentTime(0);
      setDuration(0);

      if (!blob && !audioUrl) {
        if (!loadedAudioRef.current) return;
        loadedAudioRef.current = false;
        wave.setOptions({ normalize: false });
        void wave
          .load(
            "",
            [OOM_IDLE_WAVEFORM_PEAKS],
            OOM_IDLE_WAVEFORM_DURATION_SECONDS,
          )
          .catch(() => undefined);
        return;
      }

      loadedAudioRef.current = true;
      wave.setOptions({ normalize: !precomputedPeaks });
      if (audioUrl) {
        let cancelled = false;
        void Promise.resolve()
          .then(() => {
            if (cancelled || waveRef.current !== wave) return;
            return wave.load(
              audioUrl,
              precomputedPeaks ? [precomputedPeaks] : undefined,
              precomputedDuration,
            );
          })
          .catch((error) =>
            callbacksRef.current.onError?.(
              error instanceof Error ? error : new Error(String(error)),
            ),
          );
        return () => {
          cancelled = true;
        };
      }

      if (!blob) return;
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      let cancelled = false;
      void Promise.resolve()
        .then(() => {
          if (cancelled || waveRef.current !== wave) return;
          return wave.load(url);
        })
        .catch((error) =>
          callbacksRef.current.onError?.(
            error instanceof Error ? error : new Error(String(error)),
          ),
        );

      return () => {
        cancelled = true;
        if (objectUrlRef.current === url) {
          URL.revokeObjectURL(url);
          objectUrlRef.current = null;
        }
      };
    }, [audioUrl, blob, precomputedDuration, precomputedPeaks, variant]);

    useEffect(() => {
      waveRef.current?.setPlaybackRate(playbackRate, true);
    }, [playbackRate]);

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
    const hasAudio = Boolean(blob || audioUrl);
    const waveHeightClass = variant === "exam" ? "h-[34px]" : "h-[54px]";
    const placeholderAction =
      shellState === "loading" || shellState === "fallback" ? onRequestStop : onRequestPlay;
    const placeholderActionLabel =
      shellState === "loading"
        ? `${actionLabel} 준비 중지`
        : shellState === "fallback"
          ? `${actionLabel} 시스템 음성 정지`
          : requestPlayLabel;

    return (
      <div
        className={cn(
          "grid min-w-0 gap-x-2",
          controls
            ? "grid-cols-[auto_minmax(0,1fr)] grid-rows-[auto_auto]"
            : "grid-cols-1 grid-rows-[auto_auto]",
          className,
        )}
        data-control-alignment="wave-center"
        data-seek-enabled={variant === "script"}
        data-playback-rate={playbackRate.toFixed(2)}
        data-source={audioUrl ? "static" : blob ? "blob" : "none"}
        data-state={shellState}
        data-testid={`oom-wave-player-${variant}`}
      >
        {controls ? (
          <button
            aria-label={
              hasAudio
                ? playing
                  ? `${actionLabel} 일시정지`
                  : finished
                    ? `${actionLabel} 다시 재생`
                    : `${actionLabel} 재생`
                : placeholderActionLabel
            }
            className={cn(
              "row-start-1 grid h-9 w-9 shrink-0 place-items-center self-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
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

        <div className={cn("row-start-1 min-w-0", controls && "col-start-2")}>
          <div className={cn("relative w-full min-w-0 overflow-hidden", waveHeightClass)}>
            <div
              aria-label={hasAudio ? "생성된 음성 파형" : "음성 준비 전 안내 파형"}
              className={cn(
                "w-full min-w-0 overflow-hidden",
                waveHeightClass,
                shellState === "loading" && "animate-pulse",
              )}
              ref={containerRef}
              role="img"
            />
          </div>
        </div>
        <div
          className={cn(
            "row-start-2 mt-1 flex min-w-0 items-center justify-between gap-2",
            controls && "col-start-2",
          )}
        >
          <p
            aria-live="polite"
            className={cn(
              "min-w-0 truncate text-[10px] font-semibold",
              shellState === "error" || shellState === "fallback"
                ? "text-amber-700 dark:text-amber-300"
                : consoleSurface
                  ? "text-zinc-400"
                  : "text-zinc-500 dark:text-zinc-400",
            )}
            role="status"
          >
            {statusText}
          </p>
          <p
            className={cn(
              "shrink-0 text-right font-mono text-[10px]",
              consoleSurface ? "text-zinc-400" : "text-zinc-500 dark:text-zinc-400",
            )}
          >
            {hasAudio
              ? `${formatAudioTime(currentTime)} / ${formatAudioTime(duration)}`
              : "--:--"}
          </p>
        </div>
      </div>
    );
  },
);
