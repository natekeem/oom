import { Check, Layers3 } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button, ButtonLink } from "../ui/Button";
import { Card } from "../ui/Card";
import { PageIntro } from "../ui/PageIntro";
import { viewPathForId } from "../../lib/routes";

const free = [
  "OPIc 수험 가이드와 오픽 매거진",
  "목표 설정부터 서베이·만능 스크립트·롤플레이 학습",
  "Quick Practice와 실전 모의고사, 녹음 다시 듣기",
  "Google 로그인 후 계정별 학습 설정과 학습 기록",
  "매일 무료 AI 피드백 3회 & AI 음성인식 10분 제공 (로그인 시)",
];
const planned = [
  "광고 없는 쾌적한 학습 환경",
  "AI 피드백 및 음성인식 무제한/확장 이용",
  "실전 모의고사 심층 분석 및 취약점 진단",
  "고급 학습 통계와 개인화 학습 추천",
];
const faq = [
  ["무료로 계속 사용할 수 있나요?", "현재 공개 콘텐츠와 6단계 훈련은 모두 무료로 이용할 수 있습니다. Google 로그인 시 매일 자정(KST)마다 무료 AI 피드백(일 3회)과 음성 인식(일 10분)이 제공됩니다. PRO는 향후 더 많은 기능이 필요한 학습자를 위해 계획 중인 모델입니다."],
  ["PRO는 언제 결제할 수 있나요?", "아직 준비 중입니다. 출시 일정과 가격은 정해지지 않았으며, 아래 PRO 항목은 계획으로 변경될 수 있습니다."],
  ["로그인하지 않아도 학습할 수 있나요?", "네. 가이드, 스크립트, 롤플레이와 실전 연습은 로그인 없이 이용할 수 있습니다. 계정 간 학습 설정 동기화와 기록 보관에는 Google 로그인이 필요합니다."],
  ["지금 AI 피드백을 이용할 수 있나요?", "네. Google 로그인 후 Quick Practice 복기에서 AI 답변 피드백(일 3회)과 자동 음성 인식(일 10분)을 바로 이용할 수 있으며, 스크립트 재작성과 롤플레이 질문 생성도 지원합니다. 본인의 API 키가 있는 고급 사용자는 AI 설정에서 커스텀 엔드포인트를 연결해 제한 없이 이용할 수도 있습니다."],
];

export function PricingPage() {
  return <div className="w-full space-y-10">
    <PageIntro icon={Layers3} tag="PLANS" title="요금제" description="지금 필요한 학습은 무료로 시작하세요. 더 깊은 피드백을 위한 PRO도 준비하고 있습니다." />
    <div className="grid gap-5 md:grid-cols-2">
      <Card className="flex flex-col border-indigo-300 p-6 dark:border-indigo-700 sm:p-8">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold">FREE</h2><Badge tone="emerald">현재 이용 가능</Badge></div>
        <p className="mt-5 text-4xl font-bold tracking-tight">무료</p><p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">익히고, 바꿔 말하고, 직접 연습하는 기본 학습을 함께합니다.</p>
        <ul className="my-7 flex-1 space-y-4">{free.map(item => <li key={item} className="flex gap-3 text-sm leading-6"><Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-indigo-500" />{item}</li>)}</ul>
        <ButtonLink to={viewPathForId["training-setup"]} size="lg">무료로 시작하기</ButtonLink>
      </Card>
      <Card className="flex flex-col p-6 sm:p-8">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold">PRO</h2><Badge>준비 중</Badge></div>
        <p className="mt-5 text-4xl font-bold tracking-tight">더 깊은 복기</p><p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">출시를 위해 검토 중인 기능입니다. 현재 제공되거나 구매할 수 있는 상품이 아닙니다.</p>
        <ul className="my-7 flex-1 space-y-4">{planned.map(item => <li key={item} className="flex gap-3 text-sm leading-6"><span aria-hidden="true" className="text-zinc-400">·</span>{item}<span className="ml-auto shrink-0 text-xs text-zinc-500 dark:text-zinc-400">계획</span></li>)}</ul>
        <Button disabled variant="secondary" size="lg">PRO 준비 중</Button>
      </Card>
    </div>
    <section aria-label="요금제 자주 묻는 질문" className="space-y-4"><h2 className="text-xl font-bold">자주 묻는 질문</h2>
      <Card className="divide-y divide-zinc-200 px-5 dark:divide-zinc-800 sm:px-7">{faq.map(([question, answer]) => <details key={question} className="py-5"><summary className="cursor-pointer rounded-sm text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">{question}</summary><p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">{answer}</p></details>)}</Card>
    </section>
  </div>;
}
