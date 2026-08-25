import { useEffect, useRef, useState } from "react";
import { AudioLines, LoaderCircle } from "lucide-react";
import { OomWavePlayer, type OomWavePlayerHandle } from "../audio/OomWavePlayer";
import { stopSpeech } from "../../lib/speech";
import { getTtsManager } from "../../lib/tts/TtsManager";
import type { OomVoiceId, TtsMediaPlaybackSource, TtsRuntimeStatus } from "../../lib/tts/types";
import { useTtsPreferences } from "../../lib/tts/useTtsPreferences";
import {
  EXAM_PREVIEW_TEXT,
  OOM_VOICES,
  SCRIPT_PREVIEW_TEXT,
} from "../../lib/tts/voiceConfig";

type VoiceUse = "exam" | "script";

type PreviewState = {
  use: VoiceUse;
  source: TtsMediaPlaybackSource | null;
  playRequest: number;
  message: string;
  loading: boolean;
  fallback: boolean;
};

function statusMessage(status: TtsRuntimeStatus) {
  if (status.phase === "loading-model") {
    const progress = typeof status.progress === "number" ? ` · ${Math.round(status.progress)}%` : "";
    return `음성 모델 준비 중 · 최초 1회${progress}`;
  }
  if (status.phase === "generating") {
    const progress =
      typeof status.completedChunks === "number" && typeof status.totalChunks === "number"
        ? ` · ${status.completedChunks}/${status.totalChunks}`
        : typeof status.progress === "number"
          ? ` · ${Math.round(status.progress)}%`
          : "";
    return `미리듣기 음성 생성 중${progress}`;
  }
  if (status.phase === "fallback") return "시스템 음성으로 재생 중";
  return "미리듣기 준비 완료";
}

export function VoiceSettings() {
  const { preferences, setExamVoice, setScriptVoice } = useTtsPreferences();
  const [activeUse, setActiveUse] = useState<VoiceUse | null>(null);

  const selectVoice = (use: VoiceUse, voice: OomVoiceId) => {
    if (use === "exam") setExamVoice(voice);
    else setScriptVoice(voice);
  };

  return (
    <section className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
          <AudioLines className="h-4.5 w-4.5" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
            Voice
          </p>
          <h2 className="mt-1 text-base font-bold text-zinc-950 dark:text-white">음성 설정</h2>
          <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            시험 질문과 스크립트 재생 음성을 각각 선택합니다. 학습 Course × Level 설정과는 별도로 저장됩니다.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <VoiceRow
          activeVoice={preferences.examVoice}
          activeUse={activeUse}
          key={`exam-${preferences.examVoice}`}
          label="시험 질문 음성"
          onPlaybackStart={() => setActiveUse("exam")}
          onSelect={(voice) => selectVoice("exam", voice)}
          sampleText={EXAM_PREVIEW_TEXT}
          use="exam"
        />
        <VoiceRow
          activeVoice={preferences.scriptVoice}
          activeUse={activeUse}
          key={`script-${preferences.scriptVoice}`}
          label="스크립트 재생 음성"
          onPlaybackStart={() => setActiveUse("script")}
          onSelect={(voice) => selectVoice("script", voice)}
          sampleText={SCRIPT_PREVIEW_TEXT}
          use="script"
        />
      </div>
    </section>
  );
}

