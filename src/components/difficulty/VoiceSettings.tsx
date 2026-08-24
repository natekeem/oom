import { useEffect, useRef, useState, type RefObject } from "react";
import { AudioLines, LoaderCircle, Play } from "lucide-react";
import { OomWavePlayer, type OomWavePlayerHandle } from "../audio/OomWavePlayer";
import { Button } from "../ui/Button";
import { stopSpeech } from "../../lib/speech";
import { getTtsManager } from "../../lib/tts/TtsManager";
import type { OomVoiceId, TtsRuntimeStatus } from "../../lib/tts/types";
import { useTtsPreferences } from "../../lib/tts/useTtsPreferences";
import {
  EXAM_PREVIEW_TEXT,
  OOM_VOICES,
  SCRIPT_PREVIEW_TEXT,
} from "../../lib/tts/voiceConfig";

type VoiceUse = "exam" | "script";

type PreviewState = {
  use: VoiceUse;
  blob: Blob | null;
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
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const requestIdRef = useRef(0);
  const playerRef = useRef<OomWavePlayerHandle | null>(null);

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
    setPreview(null);
  };

  const selectVoice = (use: VoiceUse, voice: OomVoiceId) => {
    stopPreview();
    if (use === "exam") setExamVoice(voice);
    else setScriptVoice(voice);
  };

  const playPreview = async (use: VoiceUse) => {
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;
    playerRef.current?.stop();
    stopSpeech();

    const voice = use === "exam" ? preferences.examVoice : preferences.scriptVoice;
    const text = use === "exam" ? EXAM_PREVIEW_TEXT : SCRIPT_PREVIEW_TEXT;

    setPreview({
      use,
      blob: null,
      playRequest: 0,
      message: "음성 모델 준비 중 · 최초 1회",
      loading: true,
      fallback: false,
    });

    try {
      const source = await getTtsManager().preparePlayback(
        { text, voice, speed: 1 },
        (status) => {
          if (requestId !== requestIdRef.current) return;
          setPreview((current) =>
            current?.use === use
              ? {
                  ...current,
                  message: statusMessage(status),
                  loading:
                    status.phase === "loading-model" || status.phase === "generating",
                  fallback: status.phase === "fallback",
                }
              : current,
          );
        },
      );

      if (requestId !== requestIdRef.current) return;

      if (source.kind === "audio") {
        setPreview({
          use,
          blob: source.blob,
          playRequest: requestId,
          message: "Kokoro 미리듣기 재생 중",
          loading: false,
          fallback: false,
        });
        return;
      }

      setPreview({
        use,
        blob: null,
        playRequest: 0,
        message: "시스템 음성으로 재생 중",
        loading: false,
        fallback: true,
      });
      source.play({
        onEnd: () => {
          if (requestId === requestIdRef.current) {
            setPreview((current) =>
              current?.use === use
                ? { ...current, message: "미리듣기 완료" }
                : current,
            );
          }
        },
        onError: () => {
          if (requestId === requestIdRef.current) {
            setPreview((current) =>
              current?.use === use
                ? { ...current, message: "음성을 재생할 수 없습니다." }
                : current,
            );
          }
        },
      });
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      setPreview({
        use,
        blob: null,
        playRequest: 0,
        message: error instanceof Error ? error.message : "음성을 재생할 수 없습니다.",
        loading: false,
        fallback: false,
      });
    }
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
          disabled={preview?.loading ?? false}
          label="시험 질문 음성"
          onPreview={() => void playPreview("exam")}
          onPreviewMessage={(message) =>
            setPreview((current) =>
              current?.use === "exam" ? { ...current, message } : current,
            )
          }
          onSelect={(voice) => selectVoice("exam", voice)}
          preview={preview?.use === "exam" ? preview : null}
          playerRef={playerRef}
          sampleText={EXAM_PREVIEW_TEXT}
          use="exam"
        />
        <VoiceRow
          activeVoice={preferences.scriptVoice}
          disabled={preview?.loading ?? false}
          label="스크립트 재생 음성"
          onPreview={() => void playPreview("script")}
          onPreviewMessage={(message) =>
            setPreview((current) =>
              current?.use === "script" ? { ...current, message } : current,
            )
          }
          onSelect={(voice) => selectVoice("script", voice)}
          preview={preview?.use === "script" ? preview : null}
          playerRef={playerRef}
          sampleText={SCRIPT_PREVIEW_TEXT}
          use="script"
        />
      </div>
    </section>
  );
}

function VoiceRow({
  activeVoice,
  disabled,
  label,
  onPreview,
  onPreviewMessage,
  onSelect,
  preview,
  playerRef,
  sampleText,
  use,
}: {
  activeVoice: OomVoiceId;
  disabled: boolean;
  label: string;
  onPreview: () => void;
  onPreviewMessage: (message: string) => void;
  onSelect: (voice: OomVoiceId) => void;
  preview: PreviewState | null;
  playerRef: RefObject<OomWavePlayerHandle>;
  sampleText: string;
  use: VoiceUse;
}) {
  return (
    <div className="min-w-0 rounded-md border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{label}</h3>
        <Button
          aria-label={`${label} 미리듣기`}
          disabled={disabled}
          onClick={onPreview}
          size="sm"
          variant="secondary"
        >
          {preview?.loading ? (
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5 fill-current" />
          )}
          미리듣기
        </Button>
      </div>

      <div aria-label={`${label} 선택`} className="mt-3 flex flex-wrap gap-2" role="group">
        {OOM_VOICES.map((voice) => {
          const active = activeVoice === voice.id;
          return (
            <button
              aria-pressed={active}
              className={`min-h-9 rounded-md border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                active
                  ? "border-indigo-500 bg-indigo-600 text-white dark:border-indigo-400 dark:bg-indigo-500"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-indigo-300 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
              }`}
              key={`${use}-${voice.id}`}
              onClick={() => onSelect(voice.id)}
              type="button"
            >
              {voice.label}
            </button>
          );
        })}
      </div>

      <p className="mt-3 break-words text-[11px] leading-5 text-zinc-500 dark:text-zinc-400">
        {sampleText}
      </p>

      {preview ? (
        <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
          <p
            aria-live="polite"
            className={`flex items-center gap-1.5 text-[11px] font-semibold ${
              preview.fallback
                ? "text-amber-700 dark:text-amber-300"
                : "text-zinc-600 dark:text-zinc-300"
            }`}
          >
            {preview.loading ? <LoaderCircle className="h-3 w-3 animate-spin" /> : null}
            {preview.message}
          </p>
          {preview.blob ? (
            <OomWavePlayer
              autoPlayRequest={preview.playRequest}
              blob={preview.blob}
              className="mt-2"
              onError={() => onPreviewMessage("음성을 재생할 수 없습니다.")}
              onFinish={() => onPreviewMessage("미리듣기 완료")}
              onPlaybackChange={(playing) =>
                onPreviewMessage(playing ? "Kokoro 미리듣기 재생 중" : "미리듣기 일시정지")
              }
              ref={playerRef}
              variant="script"
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
