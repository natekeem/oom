import { LoaderCircle, Pause, Play, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { stopSpeech } from "../../lib/speech";
import { getTtsManager } from "../../lib/tts/TtsManager";
import type { TtsRuntimeStatus } from "../../lib/tts/types";
import { useTtsPreferences } from "../../lib/tts/useTtsPreferences";
import { OomWavePlayer, type OomWavePlayerHandle } from "../audio/OomWavePlayer";
import { Button } from "../ui/Button";

type TtsControlsProps = {
  text: string;
  onError: (message: string) => void;
};

export function TtsControls({ text, onError }: TtsControlsProps) {
  const [rate, setRate] = useState(1);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [playRequest, setPlayRequest] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [fallback, setFallback] = useState(false);
  const requestRef = useRef(0);
  const manualStopRef = useRef(false);
  const playerRef = useRef<OomWavePlayerHandle | null>(null);
  const { preferences } = useTtsPreferences();

  useEffect(() => {
    return () => {
      requestRef.current += 1;
      stopSpeech();
    };
  }, []);

  const updateStatus = (next: TtsRuntimeStatus) => {
    if (next.phase === "loading-model") {
      const progress = typeof next.progress === "number" ? ` · ${Math.round(next.progress)}%` : "";
      setStatus(`음성 모델 준비 중 · 최초 1회${progress}`);
      setLoading(true);
      setFallback(false);
      return;
    }
    if (next.phase === "generating") {
      const progress = typeof next.progress === "number" ? ` · ${Math.round(next.progress)}%` : "";
      setStatus(`스크립트 음성 생성 중${progress}`);
      setLoading(true);
      setFallback(false);
      return;
    }
    if (next.phase === "fallback") {
      setStatus("시스템 음성으로 재생 중");
      setLoading(false);
      setFallback(true);
      return;
    }
    setStatus("스크립트 음성 준비 완료");
    setLoading(false);
    setFallback(false);
  };

  const play = async () => {
    requestRef.current += 1;
    const requestId = requestRef.current;
    playerRef.current?.stop();
    stopSpeech();
    manualStopRef.current = false;
    setBlob(null);
    setStatus("음성 모델 준비 중 · 최초 1회");
    setLoading(true);
    setFallback(false);

    try {
      const source = await getTtsManager().preparePlayback(
        { text, voice: preferences.scriptVoice, speed: rate },
        (next) => {
          if (requestId === requestRef.current) updateStatus(next);
        },
      );

      if (requestId !== requestRef.current) return;

      if (source.kind === "audio") {
        setBlob(source.blob);
        setPlayRequest(requestId);
        setStatus("Kokoro 스크립트 음성 재생 중");
        setLoading(false);
        return;
      }

      source.play({
        onEnd: () => {
          if (requestId === requestRef.current) setStatus("재생 완료");
        },
        onError: () => {
          if (requestId !== requestRef.current) return;
          setStatus("시스템 음성을 재생할 수 없습니다.");
          onError("시스템 음성을 재생할 수 없습니다.");
        },
      });
    } catch (error) {
      setLoading(false);
      onError(error instanceof Error ? error.message : "음성 읽기를 시작할 수 없습니다.");
    }
  };

  const stop = () => {
    requestRef.current += 1;
    manualStopRef.current = true;
    playerRef.current?.stop();
    stopSpeech();
    setLoading(false);
    setStatus("재생 정지");
  };

  return (
    <div className="min-w-0 flex-1 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button aria-label="영어 스크립트 재생" disabled={loading} onClick={() => void play()} size="sm" variant="secondary">
          {loading ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
          듣기
        </Button>
        <Button aria-label="영어 스크립트 정지" onClick={stop} size="sm" variant="ghost"><Pause className="h-3.5 w-3.5" />정지</Button>
        <label className="flex min-w-48 flex-1 items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Volume2 className="h-4 w-4" />
          <input
            aria-label="TTS 속도"
            className="accent-indigo-600"
            max="1.1"
            min="0.8"
            onChange={(event) => {
              stop();
              setBlob(null);
              setRate(Number(event.target.value));
            }}
            step="0.1"
            type="range"
            value={rate}
          />
          <span className="w-8 font-semibold text-zinc-800 dark:text-zinc-100">{rate.toFixed(1)}x</span>
        </label>
      </div>
      {status ? (
        <p
          aria-live="polite"
          className={`text-[11px] font-semibold ${fallback ? "text-amber-700 dark:text-amber-300" : "text-zinc-500 dark:text-zinc-400"}`}
        >
          {status}
        </p>
      ) : null}
      {blob ? (
        <OomWavePlayer
          autoPlayRequest={playRequest}
          blob={blob}
          onError={(error) => onError(error.message)}
          onFinish={() => setStatus("재생 완료")}
          onPlaybackChange={(playing) => {
            if (playing) {
              manualStopRef.current = false;
              setStatus("Kokoro 스크립트 음성 재생 중");
              return;
            }
            setStatus(manualStopRef.current ? "재생 정지" : "일시정지");
            manualStopRef.current = false;
          }}
          ref={playerRef}
          variant="script"
        />
      ) : null}
    </div>
  );
}
