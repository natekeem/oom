import { useEffect, useMemo, useState } from "react";

type Props = {
  text: string;
};

export function SystemVoicePanel({ text }: Props) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceUri, setVoiceUri] = useState("");

  useEffect(() => {
    const loadVoices = () => {
      const all = speechSynthesis.getVoices();
      const english = all.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
      setVoices(english);
      if (!voiceUri && english[0]) setVoiceUri(english[0].voiceURI);
    };

    loadVoices();
    speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, [voiceUri]);

  const selected = useMemo(
    () => voices.find((voice) => voice.voiceURI === voiceUri),
    [voiceUri, voices],
  );

  function play() {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selected?.lang ?? "en-US";
    if (selected) utterance.voice = selected;
    utterance.rate = 1;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  }

  return (
    <section className="system-panel">
      <div>
        <span className="section-kicker">CURRENT BASELINE</span>
        <h2>브라우저 시스템 TTS와 비교</h2>
        <p>
          Web Speech API는 OS/브라우저마다 음성이 달라집니다. Kokoro 후보와 직접
          비교하기 위한 기준선입니다.
        </p>
      </div>
      <div className="system-controls">
        <select
          value={voiceUri}
          onChange={(event) => setVoiceUri(event.target.value)}
        >
          {voices.map((voice) => (
            <option key={voice.voiceURI} value={voice.voiceURI}>
              {voice.name} · {voice.lang}
            </option>
          ))}
        </select>
        <button type="button" className="secondary-button" onClick={play}>
          시스템 음성 재생
        </button>
      </div>
    </section>
  );
}
