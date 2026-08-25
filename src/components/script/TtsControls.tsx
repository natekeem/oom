import { Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { stopSpeech } from "../../lib/speech";
import { KOKORO_SYNTHESIS_RATE } from "../../lib/tts/kokoroConfig";
import {
  DEFAULT_SCRIPT_RATE_BY_LEVEL,
  MAX_SCRIPT_RATE,
  MIN_SCRIPT_RATE,
  readScriptRate,
  SCRIPT_RATE_STEP,
  writeScriptRate,
} from "../../lib/tts/ratePreferences";
import { getTtsManager } from "../../lib/tts/TtsManager";
import type { TtsMediaPlaybackSource, TtsPlaybackSource, TtsRuntimeStatus } from "../../lib/tts/types";
import { useTtsPreferences } from "../../lib/tts/useTtsPreferences";
import type { TrainingLevelId } from "../../training/types";
import { OomWavePlayer, type OomWavePlayerHandle } from "../audio/OomWavePlayer";

type TtsControlsProps = {
  text: string;
  levelId: TrainingLevelId;
  onError: (message: string) => void;
};

type PlayerShellState = "idle" | "loading" | "ready" | "fallback" | "error";

const IDLE_STATUS = "재생하면 음성을 준비합니다.";

export function TtsControls({ text, levelId, onError }: TtsControlsProps) {
  const { preferences } = useTtsPreferences();
  const [rate, setRate] = useState(() => readScriptRate(levelId));
  const inputKey = `${preferences.scriptVoice}\u0000${text}`;
  const [storedSource, setStoredSource] = useState<{
    inputKey: string;
    source: TtsMediaPlaybackSource;
  } | null>(null);
  const source = storedSource?.inputKey === inputKey ? storedSource.source : null;
  const sourceIsStale = storedSource !== null && storedSource.inputKey !== inputKey;
  const [playRequest, setPlayRequest] = useState(0);
  const [status, setStatus] = useState(IDLE_STATUS);
  const [shellState, setShellState] = useState<PlayerShellState>("idle");
  const requestRef = useRef(0);
  const manualStopRef = useRef(false);
  const staticFallbackAttemptRef = useRef(false);
  const playerRef = useRef<OomWavePlayerHandle | null>(null);

  useEffect(() => {
    return () => {
      requestRef.current += 1;
      stopSpeech();
    };
  }, []);

  useEffect(() => {
    requestRef.current += 1;
    const requestId = requestRef.current;
    staticFallbackAttemptRef.current = false;
    void getTtsManager()
      .resolveStaticPlayback({ text, voice: preferences.scriptVoice, speed: 1 })
      .then((staticSource) => {
        if (requestId !== requestRef.current || !staticSource) return;
        setStoredSource({ inputKey, source: staticSource });
        setShellState("ready");
        setStatus("정적 스크립트 음성 준비 완료");
      });
  }, [inputKey, preferences.scriptVoice, text]);

  const updateStatus = (next: TtsRuntimeStatus) => {
    if (next.phase === "loading-model") {
      const progress =
        typeof next.progress === "number" ? ` · ${Math.round(next.progress)}%` : "";
      setStatus(`음성 모델 준비 중 · 최초 1회${progress}`);
      setShellState("loading");
      return;
    }
    if (next.phase === "generating") {
      const chunkProgress =
        typeof next.completedChunks === "number" && typeof next.totalChunks === "number"
          ? ` · ${next.completedChunks}/${next.totalChunks}`
          : typeof next.progress === "number"
            ? ` · ${Math.round(next.progress)}%`
            : "";
      setStatus(`스크립트 음성 생성 중${chunkProgress}`);
      setShellState("loading");
      return;
    }
    if (next.phase === "fallback") {
      setStatus("시스템 음성으로 재생 중");
      setShellState("fallback");
      return;
    }
    setStatus("스크립트 음성 준비 완료");
  };

  const playFallbackSource = (fallback: Extract<TtsPlaybackSource, { kind: "web-speech" }>, requestId: number) => {
    setShellState("fallback");
    setStatus("시스템 음성으로 재생 중");
    fallback.play({
      onEnd: () => {
        if (requestId !== requestRef.current) return;
        setStatus("시스템 음성 재생 완료");
        setShellState("idle");
      },
      onError: () => {
        if (requestId !== requestRef.current) return;
        setStatus("시스템 음성을 재생할 수 없습니다.");
        setShellState("error");
        onError("시스템 음성을 재생할 수 없습니다.");
      },
    });
  };

  const prepareAndPlay = async (skipStatic = false) => {
    requestRef.current += 1;
    const requestId = requestRef.current;
    playerRef.current?.stop();
    stopSpeech();
    manualStopRef.current = false;
    setStoredSource(null);
    setStatus("저장된 음성 확인 중");
    setShellState("loading");

    try {
      const source = await getTtsManager().preparePlayback(
        {
          text,
          voice: preferences.scriptVoice,
          speed: KOKORO_SYNTHESIS_RATE,
        },
        (next) => {
          if (requestId === requestRef.current) updateStatus(next);
        },
        { skipStatic },
      );

      if (requestId !== requestRef.current) return;

      if (source.kind === "audio" || source.kind === "static") {
        setStoredSource({ inputKey, source });
        setPlayRequest(requestId);
        setStatus(source.kind === "static" ? "정적 스크립트 음성 재생 중" : "Kokoro 스크립트 음성 재생 중");
        setShellState("ready");
        return;
      }
      playFallbackSource(source, requestId);
    } catch (error) {
      if (requestId !== requestRef.current) return;
      setStatus("음성을 준비할 수 없습니다.");
      setShellState("error");
      onError(error instanceof Error ? error.message : "음성 읽기를 시작할 수 없습니다.");
    }
  };

  const play = async () => {
    if (source) {
      requestRef.current += 1;
      playerRef.current?.stop();
      stopSpeech();
      manualStopRef.current = false;
      setPlayRequest(requestRef.current);
      setShellState("ready");
      setStatus(source.kind === "static" ? "정적 스크립트 음성 재생 중" : "Kokoro 스크립트 음성 재생 중");
      return;
    }
    await prepareAndPlay();
  };

  const stop = () => {
    requestRef.current += 1;
    manualStopRef.current = true;
    playerRef.current?.stop();
    stopSpeech();
    if (source) {
      setShellState("ready");
      setStatus("재생 정지");
      return;
    }
    setShellState("idle");
    setStatus(IDLE_STATUS);
  };

  const handleRateChange = (nextRate: number) => {
    setRate(nextRate);
    writeScriptRate(levelId, nextRate);
  };

  const defaultRate = DEFAULT_SCRIPT_RATE_BY_LEVEL[levelId];
  const visibleStatus = sourceIsStale ? IDLE_STATUS : status;
  const visibleShellState = sourceIsStale ? "idle" : shellState;

  return (
    <div
      className="w-full min-w-0 rounded-md border border-zinc-200 bg-zinc-50/75 p-3 dark:border-zinc-800 dark:bg-zinc-950/70 sm:p-4"
      data-testid="script-audio-controls"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-extrabold tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
          SCRIPT AUDIO
        </p>
        <span aria-live="polite" className="sr-only">
          {visibleStatus}
        </span>
      </div>

      <OomWavePlayer
        audioUrl={source?.kind === "static" ? source.url : undefined}
        autoPlayRequest={playRequest}
        blob={source?.kind === "audio" ? source.blob : undefined}
        className="mt-2"
        onError={(error) => {
          if (source?.kind === "static" && !staticFallbackAttemptRef.current) {
            staticFallbackAttemptRef.current = true;
            void prepareAndPlay(true);
            return;
          }
          setShellState("error");
          setStatus("음성을 재생할 수 없습니다.");
          onError(error.message);
        }}
        onFinish={() => setStatus("재생 완료")}
        onPlaybackChange={(playing) => {
          if (playing) {
            manualStopRef.current = false;
            setStatus(source?.kind === "static" ? "정적 스크립트 음성 재생 중" : "Kokoro 스크립트 음성 재생 중");
            return;
          }
          setStatus(manualStopRef.current ? "재생 정지" : "일시정지");
          manualStopRef.current = false;
        }}
        onRequestPlay={() => void play()}
        onRequestStop={stop}
        playbackRate={rate}
        precomputedDuration={source?.kind === "static" ? source.duration : undefined}
        precomputedPeaks={source?.kind === "static" ? source.peaks : undefined}
        ref={playerRef}
        shellState={visibleShellState}
        statusText={visibleStatus}
        variant="script"
      />

      <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
        <div className="flex items-center justify-between gap-3">
          <label
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300"
            htmlFor="script-playback-rate"
          >
            <Volume2 className="h-3.5 w-3.5" />
            재생 속도
          </label>
          <div className="flex items-center gap-1.5">
            {Math.abs(rate - defaultRate) < Number.EPSILON ? (
              <span className="rounded bg-zinc-200/80 px-1.5 py-0.5 text-[9px] font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                기본
              </span>
            ) : null}
            <span className="w-12 text-right text-xs font-extrabold text-zinc-800 dark:text-zinc-100">
              {rate.toFixed(2)}×
            </span>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
          <span className="font-mono text-[9px] text-zinc-400 dark:text-zinc-500">
            {MIN_SCRIPT_RATE.toFixed(2)}
          </span>
          <input
            aria-label="스크립트 재생 속도"
            className="h-4 w-full cursor-pointer accent-indigo-600"
            id="script-playback-rate"
            max={MAX_SCRIPT_RATE}
            min={MIN_SCRIPT_RATE}
            onChange={(event) => handleRateChange(Number(event.target.value))}
            step={SCRIPT_RATE_STEP}
            type="range"
            value={rate}
          />
          <span className="font-mono text-[9px] text-zinc-400 dark:text-zinc-500">
            {MAX_SCRIPT_RATE.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
