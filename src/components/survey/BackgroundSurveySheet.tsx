import { Check, ClipboardCheck, LockKeyhole, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import {
  backgroundSurveySections,
  recommendedActivityCount,
  recommendedSurveyIds,
  type BackgroundSurveyOption,
  type BackgroundSurveySection,
} from "../../data/fixedSurvey";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

type SurveyMode = "guide" | "practice";

type GradeResult = {
  correctCount: number;
  extra: string[];
  missing: string[];
};

const optionLabelById = new Map(
  backgroundSurveySections.flatMap((section) => section.options.map((item) => [item.id, item.label])),
);

const compactStrategies = [
  { title: "야외 / 여행", detail: "공원 · 해변 · 걷기 · 조깅 · 국내/해외 여행" },
  { title: "실내 / 휴식", detail: "음악 · 카페 · 집에서 보내는 휴가" },
  { title: "운동 / 취미", detail: "테니스 · 쇼핑" },
  { title: "집 / 거주지", detail: "가족과 거주 · 요리 · 집에서 쉬기" },
];

type SurveyQuestionProps = {
  mode: SurveyMode;
  onChange: (section: BackgroundSurveySection, option: BackgroundSurveyOption) => void;
  section: BackgroundSurveySection;
  selected: Set<string>;
  gridClass?: string;
};

function SurveyQuestion({
  mode,
  onChange,
  section,
  selected,
  gridClass,
}: SurveyQuestionProps) {
  const isPractice = mode === "practice";

  return (
    <section aria-labelledby={`${section.id}-title`} className="border-b border-zinc-200 pb-6 last:border-b-0 dark:border-zinc-800">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="text-sm font-bold text-zinc-950 dark:text-white">{section.part}</p>
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100" id={`${section.id}-title`}>
          {section.title}
          {section.minSelections ? <span className="ml-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">({section.minSelections}개 이상)</span> : null}
        </h2>
      </div>
      <div className={`mt-4 grid gap-x-7 gap-y-2 ${gridClass ?? "sm:grid-cols-2 xl:grid-cols-4"}`}>
        {section.options.map((item) => {
          const checked = isPractice ? selected.has(item.id) : Boolean(item.recommended);
          const inputId = `${mode}-${section.id}-${item.id}`;
          return (
            <label
              className={`group flex min-h-7 items-center gap-2.5 text-sm leading-5 ${isPractice ? "cursor-pointer text-zinc-800 dark:text-zinc-100" : "cursor-default text-zinc-700 dark:text-zinc-200"}`}
              htmlFor={inputId}
              key={item.id}
            >
              <input
                aria-label={item.label}
                checked={checked}
                className="peer sr-only"
                disabled={!isPractice}
                id={inputId}
                name={section.id}
                onChange={() => onChange(section, item)}
                type={section.selection === "single" ? "radio" : "checkbox"}
              />
              <span
                aria-hidden="true"
                className={`grid h-5 w-5 shrink-0 place-items-center border-2 transition-colors ${section.selection === "single" ? "rounded-full" : "rounded-sm"} ${checked ? "border-indigo-600 bg-indigo-600 text-white" : "border-zinc-300 bg-white group-hover:border-indigo-400 dark:border-zinc-600 dark:bg-zinc-950"}`}
              >
                {checked ? section.selection === "single" ? <span className="h-2 w-2 rounded-full bg-white" /> : <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
              </span>
              <span>{item.label}</span>
            </label>
          );
        })}
      </div>
    </section>
  );
}

export function BackgroundSurveySheet() {
  const [mode, setMode] = useState<SurveyMode>("guide");
  const [selectedIds, setSelectedIds] = useState<string[]>(recommendedSurveyIds);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [currentPart, setCurrentPart] = useState(1);
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);
  const activitySelected = backgroundSurveySections
    .filter((section) => ["leisure", "interests", "sports", "vacation"].includes(section.id))
    .flatMap((section) => section.options)
    .filter((option) => selected.has(option.id)).length;

  const profileSections = backgroundSurveySections.filter((section) => ["work", "student", "education", "residence"].includes(section.id));
  const activitySections = backgroundSurveySections.filter((section) => ["leisure", "interests", "sports", "vacation"].includes(section.id));
  const pages = [
    { part: 1, title: "Part 1 of 7", sections: [profileSections[0]], gridClass: "sm:grid-cols-1 xl:grid-cols-1" },
    { part: 2, title: "Part 2 of 7", sections: [profileSections[1], profileSections[2]], gridClass: "sm:grid-cols-1 xl:grid-cols-1" },
    { part: 3, title: "Part 3 of 7", sections: [profileSections[3]], gridClass: "sm:grid-cols-1 xl:grid-cols-1" },
    { part: 4, title: "Part 4 of 7", sections: [activitySections[0]], gridClass: "sm:grid-cols-2 xl:grid-cols-4" },
    { part: 5, title: "Part 5 of 7", sections: [activitySections[1]], gridClass: "sm:grid-cols-2 xl:grid-cols-2" },
    { part: 6, title: "Part 6 of 7", sections: [activitySections[2]], gridClass: "sm:grid-cols-2 xl:grid-cols-4" },
    { part: 7, title: "Part 7 of 7", sections: [activitySections[3]], gridClass: "sm:grid-cols-1 xl:grid-cols-1" },
  ];

  const beginPractice = () => {
    setMode("practice");
    setSelectedIds([]);
    setResult(null);
    setCurrentPart(1);
  };

  const returnToGuide = () => {
    setMode("guide");
    setSelectedIds(recommendedSurveyIds);
    setResult(null);
  };

  const updateSelection = (section: BackgroundSurveySection, option: BackgroundSurveyOption) => {
    if (mode !== "practice") return;
    setResult(null);
    setSelectedIds((current) => {
      const currentSet = new Set(current);
      if (section.selection === "single") {
        section.options.forEach((item) => currentSet.delete(item.id));
        currentSet.add(option.id);
        return Array.from(currentSet);
      }
      if (currentSet.has(option.id)) currentSet.delete(option.id);
      else currentSet.add(option.id);
      return Array.from(currentSet);
    });
  };

  const grade = () => {
    const expected = new Set(recommendedSurveyIds);
    const missing = recommendedSurveyIds.filter((id) => !selected.has(id));
    const extra = selectedIds.filter((id) => !expected.has(id));
    setResult({ correctCount: recommendedSurveyIds.length - missing.length, extra, missing });
  };

  const isExact = result !== null && result.missing.length === 0 && result.extra.length === 0;

  const goNext = () => setCurrentPart((part) => Math.min(part + 1, pages.length));
  const goBack = () => setCurrentPart((part) => Math.max(part - 1, 1));
  const currentPage = pages[currentPart - 1];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <ClipboardCheck className="h-5 w-5" />
          <span className="text-sm font-semibold">STEP 1. 서베이 고정 가이드</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">실제 형식으로 보고, OOM 조합을 그대로 기억합니다.</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">모든 선택지를 먼저 눈에 익힌 뒤, 아래에 표시된 OOM 고정 조합을 연습합니다. 실제 시험의 운영 시점과 언어에 따라 문구는 조금 달라질 수 있습니다.</p>
      </div>

      <Card className="border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-indigo-600 text-white"><LockKeyhole className="h-4 w-4" /></span>
            <div>
              <p className="text-sm font-semibold text-indigo-950 dark:text-indigo-100">추천 선택 조합: 기본 {recommendedSurveyIds.length}개 선택</p>
              <p className="text-xs leading-5 text-indigo-700 dark:text-indigo-300">최신 문항 순서에 맞춰 선택지를 확인해 보세요.</p>
            </div>
          </div>
          <div aria-label="서베이 표시 모드" className="inline-flex w-full rounded-md border border-indigo-200 bg-white p-1 sm:w-auto dark:border-indigo-800 dark:bg-zinc-900" role="group">
            <Button aria-pressed={mode === "guide"} className="flex-1 sm:flex-none" onClick={returnToGuide} size="sm" variant={mode === "guide" ? "primary" : "ghost"}>추천 보기</Button>
            <Button aria-pressed={mode === "practice"} className="flex-1 sm:flex-none" onClick={beginPractice} size="sm" variant={mode === "practice" ? "primary" : "ghost"}>연습 모드</Button>
          </div>
        </div>
      </Card>

      {mode === "practice" ? (
        <Card className="border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-amber-950 dark:text-amber-100"><Sparkles className="h-4 w-4" />답을 보지 말고 OOM 조합을 다시 체크해 보세요.</p>
              <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">여가·관심사·운동·휴가/출장 선택: <strong>{activitySelected} / {recommendedActivityCount}</strong></p>
            </div>
            <div className="flex gap-2">
              <Button aria-label="서베이 답안 다시 풀기" onClick={() => { setSelectedIds([]); setResult(null); }} size="sm" variant="secondary"><RotateCcw className="h-3.5 w-3.5" />다시 풀기</Button>
              <Button aria-label="선택한 서베이 답안 채점하기" onClick={grade} size="sm"><ClipboardCheck className="h-3.5 w-3.5" />채점하기</Button>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="space-y-6">
        <Card className="overflow-hidden bg-white dark:bg-zinc-950">
          <div className="flex flex-col gap-1 border-b border-zinc-200 bg-zinc-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between [&>p:first-child]:!text-sm [&>p:last-child]:!text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:[&>p:last-child]:!text-zinc-400">
            <p className="text-lg font-bold text-zinc-950 dark:text-white">Background Survey</p>
            <p className="mt-0.5 text-xs text-sky-800 dark:text-sky-200">{mode === "guide" ? "OOM 추천 답안이 체크되어 있습니다." : "연습 모드: 직접 고른 뒤 채점하세요."}</p>
          </div>
          <div className="relative overflow-hidden p-5 sm:p-7">
            <div className="w-full pb-3">
              <div key={currentPage.part}>
                <div className="relative rounded-3xl border border-zinc-200 bg-zinc-50 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:min-h-[32rem] md:pb-24 lg:min-h-[calc(100vh-18rem)]">
                  <div className="flex flex-col">
                    <div>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-300">{currentPage.title}</p>
                          <p className="mt-3 text-2xl font-bold text-zinc-950 dark:text-white">{currentPage.sections.length > 1 ? "연결된 두 문항을 함께 확인하세요." : "한 문항씩 천천히 답하세요."}</p>
                        </div>
                        <span className="min-w-[4rem] shrink-0 whitespace-nowrap rounded-full bg-zinc-200 px-3 py-1 text-center text-xs font-semibold uppercase tracking-normal text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 sm:min-w-[4.75rem] sm:tracking-[0.16em]">{currentPage.part} / 7</span>
                      </div>
                    </div>

                    <div className="mt-6 flex-1 space-y-6">
                      {currentPage.sections.map((section) => (
                        <SurveyQuestion key={section.id} mode={mode} onChange={updateSelection} section={section} selected={selected} gridClass={currentPage.gridClass} />
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-zinc-200 px-2 pt-4 dark:border-zinc-800 md:absolute md:inset-x-5 md:bottom-5 md:z-10 md:mt-0">
                    <Button disabled={currentPart === 1} onClick={goBack} size="sm" variant="secondary">Back</Button>
                    <Button onClick={goNext} size="sm">{currentPart === pages.length ? "완료" : "Next"}</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {mode === "practice" && result ? (
        <Card aria-live="polite" className={`p-5 ${isExact ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950" : "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950"}`} role="status">
          <div className="flex items-start gap-3">
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md text-white ${isExact ? "bg-emerald-600" : "bg-amber-500"}`}>{isExact ? <Trophy className="h-4 w-4" /> : <ClipboardCheck className="h-4 w-4" />}</span>
            <div>
              <p className={`text-sm font-bold ${isExact ? "text-emerald-950 dark:text-emerald-100" : "text-amber-950 dark:text-amber-100"}`}>{isExact ? "정답입니다. OOM 고정 조합을 기억하고 있네요." : `추천 답안 ${result.correctCount} / ${recommendedSurveyIds.length}개 일치`}</p>
              {!isExact ? <div className="mt-2 space-y-1 text-xs leading-5 text-zinc-700 dark:text-zinc-200">
                {result.missing.length ? <p><strong>빠진 추천 항목:</strong> {result.missing.map((id) => optionLabelById.get(id)).join(" · ")}</p> : null}
                {result.extra.length ? <p><strong>추가로 고른 항목:</strong> {result.extra.map((id) => optionLabelById.get(id)).join(" · ")}</p> : null}
              </div> : null}
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {compactStrategies.map((strategy) => <div className="border-l-2 border-indigo-400 pl-3" key={strategy.title}><p className="text-sm font-semibold text-zinc-900 dark:text-white">{strategy.title}</p><p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{strategy.detail}</p></div>)}
      </div>
    </div>
  );
}
