import { Eye, Mic, Play, Square } from "lucide-react";
import { Button } from "../ui/Button";
import { ExamInterviewer } from "./ExamInterviewer";

export type ExamSessionState = "ready" | "recording" | "complete";

type ExamScreenShellProps = {
  avatarSrc?: string;
  courseLabel: string;
  elapsedLabel: string;
  listenCount: number;
  maxListenCount?: number;
  levelLabel: string;
  onListen: () => void;
  onStartAnswer: () => void;
  onStopAnswer: () => void;
  onToggleQuestionText: () => void;
  questionNumber: number;
  questionText: string;
  showQuestionText: boolean;
  state: ExamSessionState;
  targetRangeLabel: string;
  totalQuestions?: number;
};

/**
 * Reference UI shell for STEP 6.
 *
 * Visual strategy:
 * - During the answer: only interviewer / listen / recording / progress.
 * - After the answer: switch to a separate review section.
 * - OOM timer is explicitly labeled as practice guidance, not an official per-question limit.
 */
export function ExamScreenShell({
  avatarSrc,
  courseLabel,
  elapsedLabel,
  listenCount,
  maxListenCount = 2,
  levelLabel,
  onListen,
  onStartAnswer,
  onStopAnswer,
  onToggleQuestionText,
  questionNumber,
  questionText,
  showQuestionText,
  state,
  targetRangeLabel,
  totalQuestions = 15,
}: ExamScreenShellProps) {
  const recording = state === "recording";
  const canListen = !recording && listenCount < maxListenCount;

  return (
    <section
      aria-label="OOM OPIc 실전 연습 화면"
      className="overflow-hidden rounded-xl border border-zinc-300 bg-zinc-950 shadow-xl dark:border-zinc-700"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3 text-white sm:px-5">
        <div className="text-sm font-bold">OOM OPIc Practice</div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-zinc-300 sm:text-xs">
          <span>{courseLabel}</span>
          <span>{levelLabel}</span>
          <span>
            Question {String(questionNumber).padStart(2, "0")} / {totalQuestions}
          </span>
        </div>
      </header>

      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1.75fr)_minmax(300px,.75fr)]">
        <div className="grid gap-4 md:grid-cols-[minmax(250px,.9fr)_minmax(300px,1.1fr)]">
          <ExamInterviewer
            recording={recording}
            src={avatarSrc}
          />

          <div className="rounded-lg bg-white p-5 text-zinc-950 dark:bg-zinc-100">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
                질문 청취
              </p>
              <p className="text-sm font-extrabold">
                {listenCount} / {maxListenCount}
              </p>
            </div>

            <div className="grid min-h-[280px] place-items-center text-center">
              <div>
                <button
                  aria-label="질문 듣기"
                  className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
                  disabled={!canListen}
                  onClick={onListen}
                  type="button"
                >
                  <Play className="h-8 w-8 fill-current" />
                </button>
                <p className="mt-5 text-sm font-bold">
                  {canListen
                    ? "질문을 듣고 핵심 기능과 시제를 잡아보세요."
                    : "현재 시도의 질문 청취 횟수를 모두 사용했습니다."}
                </p>

                <Button
                  className="mt-5"
                  onClick={onToggleQuestionText}
                  variant="secondary"
                >
                  <Eye className="h-4 w-4" />
                  문제 텍스트 {showQuestionText ? "숨기기" : "보기"}
                </Button>

                <p
                  className={`mx-auto mt-4 max-w-xl text-sm leading-6 text-zinc-700 ${
                    showQuestionText ? "block" : "sr-only"
                  }`}
                >
                  {questionText}
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-white">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      recording ? "animate-pulse bg-red-500" : "bg-emerald-500"
                    }`}
                  />
                  {recording ? "녹음 중" : "Ready"}
                </div>
                <p className="mt-2 font-mono text-2xl font-extrabold">
                  {elapsedLabel}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[11px] font-semibold text-zinc-400">
                  OOM 연습 목표
                </p>
                <p className="mt-1 text-lg font-extrabold">{targetRangeLabel}</p>
                <p className="mt-1 text-[10px] text-zinc-500">
                  실제 OPIc의 문항별 제한시간이 아닙니다.
                </p>
              </div>

              {recording ? (
                <Button onClick={onStopAnswer} variant="danger">
                  <Square className="h-4 w-4" />
                  답변 종료
                </Button>
              ) : (
                <Button onClick={onStartAnswer}>
                  <Mic className="h-4 w-4" />
                  답변 시작
                </Button>
              )}
            </div>
          </div>
        </div>

        <aside className="rounded-lg bg-white p-4 dark:bg-zinc-100">
          <p className="text-sm font-extrabold text-zinc-900">문항 진행</p>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((n) => (
              <div
                className={`grid h-9 place-items-center rounded border text-xs font-bold ${
                  n === questionNumber
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-zinc-50 text-zinc-500"
                }`}
                key={n}
              >
                {n}
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-zinc-200 pt-5">
            <p className="text-xs font-semibold text-zinc-500">현재 상태</p>
            <p className="mt-2 text-sm font-extrabold text-zinc-900">
              {recording ? "● 답변 녹음 중" : "질문을 듣고 답변을 준비하세요."}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
