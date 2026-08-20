import { useState } from "react";
import {
  ArrowRight,
  Headphones,
  Mic2,
  MousePointerClick,
  Play,
  RotateCcw,
  Rows3,
  UserRound,
} from "lucide-react";
import type { ViewId } from "../layout/Sidebar";
import type { ExamGuideSection } from "../../data/examGuideContent";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ExamGuideTabs } from "./ExamGuideTabs";
import { ExamScreenShell } from "../practice/ExamScreenShell";

type ExamGuideScreenProps = {
  onNavigate: (view: ViewId) => void;
  onSectionChange: (section: ExamGuideSection) => void;
};

const callouts = [
  {
    icon: UserRound,
    num: 1,
    title: "인터뷰어 영역",
    body: "화면의 가상 인터뷰어(EVA)가 표시되는 영역입니다. 질문 청취 중(Playing)과 답변 중(Recording) 상태를 시각적으로 확인합니다.",
  },
  {
    icon: Headphones,
    num: 2,
    title: "질문 청취",
    body: "Play 버튼을 눌러 질문을 듣습니다. 질문의 핵심 동사, 대상, 시제(과거/현재/경험)를 먼저 파악하는 것이 중요합니다.",
  },
  {
    icon: Play,
    num: 3,
    title: "Replay / 청취 횟수",
    body: "현재 질문을 몇 번 들었는지 확인합니다. 실제 OPIc 본시험은 질문을 최대 2회까지 들을 수 있으며 다시 듣기에 따른 감점은 없습니다.",
  },
  {
    icon: Mic2,
    num: 4,
    title: "마이크 · 녹음 상태",
    body: "답변 녹음 진행 상태와 발화 경과 시간을 확인합니다. OOM의 시간 표시는 목표 등급별 연습 권장치입니다.",
  },
  {
    icon: Rows3,
    num: 5,
    title: "문항 정보 & 진행",
    body: "현재 답변할 질문의 주제 그룹과 질문 유형(묘사, 루틴, 경험, 비교 등)을 확인합니다.",
  },
  {
    icon: MousePointerClick,
    num: 6,
    title: "답변 완료 / 다음 문제",
    body: "답변을 마친 뒤 답변 종료를 누르고 복기로 넘어갑니다. 실제 시험에서는 Next 버튼을 눌러 다음 문항으로 이동합니다.",
  },
];

const simpleFlow = [
  { step: "01", title: "질문 듣기", desc: "Play 버튼을 눌러 질문을 청취합니다 (최대 2회)." },
  { step: "02", title: "핵심 파악", desc: "질문의 시제, 핵심 명사, 답변 구조를 머릿속으로 잡습니다." },
  { step: "03", title: "답변하기", desc: "답변 시작을 누르고 첫 문장부터 질문에 바로 답합니다." },
  { step: "04", title: "답변 완료", desc: "주요 장면을 완성한 뒤 답변 종료를 누릅니다." },
  { step: "05", title: "답변 복기", desc: "녹음을 다시 듣고 STT와 AI 피드백으로 개선점을 점검합니다." },
];

/**
 * /exam-guide/screen/ Guide Page.
 * Uses annotated ExamScreenShell demo instance to explain the exam UI schema.
 */
