import { ArrowRight, CheckCircle2, Lightbulb, MessageCircleQuestion, RefreshCcw, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useTrainingSelection } from "../../training/TrainingSelectionContext";
import { getTrainingReplacementGuide, getTrainingVariantSet } from "../../training/courseRegistry";
import type { TrainingCourseId, TrainingLevelId } from "../../training/types";
import type { ScriptBlockId, ScriptItem, ScriptReplacementGuide, ScriptVariant } from "../../types";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

type StoryBlock = { id: ScriptBlockId; label: string; content: string };

const blockLabels: Record<ScriptBlockId, string> = {
  answer: "ANSWER · 직접 답하기",
  "scene-action": "SCENE / ACTION · 장면과 행동",
  result: "RESULT · 결과와 감정",
  expansion: "EXPANSION · 선택 확장",
};

function getStoryBlocks(script: ScriptItem): StoryBlock[] {
  const sentences = script.englishScript
    .replace(/\n+/g, " ")
    .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
    ?.map((sentence) => sentence.trim())
    .filter(Boolean) ?? [script.englishScript];
  const answer = sentences[0] ?? script.englishScript;
  const result = sentences.length > 1 ? sentences[sentences.length - 1] : "";
  const sceneAction = sentences.length > 2 ? sentences.slice(1, -1).join(" ") : "";
  return [
    { id: "answer", label: blockLabels.answer, content: answer },
    { id: "scene-action", label: blockLabels["scene-action"], content: sceneAction },
    { id: "result", label: blockLabels.result, content: result },
  ];
}

