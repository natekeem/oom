import {
  Dices,
  Eye,
  EyeOff,
  HelpCircle,
  Mic,
  Play,
  Square,
  Volume2,
} from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { ExamInterviewer } from "./ExamInterviewer";

export type ExamSessionState = "ready" | "recording" | "complete";

type AnnotationBadgeProps = {
  id: number;
  active?: boolean;
  onSelect?: (id: number) => void;
  className?: string;
};

function AnnotationBadge({
  id,
  active = false,
  onSelect,
  className = "",
}: AnnotationBadgeProps) {
  if (onSelect) {
    return (
      <button
        aria-label={`${id}번 영역 설명 보기`}
        aria-pressed={active}
        className={`grid h-11 w-11 place-items-center rounded-full text-xs font-black text-white shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:h-7 sm:w-7 ${
          active
            ? "bg-indigo-600 ring-4 ring-indigo-400 shadow-indigo-500/50 scale-110"
            : "bg-zinc-800 text-zinc-200 ring-2 ring-zinc-500 hover:bg-indigo-600 hover:text-white hover:scale-105"
        } ${className}`}
        onClick={() => onSelect(id)}
        type="button"
      >
        {id}
      </button>
    );
  }

  return (
    <div
      className={`grid h-11 w-11 place-items-center rounded-full bg-indigo-600 text-xs font-black text-white shadow-lg ring-2 ring-white sm:h-7 sm:w-7 ${className}`}
    >
      {id}
    </div>
  );
}

type ExamScreenShellProps = {
  courseLabel: string;
  levelLabel: string;
  questionGroup?: string;
  questionTypeLabel?: string;
  questionPrompt?: string;
  recommendedStoryTitle?: string;
  recommendedStoryScene?: string;
  listenCount: number;
  maxListenCount?: number;
  isSpeaking: boolean;
  state: ExamSessionState;
  elapsedLabel: string;
  targetRangeLabel: string;
  showQuestionText: boolean;
  showStoryHint?: boolean;
  avatarSrc?: string;
  onListen: () => void;
  onStartAnswer: () => void;
  onStopAnswer: () => void;
  onToggleQuestionText: () => void;
  onToggleStoryHint?: () => void;
  onDrawQuestion?: () => void;
  onStartTimerOnly?: () => void;
  micFailed?: boolean;
  onNavigateToGuide?: () => void;
  isDemo?: boolean;
  activeAnnotation?: number;
  onAnnotationSelect?: (id: number) => void;
  questionChanged?: boolean;
  audioPlayer?: ReactNode;
  ttsStatus?: string;
};

/**
 * Unified Exam Screen Shell for both STEP 6 interactive practice
 * and /exam-guide/screen/ annotated demo.
 */
