import { Check, ClipboardCheck, LockKeyhole, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import {
  backgroundSurveySections,
  recommendedActivityCount,
  type BackgroundSurveyOption,
  type BackgroundSurveySection,
} from "../../data/fixedSurvey";
import { allSurveyPresets } from "../../training/courseRegistry";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { TrainingSelectionGuard } from "../training/TrainingSelectionGuard";
import type { ViewId } from "../layout/Sidebar";
import type { ResolvedTrainingContext } from "../../training/types";

type SurveyMode = "guide" | "practice";

type GradeResult = {
  correctCount: number;
  extra: string[];
  missing: string[];
};

const optionLabelById = new Map(
  backgroundSurveySections.flatMap((section) => section.options.map((item) => [item.id, item.label]))
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
  recommendedSet: Set<string>;
  gridClass?: string;
};

function SurveyQuestion({
  mode,
  onChange,
  section,
  selected,
  recommendedSet,
  gridClass,
}: SurveyQuestionProps) {
  const isPractice = mode === "practice";

  return (
    <section
      aria-labelledby={`${section.id}-title`}
      className="border-b border-zinc-200 pb-6 last:border-b-0 dark:border-zinc-800"
    >
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="text-sm font-bold text-zinc-950 dark:text-white">{section.part}</p>
        <h2
          className="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
          id={`${section.id}-title`}
        >
          {section.title}
          {section.minSelections ? (
            <span className="ml-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              ({section.minSelections}개 이상)
            </span>
          ) : null}
        </h2>
      </div>
      <div className={`mt-4 grid gap-2.5 ${gridClass ?? "sm:grid-cols-2 xl:grid-cols-3"}`}>
        {section.options.map((item) => {
          const checked = selected.has(item.id);
          const isRecommended = recommendedSet.has(item.id);
          return (
            <label
              className={`group flex items-center gap-3 rounded-md border p-3 text-xs leading-5 transition-colors ${
                !isPractice && isRecommended
                  ? "border-indigo-500 bg-indigo-50/70 font-semibold text-indigo-950 dark:border-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-100"
                  : checked
                  ? "border-indigo-600 bg-indigo-50/50 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-200"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-700"
              } ${isPractice ? "cursor-pointer" : "cursor-default"}`}
              key={item.id}
            >
              <input
                aria-label={item.label}
                checked={checked}
                className="sr-only"
                disabled={!isPractice}
                name={section.id}
                onChange={() => onChange(section, item)}
                type={section.selection === "single" ? "radio" : "checkbox"}
              />
              <span
                aria-hidden="true"
                className={`grid h-5 w-5 shrink-0 place-items-center border-2 transition-colors ${
                  section.selection === "single" ? "rounded-full" : "rounded-sm"
                } ${
                  checked
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-zinc-300 bg-white group-hover:border-indigo-400 dark:border-zinc-600 dark:bg-zinc-950"
                }`}
              >
                {checked ? (
                  section.selection === "single" ? (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  ) : (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  )
                ) : null}
              </span>
              <span>{item.label}</span>
            </label>
          );
        })}
      </div>
    </section>
  );
}

function SurveySheetContent({
  resolved,
}: {
  resolved: ResolvedTrainingContext;
}) {
  const currentCoursePreset = useMemo(() => {
    return allSurveyPresets.find((p) => p.courseId === resolved.course.id) || null;
  }, [resolved.course.id]);

  const currentRecommendedIds = useMemo(() => {
    if (!currentCoursePreset) {
      return [
        ...resolved.survey.profileOptionIds,
        ...resolved.survey.residenceOptionIds,
        ...resolved.survey.activityOptionIds,
      ];
    }
    return [
      ...currentCoursePreset.profileOptionIds,
      ...currentCoursePreset.residenceOptionIds,
      ...currentCoursePreset.activityOptionIds,
    ];
  }, [currentCoursePreset, resolved.survey]);

  const currentRecommendedCount = currentCoursePreset
    ? currentCoursePreset.activityOptionIds.length
    : recommendedActivityCount;
  const recommendedSet = useMemo(() => new Set(currentRecommendedIds), [currentRecommendedIds]);

  const [mode, setMode] = useState<SurveyMode>("guide");
  const [selectedIds, setSelectedIds] = useState<string[]>(currentRecommendedIds);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [currentPart, setCurrentPart] = useState(1);
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);
  const activitySelected = backgroundSurveySections
    .filter((section) => ["leisure", "interests", "sports", "vacation"].includes(section.id))
    .flatMap((section) => section.options)
    .filter((option) => selected.has(option.id)).length;

  const profileSections = backgroundSurveySections.filter((section) =>
    ["work", "student", "education", "residence"].includes(section.id)
  );
  const activitySections = backgroundSurveySections.filter((section) =>
    ["leisure", "interests", "sports", "vacation"].includes(section.id)
  );
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
    setSelectedIds(currentRecommendedIds);
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
    const expected = new Set(currentRecommendedIds);
    const missing = currentRecommendedIds.filter((id) => !selected.has(id));
    const extra = selectedIds.filter((id) => !expected.has(id));
    setResult({ correctCount: currentRecommendedIds.length - missing.length, extra, missing });
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
          <span className="text-sm font-semibold">STEP 2. 서베이 고정</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">
          실제 형식으로 보고, OOM 추천 조합을 그대로 기억합니다.
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          모든 선택지를 먼저 눈에 익힌 뒤, 현재 <strong>{resolved.course.title}</strong> 코스에 맞춘
          고정 추천 조합을 연습합니다. 실제 시험의 운영 시점과 언어에 따라 문구는 조금 달라질 수 있습니다.
        </p>
      </div>

      <Card className="border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-indigo-600 text-white">
              <LockKeyhole className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-indigo-950 dark:text-indigo-100">
                {resolved.course.title} 코스 추천 조합: 기본 {currentRecommendedIds.length}개 선택
              </p>
              <p className="text-xs leading-5 text-indigo-700 dark:text-indigo-300">
                최신 문항 순서에 맞춰 선택지를 확인해 보세요.
              </p>
            </div>
          </div>
          <div
            aria-label="서베이 표시 모드"
            className="inline-flex w-full rounded-md border border-indigo-200 bg-white p-1 sm:w-auto dark:border-indigo-800 dark:bg-zinc-900"
            role="group"
          >
            <Button
              aria-pressed={mode === "guide"}
              className="flex-1 sm:flex-none"
              onClick={returnToGuide}
              size="sm"
              variant={mode === "guide" ? "primary" : "ghost"}
            >
              추천 보기
            </Button>
            <Button
              aria-pressed={mode === "practice"}
              className="flex-1 sm:flex-none"
              onClick={beginPractice}
              size="sm"
              variant={mode === "practice" ? "primary" : "ghost"}
            >
              연습 모드
            </Button>
          </div>
        </div>
      </Card>

      {mode === "practice" ? (
        <Card className="border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-amber-950 dark:text-amber-100">
                <Sparkles className="h-4 w-4" />
                답을 보지 말고 OOM 조합을 다시 체크해 보세요.
              </p>
              <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
                여가·관심사·운동·휴가/출장 선택: <strong>{activitySelected} / {currentRecommendedCount}</strong>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                aria-label="서베이 답안 다시 풀기"
                onClick={() => {
                  setSelectedIds([]);
                  setResult(null);
                }}
                size="sm"
                variant="secondary"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                다시 풀기
              </Button>
              <Button aria-label="선택한 서베이 답안 채점하기" onClick={grade} size="sm">
                <ClipboardCheck className="h-3.5 w-3.5" />
                채점하기
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      {result ? (
        <Card
          className={`p-4 ${
            isExact
              ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950"
              : "border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950"
          }`}
          role="status"
        >
          <div className="flex items-start gap-3">
            <Trophy
              className={`mt-0.5 h-5 w-5 shrink-0 ${
                isExact
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-indigo-600 dark:text-indigo-400"
              }`}
            />
            <div className="space-y-1">
              <p
                className={`text-sm font-bold ${
                  isExact
                    ? "text-emerald-950 dark:text-emerald-100"
                    : "text-indigo-950 dark:text-indigo-100"
                }`}
              >
                {isExact
                  ? `완벽합니다! ${resolved.course.title} 추천 조합과 100% 일치합니다.`
                  : `채점 결과: ${result.correctCount} / ${currentRecommendedIds.length}개 일치`}
              </p>
              {result.missing.length > 0 ? (
                <p className="text-xs text-rose-600 dark:text-rose-400">
                  누락된 항목: {result.missing.map((id) => optionLabelById.get(id) ?? id).join(", ")}
                </p>
              ) : null}
              {result.extra.length > 0 ? (
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  추천 외 선택: {result.extra.map((id) => optionLabelById.get(id) ?? id).join(", ")}
                </p>
              ) : null}
            </div>
          </div>
        </Card>
      ) : null}

      {mode === "guide" ? (
        <div className="space-y-6">
          {pages.map((page) => (
            <Card className="p-5" key={page.part}>
              <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {page.title}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {page.sections.map((s) => s.title).join(" · ")}
                </span>
              </div>
              <div className="space-y-6">
                {page.sections.map((section) => (
                  <SurveyQuestion
                    gridClass={page.gridClass}
                    key={section.id}
                    mode="guide"
                    onChange={() => {}}
                    recommendedSet={recommendedSet}
                    section={section}
                    selected={recommendedSet}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {currentPage.title} ({currentPart} / {pages.length})
            </span>
            <div className="flex gap-1.5">
              <Button disabled={currentPart === 1} onClick={goBack} size="sm" variant="secondary">
                이전
              </Button>
              <Button
                disabled={currentPart === pages.length}
                onClick={goNext}
                size="sm"
                variant="secondary"
              >
                다음
              </Button>
            </div>
          </div>
          <div className="space-y-6">
            {currentPage.sections.map((section) => (
              <SurveyQuestion
                gridClass={currentPage.gridClass}
                key={section.id}
                mode="practice"
                onChange={updateSelection}
                recommendedSet={recommendedSet}
                section={section}
                selected={selected}
              />
            ))}
          </div>
          <div className="mt-6 flex justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <Button disabled={currentPart === 1} onClick={goBack} size="sm" variant="secondary">
              이전 파트
            </Button>
            {currentPart === pages.length ? (
              <Button onClick={grade} size="sm">
                <ClipboardCheck className="h-3.5 w-3.5" />
                답안 채점하기
              </Button>
            ) : (
              <Button onClick={goNext} size="sm">
                다음 파트 <Check className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </Card>
      )}

      <section className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">OOM 4대 그룹별 묶음 원리</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {compactStrategies.map((item) => (
            <Card className="p-4" key={item.title}>
              <p className="text-sm font-bold text-zinc-950 dark:text-white">{item.title}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{item.detail}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

export function BackgroundSurveySheet({ onNavigate }: { onNavigate?: (view: ViewId) => void }) {
  return (
    <TrainingSelectionGuard onNavigate={onNavigate} stepName="STEP 2. 서베이 고정">
      {(resolved) => <SurveySheetContent resolved={resolved} />}
    </TrainingSelectionGuard>
  );
}
