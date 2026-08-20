import {
  ArrowRight,
  BookOpenCheck,
  CircleDollarSign,
  CircleHelp,
  FileCheck2,
  GraduationCap,
  MonitorPlay,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import {
  examGuideSections,
  type ExamGuideSection,
} from "../../data/examGuideContent";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

const iconsBySection: Record<ExamGuideSection, LucideIcon> = {
  "exam-overview": GraduationCap,
  "exam-screen": MonitorPlay,
  "exam-apply": CircleDollarSign,
  "exam-day": ShieldCheck,
  "exam-results": FileCheck2,
  "exam-faq": CircleHelp,
};

export function ExamGuideHub({
  onNavigate,
}: {
  onNavigate: (view: ExamGuideSection) => void;
}) {
  return (
    <div className="space-y-6">
      <section className="border-l-4 border-indigo-500 pl-4">
        <Badge tone="indigo">OPIc 수험 가이드</Badge>
        <h1 className="mt-3 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">
          신청 전부터 성적 활용까지, 필요한 정보를 순서대로 확인하세요.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
          시험의 구조와 등급을 이해하고, 시험 화면 조작법을 미리 익힌 뒤 신청 규정과 당일 준비물을 확인하여 성적·인증서까지 체계적으로 관리할 수 있도록 구성했습니다.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {examGuideSections.map((section) => {
          const Icon = iconsBySection[section.id] ?? GraduationCap;
          return (
            <Card className="flex h-full flex-col justify-between p-5" key={section.id}>
              <div>
                <div className="grid h-9 w-9 place-items-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-lg font-bold text-zinc-950 dark:text-white">
                  {section.label}
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  {section.description}
                </p>
              </div>
              <Button
                className="mt-6 w-full"
                onClick={() => onNavigate(section.id)}
                variant="secondary"
              >
                자세히 보기 <ArrowRight className="h-4 w-4" />
              </Button>
            </Card>
          );
        })}
      </section>

      <Card className="border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950">
        <div className="flex gap-3">
          <BookOpenCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
              읽는 순서
            </p>
            <p className="mt-1 text-sm leading-6 text-amber-800 dark:text-amber-200">
              처음 응시라면 소개·등급 → 시험 화면 · 조작법 → 회원·신청·응시료 → 신분증·입실·진행 순서를 권합니다. 성적 제출 일정이 있는 경우에는 성적·인증서 페이지를 먼저 확인하세요.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