export function ExamScreenShell({
  courseLabel,
  levelLabel,
  questionGroup,
  questionTypeLabel,
  questionPrompt,
  recommendedStoryTitle,
  recommendedStoryScene,
  listenCount,
  maxListenCount = 2,
  isSpeaking,
  state,
  elapsedLabel,
  targetRangeLabel,
  showQuestionText,
  showStoryHint = false,
  avatarSrc,
  onListen,
  onStartAnswer,
  onStopAnswer,
  onToggleQuestionText,
  onToggleStoryHint,
  onDrawQuestion,
  onStartTimerOnly,
  micFailed = false,
  onNavigateToGuide,
  isDemo = false,
  activeAnnotation,
  onAnnotationSelect,
  questionChanged = false,
  audioPlayer,
  ttsStatus,
}: ExamScreenShellProps) {
  const recording = state === "recording";
  const canListen = !recording && !isSpeaking && listenCount < maxListenCount && Boolean(questionPrompt);

  return (
    <section
      aria-label="OOM OPIc 실전 연습 시험 콘솔"
      className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 text-white shadow-2xl"
    >
      {/* Top Console Bar */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-900/90 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          <span className="text-xs font-bold tracking-wider text-zinc-200 sm:text-sm">
            OOM OPIc Practice Console
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-300">
          <span className="font-semibold text-indigo-400">{courseLabel} 랜덤 질문</span>
          <span className="text-zinc-600">|</span>
          <span>{levelLabel}</span>
          <span className="sr-only">{levelLabel} 레벨에 맞는 질문 풀</span>
          <span className="text-zinc-600">|</span>
          <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-zinc-200">
            Practice Question
          </span>
        </div>
      </header>

      {/* Main Console Grid */}
      <div
        className="grid gap-5 p-4 sm:p-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.85fr)]"
        data-testid="exam-console-grid"
      >
        {/* Left Column: Interviewer & Question Listening */}
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[minmax(200px,0.85fr)_minmax(240px,1.15fr)]">
            {/* 1. Interviewer Panel */}
            <div className="relative">
              <ExamInterviewer
                annotationBadge={isDemo ? 1 : undefined}
                isAnnotationActive={activeAnnotation === 1}
                isSpeaking={isSpeaking}
                onAnnotationSelect={onAnnotationSelect}
                recording={recording}
                src={avatarSrc}
              />
            </div>

            {/* 2 & 3. Question Listening Control */}
            <div className="relative flex flex-col justify-between rounded-lg border border-zinc-800 bg-zinc-900/90 p-5 text-white">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
                  질문 청취
                </p>
                <div className="relative inline-flex items-center gap-1.5 rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-extrabold text-white">
                  <Volume2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>
                    {listenCount} / {maxListenCount}
                  </span>
                  {isDemo ? (
                    <AnnotationBadge
                      active={activeAnnotation === 3}
                      className="absolute -right-3 -top-3 z-10 max-sm:static"
                      id={3}
                      onSelect={onAnnotationSelect}
                    />
                  ) : null}
                </div>
              </div>

              {/* Play Button Area */}
              <div className="my-4 grid place-items-center text-center">
                <div className="relative">
                  {isDemo ? (
                    <AnnotationBadge
                      active={activeAnnotation === 2}
                      className="absolute -left-3 -top-3 z-10 max-sm:static max-sm:mb-2"
                      id={2}
                      onSelect={onAnnotationSelect}
                    />
                  ) : null}
                  <button
                    aria-label="질문 듣기"
                    className={`group relative grid h-20 w-20 place-items-center rounded-full border transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/50 ${
                      canListen
                        ? "border-indigo-400 bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:scale-105 hover:bg-indigo-500 active:scale-95"
                        : "cursor-not-allowed border-zinc-700 bg-zinc-800/80 text-zinc-500"
                    }`}
                    disabled={!canListen}
                    onClick={onListen}
                    type="button"
                  >
                    {isSpeaking ? (
                      <span className="flex h-5 w-5 items-end justify-center gap-1">
                        <span className="h-4 w-1 animate-bounce bg-white" />
                        <span className="h-5 w-1 animate-bounce [animation-delay:0.15s] bg-white" />
                        <span className="h-3 w-1 animate-bounce [animation-delay:0.3s] bg-white" />
                      </span>
                    ) : (
                      <Play className="ml-1 h-8 w-8 fill-current transition group-hover:scale-110" />
                    )}
                  </button>
                </div>
                <p className="mt-3 text-xs font-medium text-zinc-300">
                  {ttsStatus ?? (isSpeaking
                    ? "질문 음성을 재생하고 있습니다..."
                    : listenCount >= maxListenCount
                    ? "청취 횟수(최대 2회)가 완료되었습니다."
                    : "버튼을 눌러 질문을 청취하세요.")}
                </p>
                <p className="mt-1 text-[11px] text-zinc-500">
                  실제 시험에서는 질문을 최대 2회까지 들을 수 있습니다.
                </p>
                {audioPlayer ? <div className="mt-3 w-full min-w-0">{audioPlayer}</div> : null}
              </div>

              {/* Spacing alignment */}
              <div className="border-t border-zinc-800/40" />
            </div>
          </div>

          {/* Question Text Box (Audio-First: hidden by default, accessible via sr-only, single toggle in header) */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold uppercase tracking-wider">
                Question Prompt
              </span>
              <Button
                aria-expanded={showQuestionText}
                aria-label={showQuestionText ? "문제 텍스트 숨기기" : "문제 텍스트 보기"}
                className="h-11 text-xs sm:h-8"
                onClick={onToggleQuestionText}
                size="sm"
                variant="secondary"
              >
                {showQuestionText ? (
                  <>
                    <EyeOff className="mr-1 h-3.5 w-3.5" />
                    텍스트 숨기기
                  </>
                ) : (
                  <>
                    <Eye className="mr-1 h-3.5 w-3.5" />
                    텍스트 보기
                  </>
                )}
              </Button>
            </div>

            {/* One canonical prompt node switches between visual and sr-only presentation. */}
            <p
              className={
                showQuestionText
                  ? "mt-2 text-sm font-medium leading-6 text-zinc-100 sm:text-base"
                  : "sr-only"
              }
            >
              {questionPrompt ?? "현재 선택된 질문이 없습니다."}
            </p>

            {!showQuestionText ? (
              <div className="mt-2 rounded-md border border-dashed border-zinc-800 bg-zinc-950/40 px-3.5 py-2.5 text-xs text-zinc-400">
                질문 텍스트는 실제 시험처럼 숨겨져 있습니다. 음성에 집중해 보세요.
              </div>
            ) : null}
          </div>

          {/* 4 & 6. Recording & Time Status Bar */}
          <div className="relative rounded-lg border border-zinc-800 bg-zinc-900/90 p-4 sm:p-5">
            {isDemo ? (
              <AnnotationBadge
                active={activeAnnotation === 4}
                className="absolute left-3 top-3 z-10 max-sm:static max-sm:mb-3"
                id={4}
                onSelect={onAnnotationSelect}
              />
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Recording Indicator */}
              <div className="flex items-center gap-3">
                <div
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border ${
                    recording
                      ? "border-red-500/50 bg-red-500/20 text-red-400"
                      : "border-zinc-700 bg-zinc-800 text-zinc-400"
                  }`}
                >
                  <Mic className={`h-5 w-5 ${recording ? "animate-pulse" : ""}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-full ${
                        recording ? "animate-ping bg-red-500" : "bg-zinc-600"
                      }`}
                    />
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      {recording ? "Recording Active" : "Microphone Ready"}
                    </p>
                  </div>
                  <p className="mt-0.5 font-mono text-xl font-black text-white sm:text-2xl">
                    {elapsedLabel}
                  </p>
                </div>
              </div>

              {/* Target Range Display */}
              <div className="rounded-md border border-zinc-800 bg-zinc-950/60 px-3.5 py-2 text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  OOM 연습 목표
                </p>
                <p className="mt-0.5 text-base font-extrabold text-indigo-300 sm:text-lg">
                  {targetRangeLabel}
                </p>
                <p className="mt-0.5 text-[10px] text-zinc-500">
                  실제 OPIc의 문항별 제한시간이 아닙니다.
                </p>
              </div>

              {/* Action Button */}
              <div className="relative flex items-center gap-2">
                {isDemo ? (
                  <AnnotationBadge
                    active={activeAnnotation === 6}
                    className="absolute -left-3 -top-3 z-10 max-sm:static"
                    id={6}
                    onSelect={onAnnotationSelect}
                  />
                ) : null}

                {recording ? (
                  <Button
                    aria-label="답변 종료"
                    className="bg-red-600 text-white hover:bg-red-500"
                    onClick={onStopAnswer}
                  >
                    <Square className="h-4 w-4" />
                    답변 종료
                  </Button>
                ) : (
                  <Button
                    aria-label="답변 시작"
                    className="bg-indigo-600 text-white hover:bg-indigo-500"
                    disabled={!questionPrompt}
                    onClick={onStartAnswer}
                  >
                    <Mic className="h-4 w-4" />
                    답변 시작
                  </Button>
                )}
              </div>
            </div>

            {/* Mic Failure Inline Fallback */}
            {micFailed ? (
              <div className="mt-3 rounded-md border border-amber-500/40 bg-amber-950/40 p-3 text-xs leading-5 text-amber-200">
                <p className="font-bold">마이크를 사용할 수 없습니다.</p>
                <p className="mt-0.5">
                  마이크 없이 타이머만 시작하여 발화 시간을 재고, 답변 후 transcript를 직접 입력할 수 있습니다.
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {onStartTimerOnly ? (
                    <Button onClick={onStartTimerOnly} size="sm" variant="secondary">
                      타이머만 시작
                    </Button>
                  ) : null}
                  <Button onClick={onStartAnswer} size="sm">
                    다시 시도
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Column: Question Info, Storyline Hint & Navigation */}
        <aside
          className={`relative flex flex-col justify-between rounded-lg border bg-zinc-900/90 p-5 text-white transition-all duration-300 ${
            questionChanged
              ? "border-indigo-400 ring-2 ring-indigo-400/60 shadow-lg shadow-indigo-500/20"
              : "border-zinc-800"
          }`}
        >
          {isDemo ? (
            <AnnotationBadge
              active={activeAnnotation === 5}
              className="absolute right-3 top-3 z-10 max-sm:static max-sm:mb-3"
              id={5}
              onSelect={onAnnotationSelect}
            />
          ) : null}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
                문항 정보
              </p>
              {onDrawQuestion ? (
                <Button
                  aria-label="랜덤 질문 뽑기"
                  className="text-xs"
                  onClick={onDrawQuestion}
                  size="sm"
                  variant="secondary"
                >
                  <Dices className="h-3.5 w-3.5" />
                  랜덤 질문 뽑기
                </Button>
              ) : null}
            </div>

            {questionGroup ? (
              <div className="flex flex-wrap gap-2">
                <Badge tone="indigo">{questionGroup}</Badge>
                {questionTypeLabel ? (
                  <Badge tone="default">{questionTypeLabel}</Badge>
                ) : null}
              </div>
            ) : null}

            <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-4">
              <p className="text-xs font-semibold text-zinc-400">진행 상태</p>
              <p className="mt-1 text-sm font-bold text-white">
                {questionChanged
                  ? "✓ 새 연습 문항을 불러왔습니다."
                  : recording
                  ? "● 답변 녹음 중..."
                  : isSpeaking
                  ? "질문 청취 중"
                  : questionPrompt
                  ? "질문을 듣고 핵심 단어를 떠올린 뒤 답변하세요."
                  : "랜덤 질문을 뽑아 연습을 시작하세요."}
              </p>
            </div>

            {/* Recommended Storyline Hint */}
            {!recording && !isSpeaking && recommendedStoryTitle && onToggleStoryHint ? (
              <div className="rounded-md border border-indigo-900/40 bg-indigo-950/30 p-3.5">
                <button
                  aria-expanded={showStoryHint}
                  aria-label={showStoryHint ? "추천 스크립트 힌트 접기" : "추천 스크립트 힌트 보기"}
                  className="flex w-full items-center justify-between text-left text-xs font-bold text-indigo-300 hover:text-indigo-200"
                  onClick={onToggleStoryHint}
                  type="button"
                >
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5" />
                    추천 스크립트 힌트 {showStoryHint ? "접기" : "보기"}
                  </span>
                  <span>{showStoryHint ? "▲" : "▼"}</span>
                </button>

                {showStoryHint ? (
                  <div className="mt-2.5 space-y-1 text-xs leading-5 text-indigo-200/90">
                    <p className="font-semibold">{recommendedStoryTitle}</p>
                    {recommendedStoryScene ? (
                      <p className="text-[11px] text-zinc-400">
                        핵심 장면: {recommendedStoryScene}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Guide Link CTA */}
          {onNavigateToGuide ? (
            <div className="mt-6 border-t border-zinc-800 pt-4">
              <button
                className="text-left text-xs text-zinc-400 transition hover:text-indigo-300"
                onClick={onNavigateToGuide}
                type="button"
              >
                시험 화면이 처음인가요?{" "}
                <span className="font-bold text-indigo-400 underline underline-offset-4">
                  시험 화면 가이드
                </span>
                에서 각 영역의 역할을 확인하세요.
              </button>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
