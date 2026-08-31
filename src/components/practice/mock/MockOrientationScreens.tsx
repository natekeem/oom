import { ArrowLeft, ArrowRight, Check, CheckCircle2, Headphones, Mic2, ShieldCheck } from "lucide-react";
import {
  backgroundSurveySections,
  type BackgroundSurveyOption,
  type BackgroundSurveySection,
} from "../../../data/fixedSurvey";
import { formatTrainingPreset, TRAINING_LEVELS } from "../../../training/levels";
import type { ResolvedTrainingContext, TrainingLevelId } from "../../../training/types";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { SurveyQuestion } from "../../survey/SurveyQuestion";
import type { MockSurveySelection } from "./mockSessionTypes";
import { createInitialMockSurveySelection, getEligibleMockStorylineIds, validateMockSurveySelection } from "./mockSurvey";

function SetupProgress({ active }: { active: 1 | 2 | 3 }) {
  const steps = ["Survey", "Self Assessment", "시험 준비"];
  return (
    <ol aria-label="모의고사 준비 진행" className="grid grid-cols-3 gap-2">
      {steps.map((label, index) => {
        const step = (index + 1) as 1 | 2 | 3;
        return (
          <li
            aria-current={active === step ? "step" : undefined}
            className={`rounded-lg border px-2 py-2 text-center text-[11px] font-bold sm:px-3 sm:text-xs ${
              active === step
                ? "border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200"
                : step < active
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
                  : "border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400"
            }`}
            key={label}
          >
            {step < active ? <Check className="mr-1 inline h-3 w-3" /> : `${step} `}
            {label}
          </li>
        );
      })}
    </ol>
  );
}

function updateSectionSelection(
  selection: MockSurveySelection,
  section: BackgroundSurveySection,
  optionId: string,
) {
  const selected = new Set(selection.selectedOptionIds);
  if (section.selection === "single") {
    section.options.forEach((option) => selected.delete(option.id));
    selected.add(optionId);
  } else if (selected.has(optionId)) {
    selected.delete(optionId);
  } else {
    selected.add(optionId);
  }
  return { selectedOptionIds: [...selected] } satisfies MockSurveySelection;
}

function surveyGridClass(sectionId: string) {
  if (["work", "leisure", "sports"].includes(sectionId)) return "sm:grid-cols-2 xl:grid-cols-4";
  return "sm:grid-cols-2 xl:grid-cols-3";
}