function VoiceRow({
  activeVoice,
  activeUse,
  label,
  onPlaybackStart,
  onSelect,
  sampleText,
  use,
}: {
  activeVoice: OomVoiceId;
  activeUse: VoiceUse | null;
  label: string;
  onPlaybackStart: () => void;
  onSelect: (voice: OomVoiceId) => void;
  sampleText: string;
  use: VoiceUse;
}) {
  const [preview, setPreview] = useState<PreviewState>({
    use,
    source: null,
    playRequest: 0,
    message: "저장된 음성 확인 중",
    loading: true,
    fallback: false,
  });
  const requestIdRef = useRef(0);
  const staticFallbackAttemptRef = useRef(false);
  const playerRef = useRef<OomWavePlayerHandle | null>(null);

  useEffect(() => {
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;
    playerRef.current?.stop();
    stopSpeech();
    staticFallbackAttemptRef.current = false;

    void getTtsManager()
      .resolveStaticPlayback({ text: sampleText, voice: activeVoice, speed: 1 })
      .then((source) => {
        if (requestId !== requestIdRef.current) return;
        setPreview({
          use,
          source,
          playRequest: 0,
          message: source ? "정적 미리듣기 준비 완료" : "재생하면 음성을 준비합니다.",
          loading: false,
          fallback: false,
        });
      })
      .catch(() => {
        if (requestId !== requestIdRef.current) return;
        setPreview({
          use,
          source: null,
          playRequest: 0,
          message: "재생하면 음성을 준비합니다.",
          loading: false,
          fallback: false,
        });
      });
  }, [activeVoice, sampleText, use]);

  useEffect(() => {
    if (activeUse !== null && activeUse !== use) {
      playerRef.current?.stop();
    }
  }, [activeUse, use]);

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
      stopSpeech();
    };
  }, []);

  const stopPreview = () => {
    requestIdRef.current += 1;
    playerRef.current?.stop();
    stopSpeech();
    setPreview((current) => ({
      ...current,
      message: current.source
        ? current.source.kind === "static"
          ? "정적 미리듣기 준비 완료"
          : "Kokoro 미리듣기 준비 완료"
        : "재생하면 음성을 준비합니다.",
      loading: false,
      fallback: false,
    }));
  };

  const playPreview = async (skipStatic = false) => {
    if (!skipStatic) staticFallbackAttemptRef.current = false;
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;
    playerRef.current?.stop();
    stopSpeech();
    onPlaybackStart();

    setPreview({
      use,
      source: null,
      playRequest: 0,
      message: "저장된 음성 확인 중",
      loading: true,
      fallback: false,
    });

    try {
      const source = await getTtsManager().preparePlayback(
        { text: sampleText, voice: activeVoice, speed: 1 },
        (status) => {
          if (requestId !== requestIdRef.current) return;
          setPreview((current) => ({
            ...current,
            message: statusMessage(status),
            loading: status.phase === "loading-model" || status.phase === "generating",
            fallback: status.phase === "fallback",
          }));
        },
        { skipStatic },
      );

      if (requestId !== requestIdRef.current) return;

      if (source.kind === "audio" || source.kind === "static") {
        setPreview({
          use,
          source,
          playRequest: requestId,
          message: source.kind === "static" ? "정적 미리듣기 재생 중" : "Kokoro 미리듣기 재생 중",
          loading: false,
          fallback: false,
        });
        return;
      }

      setPreview({
        use,
        source: null,
        playRequest: 0,
        message: "시스템 음성으로 재생 중",
        loading: false,
        fallback: true,
      });
      source.play({
        onEnd: () => {
          if (requestId === requestIdRef.current) {
            setPreview((current) => ({ ...current, message: "미리듣기 완료" }));
          }
        },
        onError: () => {
          if (requestId === requestIdRef.current) {
            setPreview((current) => ({
              ...current,
              message: "음성을 재생할 수 없습니다.",
              fallback: false,
            }));
          }
        },
      });
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      setPreview({
        use,
        source: null,
        playRequest: 0,
        message: error instanceof Error ? error.message : "음성을 재생할 수 없습니다.",
        loading: false,
        fallback: false,
      });
    }
  };

  const shellState = preview.loading
    ? "loading"
    : preview.fallback
      ? "fallback"
      : preview.source
        ? "ready"
        : preview.message === "음성을 재생할 수 없습니다."
          ? "error"
          : "idle";

  return (
    <div className="min-w-0 rounded-md border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{label}</h3>
      </div>

      <div
        aria-label={`${label} 선택`}
        className="mt-3 grid w-full grid-cols-2 gap-1 sm:grid-cols-4"
        role="group"
      >
        {OOM_VOICES.map((voice) => {
          const active = activeVoice === voice.id;
          return (
            <button
              aria-label={voice.label}
              aria-pressed={active}
              className={`min-h-16 w-full min-w-0 rounded-md border px-1 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                active
                  ? "border-indigo-500 bg-indigo-600 text-white dark:border-indigo-400 dark:bg-indigo-500"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-indigo-300 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
              }`}
              key={`${use}-${voice.id}`}
              disabled={preview.loading}
              onClick={() => {
                playerRef.current?.stop();
                requestIdRef.current += 1;
                onSelect(voice.id);
              }}
              type="button"
            >
              <span className="block text-sm font-bold">{voice.label}</span>
              <span
                className={`mt-1 block whitespace-nowrap text-[9px] font-medium leading-4 tracking-[-0.09em] ${
                  active ? "text-indigo-100" : "text-zinc-400 dark:text-zinc-500"
                }`}
              >
                {voice.description}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 break-words text-xs leading-5 text-zinc-500 dark:text-zinc-400">
        {sampleText}
      </p>

      <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
        <p
          aria-live="polite"
          className={`flex items-center gap-1.5 text-xs font-semibold ${
            preview.fallback
              ? "text-amber-700 dark:text-amber-300"
              : "text-zinc-600 dark:text-zinc-300"
          }`}
        >
          {preview.loading ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : null}
          {preview.message}
        </p>
        <OomWavePlayer
          actionLabel={label}
          audioUrl={preview.source?.kind === "static" ? preview.source.url : undefined}
          autoPlayRequest={preview.playRequest}
          blob={preview.source?.kind === "audio" ? preview.source.blob : undefined}
          className="mt-2"
          onError={() => {
            if (preview.source?.kind === "static" && !staticFallbackAttemptRef.current) {
              staticFallbackAttemptRef.current = true;
              void playPreview(true);
              return;
            }
            setPreview((current) => ({
              ...current,
              message: "음성을 재생할 수 없습니다.",
              loading: false,
              fallback: false,
            }));
          }}
          onFinish={() =>
            setPreview((current) => ({ ...current, message: "미리듣기 완료" }))
          }
          onPlaybackChange={(playing) => {
            if (playing) {
              stopSpeech();
              onPlaybackStart();
            }
            setPreview((current) => ({
              ...current,
              message: playing
                ? current.source?.kind === "static"
                  ? "정적 미리듣기 재생 중"
                  : "Kokoro 미리듣기 재생 중"
                : "미리듣기 일시정지",
            }));
          }}
          onRequestPlay={() => void playPreview()}
          onRequestStop={stopPreview}
          precomputedDuration={
            preview.source?.kind === "static" ? preview.source.duration : undefined
          }
          precomputedPeaks={
            preview.source?.kind === "static" ? preview.source.peaks : undefined
          }
          ref={playerRef}
          requestPlayLabel={`${label} 재생`}
          shellState={shellState}
          variant="script"
        />
      </div>
    </div>
  );
}
