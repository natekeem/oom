import { useEffect, useMemo, useState } from "react";
import { SystemVoicePanel } from "./components/SystemVoicePanel";
import { VoiceCard } from "./components/VoiceCard";
import { kokoroClient } from "./lib/kokoroClient";
import {
  EXAM_DEFAULT_TEXT,
  SCRIPT_DEFAULT_TEXT,
  STORAGE_KEYS,
  VOICE_CANDIDATES,
} from "./lib/voiceCandidates";
import type {
  GeneratedClip,
  LabMode,
  LoadState,
  WaveStyle,
} from "./lib/types";

const WAVE_LABELS: Record<WaveStyle, { title: string; detail: string }> = {
  studio: {
    title: "A · Studio Bars",
    detail: "가장 추천. 실제 파장을 미리 그리고 재생 영역만 왼쪽→오른쪽으로 채움.",
  },
  soft: {
    title: "B · Soft Wave",
    detail: "연속형 파형. 차분하고 일반적인 오디오 플레이어 느낌.",
  },
  voiceprint: {
    title: "C · Voice Print",
    detail: "촘촘한 얇은 막대. OOM의 signal/pulse 언어와 연결하기 쉬움.",
  },
};

function readRatings(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ratings) ?? "{}");
  } catch {
    return {};
  }
}

