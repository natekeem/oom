import { ArrowDown, ArrowRight, Lightbulb, MessageCircleQuestion } from "lucide-react";
import { useMemo, useState } from "react";
import { getTrainingReplacementGuide, getTrainingVariantSet } from "../../training/courseRegistry";
import { useTrainingSelection } from "../../training/TrainingSelectionContext";
import type { TrainingCourseId, TrainingLevelId } from "../../training/types";
import type { ScriptItem, ScriptReplacementGuide, ScriptVariant } from "../../types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { SCRIPT_STRUCTURE_NOTE } from "./scriptLearningSections";
import { buildVariantAnswerSections } from "./scriptVariantTransform";
import { VariantScenarioSelector } from "./VariantScenarioSelector";

type VariantViewProps = {
  script: ScriptItem;
  selectedVariantId?: string;
  onSelectVariant?: (variantId: string) => void;
  onSwitchTab?: () => void;
};

const blockLabels = {
  answer: "ANSWER · 직접 답하기",
  "scene-action": "SCENE / ACTION · 장면과 행동",
  result: "RESULT · 결과와 감정",
  expansion: "EXPANSION · 선택 확장",
} as const;

function FactList({ items, empty }: { items: string[]; empty?: string }) {
  if (items.length === 0) {
    return empty ? <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{empty}</p> : null;
  }
  return (
    <ul className="mt-2 space-y-1.5">
      {items.map((item) => (
        <li className="flex gap-2 text-xs leading-5 text-zinc-700 dark:text-zinc-300" key={item}>
          <span aria-hidden="true">•</span><span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function QuestionContext({ script, variant }: { script: ScriptItem; variant: ScriptVariant }) {
  return (
    <section aria-label="기본 질문과 변형 질문" className="mt-6 rounded-md border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/60 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
        <div className="rounded-md bg-white p-4 dark:bg-zinc-900">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">기본 질문</p>
            {script.baseQuestion?.functionLabel ? <Badge>{script.baseQuestion.functionLabel}</Badge> : null}
          </div>
          {script.baseQuestion ? (
            <>
              <p className="mt-3 text-base font-bold leading-7 text-zinc-950 dark:text-white">{script.baseQuestion.en}</p>
              <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{script.baseQuestion.ko}</p>
            </>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">대표 기본 질문 정보가 없습니다.</p>
          )}
        </div>
        <div className="flex items-center justify-center text-indigo-500" aria-hidden="true">
          <ArrowRight className="hidden h-5 w-5 lg:block" />
          <ArrowDown className="h-5 w-5 lg:hidden" />
        </div>
        <div className="rounded-md border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-900 dark:bg-indigo-950/30">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">변형 질문</p>
            <Badge tone="indigo">{variant.questionType}</Badge>
          </div>
          <p className="mt-3 text-base font-bold leading-7 text-zinc-950 dark:text-white">{variant.question.en}</p>
          <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{variant.question.ko}</p>
        </div>
      </div>
      <div className="mt-4 rounded-md border-l-2 border-indigo-300 pl-3 dark:border-indigo-700">
        <p className="text-[11px] font-bold tracking-wide text-indigo-700 dark:text-indigo-300">질문 초점 변화</p>
        <p className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-200">{variant.pivot}</p>
      </div>
    </section>
  );
}

function getVariantFacts(variant: ScriptVariant, guide?: ScriptReplacementGuide) {
  const required = [...new Set(variant.requiredFacts ?? [])];
  const optional = [...new Set(variant.optionalFacts ?? [])].filter((fact) => !required.includes(fact));
  const keep = [...new Set(variant.keep)].filter((fact) => !required.includes(fact));
  const change = [...new Set(guide?.replacements.map((replacement) => replacement.changeFocus) ?? [])];
  const drop = [...new Set(guide?.replacements.flatMap((replacement) => replacement.dropFacts) ?? [])];
  return { required, optional, keep, change, drop };
}

function ChangeSummary({ variant, guide }: { variant: ScriptVariant; guide?: ScriptReplacementGuide }) {
  const facts = getVariantFacts(variant, guide);
  const cards = [
    { key: "keep", label: "KEEP · 유지", items: facts.keep, className: "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" },
    { key: "change", label: "CHANGE · 바꾸기", items: facts.change, className: "border-indigo-200 bg-indigo-50/55 dark:border-indigo-900 dark:bg-indigo-950/25" },
    { key: "required", label: "이 질문에서는 필수", sublabel: "REQUIRED FOR THIS QUESTION", items: facts.required, className: "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30" },
    { key: "drop", label: "DROP · 빼기", items: facts.drop, className: "border-zinc-200 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-950/60" },
    { key: "optional", label: "OPTIONAL · 여유가 있으면", items: facts.optional, className: "border-dashed border-zinc-300 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-950/40" },
  ].filter((card) => card.items.length > 0);

  return (
    <section className="mt-5">
      <p className="text-sm font-bold text-zinc-950 dark:text-white">이번 변형에서 달라지는 것</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div className={`rounded-md border p-4 ${card.className}`} key={card.key}>
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{card.label}</p>
            {card.sublabel ? <p className="mt-1 text-[10px] font-semibold tracking-wide text-amber-700 dark:text-amber-300">{card.sublabel}</p> : null}
            <FactList items={card.items} />
          </div>
        ))}
      </div>
    </section>
  );
}

function FullAnswerCompare({ script, guide, levelId, variant }: { script: ScriptItem; guide?: ScriptReplacementGuide; levelId: TrainingLevelId; variant: ScriptVariant }) {
  const sections = useMemo(() => buildVariantAnswerSections(script, guide, levelId), [guide, levelId, script]);
  const facts = getVariantFacts(variant, guide);

  return (
    <section aria-label="전체 답변 비교" className="mt-6">
      <p className="text-sm font-bold text-zinc-950 dark:text-white">전체 답변 비교</p>
      <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">기본 전체 답변과 질문 초점에 맞게 조립한 전체 답변을 문맥째 비교합니다.</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <article aria-label="기본 전체 답변" className="min-w-0 rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
          <h4 className="text-sm font-bold text-zinc-950 dark:text-white">기본 답변</h4>
          <div className="mt-4 space-y-4">
            {sections.map((section) => (
              <div className={section.status === "change" ? "rounded-md bg-zinc-50 p-3 dark:bg-zinc-950" : ""} key={section.id}>
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-zinc-400">{section.englishLabel}</span>
                  {section.status === "change" ? <Badge>CHANGE 전</Badge> : <Badge>KEEP</Badge>}
                </div>
                <p className={`break-words text-sm leading-7 ${section.status === "change" ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-700 dark:text-zinc-200"}`}>{section.sourceText}</p>
              </div>
            ))}
          </div>
        </article>
        <article aria-label="변형 전체 답변" className="min-w-0 rounded-md border border-indigo-200 bg-indigo-50/25 p-4 dark:border-indigo-900 dark:bg-indigo-950/15 sm:p-5">
          <h4 className="text-sm font-bold text-zinc-950 dark:text-white">변형 답변</h4>
          {facts.required.length > 0 ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">이 질문에서는 필수</span>
              {facts.required.map((fact) => <Badge key={fact} tone="amber">{fact}</Badge>)}
            </div>
          ) : null}
          <div className="mt-4 space-y-4">
            {sections.map((section) => (
              <div className={section.status === "change" ? "rounded-md border border-indigo-100 bg-white/80 p-3 dark:border-indigo-900/70 dark:bg-zinc-900/70" : ""} key={section.id}>
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-zinc-400">{section.englishLabel}</span>
                  <Badge tone={section.status === "change" ? "indigo" : "default"}>{section.status === "change" ? "CHANGE" : "KEEP"}</Badge>
                </div>
                <p className="break-words text-sm leading-7 text-zinc-700 dark:text-zinc-200">{section.transformedText}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function useVariantSelection({ script, selectedVariantId, onSelectVariant }: Pick<VariantViewProps, "script" | "selectedVariantId" | "onSelectVariant">) {
  const { selection } = useTrainingSelection();
  const courseId: TrainingCourseId = selection?.courseId ?? "course-1";
  const levelId: TrainingLevelId = selection?.levelId ?? "advanced";
  const set = getTrainingVariantSet(courseId, script.id);
  const [internalId, setInternalId] = useState(() => set?.variants[0]?.id ?? "");
  if (!set) return null;
  const requestedId = selectedVariantId === undefined ? internalId : selectedVariantId;
  const selected = set.variants.find((item) => item.id === requestedId) ?? set.variants[0];
  const select = (variantId: string) => {
    setInternalId(variantId);
    onSelectVariant?.(variantId);
  };
  return { levelId, set, selected, guide: getTrainingReplacementGuide(courseId, script.id, selected.id), select };
}

export function ScriptQuestionVariants(props: VariantViewProps) {
  const state = useVariantSelection(props);
  if (!state) return null;
  const { guide, levelId, selected, select, set } = state;

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400"><MessageCircleQuestion className="h-4 w-4" /><p className="text-sm font-bold">질문별 변형</p></div>
      <h3 className="mt-2 text-lg font-bold text-zinc-950 dark:text-white">질문이 바뀌면 실제 전체 답변이 어떻게 달라지는지 비교합니다.</h3>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">{set.description}</p>
      <VariantScenarioSelector ariaLabel="변형 질문 선택" onSelect={select} selectedVariantId={selected.id} variants={set.variants} />
      <QuestionContext script={props.script} variant={selected} />
      <ChangeSummary guide={guide} variant={selected} />
      <FullAnswerCompare guide={guide} levelId={levelId} script={props.script} variant={selected} />
      {props.onSwitchTab ? <div className="mt-6 flex justify-end border-t border-zinc-200 pt-4 dark:border-zinc-800"><Button onClick={props.onSwitchTab} size="sm" variant="secondary">이 질문의 설계 원리 보기 <ArrowRight className="h-3.5 w-3.5" /></Button></div> : null}
    </Card>
  );
}

export function ScriptAnswerBlueprint(props: VariantViewProps) {
  const state = useVariantSelection(props);
  if (!state) return null;
  const { guide, selected, select, set } = state;
  const facts = getVariantFacts(selected, guide);
  const replacements = guide?.replacements ?? [];
  const sections = [
    { id: "open", number: "①", label: "시작 · 서론", english: "OPEN", block: "answer" as const },
    { id: "scene", number: "②", label: "핵심 장면 · 본론", english: "SCENE", block: "scene-action" as const },
    { id: "close", number: "③", label: "마무리 · 결론", english: "CLOSE", block: "result" as const },
  ];
  const actions = [
    ...replacements.map((replacement) => replacement.instruction),
    "KEEP fact를 질문 순서에 맞게 연결합니다.",
    facts.required.length > 0 ? `필수 fact인 ${facts.required.join(" · ")}를 본론에 넣습니다.` : "결과나 느낌 한 가지로 답변을 닫습니다.",
  ].filter((item, index, all) => all.indexOf(item) === index).slice(0, 3);

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400"><Lightbulb className="h-4 w-4" /><p className="text-sm font-bold">답변 설계</p></div>
      <h3 className="mt-2 text-lg font-bold text-zinc-950 dark:text-white">같은 변형을 내가 직접 만들기 위한 3단 설계 규칙을 익힙니다.</h3>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">완성 답안을 반복하지 않고 OPEN → SCENE → CLOSE 안에서 fact와 기능을 KEEP·CHANGE·DROP합니다.</p>
      <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{SCRIPT_STRUCTURE_NOTE}</p>
      <VariantScenarioSelector ariaLabel="설계도 질문 선택" onSelect={select} selectedVariantId={selected.id} variants={set.variants} />
      <QuestionContext script={props.script} variant={selected} />
      <ol className="mt-6 grid gap-3 lg:grid-cols-3">
        {sections.map((section) => {
          const replacement = replacements.find((item) => item.block === section.block);
          return (
            <li className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800" key={section.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div><p className="text-sm font-extrabold text-zinc-950 dark:text-white">{section.number} {section.label}</p><p className="mt-1 text-[10px] font-semibold tracking-wide text-zinc-500 dark:text-zinc-400">{section.english} · {blockLabels[section.block]}</p></div>
                <Badge tone={replacement ? "indigo" : "default"}>{replacement ? "CHANGE" : "KEEP"}</Badge>
              </div>
              <p className="mt-3 text-[11px] font-bold text-zinc-500 dark:text-zinc-400">질문이 요구하는 것</p>
              <p className="mt-1 text-xs leading-5 text-zinc-700 dark:text-zinc-200">{section.id === "open" ? selected.questionType : section.id === "scene" ? "같은 장면의 필요한 fact" : "질문 기능에 맞는 결과·느낌"}</p>
              {replacement ? <div className="mt-3 rounded-md bg-indigo-50/60 p-3 dark:bg-indigo-950/30"><p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">CHANGE</p><p className="mt-1 text-xs leading-5 text-zinc-700 dark:text-zinc-200">{replacement.changeFocus}</p></div> : null}
              {section.id === "scene" ? (
                <div className="mt-3 space-y-3">
                  <div><p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">KEEP</p><FactList items={facts.keep} /></div>
                  {facts.required.length > 0 ? <div><p className="text-[11px] font-bold text-amber-700 dark:text-amber-300">이 질문에서는 필수</p><FactList items={facts.required} /></div> : null}
                  {facts.drop.length > 0 ? <div><p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">DROP</p><FactList items={facts.drop} /></div> : null}
                  {facts.optional.length > 0 ? <div><p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">여유가 있으면</p><FactList items={facts.optional} /></div> : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
      <section className="mt-6 rounded-md border border-emerald-200 bg-emerald-50/45 p-4 dark:border-emerald-900 dark:bg-emerald-950/20 sm:p-5">
        <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">내가 직접 말할 때</p>
        <ol className="mt-3 space-y-2">{actions.map((action, index) => <li className="flex gap-3 text-sm leading-6 text-zinc-700 dark:text-zinc-200" key={action}><span className="font-bold text-emerald-700 dark:text-emerald-300">{index + 1}.</span><span>{action}</span></li>)}</ol>
      </section>
      {props.onSwitchTab ? <div className="mt-6 flex justify-end border-t border-zinc-200 pt-4 dark:border-zinc-800"><Button onClick={props.onSwitchTab} size="sm" variant="secondary">완성된 변형 답변 보기 <ArrowRight className="h-3.5 w-3.5" /></Button></div> : null}
    </Card>
  );
}
