export function isSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function getPreferredVoice() {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en-us")) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en-gb")) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en"))
  );
}

export function stopSpeech() {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}

export type SpeechCallbacks = {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: SpeechSynthesisErrorEvent) => void;
};

export function speakText(text: string, rate: number, callbacks?: SpeechCallbacks) {
  if (!isSpeechSupported()) {
    throw new Error("이 브라우저는 음성 읽기 기능을 지원하지 않습니다.");
  }

  stopSpeech();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = getPreferredVoice();
  utterance.lang = voice?.lang ?? "en-US";
  utterance.voice = voice ?? null;
  utterance.rate = rate;
  utterance.onstart = () => callbacks?.onStart?.();
  utterance.onend = () => callbacks?.onEnd?.();
  utterance.onerror = (event) => callbacks?.onError?.(event);
  window.speechSynthesis.speak(utterance);
  return utterance;
}
