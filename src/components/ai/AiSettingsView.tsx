import { Info } from "lucide-react";
import type { LlmSettings, SttSettings } from "../../types";
import { Card } from "../ui/Card";
import { AiSettingsPanel } from "./AiSettingsPanel";
import { topLevelNavigation } from "../layout/topLevelNavigation";
import { PageIntro } from "../ui/PageIntro";

type AiSettingsViewProps = {
  settings: LlmSettings;
  onChange: (settings: LlmSettings) => void;
  sttSettings: SttSettings;
  onSttChange: (settings: SttSettings) => void;
  onSave: () => void;
};

export function AiSettingsView({
  settings,
  onChange,
  sttSettings,
  onSttChange,
  onSave,
}: AiSettingsViewProps) {
  return (
    <div className="space-y-6">
      <PageIntro
        description="브라우저에서 사내 API를 직접 호출합니다. API가 CORS 요청을 허용해야 하며, 설정되지 않아도 내장 질문과 훈련 기능은 계속 사용할 수 있습니다."
        icon={topLevelNavigation.aiSettings.icon}
        tag="AI 피드백 / STT 설정"
        title="내부 LLM 및 STT 서비스를 훈련 흐름에 연결합니다."
      />
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