function App() {
  const [mode, setMode] = useState<LabMode>("exam");
  const [textByMode, setTextByMode] = useState<Record<LabMode, string>>({
    exam: EXAM_DEFAULT_TEXT,
    script: SCRIPT_DEFAULT_TEXT,
  });
  const [speed, setSpeed] = useState(0.98);
  const [waveStyle, setWaveStyle] = useState<WaveStyle>("studio");
  const [clips, setClips] = useState<Record<string, GeneratedClip>>({});
  const [generating, setGenerating] = useState<Set<string>>(new Set());
  const [loadState, setLoadState] = useState<LoadState>({
    status: "idle",
    progress: 0,
    detail: "첫 생성 시 Kokoro q8 모델을 로드합니다.",
  });
  const [ratings, setRatings] = useState<Record<string, number>>(readRatings);
  const [examVoice, setExamVoice] = useState(
    localStorage.getItem(STORAGE_KEYS.examVoice) ?? "af_heart",
  );
  const [scriptVoice, setScriptVoice] = useState(
    localStorage.getItem(STORAGE_KEYS.scriptVoice) ?? "af_bella",
  );

  useEffect(() => kokoroClient.subscribeLoad(setLoadState), []);

  const currentText = textByMode[mode];

  const orderedCandidates = useMemo(() => {
    const preferred = mode === "exam" ? examVoice : scriptVoice;
    return [...VOICE_CANDIDATES].sort((a, b) => {
      if (a.id === preferred) return -1;
      if (b.id === preferred) return 1;
      return 0;
    });
  }, [examVoice, mode, scriptVoice]);

  function clipKey(voiceId: string) {
    return [mode, voiceId, speed.toFixed(2), currentText].join("::");
  }

  async function generate(voiceId: string) {
    const key = clipKey(voiceId);
    setGenerating((prev) => new Set(prev).add(voiceId));

    try {
      const result = await kokoroClient.generate({
        text: currentText,
        voice: voiceId,
        speed,
      });

      setClips((prev) => ({
        ...prev,
        [key]: {
          key,
          voiceId,
          mode,
          speed,
          text: currentText,
          blob: result.blob,
          elapsedMs: result.elapsedMs,
          createdAt: Date.now(),
        },
      }));
    } catch (error) {
      alert(error instanceof Error ? error.message : String(error));
    } finally {
      setGenerating((prev) => {
        const next = new Set(prev);
        next.delete(voiceId);
        return next;
      });
    }
  }

  async function generateAll() {
    for (const candidate of VOICE_CANDIDATES) {
      // Sequential on purpose: avoids concurrent WASM inference pressure.
      await generate(candidate.id);
    }
  }

  function setRating(voiceId: string, value: number) {
    const key = `${mode}:${voiceId}`;
    setRatings((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEYS.ratings, JSON.stringify(next));
      return next;
    });
  }

  function chooseExam(id: string) {
    setExamVoice(id);
    localStorage.setItem(STORAGE_KEYS.examVoice, id);
  }

  function chooseScript(id: string) {
    setScriptVoice(id);
    localStorage.setItem(STORAGE_KEYS.scriptVoice, id);
  }

  const busy = generating.size > 0;

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="oom-mark" aria-hidden="true">
          <span />
        </div>
        <div className="hero-copy">
          <span className="section-kicker">OOM · DEV VOICE LAB</span>
          <h1>OPIc-like Voice + Waveform Lab</h1>
          <p>
            Kokoro-82M q8을 브라우저에서 직접 실행해 시험 질문 음성과 스크립트
            재생 음성을 고르고, 실제 생성된 오디오 파형 UI까지 함께 비교합니다.
          </p>
        </div>
        <div className="runtime-badge">
          <span className={`status-light is-${loadState.status}`} />
          <div>
            <b>{loadState.status === "ready" ? "LOCAL TTS READY" : "BROWSER LOCAL"}</b>
            <small>Kokoro q8 · WASM · 24 kHz</small>
          </div>
        </div>
      </header>

      <section className="control-deck">
        <div className="segmented">
          <button
            type="button"
            className={mode === "exam" ? "is-active" : ""}
            onClick={() => setMode("exam")}
          >
            시험 질문 음성
          </button>
          <button
            type="button"
            className={mode === "script" ? "is-active" : ""}
            onClick={() => setMode("script")}
          >
            스크립트 재생 음성
          </button>
        </div>

        <label>
          <span>말하기 속도</span>
          <select
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
          >
            {[0.9, 0.95, 0.98, 1, 1.05].map((value) => (
              <option key={value} value={value}>
                {value.toFixed(2)}×
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="primary-button"
          disabled={busy}
          onClick={generateAll}
        >
          {busy ? "순차 생성 중…" : "6개 후보 모두 생성"}
        </button>
      </section>

      <section className="model-status">
        <div className="progress-track">
          <span style={{ width: `${loadState.progress}%` }} />
        </div>
        <div className="status-copy">
          <b>
            {loadState.status === "idle"
              ? "모델 대기"
              : loadState.status === "loading"
                ? `모델 로딩 ${Math.round(loadState.progress)}%`
                : loadState.status === "ready"
                  ? "모델 캐시/준비 완료"
                  : "모델 로드 오류"}
          </b>
          <span>{loadState.detail}</span>
        </div>
      </section>

      <section className="text-panel">
        <div>
          <span className="section-kicker">
            {mode === "exam" ? "EXAM PROMPT" : "SCRIPT SAMPLE"}
          </span>
          <h2>
            {mode === "exam"
              ? "Ava-like interviewer tone을 비교하세요."
              : "AI 티가 덜 나는 자연스러운 학습용 음성을 비교하세요."}
          </h2>
        </div>
        <textarea
          value={currentText}
          onChange={(event) =>
            setTextByMode((prev) => ({ ...prev, [mode]: event.target.value }))
          }
          rows={4}
        />
      </section>

      <SystemVoicePanel text={currentText} />

      <section className="wave-style-panel">
        <div className="section-heading">
          <span className="section-kicker">PLAYER VISUAL</span>
          <h2>파형 스타일도 같이 골라보세요.</h2>
          <p>
            세 안 모두 실제 음성 amplitude로 waveform을 그리고, 재생 구간만
            왼쪽에서 오른쪽으로 채워집니다. 클릭/드래그 seek도 됩니다.
          </p>
        </div>
        <div className="wave-style-grid">
          {(Object.entries(WAVE_LABELS) as Array<
            [WaveStyle, { title: string; detail: string }]
          >).map(
            ([key, item]) => (
              <button
                key={key}
                type="button"
                className={waveStyle === key ? "wave-style is-active" : "wave-style"}
                onClick={() => setWaveStyle(key)}
              >
                <b>{item.title}</b>
                <span>{item.detail}</span>
                <div className={`mini-wave is-${key}`} aria-hidden="true">
                  {Array.from({ length: key === "voiceprint" ? 36 : 22 }).map(
                    (_, index) => (
                      <i
                        key={index}
                        style={{ height: `${22 + ((index * 29) % 64)}%` }}
                      />
                    ),
                  )}
                </div>
              </button>
            ),
          )}
        </div>
      </section>

      <section className="voice-section">
        <div className="section-heading">
          <span className="section-kicker">VOICE SHORTLIST</span>
          <h2>
            {mode === "exam" ? "시험용 후보" : "스크립트용 후보"} · 직접 듣고 선택
          </h2>
          <p>
            Kokoro의 공식 품질 grade는 참고값일 뿐입니다. Ava와의 유사도나
            학습용 자연스러움은 직접 귀로 평가하세요.
          </p>
        </div>

        <div className="voice-grid">
          {orderedCandidates.map((candidate) => {
            const key = clipKey(candidate.id);
            return (
              <VoiceCard
                key={candidate.id}
                candidate={candidate}
                mode={mode}
                clip={clips[key]}
                waveStyle={waveStyle}
                loading={generating.has(candidate.id)}
                rating={ratings[`${mode}:${candidate.id}`] ?? 0}
                selectedExam={candidate.id === examVoice}
                selectedScript={candidate.id === scriptVoice}
                onGenerate={() => generate(candidate.id)}
                onRate={(score) => setRating(candidate.id, score)}
                onPickExam={() => chooseExam(candidate.id)}
                onPickScript={() => chooseScript(candidate.id)}
              />
            );
          })}
        </div>
      </section>

      <section className="decision-panel">
        <div>
          <span className="section-kicker">CURRENT PICKS</span>
          <h2>선택 결과</h2>
        </div>
        <div className="decision-grid">
          <div>
            <small>EXAM / INTERVIEWER</small>
            <strong>{examVoice}</strong>
          </div>
          <div>
            <small>SCRIPT / NATURAL</small>
            <strong>{scriptVoice}</strong>
          </div>
          <div>
            <small>WAVEFORM</small>
            <strong>{WAVE_LABELS[waveStyle].title}</strong>
          </div>
        </div>
      </section>

      <section className="research-panel">
        <div className="section-heading">
          <span className="section-kicker">IMPLEMENTATION RESEARCH</span>
          <h2>Waveform 라이브러리 후보</h2>
        </div>
        <div className="research-grid">
          <article className="research-card is-recommended">
            <b>WaveSurfer.js v7</b>
            <span>이번 Dev Lab에 실제 적용</span>
            <p>
              waveform + played/progress color + seek + bars를 간단히 구현할 수
              있어 OOM 재생바에 가장 적합합니다.
            </p>
            <a href="https://wavesurfer.xyz/" target="_blank" rel="noreferrer">
              공식 문서 ↗
            </a>
          </article>
          <article className="research-card">
            <b>Peaks.js</b>
            <span>고급 편집/마커용 후보</span>
            <p>
              zoom, marker, segment annotation까지 강력하지만 OOM의 단순 재생
              UI에는 기능이 과합니다.
            </p>
            <a
              href="https://github.com/bbc/peaks.js"
              target="_blank"
              rel="noreferrer"
            >
              프로젝트 ↗
            </a>
          </article>
          <article className="research-card">
            <b>Custom Web Audio + Canvas</b>
            <span>dependency 0</span>
            <p>
              완전한 OOM 전용 스타일을 만들 수 있지만 seek, resize, decoding,
              accessibility를 직접 관리해야 합니다.
            </p>
          </article>
        </div>
      </section>

      <section className="future-panel">
        <span className="section-kicker">BACKEND-READY</span>
        <h2>지금은 브라우저 로컬, 나중에는 사내 서버 로컬.</h2>
        <p>
          이 Lab은 q8/WASM으로 브라우저에서 완결됩니다. 사내 백엔드가 생기면
          동일 Kokoro 모델을 서버에 고정하고 voice blend, 사전 생성/cache,
          OpenAI-compatible TTS endpoint를 붙이는 구조로 이동할 수 있습니다.
          실제 OPIc/Ava 음원의 무단 추출·복제는 이 Lab에 포함하지 않습니다.
        </p>
      </section>

      <footer>
        <b>OOM Voice Lab</b>
        <span>
          첫 실행은 Kokoro 모델 다운로드가 필요합니다. 합성 자체는 브라우저
          내부에서 실행됩니다.
        </span>
      </footer>
    </main>
  );
}

export default App;
