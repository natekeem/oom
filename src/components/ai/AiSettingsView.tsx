import { Info } from "lucide-react";
import type { LlmSettings, SttSettings } from "../../types";
import { Card } from "../ui/Card";
import { AiSettingsPanel } from "./AiSettingsPanel";
import { topLevelNavigation } from "../layout/topLevelNavigation";
import { PageIntro } from "../ui/PageIntro";
import { ManagedAiSettings } from "../../features/managed-ai/ManagedFeedback";
import { getAiConnection, hasCustomAiConfiguration } from "../../features/ai/providerResolver";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

type AiSettingsViewProps = {
  settings: LlmSettings;
  onChange: (settings: LlmSettings) => void;
  sttSettings: SttSettings;
  onSttChange: (settings: SttSettings) => void;
  onSave: () => void;
  onClearCustom: () => void;
};

export function AiSettingsView({
  settings,
  onChange,
  sttSettings,
  onSttChange,
  onSave,
  onClearCustom,
}: AiSettingsViewProps) {
  const connection = getAiConnection(settings);
  const customConfigured = hasCustomAiConfiguration(settings);
  return (
    <div className="space-y-6">
      <PageIntro
        description="답변을 돌아보고, 다음 연습에서 바꿀 한 가지를 찾아보세요. AI 이용 여부와 관계없이 모든 기본 훈련을 계속할 수 있습니다."
        icon={topLevelNavigation.aiSettings.icon}
        tag="AI 피드백 / STT 설정"
        title="내 답변에서 시작하는 AI 코칭"
      />
      <Card className="space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-zinc-500">현재 AI 연결</p>
            <p className="mt-1 text-base font-bold">{connection.label}</p>
          </div>
          <Badge tone={connection.source === "custom" ? "amber" : "indigo"}>{connection.detail}</Badge>
        </div>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          {customConfigured
            ? "저장한 Endpoint가 OOM의 모든 LLM 기능에서 관리형 AI보다 우선합니다. 요청 실패 시 다른 제공자로 자동 전환하지 않습니다."
            : "사용자 API 설정이 없으므로 로그인 후 OOM에서 제공하는 관리형 AI를 사용합니다."}
        </p>
        {customConfigured ? <Button size="sm" variant="secondary" onClick={onClearCustom}>사용자 API 설정 해제</Button> : null}
      </Card>
      <ManagedAiSettings />
      <details open={customConfigured} className="space-y-5">
      <summary className="cursor-pointer text-sm font-semibold text-zinc-900 dark:text-white">고급 사용자 설정 · 직접 연결한 STT / LLM</summary>
      <AiSettingsPanel
        onChange={onChange}
        onSave={onSave}
        onSttChange={onSttChange}
        settings={settings}
        sttSettings={sttSettings}
      />
      <section className="grid gap-5 lg:grid-cols-3">
        <Feature
          text="원래 주제와 핵심 명사를 유지한 채 자연스러운 표현으로 다시 말해 봅니다."
          title="스크립트 변형"
        />
        <Feature
          text="발화량, 시제, 구체성, 질문 대응력을 레벨 기준에 맞춰 한국어로 점검합니다."
          title="답변 피드백"
        />
        <Feature
          text="녹음 종료 시 Whisper 호환 STT를 통해 답변 텍스트를 자동으로 생성합니다."
          title="음성 자동 변환 (STT)"
        />
      </section>
      </details>
      <Card className="border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950">
        <div className="flex gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm leading-6 text-amber-800 dark:text-amber-200">
            AI 피드백 및 STT 변환은 연습을 돕는 참고 기능이며 실제 OPIc 점수나 공식 평가를 보장하지 않습니다. 응답에 개인 정보나 회사 기밀을 입력하지 마세요.
          </p>
        </div>
      </Card>
    </div>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <Card className="p-5">
      <p className="text-sm font-bold text-zinc-900 dark:text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{text}</p>
    </Card>
  );
}
