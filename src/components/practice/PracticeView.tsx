import { Bot, Dices, MessageSquareText, Play } from "lucide-react";
import { useState } from "react";
import { practiceQuestions } from "../../data/questions";
import { scripts } from "../../data/scripts";
import { useTrainingSelection } from "../../training/TrainingSelectionContext";
import { resolveTrainingContext } from "../../training/courseRegistry";
import { callInternalLlm } from "../../lib/llm";
import type { LlmSettings } from "../../types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Recorder } from "./Recorder";
import { PracticeTimer } from "./PracticeTimer";

type PracticeViewProps = {
  settings: LlmSettings;
  onToast: (title: string, description?: string, tone?: "success" | "error" | "info") => void;
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
  comparison: "과거·현재 비교",
  change: "변화와 선호",
  "unexpected-situation": "예상 밖 상황",
  problem: "문제 해결",
  opinion: "의견 / 선호",
  hobby: "취미 / 관심사",
  shopping: "구매 / 쇼핑",
};

export function PracticeView({ settings, onToast }: PracticeViewProps) {
  const { selection } = useTrainingSelection();
  const resolved = selection ? resolveTrainingContext(selection.courseId, selection.levelId) : null;

  const availableQuestions: PracticeItem[] =
    resolved && resolved.questions.length > 0
      ? resolved.questions.map((q) => ({
          id: q.id,
          group: q.group,
          type: q.type,
          prompt: q.prompt,
          storylineId: q.storylineId,
        }))
      : practiceQuestions.map((q) => ({
          id: q.id,
          group: q.group,
          type: q.type,
          prompt: q.prompt,
          scriptId: q.scriptId,
        }));

  const [question, setQuestion] = useState<PracticeItem | null>(null);
  const [timerSignal, setTimerSignal] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const drawQuestion = () => {
    const next = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    setQuestion(next);
    setFeedback("");
  };

  const startAnswer = () => {
    if (!question) {
      onToast("먼저 질문을 뽑아 주세요.", "랜덤 질문을 정한 뒤 타이머를 시작할 수 있습니다.", "info");
      return;
    }
    setTimerSignal((value) => value + 1);
  };

  const getFeedback = async () => {
    if (!answer.trim()) {
      onToast("텍스트 답변을 입력해 주세요.", "녹음과 별개로 답변 텍스트가 필요합니다.", "info");
      return;
    }
    if (!settings.endpoint.trim()) {
      setFeedback(
        "AI 설정이 아직 없습니다. AI 피드백 / 설정에서 Endpoint와 요청 형식을 저장한 뒤 다시 시도해 주세요. 지금은 체크리스트로 답변을 확인해 보세요: 질문에 직접 답했는지, 과거와 현재 시제를 구분했는지, 구체 명사 두 개 이상을 넣었는지 확인합니다."
      );
      onToast("AI 설정이 필요합니다.", "설정 화면으로 이동해 내부 LLM Endpoint를 입력해 주세요.", "info");
      return;
    }
    setIsLoading(true);
    try {
      const levelLabel = resolved
        ? `${resolved.level.displayName} (${resolved.level.targetLabel})`
        : "AL, IH, IM3";
      const criteria = resolved
        ? resolved.level.learningFocus.join(", ")
        : "발화량, 시제, 구체성";
      const courseInfo = resolved ? `Course: ${resolved.course.title}` : "";

      const result = await callInternalLlm(settings, [
        {
          role: "system",
          content: `You are an OPIc speaking evaluator. Give concise, supportive feedback in Korean. Use headings: 예상 등급, 발화량, 시제, 구체성, filler, 질문 적합성, 반복, 더 좋은 표현 3개, 다음 연습 목표. Evaluate based on these level criteria: ${criteria}. Do NOT require exact script matching.`,
        },
        {
          role: "user",
          content: `Question: ${
            question?.prompt ?? "General OPIc question"
          }\n\nStudent answer:\n${answer}\n\nContext: ${courseInfo}\n\nEvaluate for ${levelLabel} target. Do not claim an official score.`,
        },
      ]);
      setFeedback(result);
      onToast("AI 피드백을 받았습니다.", "다음 연습 목표 한 가지를 바로 적용해 보세요.", "success");
    } catch (error) {
      setFeedback(
        `AI 요청에 실패했습니다. ${
          error instanceof Error ? error.message : "설정과 CORS 정책을 확인해 주세요."
        }`
      );
      onToast("AI 피드백에 실패했습니다.", "내장 체크리스트로 먼저 연습을 이어가세요.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const recommended = question?.scriptId
    ? scripts.find((script) => script.id === question.scriptId)
    : null;
  const courseRecommended =
    resolved && question?.storylineId
      ? resolved.storylines.find((story) => story.id === question.storylineId)
      : null;
  const recommendedTitle = courseRecommended
    ? courseRecommended.title
    : recommended
    ? recommended.title
    : null;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <MessageSquareText className="h-5 w-5" />
          <span className="text-sm font-semibold">STEP 5. 실전 연습</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">
          질문을 받고, 말하고, 다시 듣습니다.
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          완벽한 문장보다 시간 안에 장면을 끝까지 전달하는 연습이 우선입니다.
        </p>
      </div>
      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-white">
                {resolved ? `${resolved.course.title} 랜덤 질문` : "랜덤 질문 연습"}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {resolved
                  ? `현재 코스와 ${resolved.level.displayName} 레벨에 맞는 질문 풀입니다.`
                  : "선택한 서베이 그룹을 넘나드는 질문 풀입니다."}
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
                <p className="mt-3 text-xs text-indigo-700 dark:text-indigo-300">
                  추천 스크립트: <strong>{recommendedTitle}</strong>
                </p>
              ) : null}
              <Button className="mt-5" onClick={startAnswer}>
                <Play className="h-4 w-4" />
                답변 시작
              </Button>
            </div>
          ) : (
            <div className="mt-5 rounded-md border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              랜덤 질문을 뽑아 실전 답변을 시작하세요.
            </div>
          )}
        </Card>
        <PracticeTimer autoStart={timerSignal > 0} key={timerSignal} />
      </section>
      <section className="grid gap-5 xl:grid-cols-2">
        <Recorder onToast={onToast} />
        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Bot className="h-5 w-5" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">AI 맞춤 피드백</h2>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            발화한 내용을 텍스트로 적고 맞춤 평가를 받아보세요.
          </p>
          <textarea
            aria-label="답변 텍스트 입력"
            className="mt-4 h-36 w-full rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm leading-6 text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="내가 말한 답변을 영어로 적어보세요..."
            value={answer}
          />
          <div className="mt-4 flex justify-end">
            <Button disabled={isLoading} onClick={getFeedback}>
              {isLoading ? "분석 중..." : "AI 피드백 받기"}
            </Button>
          </div>
          {feedback ? (
            <div className="mt-5 rounded-md border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900 dark:bg-indigo-950/40">
              <pre className="whitespace-pre-wrap font-sans text-xs leading-6 text-zinc-800 dark:text-zinc-200">
                {feedback}
              </pre>
            </div>
          ) : null}
        </Card>
      </section>
    </div>
  );
}
