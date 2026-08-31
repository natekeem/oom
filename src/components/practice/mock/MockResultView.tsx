import { FileText, Headphones, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
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
  onReview,
  onStartReview,
  onViewReport,
  onRestart,
  children,
}: {
  attempts: MockAttempt[];
  totalQuestions: number;
  totalTestSeconds: number;
  reviewing: boolean;
  selectedAttemptId?: string;
  onReview: (attemptId: string) => void;
  onStartReview: () => void;
  onViewReport: () => void;
  onRestart: () => void;
  children?: ReactNode;
}) {
  const durations = attempts.map((attempt) => attempt.durationSeconds);
  const totalAnswerSeconds = durations.reduce((sum, duration) => sum + duration, 0);
  const average = attempts.length ? Math.round(totalAnswerSeconds / attempts.length) : 0;
  const recordedCount = attempts.filter((attempt) => attempt.recording).length;

  if (!reviewing) {
    return (
      <div className="space-y-5">
        <Card className="border-emerald-200 p-7 text-center dark:border-emerald-900 sm:p-10">
          <Badge tone="emerald">시험 완료</Badge>
          <h1 className="mt-4 text-2xl font-black text-zinc-950 dark:text-white sm:text-3xl">실전 모의고사를 완료했습니다.</h1>
          <div className="mx-auto mt-7 grid max-w-2xl gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
              <p className="text-xs text-zinc-500">답변한 문항</p>
              <p className="mt-1 text-xl font-black text-zinc-950 dark:text-white">{attempts.length} / {totalQuestions}</p>
            </div>
            <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
              <p className="text-xs text-zinc-500">총 본시험 시간</p>
              <p className="mt-1 font-mono text-xl font-black text-zinc-950 dark:text-white">{formatDuration(totalTestSeconds)}</p>
            </div>
            <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
              <p className="text-xs text-zinc-500">녹음 성공 문항</p>
              <p className="mt-1 text-xl font-black text-zinc-950 dark:text-white">{recordedCount}</p>
            </div>
          </div>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={onViewReport}><FileText className="h-4 w-4" /> 종합 예상 점수·진단 Report</Button>
            <Button onClick={onStartReview} variant="secondary"><Headphones className="h-4 w-4" /> 전체 복기 시작</Button>
            <Button onClick={onRestart} variant="secondary"><RefreshCw className="h-4 w-4" /> 새 모의고사</Button>
          </div>
        </Card>
        <p className="text-center text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          예상치는 완료율·발화 시간·녹음·복기 근거를 사용한 OOM 비공식 훈련 진단이며 공식 OPIc 점수나 등급을 보장하지 않습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="indigo">전체 답변 복기</Badge>
          <h1 className="mt-2 text-2xl font-black text-zinc-950 dark:text-white">질문과 내 답변을 한 화면에서 비교하세요.</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">선택한 답변만 STT와 AI로 복기한 뒤 종합 Report에 반영할 수 있습니다.</p>
        </div>
        <Button onClick={onViewReport} variant="secondary"><FileText className="h-4 w-4" /> 종합 진단 Report</Button>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(420px,1.05fr)_minmax(0,1.25fr)] lg:items-stretch">
        <Card className="p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-2 p-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span>평균 답변 {formatDuration(average)}</span>
            <span className="text-right">총 답변 {formatDuration(totalAnswerSeconds)}</span>
            <span>최단 {formatDuration(durations.length ? Math.min(...durations) : 0)}</span>
            <span className="text-right">최장 {formatDuration(durations.length ? Math.max(...durations) : 0)}</span>
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {attempts.map((attempt) => (
              <button
                aria-pressed={attempt.id === selectedAttemptId}
                className={`w-full rounded-lg border p-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  attempt.id === selectedAttemptId
                    ? "border-indigo-400 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950/40"
                    : "border-zinc-200 hover:border-indigo-300 dark:border-zinc-800 dark:hover:border-indigo-800"
                }`}
                key={attempt.id}
                onClick={() => onReview(attempt.id)}
                type="button"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-indigo-700 dark:text-indigo-300">SESSION {attempt.session} · Q{attempt.sessionIndex + 1}</span>
                  <span className="font-mono text-xs text-zinc-500">{formatDuration(attempt.durationSeconds)}</span>
                </div>
                <p className="mt-1 text-xs font-black text-zinc-900 dark:text-white">
                  {attempt.question.kind === "roleplay" ? "ROLEPLAY · " : ""}{attempt.question.group}
                </p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">{attempt.question.prompt}</p>
              </button>
            ))}
          </div>
        </Card>
        <div className="min-w-0 lg:h-full">{children}</div>
      </div>
    </div>
  );
}
