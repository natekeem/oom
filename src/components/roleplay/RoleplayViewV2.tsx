import { ArrowLeft, Bot, ChartNoAxesCombined, CircleHelp, Sparkles } from "lucide-react";
import { useState } from "react";
import { TRAINING_LEVELS } from "../../training/levels";
import { callInternalLlm } from "../../lib/llm";
import type { LlmSettings } from "../../types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { TrainingSelectionGuard } from "../training/TrainingSelectionGuard";
import type { ViewId } from "../layout/Sidebar";
import type { ResolvedTrainingContext } from "../../training/types";
import { TtsControls } from "../script/TtsControls";

type RoleplayViewV2Props = {
  slotIndex?: number;
  initialGroup?: string;
  settings: LlmSettings;
  onToast: (title: string, description?: string, tone?: "success" | "error" | "info") => void;
  onSlotChange?: (slotIndex: number) => void;
  onNavigate?: (view: ViewId) => void;
};

function RoleplayViewV2Content({
  resolved,
  slotIndex = 0,
  initialGroup,
  onToast,
  settings,
  onSlotChange,
  onNavigate,
}: {
  resolved: ResolvedTrainingContext;
  slotIndex?: number;
  initialGroup?: string;
  settings: LlmSettings;
  onToast: (title: string, description?: string, tone?: "success" | "error" | "info") => void;
  onSlotChange?: (slotIndex: number) => void;
  onNavigate?: (view: ViewId) => void;
}) {
  const roleplays = resolved.roleplays;
  const selectedIndex =
    typeof slotIndex === "number" && slotIndex >= 0 && slotIndex < roleplays.length
      ? slotIndex
      : initialGroup
      ? Math.max(
          0,
          roleplays.findIndex((r) => r.group === initialGroup)
        )
      : 0;

  const [selectedId, setSelectedId] = useState<string>(
    () => roleplays[selectedIndex]?.id ?? roleplays[0]?.id
  );
  const [generatedQuestion, setGeneratedQuestion] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const scenario =
    roleplays.find((item) => item.id === selectedId) ??
    roleplays[selectedIndex] ??
    roleplays[0];

  const handleSelectScenario = (idx: number, id: string) => {
    setSelectedId(id);
    if (onSlotChange) {
      onSlotChange(idx);
    }
  };

  const generateQuestion = async () => {
    if (!settings.endpoint.trim()) {
      onToast(
        "AI 설정이 필요합니다.",
        "AI 피드백 / 설정에서 Endpoint를 저장한 뒤 다시 시도해 주세요.",
        "info"
      );
      return;
    }
    setIsGenerating(true);
    try {
      const result = await callInternalLlm(settings, [
        {
          role: "system",
          content: "You create concise OPIc role-play prompts in natural English.",
        },
        {
          role: "user",
          content: `Create one realistic role-play question based on the OPIc survey group '${scenario.group}' and situation '${scenario.situation}'. Include a problem and ask the candidate to request options. Return only the English prompt.`,
        },
      ]);
      setGeneratedQuestion(result);
    } catch (error) {
      onToast(
        "AI 질문 생성에 실패했습니다.",
        error instanceof Error ? error.message : "Endpoint와 CORS 설정을 확인해 주세요.",
        "error"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <ChartNoAxesCombined className="h-5 w-5" />
            <span className="text-sm font-semibold">STEP 5. 롤플레이 공식</span>
          </div>
          {onNavigate ? (
            <Button
              onClick={() => onNavigate("roleplay-hub")}
              size="sm"
              variant="ghost"
            >
              <ArrowLeft className="h-4 w-4" /> 롤플레이 공식 전체보기
            </Button>
          ) : null}
        </div>
        <h1 className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">
          {scenario.group} 상황을 6단계 공식으로 해결하세요.
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          {resolved.course.title} ({resolved.level.displayName}) 코스에 배정된 롤플레이 시나리오입니다.
          상황을 설명하고, 대안을 요청하고, 정중하게 마무리하는 구조를 훈련합니다.
        </p>
        <p className="mt-2 inline-block rounded bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
          목표 구간: {resolved.level.displayName} ({resolved.level.targetLabel})
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {roleplays.map((item, idx) => {
          const active = item.id === scenario.id;
          return (
            <button
              aria-pressed={active}
              className={`rounded-md border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                active
                  ? "border-indigo-500 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-950"
                  : "border-zinc-200 bg-white hover:border-indigo-200 dark:border-zinc-800 dark:bg-zinc-900"
              }`}
              key={item.id}
              onClick={() => handleSelectScenario(idx, item.id)}
              type="button"
            >
              <div className="flex items-center justify-between gap-2">
                <Badge tone={active ? "indigo" : "default"}>{item.group}</Badge>
                <Badge tone="emerald">{resolved.level.displayName}</Badge>
              </div>
              <p className="mt-3 text-sm font-bold text-zinc-900 dark:text-white">
                {item.title}
              </p>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                {item.situation}
              </p>
            </button>
          );
        })}
      </div>

      {/* Compact 6-Step Formula Reminder */}
      <Card className="border-indigo-100 bg-indigo-50/40 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
              6단계 문제 해결 공식 요약
            </span>
            <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-300">
              01 상황 시작 → 02 문제 설명 → 03 정보 질문 → 04 첫 번째 대안 → 05 두 번째 대안 → 06 감사/마무리
            </p>
          </div>
          {onNavigate ? (
            <button
              className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400 self-start sm:self-auto"
              onClick={() => onNavigate("roleplay-hub")}
              type="button"
            >
              공식 다시 보기
            </button>
          ) : null}
        </div>
      </Card>

      <section className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <CircleHelp className="h-5 w-5 text-indigo-500" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              {scenario.title}
            </h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            {scenario.situation}
          </p>
          <div className="mt-5 rounded-md bg-zinc-50 p-4 dark:bg-zinc-950">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              EVA QUESTION
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-800 dark:text-zinc-200">
              {scenario.prompt}
            </p>
          </div>
          <h3 className="mt-5 text-sm font-bold text-zinc-900 dark:text-zinc-100">
            답변 구조
          </h3>
          <ol className="mt-3 space-y-2">
            {scenario.answerStructure.map((item, index) => (
              <li
                className="flex gap-2 text-sm text-zinc-600 dark:text-zinc-300"
                key={item}
              >
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {index + 1}.
                </span>
                {item}
              </li>
            ))}
          </ol>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              영어 답변 예시 ({resolved.level.displayName})
            </h2>
            <Badge tone="indigo">{resolved.level.targetLabel}</Badge>
          </div>
          <div className="mt-4 space-y-4">
            {scenario.active.englishExample.split("\n\n").map((paragraph) => (
              <p
                className="text-sm leading-7 text-zinc-700 dark:text-zinc-200"
                key={paragraph}
              >
                {paragraph}
              </p>
            ))}
          </div>
          <div className="mt-5 border-t border-zinc-100 pt-5 dark:border-zinc-800">
            <TtsControls
              audioLabel="ROLEPLAY AUDIO"
              levelId={resolved.level.id}
              onError={(message) =>
                onToast("롤플레이 음성을 재생할 수 없습니다.", message, "error")
              }
              playerActionLabel="롤플레이 답변 음성"
              requestPlayLabel="영어 롤플레이 답변 재생"
              testId="roleplay-audio-controls"
              text={scenario.active.englishExample}
            />
          </div>
        </Card>
      </section>

      <Card className="p-5">
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">
          구간별 롤플레이 답변 차이
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {TRAINING_LEVELS.map((lvl) => {
            const levelContent = scenario.levels[lvl.id];
            const isCurrent = lvl.id === resolved.level.id;
            return (
              <div
                className={`rounded-md p-4 transition-all ${
                  isCurrent
                    ? "border-2 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40"
                    : "bg-zinc-50 dark:bg-zinc-950"
                }`}
                key={lvl.id}
              >
                <div className="flex items-center justify-between">
                  <Badge
                    tone={
                      lvl.id === "foundation"
                        ? "emerald"
                        : lvl.id === "intermediate"
                        ? "indigo"
                        : "amber"
                    }
                  >
                    {lvl.displayName} ({lvl.targetLabel})
                  </Badge>
                  {isCurrent ? (
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      현재 목표
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    초점: {levelContent.focus.join(", ")}
                  </p>
                  <p className="line-clamp-3 text-xs leading-5 text-zinc-700 dark:text-zinc-300">
                    "{levelContent.englishExample.split("\n\n")[0]}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-900 dark:bg-indigo-950">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-bold text-indigo-900 dark:text-indigo-100">
                AI 롤플레이 질문 생성
              </h2>
            </div>
            <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-300">
              선택한 {scenario.group} 그룹을 바탕으로 Eva 스타일 질문을 만듭니다.
            </p>
          </div>
          <Button disabled={isGenerating} onClick={generateQuestion}>
            <Sparkles className="h-4 w-4" />
            {isGenerating ? "생성 중" : "AI 롤플레이 질문 생성"}
          </Button>
        </div>
        {generatedQuestion ? (
          <div className="mt-4 rounded-md border border-indigo-100 bg-white p-4 dark:border-indigo-900 dark:bg-zinc-950">
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              PRACTICE PROMPT
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-800 dark:text-zinc-200">
              {generatedQuestion}
            </p>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

export function RoleplayViewV2(props: RoleplayViewV2Props) {
  return (
    <TrainingSelectionGuard onNavigate={props.onNavigate} stepName="STEP 5. 롤플레이 시나리오">
      {(resolved) => <RoleplayViewV2Content {...props} resolved={resolved} />}
    </TrainingSelectionGuard>
  );
}