export function MockSurveyScreen({
  resolved,
  selection,
  onChange,
  onNext,
}: {
  resolved: ResolvedTrainingContext;
  selection: MockSurveySelection;
  onChange: (selection: MockSurveySelection) => void;
  onNext: () => void;
}) {
  const selected = new Set(selection.selectedOptionIds);
  const recommendedSet = new Set([
    ...resolved.survey.profileOptionIds,
    ...resolved.survey.residenceOptionIds,
    ...resolved.survey.activityOptionIds,
  ]);
  const validation = validateMockSurveySelection(selection);
  const eligibleStorylineIds = getEligibleMockStorylineIds(resolved, selection);

  return (
    <div className="space-y-5" data-mock-phase="survey">
      <SetupProgress active={1} />
      <header>
        <Badge tone="indigo">STEP 6 · 실전 모의고사</Badge>
        <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-indigo-700 dark:text-indigo-300">Background Survey</p>
        <h1 className="mt-2 text-2xl font-black text-zinc-950 dark:text-white sm:text-3xl">모의고사에서 사용할 배경 설문을 선택하세요.</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          현재 <strong>{resolved.course.title}</strong> 코스의 추천 설정으로 시작합니다. 선택한 항목과 명시적으로 연결된 이야기 주제를 문항 구성에서 우선 사용합니다.
        </p>
      </header>

      <Card className="p-5 sm:p-6">
        <div className="mb-6 flex flex-col gap-4 border-b border-zinc-100 pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md bg-indigo-600 text-white">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-black text-zinc-950 dark:text-white">현재 코스 · {resolved.course.title}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-300">
                연결된 이야기 주제 {eligibleStorylineIds.length} / {resolved.storylines.length}개 · 부족한 문항은 같은 Course 풀에서만 보충합니다.
              </p>
            </div>
          </div>
          <Button onClick={() => onChange(createInitialMockSurveySelection(resolved))} size="sm" variant="secondary">
            코스 추천값 복원
          </Button>
        </div>
        <div className="space-y-6">
        {backgroundSurveySections.map((section) => {
          const invalid = validation.invalidSectionIds.includes(section.id);
          return (
            <SurveyQuestion
              gridClass={surveyGridClass(section.id)}
              key={section.id}
              mode="practice"
              onChange={(changedSection: BackgroundSurveySection, option: BackgroundSurveyOption) =>
                onChange(updateSectionSelection(selection, changedSection, option.id))
              }
              recommendedSet={recommendedSet}
              section={section}
              selected={selected}
              validationMessage={invalid ? "이 항목의 최소 선택 조건을 채워주세요." : undefined}
            />
          );
        })}
        </div>
      </Card>

      <div className="flex justify-end border-t border-zinc-200 pt-5 dark:border-zinc-800">
        <Button disabled={!validation.valid} onClick={onNext}>
          다음: Self Assessment <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function MockSelfAssessmentScreen({
  selectedLevelId,
  onBack,
  onChange,
  onNext,
}: {
  selectedLevelId: TrainingLevelId;
  onBack: () => void;
  onChange: (levelId: TrainingLevelId) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-5" data-mock-phase="self-assessment">
      <SetupProgress active={2} />
      <header>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">Self Assessment</p>
        <h1 className="mt-2 text-2xl font-black text-zinc-950 dark:text-white sm:text-3xl">현재 말하기 수준에 가까운 설정을 선택하세요.</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">OOM에서 사용하는 연습용 난이도 프리셋입니다. 이 선택은 저장된 STEP 3 설정을 바꾸지 않습니다.</p>
      </header>
      <div className="grid gap-4 lg:grid-cols-3">
        {[...TRAINING_LEVELS].reverse().map((level) => {
          const checked = level.id === selectedLevelId;
          return (
            <label
              className={`cursor-pointer rounded-xl border p-5 transition ${checked ? "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-300 dark:border-emerald-700 dark:bg-emerald-950/40 dark:ring-emerald-800" : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"}`}
              key={level.id}
            >
              <input checked={checked} className="sr-only" name="mock-level" onChange={() => onChange(level.id)} type="radio" />
              <div className="flex items-center justify-between gap-3">
                <span className="text-2xl font-black text-zinc-950 dark:text-white">{level.difficulty.label}</span>
                {checked ? <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> : null}
              </div>
              <p className="mt-3 text-sm font-black text-zinc-900 dark:text-zinc-100">{level.displayName} · {level.targetLabel}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{formatTrainingPreset(level)}</p>
            </label>
          );
        })}
      </div>
      <div className="flex items-center justify-between border-t border-zinc-200 pt-5 dark:border-zinc-800">
        <Button onClick={onBack} variant="secondary"><ArrowLeft className="h-4 w-4" /> 이전: Survey</Button>
        <Button onClick={onNext}>다음: 시험 준비 <ArrowRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

export function MockPreTestScreen({
  resolved,
  selectedLevelId,
  plannerError,
  onBack,
  onStart,
}: {
  resolved: ResolvedTrainingContext;
  selectedLevelId: TrainingLevelId;
  plannerError: string;
  onBack: () => void;
  onStart: () => void;
}) {
  const selectedLevel = TRAINING_LEVELS.find((level) => level.id === selectedLevelId) ?? resolved.level;
  return (
    <div className="space-y-5" data-mock-phase="pre-test">
      <SetupProgress active={3} />
      <Card className="w-full border-emerald-200 p-6 dark:border-emerald-900 sm:p-8">
        <Badge tone="emerald">시험 준비</Badge>
        <h1 className="mt-3 text-2xl font-black text-zinc-950 dark:text-white sm:text-3xl">모의고사 진행 흐름을 확인하세요.</h1>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
            <p className="text-xs font-bold text-zinc-500">준비 완료</p>
            <p className="mt-1 text-sm font-black text-zinc-950 dark:text-white">Background Survey 완료</p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">초기 난이도 {selectedLevel.difficulty.label} · {selectedLevel.displayName}</p>
          </div>
          <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
            <p className="text-xs font-bold text-zinc-500">본시험</p>
            <p className="mt-1 text-sm font-black text-zinc-950 dark:text-white">최대 40분 · 문항당 최대 2회 청취</p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">마이크 권한은 첫 녹음 시 요청될 수 있습니다.</p>
          </div>
        </div>
        <div className="mt-5 rounded-lg border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-900 dark:bg-indigo-950/30">
          <p className="text-sm font-black text-indigo-950 dark:text-indigo-100">진행</p>
          <p className="mt-2 text-sm leading-6 text-indigo-900 dark:text-indigo-200">자기소개 Warm-up → 1st Session 약 7문항 → 난이도 재조정 → 2nd Session → 전체 복기</p>
          <p className="mt-1 text-xs leading-5 text-indigo-800 dark:text-indigo-300">시험 중에는 힌트, STT, AI 피드백, transcript를 보여주지 않습니다.</p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"><Headphones className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" /><p className="text-xs leading-5 text-zinc-600 dark:text-zinc-300"><strong>오디오 출력 준비</strong><br />질문은 audio-first로 재생됩니다.</p></div>
          <div className="flex gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"><Mic2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" /><p className="text-xs leading-5 text-zinc-600 dark:text-zinc-300"><strong>녹음 준비</strong><br />마이크 없이 타이머만 사용할 수도 있습니다.</p></div>
        </div>
        {plannerError ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200" role="alert">{plannerError}</p> : null}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button onClick={onBack} variant="secondary"><ArrowLeft className="h-4 w-4" /> 이전: Self Assessment</Button>
          <Button onClick={onStart}>모의고사 시작 <ArrowRight className="h-4 w-4" /></Button>
        </div>
        <div className="mt-6 flex gap-2 border-t border-zinc-200 pt-4 text-xs leading-5 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>공개된 진행 흐름을 참고한 OOM training simulation이며, 실제 문항 구성이나 공식 출제 알고리즘을 재현하지 않습니다.</p>
        </div>
      </Card>
    </div>
  );
}
