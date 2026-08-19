import { BookOpenText, Layers3 } from "lucide-react";
import type { GoalLevel, LlmSettings, ScriptItem } from "../../types";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { ScriptTrainingTabs } from "./ScriptTrainingTabs";
import { TrainingSelectionGuard } from "../training/TrainingSelectionGuard";
import type { ViewId } from "../layout/Sidebar";

type ScriptDashboardProps = {
  slotIndex?: number;
  initialScriptId?: string;
  settings: LlmSettings;
  onToast: (title: string, description?: string, tone?: "success" | "error" | "info") => void;
  onSlotChange?: (slotIndex: number) => void;
  onScriptChange?: (scriptId: string) => void;
  onNavigate?: (view: ViewId) => void;
};

export function ScriptDashboardV2({
  slotIndex = 0,
  initialScriptId,
  settings,
  onToast,
  onSlotChange,
  onScriptChange,
  onNavigate,
}: ScriptDashboardProps) {
  return (
    <TrainingSelectionGuard onNavigate={onNavigate} stepName="STEP 4. 만능 스크립트">
      {(resolved) => {
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
                displayScripts.findIndex((s) => s.id === initialScriptId)
              )
            : 0;

        const currentScript = displayScripts[selectedIndex] ?? displayScripts[0];

        const handleGroupClick = (idx: number, scriptId: string) => {
          if (onSlotChange) {
            onSlotChange(idx);
          }
          if (onScriptChange) {
            onScriptChange(scriptId);
          }
        };

        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <BookOpenText className="h-5 w-5" />
                <span className="text-sm font-semibold">STEP 4. 만능 스크립트</span>
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
                    <p className="text-xs font-bold uppercase tracking-wider">
                      {currentScript.group} · {currentScript.levelName} ({currentScript.goalLevel})
                    </p>
                  </div>
                  <h2 className="mt-1 text-xl font-bold text-zinc-950 dark:text-white sm:text-2xl">
                    {currentScript.title}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="indigo">
                    목표 등급 {currentScript.goalLevel} ({currentScript.levelName})
                  </Badge>
                </div>
              </div>

              <div className="mt-6">
                <ScriptTrainingTabs
                  key={`${currentScript.id}-${currentScript.levelName}`}
                  onToast={onToast}
                  script={currentScript}
                  settings={settings}
                />
              </div>
            </Card>
          </div>
        );
      }}
    </TrainingSelectionGuard>
  );
}
