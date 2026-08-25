import { ArrowRight, Headphones, Mic2, MousePointerClick, Play, Rows3, UserRound } from "lucide-react";
import type { ViewId } from "../layout/Sidebar";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ExamGuideTabs } from "./ExamGuideTabs";

type ExamGuideScreenProps = {
  onNavigate: (view: ViewId) => void;
  onSectionChange: (section: any) => void;
};

const callouts = [
  { icon: UserRound, title: "인터뷰어 영역", body: "질문을 들을 때 화면의 가상 인터뷰어가 표시되는 영역입니다." },
  { icon: Headphones, title: "질문 청취", body: "질문의 핵심 동사와 시제를 먼저 파악하세요. 본 시험은 질문을 최대 2회 들을 수 있습니다." },
  { icon: Play, title: "Replay / 청취 횟수", body: "현재 질문을 몇 번 들었는지 확인하는 영역입니다." },
  { icon: Mic2, title: "녹음 상태", body: "답변 녹음 시작·진행 상태를 확인합니다." },
  { icon: Rows3, title: "문항 진행", body: "현재 몇 번째 질문인지 확인합니다." },
  { icon: MousePointerClick, title: "다음 문제", body: "답변을 마친 뒤 다음 문제로 이동합니다." },
];

/**
 * Reference implementation for /exam-guide/screen/
 * This page should explain the exam UI using OOM's original schematic mockup.
 */
export function ExamGuideScreen({
  onNavigate,
  onSectionChange,
}: ExamGuideScreenProps) {
  return (
    <div className="space-y-6">
      <ExamGuideTabs activeSection={"exam-screen" as any} onSectionChange={onSectionChange} />

      <section>
        <Badge tone="indigo">시험 화면 · 조작법</Badge>
        <h1 className="mt-3 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">
          시험장에서 화면이 낯설지 않도록 미리 익혀보세요.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
          아래 화면은 OPIc 시험 흐름을 이해하기 위한 OOM 학습용 도식입니다.
          실제 시험 화면의 세부 디자인과 배치는 운영사 업데이트에 따라 달라질 수 있습니다.
        </p>
      </section>

      <Card className="overflow-hidden p-0">
        <img
          alt="OOM OPIc 시험 화면 구성 학습용 도식"
          className="w-full"
          src="/assets/exam/exam-screen-guide.png"
        />
      </Card>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {callouts.map(({ icon: Icon, title, body }, index) => (
          <Card className="p-4" key={title}>
            <div className="flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-600 text-xs font-extrabold text-white">
                {index + 1}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-indigo-600" />
                  <h2 className="text-sm font-bold">{title}</h2>
                </div>
                <p className="mt-2 text-xs leading-5 text-zinc-600 dark:text-zinc-300">
                  {body}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <Card className="border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
        <p className="text-sm font-bold text-amber-950 dark:text-amber-100">
          OOM의 연습 타이머는 실제 시험의 문항별 제한시간이 아닙니다.
        </p>
        <p className="mt-2 text-xs leading-5 text-amber-900 dark:text-amber-200">
          OPIc 공식 안내상 본 시험은 질문을 최대 2회 들을 수 있으며 문항별 답변시간 제한은 없습니다.
          OOM의 30–45 / 45–65 / 60–90초 표시는 답변 길이를 훈련하기 위한 학습 프리셋입니다.
        </p>
      </Card>

      <Button onClick={() => onNavigate("practice")}>
        시험 화면으로 직접 연습해 보기
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
