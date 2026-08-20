import { Bot, Dices, HelpCircle, Loader2, MessageSquareText, Play, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import { callInternalLlm } from "../../lib/llm";
import { transcribeAudio } from "../../lib/stt";
import type { LlmSettings, SttSettings } from "../../types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Recorder, type RecorderHandle, type RecordingResult } from "./Recorder";
import { PracticeTimer } from "./PracticeTimer";
import { TrainingSelectionGuard } from "../training/TrainingSelectionGuard";
import type { ViewId } from "../layout/Sidebar";
import type { ResolvedTrainingContext } from "../../training/types";

type PracticeViewProps = {
  settings: LlmSettings;
  sttSettings?: SttSettings;
  onToast: (title: string, description?: string, tone?: "success" | "error" | "info") => void;
  onNavigate?: (view: ViewId) => void;
};

type PracticeItem = {
  id: string;
  group: string;
  type: string;
  prompt: string;
  storylineId?: string;
  scriptId?: string;
};

const questionTypeLabels: Record<string, string> = {
  description: "장소·대상 묘사",
  routine: "일상 루틴 / 활동",
  "recent-experience": "최근 경험",
  "description-reason": "묘사 및 선호 이유",
  "routine-detail": "세부 루틴 / 활동",
  "experience-change": "경험과 변화",
  "expanded-experience": "기억에 남는 경험",
  "comparison-change": "과거·현재 비교 및 변화",
  "problem-opinion": "문제 해결 및 의견",
  comparison: "과거·현재 비교",
  change: "변화와 선호",
  "unexpected-situation": "예상 밖 상황",
  problem: "문제 해결",
  opinion: "의견 / 선호",
  hobby: "취미 / 관심사",
  shopping: "구매 / 쇼핑",
};

function PracticeViewContent({
  resolved,
  settings,
  sttSettings,
  onToast,
}: {
  resolved: ResolvedTrainingContext;
  settings: LlmSettings;
  sttSettings?: SttSettings;
  onToast: (title: string, description?: string, tone?: "success" | "error" | "info") => void;
}) {
  const availableQuestions: PracticeItem[] = resolved.questions.map((q) => ({
    id: q.id,
    group: q.group,
    type: q.type,
    prompt: q.prompt,
    storylineId: q.storylineId,
  }));

  const [question, setQuestion] = useState<PracticeItem | null>(null);
  const [timerSignal, setTimerSignal] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [attemptKey, setAttemptKey] = useState(0);
  const [recordingResult, setRecordingResult] = useState<RecordingResult | null>(null);
  const [showHint, setShowHint] = useState(false);

  const recorderRef = useRef<RecorderHandle | null>(null);
  const sttAbortRef = useRef<AbortController | null>(null);

  const targetDefaultSeconds = resolved.level.targetSeconds[1] || 90;

  const drawQuestion = () => {
    sttAbortRef.current?.abort();
    const next = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    setQuestion(next);
    setFeedback("");
    setAnswer("");
    setIsTranscribing(false);
    setRecordingResult(null);
    setShowHint(false);
    setAttemptKey((k) => k + 1);
  };

  const startAnswer = async () => {
    if (!question) {
      onToast("먼저 질문을 뽑아 주세요.", "랜덤 질문을 정한 뒤 타이머를 시작할 수 있습니다.", "info");
      return;
    }
    setTimerSignal((value) => value + 1);
    try {
      await recorderRef.current?.start();
    } catch {
      // Handled in Recorder
    }
  };

  const handleTimerEnd = () => {
    if (recorderRef.current?.isRecording()) {
      recorderRef.current.stop();
      onToast("목표 시간이 종료되어 녹음을 마쳤습니다.", undefined, "info");
    }
  };

  const handleRecordingReady = async (recording: RecordingResult) => {
    setRecordingResult(recording);
    if (!sttSettings?.endpoint?.trim() || !sttSettings.autoTranscribe) {
      return;
    }

    sttAbortRef.current?.abort();
    const controller = new AbortController();
    sttAbortRef.current = controller;
    setIsTranscribing(true);

    try {
      const text = await transcribeAudio(
        sttSettings,
        recording.blob,
        recording.mimeType,
        controller.signal
      );
      if (!controller.signal.aborted) {
        setAnswer(text);
        onToast("음성을 텍스트로 변환했습니다.", "필요시 수정 후 AI 피드백을 요청하세요.", "success");
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        const msg = error instanceof Error ? error.message : "STT 변환에 실패했습니다.";
        onToast("STT 변환 실패", `${msg} (수동으로 답변을 입력할 수 있습니다)`, "error");
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsTranscribing(false);
      }
    }
  };

  const retryAttempt = () => {
    sttAbortRef.current?.abort();
    setFeedback("");
    setAnswer("");
    setIsTranscribing(false);
    setRecordingResult(null);
    setShowHint(false);
    setAttemptKey((k) => k + 1);
    onToast("재도전 준비가 완료되었습니다.", "다시 '답변 시작'을 눌러 말해 보세요.", "info");
  };

  const getFeedback = async () => {
    if (!answer.trim()) {
      onToast("답변 텍스트가 비어 있습니다.", "음성을 녹음하거나 텍스트를 입력해 주세요.", "info");
      return;
    }
    if (!settings.endpoint.trim()) {
      setFeedback(
        "AI 설정이 아직 없습니다. AI 피드백 / STT 설정에서 Endpoint를 저장한 뒤 다시 시도해 주세요.\n\n" +
          `[체크리스트 - ${resolved.level.displayName} (${resolved.level.targetLabel})]\n` +
          `1. 목표 시간 (${resolved.level.targetSeconds.join("–")}초) 내에 주요 장면을 완성했는가?\n` +
          `2. 질문에 첫 문장부터 직접 답했는가?\n` +
          `3. 시제와 핵심 명사 2개 이상이 명확하게 들어갔는가?\n` +
          `4. 침묵 대신 자연스러운 필러로 문장을 연결했는가?`
      );
      onToast("AI 설정이 필요합니다.", "설정 화면으로 이동해 내부 LLM Endpoint를 입력해 주세요.", "info");
      setShowHint(true);
      return;
    }
    setIsLoading(true);
    try {
      const levelLabel = `${resolved.level.displayName} (${resolved.level.targetLabel})`;
      const criteria = resolved.level.learningFocus.join(", ");
      const courseInfo = `Course: ${resolved.course.title}`;
      const durationSeconds = recordingResult?.durationSeconds ?? 0;
      const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
      const wpm = durationSeconds > 0 ? Math.round((wordCount / durationSeconds) * 60) : 0;

      const courseRecommendedStory = question?.storylineId
        ? resolved.storylines.find((story) => story.id === question.storylineId)
        : null;

      const storylineContext = courseRecommendedStory
        ? `Anchor Scene: ${courseRecommendedStory.core.anchorScene}, Core Facts: ${courseRecommendedStory.core.facts.join(" / ")}`
        : "";

      const result = await callInternalLlm(settings, [
        {
          role: "system",
          content:
            `You are an expert OPIc speaking coach. Provide concise, constructive, and highly actionable feedback in Korean.\n` +
            `Evaluate specifically against target level: ${levelLabel}.\n` +
            `Level Learning Focus: ${criteria}.\n` +
            `Target Duration: ${resolved.level.targetSeconds.join("–")}s.\n\n` +
            `Format your response with the following structured sections:\n` +
            `1. 목표 구간 적합도 (Target level fit: Excellent / Good / Needs Improvement with clear reason)\n` +
            `2. 질문 대응 (Did the response answer the question directly from the first sentence?)\n` +
            `3. 답변 구조 (Opening → Details → Closing narrative progression)\n` +
            `4. 시제 및 구체성 (Tense consistency, specific nouns, descriptive details)\n` +
            `5. 발화량 분석 (Word count, WPM, and duration suitability)\n` +
            `6. 유지할 점 2가지 (Strengths to keep)\n` +
            `7. 고칠 점 1가지 (Key improvement priority)\n` +
            `8. 자연스러운 표현 3개 (3 polished alternative expressions)\n` +
            `9. 다음 시도 미션 (One clear, immediate goal for the retry attempt)\n\n` +
            `Rules:\n` +
            `- Do NOT claim an official OPIc score or guarantee any grade.\n` +
            `- Do NOT grade pronunciation or intonation from text.\n` +
            `- Do NOT require exact script memorization; value natural communication and scene delivery.`,
        },
        {
          role: "user",
          content:
            `Question: ${question?.prompt ?? "General OPIc question"}\n\n` +
            `Student Answer Transcript:\n"${answer}"\n\n` +
            `Context:\n` +
            `- ${courseInfo}\n` +
            `- Target Level: ${levelLabel}\n` +
            `- Recording Duration: ${durationSeconds > 0 ? `${durationSeconds}s` : "Text direct input"}\n` +
            `- Word Count: ${wordCount} words\n` +
            `- Calculated WPM: ${wpm > 0 ? `${wpm} WPM` : "N/A"}\n` +
            (storylineContext ? `- Associated Storyline: ${storylineContext}\n` : ""),
        },
      ]);
      setFeedback(result);
      setShowHint(true);
      onToast("AI 피드백을 받았습니다.", "고칠 점과 다음 시도 미션을 확인해 보세요.", "success");
    } catch (error) {
      setFeedback(
        `AI 요청에 실패했습니다. ${
          error instanceof Error ? error.message : "설정과 CORS 정책을 확인해 주세요."
        }`
      );
      setShowHint(true);
      onToast("AI 피드백에 실패했습니다.", "내장 체크리스트로 먼저 연습을 이어가세요.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const courseRecommended =
    question?.storylineId
      ? resolved.storylines.find((story) => story.id === question.storylineId)
      : null;
  const recommendedTitle = courseRecommended ? courseRecommended.title : null;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <MessageSquareText className="h-5 w-5" />
          <span className="text-sm font-semibold">STEP 6. 실전 연습</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">
          질문을 받고, 말하고, 다시 듣습니다.
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          완벽한 문장보다 목표 시간 안에 장면을 끝까지 전달하는 연습이 우선입니다. 녹음 후 STT 변환과 AI 맞춤 피드백을 받아보세요.
        </p>
      </div>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-white">
                {resolved.course.title} 랜덤 질문
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                현재 코스와 {resolved.level.displayName} ({resolved.level.targetLabel}) 레벨에 맞는 질문 풀입니다.
              </p>
            </div>
            <Button onClick={drawQuestion} variant="secondary">
              <Dices className="h-4 w-4" />
              랜덤 질문 뽑기
            </Button>
          </div>

          {question ? (
            <div className="mt-5 rounded-md border border-indigo-100 bg-indigo-50 p-5 dark:border-indigo-900 dark:bg-indigo-950">
              <div className="flex flex-wrap gap-2">
                <Badge tone="indigo">{question.group}</Badge>
                <Badge tone="default">
                  {questionTypeLabels[question.type] ?? question.type}
                </Badge>
              </div>
              <p className="mt-4 text-base font-semibold leading-7 text-zinc-900 dark:text-white">
                {question.prompt}
              </p>

              {recommendedTitle ? (
                <div className="mt-4 border-t border-indigo-200/60 pt-3 dark:border-indigo-800/60">
                  {showHint ? (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                        💡 추천 스크립트: <strong>{recommendedTitle}</strong>
                      </p>
                      {courseRecommended?.core.anchorScene ? (
                        <p className="text-xs text-indigo-700 dark:text-indigo-300">
                          핵심 장면: {courseRecommended.core.anchorScene}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <button
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-700 hover:text-indigo-900 dark:text-indigo-300 dark:hover:text-indigo-100"
                      onClick={() => setShowHint(true)}
                      type="button"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      추천 스크립트 힌트 보기
                    </button>
                  )}
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-2">
                <Button onClick={startAnswer}>
                  <Play className="h-4 w-4" />
                  답변 시작 (녹음+타이머)
                </Button>
                {recordingResult || feedback ? (
                  <Button onClick={retryAttempt} variant="secondary">
                    <RotateCcw className="h-4 w-4" />
                    다시 말하기 (재도전)
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-md border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              랜덤 질문을 뽑아 실전 답변을 시작하세요.
            </div>
          )}
        </Card>

        <PracticeTimer
          autoStart={timerSignal > 0}
          initialSeconds={targetDefaultSeconds}
          key={`${timerSignal}-${attemptKey}`}
          onTimerEnd={handleTimerEnd}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <Recorder
          onRecordingReady={handleRecordingReady}
          onToast={onToast}
          ref={recorderRef}
          resetKey={attemptKey}
        />

        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Bot className="h-5 w-5" />
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">AI 맞춤 피드백</h2>
            </div>
            {isTranscribing ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                음성을 텍스트로 변환 중...
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            녹음 후 변환된 transcript를 확인하고 수정한 뒤 AI 피드백을 요청하세요.
          </p>

          <textarea
            aria-label="답변 텍스트 입력"
            className="mt-4 h-36 w-full rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm leading-6 text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            disabled={isTranscribing}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder={
              isTranscribing
                ? "음성을 텍스트로 변환하고 있습니다..."
                : "내가 말한 답변을 영어로 적거나, 녹음 후 자동 변환된 내용을 확인해 보세요..."
            }
            value={answer}
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              {answer.trim() ? (
                <span>
                  단어 수: <strong>{answer.trim().split(/\s+/).filter(Boolean).length}단어</strong>
                  {recordingResult?.durationSeconds
                    ? ` · 녹음: ${recordingResult.durationSeconds}초`
                    : ""}
                </span>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button disabled={isLoading || isTranscribing} onClick={getFeedback}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    분석 중...
                  </>
                ) : (
                  "AI 피드백 받기"
                )}
              </Button>
            </div>
          </div>

          {feedback ? (
            <div className="mt-5 rounded-md border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900 dark:bg-indigo-950/40">
              <pre className="whitespace-pre-wrap font-sans text-xs leading-6 text-zinc-800 dark:text-zinc-200">
                {feedback}
              </pre>
              <div className="mt-4 border-t border-indigo-200/50 pt-3 dark:border-indigo-800/50">
                <Button onClick={retryAttempt} size="sm" variant="secondary">
                  <RotateCcw className="h-3.5 w-3.5" />
                  피드백 반영하여 다시 말하기
                </Button>
              </div>
            </div>
          ) : null}
        </Card>
      </section>
    </div>
  );
}

export function PracticeView({
  settings,
  sttSettings,
  onToast,
  onNavigate,
}: PracticeViewProps) {
  return (
    <TrainingSelectionGuard onNavigate={onNavigate} stepName="STEP 6. 실전 연습">
      {(resolved) => (
        <PracticeViewContent
          onToast={onToast}
          resolved={resolved}
          settings={settings}
          sttSettings={sttSettings}
        />
      )}
    </TrainingSelectionGuard>
  );
}

