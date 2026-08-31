import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Headphones,
  Pause,
  Play,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { MockPostExamNav, type MockPostExamView } from "./MockPostExamNav";
import type { MockAttempt } from "./mockSessionTypes";

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function MockResultView({
  attempts,
  totalQuestions,
  totalTestSeconds,
  reviewing,
  selectedAttemptId,
  onNavigate,
  onReview,
  onRestart,
  children,
}: {
  attempts: MockAttempt[];
  totalQuestions: number;
  totalTestSeconds: number;
  reviewing: boolean;
  selectedAttemptId?: string;
  onNavigate: (view: MockPostExamView) => void;
  onReview: (attemptId?: string) => void;
  onRestart: () => void;
  children?: ReactNode;
}) {
  const durations = attempts.map((attempt) => attempt.durationSeconds);
  const totalAnswerSeconds = durations.reduce((sum, duration) => sum + duration, 0);
  const average = attempts.length ? Math.round(totalAnswerSeconds / attempts.length) : 0;
  const recordedCount = attempts.filter((attempt) => attempt.recording).length;
  const selectedIndex = attempts.findIndex((attempt) => attempt.id === selectedAttemptId);
  const selectedAttempt = selectedIndex >= 0 ? attempts[selectedIndex] : undefined;
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [playingAttemptId, setPlayingAttemptId] = useState<string | null>(null);

  const stopPreview = useCallback(() => {
    const audio = previewAudioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPlayingAttemptId(null);
  }, []);

  useEffect(() => stopPreview, [stopPreview]);

  const togglePreview = async (attempt: MockAttempt) => {
    const audio = previewAudioRef.current;
    if (!audio || !attempt.recording) return;
    if (playingAttemptId === attempt.id) {
      stopPreview();
      return;
    }
    stopPreview();
    const url = URL.createObjectURL(attempt.recording.blob);
    previewUrlRef.current = url;
    audio.src = url;
    setPlayingAttemptId(attempt.id);
    try {
      await audio.play();
    } catch {
      stopPreview();
    }
  };

  const moveSelection = (direction: -1 | 1) => {
    const next = attempts[selectedIndex + direction];
    if (next) onReview(next.id);
  };

  if (!reviewing) {
    return (
      <div className="space-y-5" data-mock-phase="complete">
        <MockPostExamNav active="summary" onChange={onNavigate} />
        <Card className="border-emerald-200 p-7 dark:border-emerald-900 sm:p-9">
          <Badge tone="emerald">시험 완료</Badge>
          <h1 className="mt-4 text-2xl font-black text-zinc-950 dark:text-white sm:text-3xl">
            실전 모의고사를 완료했습니다.
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            끝까지 답한 기록을 확인하고 필요한 답변만 복기하세요.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-950/70">
              <p className="text-xs text-zinc-500">답변한 문항</p>
              <p className="mt-1 text-xl font-black text-zinc-950 dark:text-white">{attempts.length} / {totalQuestions}</p>
            </div>
            <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-950/70">
              <p className="text-xs text-zinc-500">본시험 시간</p>
              <p className="mt-1 font-mono text-xl font-black text-zinc-950 dark:text-white">{formatDuration(totalTestSeconds)}</p>
            </div>
            <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-950/70">
              <p className="text-xs text-zinc-500">녹음 문항</p>
              <p className="mt-1 text-xl font-black text-zinc-950 dark:text-white">{recordedCount}</p>
            </div>
          </div>

          <div className="mt-8 border-t border-zinc-100 pt-6 dark:border-zinc-800">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-500">다음 단계</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button onClick={() => onReview(attempts[0]?.id)}>
                <Headphones className="h-4 w-4" /> 답변 복기 시작
              </Button>
              <Button onClick={() => onNavigate("report")} variant="secondary">
                <FileText className="h-4 w-4" /> 훈련 리포트 보기
              </Button>
              <Button className="sm:ml-auto" onClick={onRestart} variant="ghost">
                <RefreshCw className="h-4 w-4" /> 새 모의고사
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="space-y-4 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:space-y-0 lg:overflow-hidden"
      data-mock-phase="review"
      data-mock-workbench="review"
    >
      <MockPostExamNav active="review" onChange={onNavigate} />

      <header className="py-4 lg:shrink-0">
        <Badge tone="indigo">전체 답변 복기</Badge>
        <h1 className="mt-2 text-xl font-black text-zinc-950 dark:text-white sm:text-2xl">
          질문과 내 답변을 한 화면에서 비교하세요.
        </h1>
        <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-300 sm:text-sm">
          필요한 답변만 STT와 AI로 확인하면 훈련 리포트에 즉시 반영됩니다.
        </p>
      </header>

      <div className="grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(360px,410px)_minmax(0,1fr)] lg:items-stretch">
        <Card className="flex min-h-0 flex-col overflow-hidden p-3 sm:p-4">
          <div className="shrink-0 border-b border-zinc-100 px-1 pb-3 dark:border-zinc-800">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-sm font-black text-zinc-950 dark:text-white">답변 목록</h2>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{attempts.length}문항 · 평균 {formatDuration(average)}</p>
              </div>
              <p className="text-right text-[11px] text-zinc-400">총 {formatDuration(totalAnswerSeconds)}</p>
            </div>
          </div>

          <ol
            aria-label="모의고사 답변 목록"
            className="oom-sidebar-scroll mt-3 min-h-0 space-y-2 overflow-y-auto pr-1 lg:flex-1"
            data-testid="mock-answer-list"
          >
            {attempts.map((attempt) => {
              const selected = attempt.id === selectedAttemptId;
              const playing = attempt.id === playingAttemptId;
              const label = `Session ${attempt.session} Q${attempt.sessionIndex + 1}`;
              return (
                <li
                  className={`flex overflow-hidden rounded-lg border transition ${
                    selected
                      ? "border-indigo-400 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950/40"
                      : "border-zinc-200 bg-white hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800"
                  }`}
                  key={attempt.id}
                >
                  <button
                    aria-pressed={selected}
                    className="min-w-0 flex-1 p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
                    onClick={() => onReview(attempt.id)}
                    type="button"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-indigo-700 dark:text-indigo-300">
                        S{attempt.session} · Q{attempt.sessionIndex + 1}
                      </span>
                      {attempt.question.kind === "roleplay" ? <Badge className="py-0.5 text-[10px]" tone="amber">ROLEPLAY</Badge> : null}
                    </div>
                    <p className="mt-1.5 text-xs font-black text-zinc-900 dark:text-white">{attempt.question.group}</p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">{attempt.question.prompt}</p>
                  </button>
                  <div className="flex w-16 shrink-0 flex-col items-center justify-center gap-2 border-l border-zinc-100 px-2 dark:border-zinc-800">
                    <span className="font-mono text-[11px] text-zinc-500">{formatDuration(attempt.durationSeconds)}</span>
                    <button
                      aria-label={attempt.recording ? `${label} ${playing ? "녹음 정지" : "녹음 재생"}` : `${label} 녹음 없음`}
                      className="grid h-9 w-9 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-35 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
                      disabled={!attempt.recording}
                      onClick={(event) => {
                        event.stopPropagation();
                        void togglePreview(attempt);
                      }}
                      title={attempt.recording ? "이 답변 바로 듣기" : "녹음 없음"}
                      type="button"
                    >
                      {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
          <audio
            aria-hidden="true"
            className="hidden"
            data-testid="mock-row-preview-audio"
            onEnded={stopPreview}
            ref={previewAudioRef}
          />
        </Card>

        <div className="flex min-w-0 flex-col overflow-hidden rounded-md border border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-950/30 lg:min-h-0">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900 sm:px-4">
            <Button
              aria-label="이전 답변"
              disabled={selectedIndex <= 0}
              onClick={() => moveSelection(-1)}
              size="sm"
              variant="ghost"
            >
              <ChevronLeft className="h-4 w-4" /> 이전 답변
            </Button>
            <p className="text-center text-xs font-black text-zinc-600 dark:text-zinc-300">
              {selectedAttempt ? `S${selectedAttempt.session} · Q${selectedAttempt.sessionIndex + 1} / 전체 ${attempts.length}` : `전체 ${attempts.length}`}
            </p>
            <Button
              aria-label="다음 답변"
              disabled={selectedIndex < 0 || selectedIndex >= attempts.length - 1}
              onClick={() => moveSelection(1)}
              size="sm"
              variant="ghost"
            >
              다음 답변 <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="oom-sidebar-scroll min-h-0 flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
            {selectedAttempt ? (
              <Card className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="indigo">SESSION {selectedAttempt.session} · Q{selectedAttempt.sessionIndex + 1}</Badge>
                  <Badge tone={selectedAttempt.question.kind === "roleplay" ? "amber" : "default"}>
                    {selectedAttempt.question.kind === "roleplay" ? "롤플레이" : "일반 질문"}
                  </Badge>
                </div>
                <p className="mt-3 text-sm font-black text-zinc-950 dark:text-white">{selectedAttempt.question.group}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-200">{selectedAttempt.question.prompt}</p>
                <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                  답변 {formatDuration(selectedAttempt.durationSeconds)} · 청취 {selectedAttempt.listenCount}/2
                </p>
              </Card>
            ) : null}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
