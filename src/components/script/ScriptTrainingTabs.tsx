import { BookOpenText, MessageCircleQuestion, Route } from "lucide-react";
import { useState } from "react";
import type { LlmSettings, ScriptItem } from "../../types";
import { Card } from "../ui/Card";
import { ScriptDetail } from "./ScriptDetail";
import { ScriptAnswerBlueprint, ScriptQuestionVariants } from "./ScriptTrainingGuide";

type TrainingTab = "story" | "variants" | "blueprint";

type ScriptTrainingTabsProps = {
  script: ScriptItem;
  settings: LlmSettings;
  onToast: (title: string, description?: string, tone?: "success" | "error" | "info") => void;
};

const tabs: Array<{ id: TrainingTab; label: string; icon: typeof BookOpenText }> = [
  { id: "story", label: "메인 스토리", icon: BookOpenText },
  { id: "variants", label: "질문별 변형", icon: MessageCircleQuestion },
  { id: "blueprint", label: "답변 설계", icon: Route },
];

export function ScriptTrainingTabs({ script, settings, onToast }: ScriptTrainingTabsProps) {
  const [activeTab, setActiveTab] = useState<TrainingTab>("story");
  const [selectedVariantId, setSelectedVariantId] = useState("");

  const tabDescription: Record<TrainingTab, string> = {
    story: "기준 질문과 전체 답변",
    variants: "질문이 바뀌면 실제 전체 답변이 이렇게 바뀝니다",
    blueprint: "그 변형을 내가 직접 만드는 방법",
  };

  return (
    <div className="space-y-5">
      <Card className="p-1.5">
        <div aria-label="스크립트 학습 보기" className="grid grid-cols-3 gap-1" role="tablist">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                aria-label={tab.label}
                aria-selected={active}
                className={`flex min-h-10 items-center justify-center gap-2 rounded-md px-2 py-2 text-xs font-semibold transition-colors sm:text-sm ${active ? "bg-indigo-600 text-white shadow-sm" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"}`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                type="button"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span><span className="sm:hidden">{tab.id === "story" ? "스토리" : tab.id === "variants" ? "변형" : "설계"}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <p className="px-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">{tabDescription[activeTab]}</p>

      {activeTab === "story" ? <ScriptDetail onToast={onToast} script={script} settings={settings} /> : null}
      {activeTab === "variants" ? (
        <ScriptQuestionVariants
          onSelectVariant={setSelectedVariantId}
          onSwitchTab={() => setActiveTab("blueprint")}
          script={script}
          selectedVariantId={selectedVariantId}
        />
      ) : null}
      {activeTab === "blueprint" ? (
        <ScriptAnswerBlueprint
          onSelectVariant={setSelectedVariantId}
          onSwitchTab={() => setActiveTab("variants")}
          script={script}
          selectedVariantId={selectedVariantId}
        />
      ) : null}
    </div>
  );
}
