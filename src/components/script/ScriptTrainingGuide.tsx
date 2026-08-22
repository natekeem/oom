import { ArrowRight, CheckCircle2, Lightbulb, MessageCircleQuestion, RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { useTrainingSelection } from "../../training/TrainingSelectionContext";
import { getTrainingReplacementGuide, getTrainingVariantSet } from "../../training/courseRegistry";
import type { TrainingCourseId, TrainingLevelId } from "../../training/types";
import type { ScriptBlockId, ScriptItem, ScriptReplacementGuide, ScriptVariant } from "../../types";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import {
  deriveScriptLearningSections,
  SCRIPT_STRUCTURE_NOTE,
  type ScriptLearningSectionId,
} from "./scriptLearningSections";

type StoryBlock = {
  id: ScriptBlockId;
  sectionId: ScriptLearningSectionId;
  number: string;
  macroLabel: string;
  englishLabel: string;
  functionLabel: string;
  content: string;
  optionalFacts: string[];
};

const blockLabels: Record<ScriptBlockId, string> = {
  answer: "ANSWER · 직접 답하기",
  "scene-action": "SCENE / ACTION · 장면과 행동",
  result: "RESULT · 결과와 감정",
  expansion: "EXPANSION · 선택 확장",
};

const blockBySection: Record<ScriptLearningSectionId, ScriptBlockId> = {
  open: "answer",
  scene: "scene-action",
  close: "result",
};

function getStoryBlocks(script: ScriptItem): StoryBlock[] {
  return deriveScriptLearningSections(
    script.englishScript,
    script.trainingLevelId ?? "advanced"
  ).map((section) => ({
    id: blockBySection[section.id],
    sectionId: section.id,
    number: section.number,
    macroLabel: section.koreanLabel,
    englishLabel: section.englishLabel,
    functionLabel: blockLabels[blockBySection[section.id]],
    content: section.segments
      .filter((segment) => segment.kind === "core")
      .map((segment) => segment.text)
      .join(" "),
    optionalFacts: section.segments
      .filter((segment) => segment.kind === "optional")
      .map((segment) => segment.text),
  }));
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
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-sm font-bold text-zinc-900 dark:text-white">
                  {block.number} {block.macroLabel}
                </span>
                <p className="mt-1 text-[10px] font-semibold tracking-wide text-zinc-500 dark:text-zinc-400">
                  {block.englishLabel} · {block.functionLabel}
                </p>
              </div>
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
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">{block.number} {block.macroLabel}</p>
                <p className="mt-0.5 text-[10px] font-semibold tracking-wide text-zinc-500 dark:text-zinc-400">{blockLabels[replacement.block]}</p>
              </div>
              <Badge tone="indigo">메인 → 질문용</Badge>
            </div>
            <div className="bg-indigo-50/40 p-4 dark:bg-indigo-950/20">
              <div>
                <p className="text-[11px] font-semibold tracking-wide text-indigo-700 dark:text-indigo-300">CHANGE · {replacement.functionCue}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-800 dark:text-zinc-100">
                  {replacement.levelExamples[levelId]}
                </p>
                <p className="mt-3 text-xs leading-5 text-indigo-700 dark:text-indigo-300">
                  <RefreshCcw className="mr-1 inline h-3.5 w-3.5" />
                  {replacement.instruction}
                </p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-md bg-white/75 p-3 dark:bg-zinc-900/65">
                  <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">KEEP · 유지할 fact</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-300">{replacement.keepFacts.join(" · ")}</p>
                </div>
                <div className="rounded-md bg-white/75 p-3 dark:bg-zinc-900/65">
                  <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">DROP · 빼도 되는 fact</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-300">{replacement.dropFacts.join(" · ")}</p>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function FactList({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{empty}</p>;
  return (
    <ul className="mt-2 space-y-1.5">
      {items.map((item) => <li className="flex gap-2 text-xs leading-5 text-zinc-700 dark:text-zinc-300" key={item}><span aria-hidden="true">•</span><span>{item}</span></li>)}
    </ul>
  );
}

function VariantFactPlan({
  variant,
  guide,
  blocks,
  levelId,
}: {
  variant: ScriptVariant;
  guide?: ScriptReplacementGuide;
  blocks: StoryBlock[];
  levelId: TrainingLevelId;
}) {
  const requiredFacts = variant.requiredFacts ?? [];
  const optionalFacts = variant.optionalFacts ?? [];
  const keepFacts = variant.keep.filter((fact) => !requiredFacts.includes(fact));
  const dropFacts = [...new Set(guide?.replacements.flatMap((replacement) => replacement.dropFacts) ?? [])];
  const openingExample = guide?.replacements.find((replacement) => replacement.block === "answer")?.levelExamples[levelId];
  const derivedOptional = blocks.flatMap((block) => block.optionalFacts);

  return (
    <div className="mt-5 space-y-3">
      <section className="rounded-md border border-indigo-200 bg-indigo-50/55 p-4 dark:border-indigo-900 dark:bg-indigo-950/25">
        <p className="text-[11px] font-bold tracking-wide text-indigo-700 dark:text-indigo-300">첫 문장 이렇게 바꾸기</p>
        <p className="mt-2 text-sm leading-6 text-zinc-800 dark:text-zinc-100">{openingExample ?? variant.pivot}</p>
      </section>
      <div className="grid gap-3 sm:grid-cols-2">
        <section className="rounded-md border border-emerald-200 bg-emerald-50/45 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">유지할 기본 · KEEP</p>
          <FactList empty="첫 문장과 필수 pivot에 집중합니다." items={keepFacts} />
        </section>
        <section className="rounded-md border border-rose-200 bg-rose-50/35 p-4 dark:border-rose-900 dark:bg-rose-950/20">
          <p className="text-xs font-bold text-rose-800 dark:text-rose-200">빼도 되는 내용 · DROP</p>
          <FactList empty="이번 질문에서 미리 정한 DROP fact는 없습니다." items={dropFacts} />
        </section>
        {requiredFacts.length > 0 ? (
          <section className="rounded-md border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
            <p className="text-xs font-extrabold text-amber-900 dark:text-amber-100">이 질문에서는 필수</p>
            <p className="mt-1 text-[10px] font-semibold tracking-wide text-amber-700 dark:text-amber-300">REQUIRED FOR THIS QUESTION</p>
            <FactList empty="" items={requiredFacts} />
          </section>
        ) : null}
        <section className="rounded-md border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
          <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200">여유가 있으면 · 선택 확장</p>
          <FactList empty="별도 확장 없이 3단 CORE만으로 답할 수 있습니다." items={optionalFacts.length > 0 ? optionalFacts : derivedOptional} />
        </section>
      </div>
      <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">새 스토리를 만드는 화면이 아닙니다. 같은 장면의 fact를 질문에 맞게 KEEP·CHANGE·DROP하고, 필요한 선택 fact만 필수로 승격합니다.</p>
    </div>
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
            같은 장면에서 질문에 맞는 fact만 골라 말합니다.
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            {set.description} 완성 답안을 하나 더 외우는 화면이 아니라, 3단 말하기 순서 안에서 KEEP·CHANGE·DROP할 fact를 고르는 화면입니다.
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
        <VariantFactPlan blocks={blocks} guide={guide} levelId={levelId} variant={selected} />
        <div className="mt-5">
          <AssemblyStrip blocks={blocks} guide={guide} />
        </div>
      </div>
      <div className="mt-6 space-y-3">
        <p className="text-sm font-bold text-zinc-950 dark:text-white">바꿀 부분만 확인하세요</p>
        <ReplacementRows blocks={blocks} guide={guide} levelId={levelId} />
      </div>
    </Card>
  );
}

export function ScriptAnswerBlueprint({ script }: { script: ScriptItem }) {
  const { selection } = useTrainingSelection();
  const courseId: TrainingCourseId = selection?.courseId ?? "course-1";
  const levelId: TrainingLevelId = selection?.levelId ?? "advanced";

  const set = getTrainingVariantSet(courseId, script.id);
  const [selectedId, setSelectedId] = useState(() => set?.variants[0]?.id ?? "");
  const blocks = useMemo(() => getStoryBlocks(script), [script]);

  if (!set) return null;
  const selected: ScriptVariant = set.variants.find((item) => item.id === selectedId) ?? set.variants[0];
  const guide = getTrainingReplacementGuide(courseId, script.id, selected.id);
  const blueprintGuide: Record<ScriptLearningSectionId, { guide: string; cue: string }> = {
    open: {
      guide: "질문에 바로 답하는 첫 fact와 짧은 배경을 둡니다.",
      cue: guide?.replacements.some((replacement) => replacement.block === "answer")
        ? "CHANGE · 질문의 중심 명사와 시제에 맞게 첫 문장만 바꿉니다."
        : "KEEP · 메인 스토리의 첫 답변 fact를 유지합니다.",
    },
    scene: {
      guide: "같은 장면에서 필요한 사람·장소·행동을 KEEP하고, 초점만 CHANGE하며 불필요한 fact는 DROP합니다.",
      cue: `KEEP · ${selected.keep.join(" · ")}.`,
    },
    close: {
      guide: "결과나 감정으로 닫고, 변화·의미는 질문이 요구할 때만 붙입니다.",
      cue: guide?.replacements.some((replacement) => replacement.block === "result")
        ? "CHANGE · 질문 기능에 맞는 결과·감정·변화 중 하나로 닫습니다."
        : "KEEP · CORE의 자연스러운 마무리를 유지합니다.",
    },
  };

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
        ① 시작 · 서론 → ② 핵심 장면 · 본론 → ③ 마무리 · 결론 순서 안에서 필요한 fact를 KEEP·CHANGE·DROP합니다.
      </p>
      <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{SCRIPT_STRUCTURE_NOTE}</p>
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
      <ol className="mt-6 grid gap-3 lg:grid-cols-3">
        {blocks.map((block) => (
          <li
            className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800"
            key={block.id}
          >
            <p className="text-sm font-extrabold text-zinc-950 dark:text-white">{block.number} {block.macroLabel}</p>
            <p className="mt-1 text-[10px] font-semibold tracking-wide text-zinc-500 dark:text-zinc-400">{block.englishLabel} · {block.functionLabel}</p>
            <p className="mt-3 text-xs leading-5 text-zinc-600 dark:text-zinc-300">{blueprintGuide[block.sectionId].guide}</p>
            <p className="mt-3 text-xs font-semibold leading-5 text-emerald-700 dark:text-emerald-300">{blueprintGuide[block.sectionId].cue}</p>
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
        <div className="mt-4">
          <VariantFactPlan blocks={blocks} guide={guide} levelId={levelId} variant={selected} />
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
