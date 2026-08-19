import { ArrowRight, BookOpenCheck, Gauge, Lightbulb, MessageCircleMore, Mic2, Route, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { ButtonLink } from "../ui/Button";

const flows = [
  "STEP 1 목표 구간 · 코스 설정",
  "STEP 2 서베이 고정",
  "STEP 3 난이도 설정",
  "STEP 4 만능 스크립트",
  "STEP 5 롤플레이 공식",
  "STEP 6 실전 연습",
];

const levels = [
  { level: "IM3", tone: "emerald" as const, text: "기본 구조를 지키며, 친숙한 경험을 이해 가능한 문장으로 이어 말합니다." },
  { level: "IH", tone: "indigo" as const, text: "시간·장소·감정을 덧붙여 답변을 확장하고 자연스럽게 연결합니다." },
  { level: "AL", tone: "amber" as const, text: "구체적인 장면과 변화, 문제 해결을 유연하게 엮어 깊이를 만듭니다." },
];

export function HomeView() {
  return (
    <div className="space-y-6">
      <motion.section animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 10 }} className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="overflow-hidden bg-zinc-950 p-6 text-white sm:p-8">
          <span className="inline-flex flex-col">
            <span className="block text-sm font-semibold text-zinc-950 dark:text-white">오픽온미</span>
            <span className="block text-xs text-zinc-500 dark:text-zinc-400">OOM - OPIc On Me</span>
          </span>
          <h1 className="mt-4 max-w-3xl text-balance text-3xl font-bold leading-tight sm:text-4xl">오픽온미와 함께 오픽은 나에게 맡기고, 반복 가능한 구조로 말합니다.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">OOM은 답을 통째로 암기하는 도구가 아닙니다. 익숙한 장면을 여러 질문에 맞게 자연스럽게 변형해 말하는 훈련 대시보드입니다.</p>
          <div className="mt-6 flex flex-wrap gap-3"><ButtonLink to="/training/"><Route className="h-4 w-4" />STEP 1 실전 훈련 시작</ButtonLink><ButtonLink to="/training/scripts/outdoor/" variant="secondary"><Mic2 className="h-4 w-4" />스크립트 보기</ButtonLink></div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400"><Gauge className="h-5 w-5" /><p className="text-sm font-semibold">추천 시작점</p></div>
          <p className="mt-5 text-4xl font-bold text-zinc-950 dark:text-white">5 <span className="text-zinc-400">→</span> 5</p>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">충분히 다양한 질문을 받으면서도, 초반부터 지나치게 추상적인 질문으로 흔들리지 않는 설정입니다.</p>
          <ButtonLink className="mt-6 w-full" to="/training/difficulty/" variant="secondary">난이도 가이드 <ArrowRight className="h-4 w-4" /></ButtonLink>
        </Card>
      </motion.section>

      <section className="grid gap-5 lg:grid-cols-3">
        {levels.map((item, index) => <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 12 }} key={item.level} transition={{ delay: index * 0.06 }}><Card className="h-full p-5"><Badge tone={item.tone}>{item.level}</Badge><p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{item.text}</p></Card></motion.div>)}
      </section>

      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-indigo-500" /><h2 className="text-lg font-bold text-zinc-950 dark:text-white">이 앱에서 하는 훈련 흐름</h2></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {flows.map((flow, index) => <div className="flex items-center gap-3 rounded-md bg-zinc-50 p-3 dark:bg-zinc-950" key={flow}><span className="grid h-7 w-7 shrink-0 place-items-center rounded bg-indigo-600 text-xs font-bold text-white">{index + 1}</span><span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{flow}</span></div>)}
        </div>
      </Card>

      <Card className="border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950">
        <div className="flex gap-3"><Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" /><div><p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">훈련의 기준</p><p className="mt-1 text-sm leading-6 text-emerald-800 dark:text-emerald-200">이 구조가 점수를 보장하지는 않습니다. 다만 낯선 질문 앞에서도 재사용 가능한 답변 구조를 꺼내 자연스럽게 말하는 힘을 키웁니다.</p></div></div>
      </Card>

      <section aria-labelledby="opic-study-guide" className="space-y-5 pt-4">
        <div className="max-w-3xl">
          <Badge tone="indigo">OPIc 학습 가이드</Badge>
          <h2 className="mt-3 text-balance text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl dark:text-white" id="opic-study-guide">오픽을 혼자 준비할 때 알아야 할 등급, 훈련, 발화의 기준</h2>
          <p className="mt-3 text-sm leading-7 text-zinc-600 sm:text-base dark:text-zinc-300">OPIc은 외운 문장을 얼마나 많이 꺼내는지보다, 자신의 경험을 질문에 맞춰 얼마나 구체적이고 자연스럽게 이어 가는지를 연습하는 영어 말하기 평가입니다. 아래 가이드는 점수를 보장하는 공식 채점표가 아니라, 목표 등급에 맞는 답변의 밀도와 OOM에서 반복할 학습 순서를 이해하기 위한 실전형 안내입니다.</p>
        </div>

        <Card className="overflow-hidden rounded-xl">
          <div className="border-l-4 border-indigo-500 p-5 sm:p-7">
            <div className="flex flex-wrap items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300"><BookOpenCheck className="h-5 w-5" /></span>
              <div>
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">01. OPIc 시험 소개 및 등급별 평가 기준</p>
                <h3 className="mt-1 text-xl font-bold tracking-tight text-zinc-950 dark:text-white">AL과 IH는 ‘어려운 단어’보다 이야기를 전개하는 방식에서 갈립니다.</h3>
              </div>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="space-y-4 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
                <p>OPIc에서는 친숙한 주제를 두고 장소, 사람, 일상 습관, 과거 경험, 비교, 문제 해결처럼 서로 다른 방향의 질문이 이어질 수 있습니다. 그래서 준비의 단위는 질문 하나의 정답이 아니라, 여러 질문으로 다시 꺼내 쓸 수 있는 개인적인 장면이어야 합니다. 예를 들어 좋아하는 공원을 소개할 때는 위치만 말하는 대신 언제 가는지, 무엇을 보는지, 그곳에 가게 된 계기와 방문 후 기분이 어떻게 달라지는지까지 연결하면 답변이 훨씬 선명해집니다.</p>
                <p>IH를 목표로 하는 학습자는 먼저 질문에 직접 답하고, 시간·장소·행동·이유 중 두 가지 이상을 붙여 45초에서 60초 정도의 흐름을 안정적으로 만드는 데 집중하는 것이 좋습니다. “I like going to a park”에서 멈추지 않고 “I usually go there on Sunday mornings because it helps me slow down after a busy week”처럼 습관과 이유를 덧붙이면, 단순 정보가 개인 경험으로 바뀝니다. 핵심 채점 포인트는 완벽한 문법 한 문장이 아니라 질문과 관련된 내용을 이해 가능한 순서로 확장하고, 연결어를 사용해 말의 흐름을 유지하는가에 있습니다.</p>
              </div>
              <div className="space-y-4 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
                <p>AL을 목표로 한다면 같은 경험 안에서도 변화와 관점을 보여 주는 연습이 필요합니다. 예전과 지금의 차이, 기대와 달랐던 순간, 작은 문제를 해결한 과정, 그 일을 통해 생긴 생각을 자연스럽게 엮으면 답변에 깊이가 생깁니다. “The park is quiet”라고만 말하기보다 “I used to think it was too ordinary, but now I go there whenever I need a break from work”처럼 시간의 변화와 개인적인 해석을 덧붙여 보세요.</p>
                <p>AL 수준의 발화는 실수 없이 빠르게 말하는 모습만을 뜻하지 않습니다. 단어가 바로 떠오르지 않을 때 “I can&apos;t remember the exact name, but it was a small local place near the station”처럼 설명으로 우회하고, 말의 방향을 정정할 때 “Actually, when I think about it…”으로 더 정확한 장면을 보태는 회복 능력이 중요합니다. 공식 점수 산식은 공개되어 있지 않으므로 특정 표현만으로 등급을 예측할 수는 없지만, 구체적인 묘사, 일관된 시간 흐름, 자연스러운 연결, 질문에 맞춘 유연한 확장이 고득점 답변을 만드는 공통 기반입니다.</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden rounded-xl">
          <div className="border-l-4 border-emerald-500 p-5 sm:p-7">
            <div className="flex flex-wrap items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300"><Route className="h-5 w-5" /></span>
              <div>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">02. OOM(OPIc On Me) 활용 100% 가이드</p>
                <h3 className="mt-1 text-xl font-bold tracking-tight text-zinc-950 dark:text-white">스크립트와 롤플레이를 따로 보지 말고, 한 장면을 옮겨 말하는 세 단계로 공부하세요.</h3>
              </div>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <section className="rounded-lg bg-zinc-50 p-5 dark:bg-zinc-950">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-300">Step 1 · 고정</p>
                <h4 className="mt-2 text-base font-bold text-zinc-950 dark:text-white">서베이와 난이도로 내 재료를 좁힙니다.</h4>
                <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">먼저 서베이에서 실제로 설명할 수 있는 관심사를 고르고, 난이도 화면에서 목표 발화 길이를 정합니다. 남들이 많이 고르는 주제보다 내 기억 속에 장소·사람·사건이 남아 있는 주제가 좋습니다. 한 주제를 고른 뒤에는 자주 바꾸지 말고, 그 안에서 말할 수 있는 장면 세 개를 메모하세요. 이 선택이 이후 스크립트와 롤플레이의 공통 재료가 됩니다.</p>
                <ButtonLink className="mt-4" to="/training/survey/" size="sm" variant="secondary">서베이로 시작 <ArrowRight className="h-3.5 w-3.5" /></ButtonLink>
              </section>
              <section className="rounded-lg bg-zinc-50 p-5 dark:bg-zinc-950">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-300">Step 2 · 구조화</p>
                <h4 className="mt-2 text-base font-bold text-zinc-950 dark:text-white">스크립트는 통째 암기 대신 블록으로 익힙니다.</h4>
                <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">OOM의 스크립트 그룹에서는 가장 나와 닮은 스토리 하나를 고른 뒤, 시작·구체적 디테일·작은 변화·마무리 블록을 나누어 읽습니다. 처음에는 전체 문장을 보며 말하고, 다음에는 키워드만 보며 같은 장면을 설명해 보세요. 질문 변형에서는 첫 문장만 질문에 맞게 바꾸고 나머지 장면을 이어 말합니다. 이렇게 하면 외운 문장이 아니라 움직일 수 있는 답변 구조가 남습니다.</p>
                <ButtonLink className="mt-4" to="/training/scripts/" size="sm" variant="secondary">스크립트 구조 보기 <ArrowRight className="h-3.5 w-3.5" /></ButtonLink>
              </section>
              <section className="rounded-lg bg-zinc-50 p-5 dark:bg-zinc-950">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-300">Step 3 · 전이</p>
                <h4 className="mt-2 text-base font-bold text-zinc-950 dark:text-white">롤플레이와 녹음으로 즉답력을 확인합니다.</h4>
                <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">롤플레이에서는 상황 설명, 정보 질문, 대안 요청, 감사의 순서를 반복해 요청의 목적을 잃지 않는 연습을 합니다. 이후 실전 연습에서 랜덤 질문을 듣고 타이머 안에 답한 뒤 녹음을 재생하세요. 첫 재생에서는 긴 정적을, 두 번째 재생에서는 반복한 표현 하나만 찾습니다. 수정한 연결어를 비슷한 다른 질문에 다시 적용하면 스크립트가 실제 말하기 실력으로 옮겨갑니다.</p>
                <ButtonLink className="mt-4" to="/roleplay/" size="sm" variant="secondary">롤플레이 공식 보기 <ArrowRight className="h-3.5 w-3.5" /></ButtonLink>
              </section>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden rounded-xl">
          <div className="border-l-4 border-amber-500 p-5 sm:p-7">
            <div className="flex flex-wrap items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"><MessageCircleMore className="h-5 w-5" /></span>
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">03. 오픽 고득점 치트키: Filler word와 자연스러운 발화량</p>
                <h3 className="mt-1 text-xl font-bold tracking-tight text-zinc-950 dark:text-white">필러는 침묵을 감추는 소리가 아니라, 다음 이야기를 안내하는 연결 장치입니다.</h3>
              </div>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-lg bg-amber-50/70 p-5 dark:bg-amber-950/30">
                <h4 className="text-base font-bold text-amber-950 dark:text-amber-100">상황별로 바로 쓸 수 있는 필러 표현</h4>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-amber-950/90 dark:text-amber-100/90">
                  <li><span className="font-semibold">생각을 정리할 때:</span> “Let me think for a second.”이라고 짧게 말한 뒤 바로 장소나 경험을 제시합니다.</li>
                  <li><span className="font-semibold">관점을 바꿀 때:</span> “Actually, when I think about it…”을 사용해 처음 답보다 더 정확한 기억을 덧붙입니다.</li>
                  <li><span className="font-semibold">예시를 줄 때:</span> “For example,” 또는 “The thing is…”으로 추상적인 설명 뒤에 개인적인 행동을 붙입니다.</li>
                  <li><span className="font-semibold">단어를 회복할 때:</span> “I can&apos;t remember the exact name, but…”으로 기억나지 않는 고유명사를 설명으로 바꿉니다.</li>
                  <li><span className="font-semibold">핵심으로 돌아올 때:</span> “Anyway, the point is…”으로 곁가지 설명 뒤에 질문의 답을 다시 붙잡습니다.</li>
                </ul>
              </div>
              <div className="space-y-4 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
                <p>자연스러운 발화량을 늘리는 가장 안전한 방법은 필러를 많이 넣는 것이 아니라, 하나의 문장을 두 번 확장하는 것입니다. 먼저 질문에 직접 답하고, 다음 문장에는 구체적인 행동을, 마지막 문장에는 그 행동의 이유나 감정을 더해 보세요. “I enjoy cooking”이라는 짧은 답은 “I enjoy cooking on weekend evenings. I usually try a simple recipe with my sister, and it helps us catch up after a busy week”처럼 장면과 의미를 갖춘 답변으로 자랄 수 있습니다.</p>
                <p>필러는 한 답변에서 두 번 정도만, 분명한 역할이 있을 때 쓰는 편이 좋습니다. 첫 문장 앞에서 “um, you know”를 길게 반복하기보다 핵심 정보를 먼저 말하고, 세부 묘사로 넘어갈 때 “To be more specific”을 쓰면 훨씬 안정적으로 들립니다. 말이 막히는 순간에는 억지로 어려운 단어를 찾기보다 쉬운 표현으로 바꾸고, 시간 순서 표현인 “at first”, “then”, “after that”, “in the end”를 활용해 이야기를 끝까지 가져가세요.</p>
                <p>매일 5분만 투자하는 연습도 효과적입니다. 하나의 질문에 45초 동안 답을 녹음한 뒤, 두 번째 녹음에서는 필러를 정확히 두 번만 쓰고 배경·행동·감정이 모두 들어가는지 확인하세요. 재생하면서 반복된 필러 하나를 지우고 그 자리에 구체적인 디테일을 넣는 과정을 반복하면, 불필요한 공백은 줄고 내 경험이 중심이 되는 영어 말하기가 만들어집니다.</p>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
