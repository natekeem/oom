import { useEffect, useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import type { SttSettings } from "../../types";
import { checkBrowserLocalSttStatus, installBrowserLocalLanguagePack, isLocalOnDeviceSttSupported } from "./browserLocalSttProvider";

interface BrowserLocalSttCardProps {
  sttSettings: SttSettings;
  onChange: (settings: SttSettings) => void;
}

export function BrowserLocalSttCard({ sttSettings, onChange }: BrowserLocalSttCardProps) {
  const [supported] = useState(() => isLocalOnDeviceSttSupported());
  const [status, setStatus] = useState<string>(() => (isLocalOnDeviceSttSupported() ? "checking" : "unavailable"));
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (!supported) {
      return;
    }
    let cancelled = false;
    void checkBrowserLocalSttStatus("en-US").then((res) => {
      if (!cancelled) {
        setStatus(res.status);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [supported]);

  const handleToggle = (checked: boolean) => {
    onChange({ ...sttSettings, preferLocalOnDevice: checked });
  };

  const handleInstall = async () => {
    setInstalling(true);
    try {
      await installBrowserLocalLanguagePack("en-US");
      const res = await checkBrowserLocalSttStatus("en-US");
      setStatus(res.status);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <Card className="space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">기기 내 음성 인식 (선택 사항)</h2>
          <p className="text-xs text-zinc-500">브라우저 온디바이스 처리 (processLocally)</p>
        </div>
        <Badge tone={supported ? "emerald" : "default"}>
          {supported ? "기기 지원" : "미지원"}
        </Badge>
      </div>

      <div className="space-y-3">
        <label className={`flex items-start gap-3 select-none ${supported ? "cursor-pointer" : "opacity-60 cursor-not-allowed"}`}>
          <input
            checked={Boolean(sttSettings.preferLocalOnDevice && supported)}
            className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950"
            disabled={!supported}
            onChange={(e) => handleToggle(e.target.checked)}
            type="checkbox"
          />
          <div className="space-y-1">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              가능한 경우 이 기기에서 음성 인식
            </span>
            <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              지원되는 브라우저에서는 음성을 이 기기에서 처리합니다. 브라우저 언어팩 설치가 필요할 수 있습니다.
            </p>
          </div>
        </label>

        {!supported ? (
          <p className="text-xs leading-5 text-amber-700 dark:text-amber-400">
            현재 브라우저에서는 온디바이스 음성 인식(processLocally)을 지원하지 않습니다. OOM 관리형 STT 또는 사용자 지정 STT가 사용됩니다.
          </p>
        ) : status === "downloadable" ? (
          <div className="flex items-center gap-3 rounded-md bg-zinc-50 p-3 text-xs dark:bg-zinc-900">
            <span>영어(en-US) 언어팩 다운로드가 필요합니다.</span>
            <button
              className="font-bold text-indigo-600 underline hover:text-indigo-500"
              disabled={installing}
              onClick={() => void handleInstall()}
              type="button"
            >
              {installing ? "설치 중..." : "언어팩 설치"}
            </button>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
