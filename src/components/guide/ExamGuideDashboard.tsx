import {
  BadgeCheck,
  CalendarCheck2,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  ExternalLink,
  FileText,
  GraduationCap,
  Landmark,
  ListChecks,
  ShieldCheck,
  TicketCheck,
  UserRoundCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  applyStepsDetailed,
  dayOfExamRules,
  examAtAGlance,
  examProcess,
  feeRows,
  gradeGuide,
  guideSourceNote,
  identityGroups,
  identityWarnings,
  membershipGuidance,
  militaryIdGuidance,
  officialGuideLinks,
  resultGuidance,
  savingCouponRules,
  type ExamGuideSection,
} from "../../data/examGuideContent";
import type { ViewId } from "../layout/Sidebar";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ExamGuideTabs } from "./ExamGuideTabs";

type ExamGuideDashboardProps = {
  initialSection: ExamGuideSection;
  onNavigate: (view: ViewId) => void;
  onSectionChange: (section: ExamGuideSection) => void;
};

function OfficialLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <a
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-300"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {children}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

function SourceNote() {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
      <ShieldCheck className="mr-1.5 inline h-4 w-4" />
      {guideSourceNote}
    </div>
  );
}

function OverviewContent({ onNavigate }: { onNavigate: (view: ViewId) => void }) {
  return (
    <div className="space-y-6">
      <section className="border-l-4 border-indigo-500 pl-4">
        <Badge tone="indigo">OPIc 소개 · 등급</Badge>
        <h1 className="mt-3 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">
          OPIc은 어떤 시험이고, 무엇을 준비해야 할까요?
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
          OPIc은 ACTFL이 개발·평가·인증하는 컴퓨터 기반 외국어 말하기 평가입니다. 실제 생활과 비즈니스 현장에서의 말하기 능력을 보기 위해, 응시자의 배경과 관심사에 맞는 질문이 개인 맞춤형으로 출제됩니다.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={() => onNavigate("training-hub")}>
            <ListChecks className="h-4 w-4" />
            STEP 1. 목표/코스 설정
          </Button>
          <OfficialLink href={officialGuideLinks.actflGuidelines}>
            2024 ACTFL Guidelines
          </OfficialLink>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {examAtAGlance.map((item) => (
          <Card className="p-4" key={item.label}>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{item.label}</p>
            <p className="mt-2 text-lg font-bold text-zinc-950 dark:text-white">{item.value}</p>
            <p className="mt-2 text-xs leading-5 text-zinc-600 dark:text-zinc-300">{item.detail}</p>
          </Card>
        ))}
      </section>

      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <GraduationCap className="h-5 w-5" />
          <h2 className="text-lg font-bold text-zinc-950 dark:text-white">등급 체계, OOM의 목표와 연결하기</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          OPIc은 실제 말하기 능숙도를 전반적으로 평가합니다. IM 등급은 IM1·IM2·IM3로 세분화되며, OOM의 실전 목표는 IM3부터 IH, AL까지입니다.
        </p>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {gradeGuide.map((grade) => (
            <div
              className={`rounded-md border p-4 ${
                grade.band === "Novice"
                  ? "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
                  : grade.band === "Intermediate"
                  ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30"
                  : "border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/30"
              }`}
              key={grade.band}
            >
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{grade.band}</p>
              <p className="mt-2 text-lg font-bold text-zinc-950 dark:text-white">{grade.levels}</p>
              <p className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-200">{grade.explanation}</p>
              <p className="mt-3 border-t border-zinc-200 pt-3 text-xs leading-5 text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
                <span className="font-semibold">훈련 초점:</span> {grade.focus}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <Clock3 className="h-5 w-5" />
          <h2 className="text-lg font-bold text-zinc-950 dark:text-white">시험은 이렇게 진행됩니다</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          오리엔테이션에서 설문·난이도·장비를 점검한 뒤 1차 세션과 2차 세션으로 개인 맞춤형 질문에 답합니다. 질문은 두 번 들을 수 있고 문항별 답변 시간 제한은 없습니다.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {examProcess.map((item) => (
            <div
              className={`rounded-md border p-4 ${
                item.phase === "orientation"
                  ? "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
                  : "border-indigo-200 bg-indigo-50/70 dark:border-indigo-900 dark:bg-indigo-950/30"
              }`}
              key={item.step}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`grid h-6 w-6 place-items-center rounded text-xs font-bold ${
                    item.phase === "orientation"
                      ? "bg-white text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                      : "bg-indigo-600 text-white"
                  }`}
                >
                  {item.step}
                </span>
                <p className="text-sm font-bold text-zinc-950 dark:text-white">{item.title}</p>
              </div>
              <p className="mt-3 text-xs leading-5 text-zinc-600 dark:text-zinc-300">{item.detail}</p>
            </div>
          ))}
        </div>
      </Card>
      <SourceNote />
    </div>
  );
}

function ApplyContent() {
  return (
    <div className="space-y-6">
      <section className="border-l-4 border-indigo-500 pl-4">
        <Badge tone="indigo">회원 · 신청 · 응시료</Badge>
        <h1 className="mt-3 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">
          신청 전에는 계정, 일정, 응시료를 순서대로 확인하세요.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
          시험 신청은 회원가입과 본인인증 이후에 가능합니다. 접수만 끝내는 것이 아니라, 당일 신분증과 입실 시간을 준비하는 곳까지가 신청 과정의 마무리입니다.
        </p>
        <div className="mt-4">
          <OfficialLink href={officialGuideLinks.apply}>OPIc 시험 신청으로 이동</OfficialLink>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {membershipGuidance.map((item) => (
          <Card className="p-5" key={item.title}>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <UserRoundCheck className="h-4 w-4" />
              <p className="text-sm font-bold text-zinc-950 dark:text-white">{item.title}</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{item.detail}</p>
          </Card>
        ))}
      </section>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CircleDollarSign className="h-5 w-5" />
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white">시험 응시료</h2>
          </div>
          <Badge tone="amber">VAT 포함 · 2025.11.01 신청부터</Badge>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="px-3 py-3 font-semibold">시험</th>
                <th className="px-3 py-3 font-semibold">정식 명칭</th>
                <th className="px-3 py-3 text-right font-semibold">응시료</th>
              </tr>
            </thead>
            <tbody>
              {feeRows.map((row) => (
                <tr className="border-b border-zinc-100 last:border-0 dark:border-zinc-800" key={row.exam}>
                  <td className="px-3 py-3 font-bold text-zinc-950 dark:text-white">{row.exam}</td>
                  <td className="px-3 py-3 text-zinc-600 dark:text-zinc-300">{row.name}</td>
                  <td
                    className={`px-3 py-3 text-right font-bold ${
                      row.emphasis ? "text-indigo-700 dark:text-indigo-300" : "text-zinc-800 dark:text-zinc-100"
                    }`}
                  >
                    {row.fee}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          기업·기관의 단체시험에는 별도 응시료가 적용될 수 있습니다. 최종 금액은 신청 화면에서 확인하세요.
        </p>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-100">
          <CalendarCheck2 className="h-5 w-5 text-indigo-500" />
          <h2 className="text-lg font-bold">신청 체크리스트</h2>
        </div>
        <ol className="mt-5 grid gap-4 md:grid-cols-2">
          {applyStepsDetailed.map((item, index) => (
            <li className="flex gap-3" key={item.title}>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded bg-indigo-600 text-xs font-bold text-white">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <p className="text-sm font-bold text-zinc-900 dark:text-white">장애 수험자 안내</p>
          <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            시각·청각·기타 신체 장애 관련 지원이 필요한 경우, 반드시 신청 전 상담을 진행하세요.
          </p>
          <div className="mt-3">
            <OfficialLink href={officialGuideLinks.inquiry}>1:1 문의 바로가기</OfficialLink>
          </div>
        </div>
      </Card>
      <SourceNote />
    </div>
  );
}

function DayContent() {
  return (
    <div className="space-y-6">
      <section className="border-l-4 border-indigo-500 pl-4">
        <Badge tone="indigo">신분증 · 입실 · 진행</Badge>
        <h1 className="mt-3 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">
          당일에는 규정 신분증과 입실 시각이 가장 먼저입니다.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
          규정 신분증이 없으면 시험에 응시할 수 없고 해당 시험은 무효 처리됩니다. 특히 할인 시험이나 특정 대상 시험은 추가 소속 확인 서류가 필요한지 신청 사이트에서 함께 확인해야 합니다.
        </p>
      </section>

      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
          <BadgeCheck className="h-5 w-5" />
          <h2 className="text-lg font-bold text-zinc-950 dark:text-white">규정 신분증: 대상별 빠른 확인</h2>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {identityGroups.map((group) => (
            <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800" key={group.title}>
              <p className="text-sm font-bold text-zinc-950 dark:text-white">{group.title}</p>
              <p className="mt-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400">인정 신분증</p>
              <p className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-200">{group.accepted}</p>
              <p className="mt-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400">대체 가능 서류</p>
              <p className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-200">{group.alternative}</p>
            </div>
          ))}
        </div>
        <ul className="mt-5 space-y-2 rounded-md bg-zinc-50 p-4 text-sm leading-6 text-zinc-700 dark:bg-zinc-950 dark:text-zinc-200">
          {identityWarnings.map((warning) => (
            <li className="flex gap-2" key={warning}>
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-rose-500" />
              {warning}
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <OfficialLink href={officialGuideLinks.identificationForm}>
            신분확인증명서 양식 다운로드
          </OfficialLink>
        </div>
      </Card>

      <details className="rounded-md border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <summary className="cursor-pointer text-sm font-bold text-zinc-950 marker:text-indigo-500 dark:text-white">
          군인 할인 대상자: 추가 신분 확인 서류
        </summary>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="px-3 py-2.5">신청자 구분</th>
                <th className="px-3 py-2.5">규정 신분증</th>
                <th className="px-3 py-2.5">대체 가능 서류</th>
              </tr>
            </thead>
            <tbody>
              {militaryIdGuidance.map((row) => (
                <tr className="border-b border-zinc-100 last:border-0 dark:border-zinc-800" key={row.target}>
                  <td className="px-3 py-3 font-semibold text-zinc-900 dark:text-white">{row.target}</td>
                  <td className="px-3 py-3 leading-6 text-zinc-600 dark:text-zinc-300">{row.primary}</td>
                  <td className="px-3 py-3 leading-6 text-zinc-600 dark:text-zinc-300">{row.alternative}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          밀리패스는 현역 신분만 가능하며, 예비역·군 가족 등은 사용할 수 없습니다. 명시되지 않은 대상의 할인 가능 여부는 신청 전 공식 안내에서 확인하세요.
        </p>
      </details>

      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Clock3 className="h-5 w-5" />
          <h2 className="text-lg font-bold text-zinc-950 dark:text-white">입실 통제와 시험 시간</h2>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-4">
          {dayOfExamRules.map((rule, index) => (
            <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800" key={rule.title}>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">0{index + 1}</span>
              <p className="mt-2 text-sm font-bold text-zinc-950 dark:text-white">{rule.title}</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{rule.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-3 rounded-md border border-indigo-200 bg-indigo-50/60 p-4 sm:grid-cols-3 dark:border-indigo-900 dark:bg-indigo-950/30">
          <div>
            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">도착 기준</p>
            <p className="mt-1 text-lg font-bold text-zinc-950 dark:text-white">시작 10분 전</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">예: 10시 시험 입실</p>
            <p className="mt-1 text-lg font-bold text-zinc-950 dark:text-white">09:50 ~ 09:59</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">전체 소요 시간</p>
            <p className="mt-1 text-lg font-bold text-zinc-950 dark:text-white">OT 20분 + 본시험 40분</p>
          </div>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <ListChecks className="h-5 w-5" />
          <h2 className="text-lg font-bold text-zinc-950 dark:text-white">오리엔테이션부터 2차 세션까지</h2>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {examProcess.map((item) => (
            <div
              className={`rounded-md border p-4 ${
                item.phase === "test"
                  ? "border-indigo-200 bg-indigo-50/60 dark:border-indigo-900 dark:bg-indigo-950/30"
                  : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
              }`}
              key={item.step}
            >
              <span
                className={`grid h-6 w-6 place-items-center rounded text-xs font-bold ${
                  item.phase === "test"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                }`}
              >
                {item.step}
              </span>
              <p className="mt-3 text-sm font-bold text-zinc-950 dark:text-white">{item.title}</p>
              <p className="mt-2 text-xs leading-5 text-zinc-600 dark:text-zinc-300">{item.detail}</p>
            </div>
          ))}
        </div>
      </Card>
      <SourceNote />
    </div>
  );
}

function ResultsContent() {
  return (
    <div className="space-y-6">
      <section className="border-l-4 border-indigo-500 pl-4">
        <Badge tone="indigo">성적 · 인증서 · 쿠폰</Badge>
        <h1 className="mt-3 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">
          시험이 끝난 뒤에도 성적 확인과 서류 관리가 이어집니다.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
          성적 발표 예정일, 유효기간, 인증서 출력 방법을 미리 알고 있으면 회사·기관 제출 일정을 훨씬 안전하게 관리할 수 있습니다.
        </p>
        <div className="mt-4">
          <OfficialLink href={officialGuideLinks.results}>성적 확인으로 이동</OfficialLink>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {resultGuidance.map((item) => (
          <Card className="p-5" key={item.title}>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <FileText className="h-4 w-4" />
              <p className="text-sm font-bold text-zinc-950 dark:text-white">{item.title}</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{item.detail}</p>
          </Card>
        ))}
      </section>

      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <TicketCheck className="h-5 w-5" />
          <h2 className="text-lg font-bold text-zinc-950 dark:text-white">세이빙 쿠폰과 UR 안내</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          개인 유료결제 시험에서 정해진 사유로 응시하지 못했거나 채점이 불가한 경우, 재신청 부담을 줄이기 위한 세이빙 쿠폰 관련 규정이 적용될 수 있습니다.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {savingCouponRules.map((rule) => (
            <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800" key={rule.title}>
              <p className="text-sm font-bold text-zinc-950 dark:text-white">{rule.title}</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{rule.detail}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
        <div className="flex gap-3">
          <Landmark className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">기관 제출 전 3분 점검</p>
            <ul className="mt-2 space-y-1.5 text-sm leading-6 text-emerald-800 dark:text-emerald-200">
              <li>Test ID의 I·L·O·0 같은 문자가 혼동되지 않았는지 확인합니다.</li>
              <li>제출 기관의 유효기간 기준과 내 응시일을 함께 계산합니다.</li>
              <li>인증서가 필요한 경우 성적 공개 뒤 직접 출력합니다.</li>
            </ul>
          </div>
        </div>
      </Card>
      <SourceNote />
    </div>
  );
}

export function ExamGuideDashboard({
  initialSection,
  onNavigate,
  onSectionChange,
}: ExamGuideDashboardProps) {
  const renderContent = () => {
    if (initialSection === "exam-apply") return <ApplyContent />;
    if (initialSection === "exam-day") return <DayContent />;
    if (initialSection === "exam-results") return <ResultsContent />;
    return <OverviewContent onNavigate={onNavigate} />;
  };

  return (
    <div className="space-y-6">
      <ExamGuideTabs
        activeSection={initialSection}
        onSectionChange={onSectionChange}
      />
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 8 }}
        key={initialSection}
        transition={{ duration: 0.2 }}
      >
        {renderContent()}
      </motion.div>
    </div>
  );
}