function AssemblyStrip({
  blocks,
  guide,
}: {
  blocks: StoryBlock[];
  guide?: ScriptReplacementGuide;
}) {
  return (
    <div aria-label="답변 조립 순서" className="grid gap-2 sm:grid-cols-3">
      {blocks.map((block, index) => {
        const replacing = guide?.replacements.some((item) => item.block === block.id) ?? false;
        return (
          <div
            className={`min-w-0 rounded-md border p-3 ${
              replacing
                ? "border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/50"
                : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
            }`}
            key={block.id}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                {block.label}
              </span>
              <Badge tone={replacing ? "indigo" : "emerald"}>{replacing ? "교체" : "유지"}</Badge>
            </div>
            <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              {replacing ? "질문 기능에 맞게 초점 바꾸기" : "필요한 핵심 fact만 고르기"}
            </p>
            {index < blocks.length - 1 ? (
              <ArrowRight className="mt-3 hidden h-4 w-4 text-zinc-400 sm:block" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function ReplacementRows({
  blocks,
  guide,
  levelId,
}: {
  blocks: StoryBlock[];
  guide?: ScriptReplacementGuide;
  levelId: TrainingLevelId;
}) {
  const replacements = guide?.replacements ?? [];
  if (replacements.length === 0)
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
        <CheckCircle2 className="mr-2 inline h-4 w-4" />
        이 질문은 메인 스토리의 출발점과 구조가 이미 잘 맞습니다. 세 블록을 유지하고, 질문의 핵심 단어를 첫 문장에 또렷하게 말해 주세요.
      </div>
    );

  return (
    <div className="space-y-3">
      {replacements.map((replacement) => {
        const block = blocks.find((item) => item.id === replacement.block);
        if (!block) return null;
        return (
          <section
            className="overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800"
            key={replacement.block}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                {blockLabels[replacement.block]} 교체
              </p>
              <Badge tone="indigo">메인 → 질문용</Badge>
            </div>
            <div className="grid divide-y divide-zinc-200 dark:divide-zinc-800 md:grid-cols-2 md:divide-x md:divide-y-0">
              <div className="p-4">
                <p className="text-[11px] font-semibold tracking-wide text-zinc-500">DROP · 지금 질문에 불필요한 fact</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  {block.content}
                </p>
              </div>
              <div className="bg-indigo-50/60 p-4 dark:bg-indigo-950/30">
                <p className="text-[11px] font-semibold tracking-wide text-indigo-700 dark:text-indigo-300">CHANGE · {replacement.functionCue}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-800 dark:text-zinc-100">
                  {replacement.levelExamples[levelId]}
                </p>
                <p className="mt-3 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">KEEP · {replacement.keepFacts.join(" · ")}</p>
                <p className="mt-3 text-xs leading-5 text-indigo-700 dark:text-indigo-300">
                  <RefreshCcw className="mr-1 inline h-3.5 w-3.5" />
                  {replacement.instruction}
                </p>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function AssembledAnswer({
  blocks,
  guide,
  levelId,
}: {
  blocks: StoryBlock[];
  guide?: ScriptReplacementGuide;
  levelId: TrainingLevelId;
}) {
  return (
    <details className="group rounded-md border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900 dark:bg-amber-950/30">
      <summary className="cursor-pointer list-none text-sm font-bold text-amber-900 marker:hidden dark:text-amber-100">
        <Sparkles className="mr-2 inline h-4 w-4" />
        조립된 답변 보기 <span className="ml-1 text-xs font-normal">교체된 블록만 확인하세요</span>
      </summary>
      <p className="mt-3 text-xs leading-5 text-amber-800 dark:text-amber-200">
        새 답안 전체를 추가 암기하라는 뜻이 아닙니다. 현재 구간의 micro-example로 기능을 확인하고, KEEP fact 중 질문에 필요한 것만 골라 말하세요.
      </p>
      <div className="mt-4 space-y-3">
        {blocks.map((block) => {
          const replacement = guide?.replacements.find((item) => item.block === block.id);
          if (!replacement && !block.content) return null;
          return (
            <section
              className={`rounded-md border-l-4 p-4 ${
                replacement
                  ? "border-indigo-500 bg-indigo-100/80 dark:border-indigo-400 dark:bg-indigo-950/70"
                  : "border-zinc-300 bg-white/70 dark:border-zinc-700 dark:bg-zinc-950/60"
              }`}
              key={block.id}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge tone={replacement ? "indigo" : "default"}>
                {replacement ? "CHANGE" : "KEEP"}
                </Badge>
                <span
                  className={`text-xs font-bold ${
                    replacement
                      ? "text-indigo-700 dark:text-indigo-300"
                      : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {blockLabels[block.id]}
                </span>
              </div>
              <p className="whitespace-pre-line text-sm leading-7 text-zinc-700 dark:text-zinc-200">
                {replacement?.levelExamples[levelId] ?? block.content}
              </p>
            </section>
          );
        })}
      </div>
    </details>
  );
}

export function ScriptQuestionVariants({ script }: { script: ScriptItem }) {
  const { selection } = useTrainingSelection();
  const courseId: TrainingCourseId = selection?.courseId ?? "course-1";
  const levelId: TrainingLevelId = selection?.levelId ?? "advanced";

  const set = getTrainingVariantSet(courseId, script.id);
  const [selectedId, setSelectedId] = useState(() => set?.variants[0]?.id ?? "");
  const blocks = useMemo(() => getStoryBlocks(script), [script]);

  if (!set) return null;
  const selected: ScriptVariant = set.variants.find((item) => item.id === selectedId) ?? set.variants[0];
  const guide = getTrainingReplacementGuide(courseId, script.id, selected.id);

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <MessageCircleQuestion className="h-4 w-4" />
            <p className="text-sm font-bold">질문별 교체 가이드</p>
          </div>
          <h3 className="mt-2 text-lg font-bold text-zinc-950 dark:text-white">
            메인 스토리는 공통 장면, 아래는 질문별 교체 블록입니다.
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            {set.description} 짧은 예제를 통째로 외우는 화면이 아닙니다. 질문 하나를 고르면 메인 스토리의 세 블록 중 어떤 부분을 바꿔 말할지 보여 줍니다.
          </p>
        </div>
        <Badge tone="amber">현재 구간 micro-example</Badge>
      </div>
      <div aria-label="예상 질문 선택" className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {set.variants.map((variant) => {
          const active = variant.id === selected.id;
          return (
            <button
              aria-pressed={active}
              className={`rounded-md border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                active
                  ? "border-indigo-500 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950"
                  : "border-zinc-200 hover:border-indigo-200 dark:border-zinc-800 dark:hover:border-indigo-800"
              }`}
              key={variant.id}
              onClick={() => setSelectedId(variant.id)}
              type="button"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-zinc-900 dark:text-white">{variant.label}</p>
                <Badge tone={active ? "indigo" : "default"}>{variant.questionType}</Badge>
              </div>
              <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{variant.question}</p>
            </button>
          );
        })}
      </div>
      <div className="mt-6 border-t border-zinc-200 pt-5 dark:border-zinc-800">
        <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">현재 질문</p>
        <p className="mt-1 text-base font-bold text-zinc-950 dark:text-white">{selected.question}</p>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          {guide?.summary ?? selected.pivot}
        </p>
        <div className="mt-4">
          <AssemblyStrip blocks={blocks} guide={guide} />
        </div>
      </div>
      <div className="mt-6 space-y-3">
        <p className="text-sm font-bold text-zinc-950 dark:text-white">바꿀 부분만 확인하세요</p>
        <ReplacementRows blocks={blocks} guide={guide} levelId={levelId} />
      </div>
      <div className="mt-5">
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">그대로 유지할 핵심 명사</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {selected.keep.map((item) => (
            <Badge key={item} tone="emerald">
              {item}
            </Badge>
          ))}
        </div>
      </div>
      <div className="mt-5">
        <AssembledAnswer blocks={blocks} guide={guide} levelId={levelId} />
      </div>
    </Card>
  );
}

export function ScriptAnswerBlueprint({ script }: { script: ScriptItem }) {
  const { selection } = useTrainingSelection();
  const courseId: TrainingCourseId = selection?.courseId ?? "course-1";

  const set = getTrainingVariantSet(courseId, script.id);
  const [selectedId, setSelectedId] = useState(() => set?.variants[0]?.id ?? "");
  const blocks = useMemo(() => getStoryBlocks(script), [script]);

  if (!set) return null;
  const selected: ScriptVariant = set.variants.find((item) => item.id === selectedId) ?? set.variants[0];
  const guide = getTrainingReplacementGuide(courseId, script.id, selected.id);

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
        <Lightbulb className="h-4 w-4" />
        <p className="text-sm font-bold">답변 설계도</p>
      </div>
      <h3 className="mt-2 text-lg font-bold text-zinc-950 dark:text-white">
        질문이 바뀌어도, 장면을 새로 만들지 말고 출발점을 바꿉니다.
      </h3>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
        질문을 받으면 문단 번호를 찾지 말고 ANSWER, SCENE / ACTION, RESULT 중 어떤 기능을 KEEP·CHANGE·DROP할지 먼저 고릅니다.
      </p>
      <div aria-label="설계도 질문 선택" className="mt-5 flex flex-wrap gap-2">
        {set.variants.map((variant) => (
          <button
            aria-pressed={variant.id === selected.id}
            className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              variant.id === selected.id
                ? "bg-emerald-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
            key={variant.id}
            onClick={() => setSelectedId(variant.id)}
            type="button"
          >
            {variant.label}
          </button>
        ))}
      </div>
      <ol className="mt-6 grid gap-3 lg:grid-cols-2">
        {set.blueprint.map((step, index) => (
          <li
            className="flex gap-3 rounded-md border border-zinc-200 p-4 dark:border-zinc-800"
            key={step.id}
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              {index + 1}
            </span>
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-white">{step.label}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-300">
                {step.koreanGuide}
              </p>
              <p className="mt-2 text-xs leading-5 text-emerald-700 dark:text-emerald-300">
                {step.cue}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <section className="mt-6 rounded-md border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-900 dark:bg-indigo-950/30">
        <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
          전환 예시: {selected.label}
        </p>
        <p className="mt-1 text-sm font-bold text-zinc-950 dark:text-white">{selected.question}</p>
        <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-200">
          {guide?.summary ?? selected.pivot}
        </p>
        <div className="mt-4">
          <AssemblyStrip blocks={blocks} guide={guide} />
        </div>
        <p className="mt-4 text-xs leading-5 text-indigo-800 dark:text-indigo-200">
          {guide?.replacements.length
            ? `교체할 블록은 ${guide.replacements
                .map((item) => blockLabels[item.block])
                .join(", ")}입니다. 나머지 블록은 메인 스토리에서 가져옵니다.`
            : "교체 없이 메인 스토리를 사용합니다. 질문의 중심 단어만 첫 문장에 또렷하게 넣어 주세요."}
        </p>
      </section>
    </Card>
  );
}
