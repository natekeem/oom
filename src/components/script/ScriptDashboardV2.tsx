import { BookOpenText, Layers3 } from "lucide-react";
import { useTrainingSelection } from "../../training/TrainingSelectionContext";
import { resolveTrainingContext } from "../../training/courseRegistry";
import type { GoalLevel, LlmSettings, ScriptItem } from "../../types";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { ScriptTrainingTabs } from "./ScriptTrainingTabs";

type ScriptDashboardProps = {
  slotIndex?: number;
  initialScriptId?: string;
  settings: LlmSettings;
  onToast: (title: string, description?: string, tone?: "success" | "error" | "info") => void;
  onSlotChange?: (slotIndex: number) => void;
  onScriptChange?: (scriptId: string) => void;
};

export function ScriptDashboardV2({
  slotIndex = 0,
  initialScriptId,
  settings,
  onToast,
  onSlotChange,
  onScriptChange,
}: ScriptDashboardProps) {
  const { selection } = useTrainingSelection();
  let resolved = selection ? resolveTrainingContext(selection.courseId, selection.levelId) : null;

  // Fallback to default course-1 / advanced if no selection or standalone
  if (!resolved) {
    resolved = resolveTrainingContext("course-1", "advanced");
  }

  const displayScripts: Array<ScriptItem & { slotIndex: number; levelName: string }> =
    resolved.storylines.map((s, idx) => {
      const item: ScriptItem = {
        id: s.id,
        group: s.group,
        title: s.title,
        goalLevel: (resolved.level.id === "foundation"
          ? "IM3"
          : resolved.level.id === "intermediate"
          ? "IH"
          : "AL") as GoalLevel,
        surveyBadges: s.surveyOptionIds,
        strategy: s.core.anchorScene,
        covers: s.core.reusableFor,
        keywords: s.core.facts,
        expectedQuestions: s.core.reusableFor.map((topic) => `${topic}에 대한 질문`),
        fillerPhrases: [],
        koreanSummary: s.active.koreanSummary,
        englishScript: s.active.englishScript,
        pointNotes: s.active.skills,
      };
      return { ...item, slotIndex: idx, levelName: resolved.level.displayName };
    });

  const selectedIndex =
    typeof slotIndex === "number" && slotIndex >= 0 && slotIndex < displayScripts.length
      ? slotIndex
      : initialScriptId
      ? Math.max(
          0,
          displayScripts.findIndex((script) => script.id === initialScriptId)
        )
      : 0;

  const primary = displayScripts[selectedIndex] ?? displayScripts[0];

  const handleGroupClick = (targetSlot: number, scriptId: string) => {
    if (onSlotChange) {
      onSlotChange(targetSlot);
    } else if (onScriptChange) {
      onScriptChange(scriptId);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <BookOpenText className="h-5 w-5" />
          <span className="text-sm font-semibold">STEP 3. 만능 스크립트</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">
          선택한 코스에 최적화된 메인 스토리를 연습하세요.
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          {resolved.course.title} ({resolved.level.displayName})에 맞춘 4개 대표 장면이 제공됩니다.
          질문별로 어떻게 유연하게 변형하는지에 집중해 보세요.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {displayScripts.map((script, idx) => {
          const active = idx === selectedIndex;
          return (
            <button
              aria-pressed={active}
              className={`rounded-md border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                active
                  ? "border-indigo-500 bg-indigo-50 shadow-sm dark:border-indigo-500 dark:bg-indigo-950"
                  : "border-zinc-200 bg-white hover:border-indigo-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800"
              }`}
              key={script.id}
              onClick={() => handleGroupClick(idx, script.id)}
              type="button"
            >
              <div className="flex justify-between gap-2">
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {script.group}
                </p>
                <Badge tone={active ? "indigo" : "default"}>{script.levelName}</Badge>
              </div>
              <p className="mt-2 text-sm font-bold leading-5 text-zinc-900 dark:text-white">
                {script.title}
              </p>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                {script.surveyBadges.slice(0, 3).join(" · ")}
              </p>
            </button>
          );
        })}
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Layers3 className="h-5 w-5" />
              <p className="text-sm font-bold">{primary.group} · 메인 스토리</p>
            </div>
            <h2 className="mt-2 text-lg font-bold text-zinc-950 dark:text-white">
              이 장면에 깊게 익숙해지세요.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              서베이와 질문 유형이 달라도, 이 장면의 사람·활동·핵심 단어를 유연하게 엮어 대답할 수
              있습니다.
            </p>
          </div>
          <Badge tone="emerald">{resolved.course.title}</Badge>
        </div>
      </Card>

      <ScriptTrainingTabs
        key={`${resolved.course.id}-${primary.id}-${resolved.level.id}`}
        onToast={onToast}
        script={primary}
        settings={settings}
      />

      <Card className="border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
        <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">연습 팁</p>
        <p className="mt-1 text-sm leading-6 text-amber-800 dark:text-amber-200">
          단어를 완벽히 외우는 것보다 핵심 뼈대를 내 경험에 맞춰 유연하게 변형할 수 있는지가 더
          중요합니다.
        </p>
      </Card>
    </div>
  );
}
