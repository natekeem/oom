import { Circle, Mic, Square } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { isRecorderSupported, requestAudioStream, stopAudioTracks } from "../../lib/recorder";
import { formatTime } from "../../lib/utils";
import { Button } from "../ui/Button";

export type RecordingResult = {
  blob: Blob;
  mimeType: string;
  durationSeconds: number;
};

export type RecorderHandle = {
  /** Returns true on success, false if mic permission was denied or device unavailable. */
  start: () => Promise<boolean>;
  stop: () => void;
  isRecording: () => boolean;
};

export type RecorderProps = {
  mode?: "ui" | "engine";
  onToast: (title: string, description?: string, tone?: "success" | "error" | "info") => void;
  onRecordingReady?: (recording: RecordingResult) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  resetKey?: number;
};

export const Recorder = forwardRef<RecorderHandle, RecorderProps>(function Recorder(
  { mode = "ui", onToast, onRecordingReady, onRecordingStateChange, resetKey },
  ref
) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const secondsRef = useRef(0);
  // When true, the next onstop event is from a discard/reset — skip onRecordingReady.
  const discardOnStopRef = useRef(false);
  const supported = isRecorderSupported();

  secondsRef.current = seconds;

  useEffect(() => {
    if (!isRecording) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      stopAudioTracks(streamRef.current);
    };
  }, [audioUrl]);

  // Reset when resetKey changes — mark discard so onstop skips onRecordingReady.
  useEffect(() => {
    if (resetKey === undefined || resetKey === 0) return;
    if (recorderRef.current && recorderRef.current.state === "recording") {
      discardOnStopRef.current = true;
      recorderRef.current.stop();
    }
    stopAudioTracks(streamRef.current);
    streamRef.current = null;
    recorderRef.current = null;
    setIsRecording(false);
    onRecordingStateChange?.(false);
    setSeconds(0);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl("");
    }
  }, [resetKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = async (): Promise<boolean> => {
    try {
      if (recorderRef.current && recorderRef.current.state === "recording") {
        return true;
      }
      const stream = await requestAudioStream();
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        // If this stop was triggered by a reset/discard, clear the flag and bail out.
        if (discardOnStopRef.current) {
          discardOnStopRef.current = false;
          stopAudioTracks(streamRef.current);
          streamRef.current = null;
          return;
        }
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(blob));
        stopAudioTracks(streamRef.current);
        streamRef.current = null;
        onToast("녹음이 저장되었습니다.", "오디오는 이 브라우저 메모리에만 유지됩니다.", "success");
        onRecordingReady?.({
          blob,
          mimeType,
          durationSeconds: secondsRef.current,
        });
      };
      setSeconds(0);
      recorder.start();
      setIsRecording(true);
      onRecordingStateChange?.(true);
      return true;
    } catch (error) {
      onToast(
        "녹음을 시작하지 못했습니다.",
        error instanceof Error ? error.message : "마이크 권한을 확인해 주세요.",
        "error"
      );
      return false;
    }
  };

  const stop = () => {
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
    setIsRecording(false);
    onRecordingStateChange?.(false);
  };

  useImperativeHandle(
    ref,
    () => ({
      start,
      stop,
      isRecording: () => isRecording,
    }),
    [isRecording] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // PracticeView owns the visible exam controls. Engine mode keeps the
  // MediaRecorder lifecycle and imperative API without creating duplicate
  // interactive controls in a visually hidden subtree.
  if (mode === "engine") return null;

  if (!supported) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        이 브라우저는 MediaRecorder 또는 마이크 접근을 지원하지 않습니다. 아래 텍스트 답변으로도
        피드백 연습을 할 수 있습니다.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-indigo-500" />
            <p className="text-sm font-bold text-zinc-900 dark:text-white">브라우저 녹음</p>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            서버 저장 없이 현재 세션에서만 재생됩니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-lg font-bold text-zinc-900 dark:text-white">
            {formatTime(seconds)}
          </span>
          {isRecording ? (
            <Button onClick={stop} variant="danger">
              <Square className="h-4 w-4" />
              중지
            </Button>
          ) : (
            <Button onClick={start}>
              <Circle className="h-4 w-4" />
              녹음 시작
            </Button>
          )}
        </div>
      </div>
      {isRecording ? (
        <p className="mt-4 flex items-center gap-2 text-xs font-medium text-rose-600 dark:text-rose-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
          녹음 중입니다. 자연스럽게 멈추고 연결해 보세요.
        </p>
      ) : null}
      {audioUrl ? (
        <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <p className="mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">내 녹음 듣기</p>
          <audio className="w-full" controls src={audioUrl}>
            브라우저가 audio 재생을 지원하지 않습니다.
          </audio>
        </div>
      ) : null}
    </div>
  );
});
