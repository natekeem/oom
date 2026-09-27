import { SttError } from "./errors";

interface SpeechRecognitionStatic {
  available?(options: { langs: string[]; processLocally: boolean }): Promise<string>;
  install?(options: { langs: string[]; processLocally: boolean }): Promise<void>;
  new (): SpeechRecognitionInstance;
}

interface SpeechRecognitionInstance {
  lang: string;
  processLocally?: boolean;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: unknown) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
}

export async function checkBrowserLocalSttStatus(lang = "en-US"): Promise<{
  supported: boolean;
  status: "available" | "downloadable" | "downloading" | "unavailable";
  reason?: string;
}> {
  if (typeof window === "undefined") {
    return { supported: false, status: "unavailable", reason: "브라우저 환경이 아닙니다." };
  }

  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionStatic;
    webkitSpeechRecognition?: SpeechRecognitionStatic;
  };

  const RecognitionClass = win.SpeechRecognition ?? win.webkitSpeechRecognition;
  if (!RecognitionClass) {
    return {
      supported: false,
      status: "unavailable",
      reason: "브라우저가 SpeechRecognition API를 지원하지 않습니다.",
    };
  }

  if (typeof RecognitionClass.available === "function") {
    try {
      const state = await RecognitionClass.available({ langs: [lang], processLocally: true });
      if (state === "available") {
        return { supported: true, status: "available" };
      }
      if (state === "downloadable" || state === "downloading") {
        return { supported: true, status: state };
      }
      return { supported: false, status: "unavailable", reason: "온디바이스 언어팩이 제공되지 않습니다." };
    } catch {
      return { supported: false, status: "unavailable", reason: "온디바이스 상태 확인 실패" };
    }
  }

  // Fallback: check if processLocally is a known property on the prototype
  if (RecognitionClass.prototype && "processLocally" in RecognitionClass.prototype) {
    return { supported: true, status: "available" };
  }

  return {
    supported: false,
    status: "unavailable",
    reason: "기기 내 처리(processLocally)를 지원하지 않는 브라우저입니다.",
  };
}

export async function installBrowserLocalLanguagePack(lang = "en-US"): Promise<void> {
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionStatic;
    webkitSpeechRecognition?: SpeechRecognitionStatic;
  };
  const RecognitionClass = win.SpeechRecognition ?? win.webkitSpeechRecognition;
  if (typeof RecognitionClass?.install === "function") {
    await RecognitionClass.install({ langs: [lang], processLocally: true });
  }
}

export async function executeBrowserLocalStt(
  blob?: Blob,
  mimeType?: string,
  signal?: AbortSignal
): Promise<string> {
  void blob;
  void mimeType;
  void signal;
  const check = await checkBrowserLocalSttStatus("en-US");
  if (!check.supported || check.status === "unavailable") {
    throw new SttError(
      "LOCAL_STT_UNAVAILABLE",
      "현재 브라우저는 녹음 오디오에 대한 온디바이스 음성 인식(processLocally)을 지원하지 않습니다. OOM 관리형 STT 또는 사용자 STT API를 이용해 주세요.",
      400
    );
  }

  if (check.status === "downloadable") {
    throw new SttError(
      "LOCAL_LANGUAGE_PACK_REQUIRED",
      "기기 내 음성 인식을 위한 브라우저 언어팩 설치가 필요합니다.",
      400
    );
  }

  // Web Speech API does not support transcribing pre-recorded audio blobs offline.
  throw new SttError(
    "LOCAL_STT_UNAVAILABLE",
    "브라우저 SpeechRecognition은 녹음된 파일의 사후 온디바이스 변환을 지원하지 않습니다. OOM 관리형 STT를 이용해 주세요.",
    400
  );
}

export { isLocalOnDeviceSttSupported } from "./providerResolver";