export function ExamGuideScreen({
  onNavigate,
  onSectionChange,
}: ExamGuideScreenProps) {
  const [activeCallout, setActiveCallout] = useState<number>(1);

  return (
    <div className="space-y-8">
      <ExamGuideTabs
        activeSection="exam-screen"
        onSectionChange={onSectionChange}
      />

      {/* Header */}
      <section className="border-l-4 border-indigo-500 pl-4">
        <Badge tone="indigo">OPIc 수험 가이드 · 시험 화면</Badge>
        <h1 className="mt-3 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">
          시험장에서 화면이 낯설지 않도록 미리 익혀보세요.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
          실제 OPIc 시험은 컴퓨터 화면에서 가상 인터뷰어의 질문을 듣고 마이크로 답변을 녹음하는 방식으로 진행됩니다.
          아래는 OOM 실전 훈련 화면을 기반으로 한 시험 조작 인터페이스 도식입니다.
        </p>
      </section>

      {/* Interactive / Annotated ExamScreenShell Demo */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            시험 조작 인터페이스 구성 도식
          </h2>
          <span className="text-xs text-zinc-500">
            ①~⑥ 번호를 선택하면 해당 영역의 설명을 바로 확인할 수 있으며, 아래 설명 카드를 눌러도 해당 영역이 강조됩니다.
          </span>
        </div>

        <ExamScreenShell
          activeAnnotation={activeCallout}
          courseLabel="Everyday & Getaway"
          elapsedLabel="00:42"
          isDemo={true}
          isSpeaking={false}
          levelLabel="1구간 (AL)"
          listenCount={1}
          maxListenCount={2}
          onAnnotationSelect={setActiveCallout}
          onListen={() => {}}
          onStartAnswer={() => {}}
          onStopAnswer={() => {}}
          onToggleQuestionText={() => {}}
          questionGroup="공원 / 조깅"
          questionPrompt="Please describe the park you often visit. Where is it located, what does it look like, and what do people usually do there?"
          questionTypeLabel="장소·대상 묘사"
          recommendedStoryScene="일요일 아침 근처 공원에서 조깅 후 벤치에서 커피를 마시는 루틴"
          recommendedStoryTitle="주말 공원 산책과 조깅 루틴"
          showQuestionText={true}
          showStoryHint={true}
          state="recording"
          targetRangeLabel="60–90초"
        />
      </section>

      {/* 6 Callouts Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
          화면 주요 구성 요소 설명
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {callouts.map(({ icon: Icon, num, title, body }) => {
            const isActive = activeCallout === num;
            return (
              <Card
                aria-label={`${num}번 ${title} 설명 카드`}
                aria-pressed={isActive}
                className={`cursor-pointer p-5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isActive
                    ? "border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-400/40 dark:border-indigo-400 dark:bg-indigo-950/40"
                    : "hover:border-zinc-300 hover:bg-zinc-50/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/50"
                }`}
                key={title}
                onClick={() => setActiveCallout(num)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveCallout(num);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black text-white shadow-sm transition-transform ${
                      isActive ? "bg-indigo-600 scale-110" : "bg-zinc-700"
                    }`}
                  >
                    {num}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <Icon
                        className={`h-4 w-4 ${
                          isActive
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-zinc-500 dark:text-zinc-400"
                        }`}
                      />
                      <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                        {title}
                      </h3>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-zinc-600 dark:text-zinc-300">
                      {body}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Exam Flow Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
          문항별 표준 답변 진행 흐름
        </h2>
        <Card className="p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {simpleFlow.map((step) => (
              <div
                className="rounded-md border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60"
                key={step.step}
              >
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  STEP {step.step}
                </span>
                <p className="mt-2 text-sm font-bold text-zinc-950 dark:text-white">{step.title}</p>
                <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Timer Disclaimer Card */}
      <Card className="border-amber-200 bg-amber-50/90 p-5 dark:border-amber-900 dark:bg-amber-950/40">
        <div className="flex items-start gap-3">
          <RotateCcw className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-amber-950 dark:text-amber-100">
              OOM 연습 타이머는 실제 시험의 문항별 제한시간이 아닙니다.
            </p>
            <p className="text-xs leading-5 text-amber-900 dark:text-amber-200">
              OPIc 공식 안내상 본 시험은 질문을 최대 2회 들을 수 있으며 문항별 답변 시간 제한은 없습니다.
              전체 시험 시간(약 40분) 안에서 자유롭게 조절할 수 있으며, OOM의 30–45 / 45–65 / 60–90초 표시는 목표 등급에 알맞은 발화 밀도를 훈련하기 위한 학습용 프리셋입니다.
            </p>
          </div>
        </div>
      </Card>

      {/* CTA Button to STEP 6 */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          시험 화면 구성을 확인했다면, STEP 6에서 실제 질문으로 직접 연습해 보세요.
        </p>
        <Button onClick={() => onNavigate("practice")}>
          시험 화면으로 직접 연습해 보기
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
