import { AudioLines, KeyRound, Save, ShieldCheck } from "lucide-react";
import type { ChangeEvent } from "react";
import type { LlmSettings, SttSettings } from "../../types";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

type AiSettingsPanelProps = {
  settings: LlmSettings;
  onChange: (settings: LlmSettings) => void;
  sttSettings: SttSettings;
  onSttChange: (settings: SttSettings) => void;
  onSave: () => void;
};

export function AiSettingsPanel({
  settings,
  onChange,
  sttSettings,
  onSttChange,
  onSave,
}: AiSettingsPanelProps) {
  const updateLlm = (key: keyof LlmSettings, value: string) =>
    onChange({ ...settings, [key]: value });
  const handleLlmMode = (event: ChangeEvent<HTMLSelectElement>) =>
    updateLlm("mode", event.target.value);

  const updateStt = (key: keyof SttSettings, value: string | boolean) =>
    onSttChange({ ...sttSettings, [key]: value });

  return (
    <div className="space-y-6">
      {/* LLM Settings Card */}
      <Card className="p-5 sm:p-6">
        <div className="flex gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
            <KeyRound className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              내부 LLM 연결 설정 (평가/피드백)
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              이 정보는 현재 브라우저의 localStorage에만 저장됩니다. 공유 PC에서는 사용 후 삭제하세요.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field label="API Endpoint URL">
            <input
              autoComplete="url"
              className="input"
              onChange={(event) => updateLlm("endpoint", event.target.value)}
              placeholder="https://internal.example.com/v1/chat/completions"
              type="url"
              value={settings.endpoint}
            />
          </Field>
          <Field label="Model Name">
            <input
              className="input"
              onChange={(event) => updateLlm("model", event.target.value)}
              placeholder="internal-chat-model"
              type="text"
              value={settings.model ?? ""}
            />
          </Field>
          <Field label="API Key 또는 Authorization Token">
            <input
              autoComplete="off"
              className="input"
              onChange={(event) => updateLlm("apiKey", event.target.value)}
              placeholder="브라우저에만 저장됩니다"
              type="password"
              value={settings.apiKey ?? ""}
            />
          </Field>
          <Field label="Authorization Header">
            <select
              className="input"
              onChange={(event) =>
                updateLlm("authType", event.target.value as LlmSettings["authType"])
              }
              value={settings.authType}
            >
              <option value="bearer">Bearer token</option>
              <option value="x-api-key">x-api-key</option>
              <option value="none">No auth</option>
            </select>
          </Field>
          <Field label="Request Body Template">
            <select className="input" onChange={handleLlmMode} value={settings.mode}>
              <option value="openai-compatible">OpenAI-compatible</option>
              <option value="generic">Generic chat messages</option>
              <option value="custom">Custom JSON</option>
            </select>
          </Field>
        </div>
        {settings.mode === "custom" ? (
          <Field className="mt-5" label="Custom JSON Body">
            <textarea
              className="input min-h-36 resize-y font-mono text-xs"
              onChange={(event) => updateLlm("customBodyTemplate", event.target.value)}
              placeholder={'{"model":{model},"messages":{messages},"temperature":0.4}'}
              value={settings.customBodyTemplate ?? ""}
            />
            <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              사용 가능한 토큰: <code>{"{model}"}</code>, <code>{"{messages}"}</code>,{" "}
              <code>{"{system}"}</code>, <code>{"{user}"}</code>. JSON 값으로 자동 치환되므로 토큰 주위에 따옴표를 넣지 마세요.
            </p>
          </Field>
        ) : null}
      </Card>

      {/* STT Settings Card */}
      <Card className="p-5 sm:p-6">
        <div className="flex gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
            <AudioLines className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              음성 인식 (STT) 연결 설정 (선택)
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              녹음 완료 시 음성을 텍스트로 자동 변환합니다. Whisper 호환 multipart/form-data 엔드포인트를 지원합니다.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field label="STT API Endpoint URL">
            <input
              autoComplete="url"
              className="input"
              onChange={(event) => updateStt("endpoint", event.target.value)}
              placeholder="https://internal.example.com/v1/audio/transcriptions"
              type="url"
              value={sttSettings.endpoint}
            />
          </Field>
          <Field label="STT Model Name (서버 요구 시)">
            <input
              className="input"
              onChange={(event) => updateStt("model", event.target.value)}
              placeholder="whisper-1 (호환 서버에 따라 필요)"
              type="text"
              value={sttSettings.model ?? ""}
            />
            <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              사용하는 STT 서비스에 따라 모델명이 필요할 수 있습니다. 예: <code>whisper-1</code> 또는 해당 서비스에서 지정한 모델명. 미입력 시 모델 파라미터를 생략합니다.
            </p>
          </Field>
          <Field label="STT API Key">
            <input
              autoComplete="off"
              className="input"
              onChange={(event) => updateStt("apiKey", event.target.value)}
              placeholder="STT 전용 API Key (미입력 시 인증 없음)"
              type="password"
              value={sttSettings.apiKey ?? ""}
            />
          </Field>
          <Field label="STT Authorization Header">
            <select
              className="input"
              onChange={(event) =>
                updateStt("authType", event.target.value as SttSettings["authType"])
              }
              value={sttSettings.authType}
            >
              <option value="bearer">Bearer token</option>
              <option value="x-api-key">x-api-key</option>
              <option value="none">No auth</option>
            </select>
          </Field>
        </div>

        <div className="mt-5">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              checked={sttSettings.autoTranscribe}
              className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950"
              onChange={(event) => updateStt("autoTranscribe", event.target.checked)}
              type="checkbox"
            />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              녹음 종료 시 자동으로 STT 변환 실행
            </span>
          </label>
          <p className="mt-1 ml-7 text-xs text-zinc-500 dark:text-zinc-400">
            비활성화 시 녹음은 재생만 가능하며 답변 텍스트를 직접 입력할 수 있습니다.
          </p>
        </div>

        <div className="mt-6 flex flex-col justify-between gap-3 border-t border-zinc-100 pt-5 dark:border-zinc-800 sm:flex-row sm:items-center">
          <div className="flex items-start gap-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            STT 설정 및 녹음 파일은 사용자가 지정한 엔드포인트로만 전송됩니다.
          </div>
          <Button onClick={onSave}>
            <Save className="h-4 w-4" />
            설정 저장하기
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200">{label}</span>
      {children}
    </label>
  );
}
