import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LandingNav } from "./components/LandingNav";
import { PointerSignalTrail } from "./components/PointerSignalTrail";
import { useLandingCapabilities } from "./hooks/useLandingCapabilities";
import { useLandingLenis } from "./hooks/useLandingLenis";
import { useLandingPointerInteractions } from "./hooks/useLandingPointerInteractions";
import { useLandingScrollTimeline } from "./hooks/useLandingScrollTimeline";
import { TRAINING_LEVELS } from "../training/levels";
import "./landing.css";

const VoiceUniverseCanvas = lazy(() => import("./three/VoiceUniverseCanvas").then((module) => ({ default: module.VoiceUniverseCanvas })));
const LandingPracticePreview = lazy(() => import("./components/LandingPracticePreview").then((module) => ({ default: module.LandingPracticePreview })));

const levelMeta = {
  foundation: { label: "Foundation", density: "핵심 장면을 짧고 분명하게" },
  intermediate: { label: "Intermediate", density: "행동과 이유를 자연스럽게 연결" },
  advanced: { label: "Advanced", density: "변화와 관점까지 유연하게 확장" },
};

const levels = [...TRAINING_LEVELS].reverse().map((level) => ({
  band: level.displayName,
  grade: level.targetLabel,
  label: levelMeta[level.id].label,
  time: `${level.targetSeconds[0]}~${level.targetSeconds[1]}초`,
  density: levelMeta[level.id].density,
}));

const steps = [
  ["01", "목표 · 코스", "내가 말할 장면을 정합니다."],
  ["02", "추천 서베이", "이야기가 이어질 선택을 익힙니다."],
  ["03", "난이도", "목표 발화 밀도를 맞춥니다."],
  ["04", "만능 스크립트", "같은 story를 질문에 맞춰 바꿉니다."],
  ["05", "롤플레이", "필요한 말하기 기능을 골라 씁니다."],
  ["06", "실전 연습", "듣고 말한 뒤 복기하고 재도전합니다."],
];

const factStates = [
  ["KEEP", "장소와 사람", "같은 story의 중심은 유지"],
  ["CHANGE", "첫 답변 방향", "질문 의도에 맞게 전환"],
  ["REQUIRED", "필수 장면", "이번 질문에 필요한 fact 승격"],
  ["DROP", "불필요한 확장", "시간과 초점을 위해 덜어냄"],
];

const aiCoachFeatures = [
  ["01", "답변 분석", "Transcript를 기준으로 질문 대응, 구조, 시제·구체성을 확인합니다."],
  ["02", "KEEP / FIX / RETRY", "이번 답변에서 유지할 것, 고칠 것, 다음 재시도 미션을 정리합니다."],
  ["03", "스크립트 · 질문 Assist", "스크립트 변형, 표현 보조, 롤플레이 질문 생성에 AI를 활용합니다."],
  ["04", "계속 확장되는 AI", "OOM의 AI 학습 보조 기능은 앞으로 단계적으로 확장됩니다."],
];

export function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [canvasFailed, setCanvasFailed] = useState(false);
  const { coarsePointer, finePointer, quality, reducedMotion, webglSupported } = useLandingCapabilities();
  const motionEnabled = !reducedMotion;
  const smoothScrollEnabled = motionEnabled && finePointer && !coarsePointer;
  const pointerEnabled = motionEnabled && finePointer && !coarsePointer && quality !== "low";

  useLandingLenis(smoothScrollEnabled);
  useLandingScrollTimeline(rootRef, motionEnabled);
  useLandingPointerInteractions(rootRef, pointerEnabled);

  useEffect(() => {
    document.documentElement.classList.add("landing-active");
    return () => document.documentElement.classList.remove("landing-active");
  }, []);

  return (
    <div
      className="landing-page"
      data-landing-quality={quality}
      data-canvas-ready={canvasReady ? "true" : "false"}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      ref={rootRef}
    >
      <a className="landing-skip-link" href="#landing-main">본문으로 건너뛰기</a>
      <LandingNav />

      <Suspense fallback={null}>
        <VoiceUniverseCanvas
          enabled={webglSupported && !reducedMotion && !canvasFailed}
          onFail={() => { setCanvasFailed(true); setCanvasReady(false); }}
          onReady={() => setCanvasReady(true)}
          quality={quality}
        />
      </Suspense>
      <PointerSignalTrail enabled={pointerEnabled} quality={quality} />

      <div aria-hidden="true" className="landing-static-field">
        <div className="landing-static-orbit landing-static-orbit-a" />
        <div className="landing-static-orbit landing-static-orbit-b" />
        <div className="landing-static-o"><span>O</span></div>
      </div>
      <div aria-hidden="true" className="landing-noise" />
      <div aria-hidden="true" className="landing-vignette" />

      <main id="landing-main">
        <section aria-labelledby="landing-hero-title" className="landing-section landing-hero" data-landing-scene="hero">
          <div className="landing-hero-copy">
            <p className="landing-eyebrow">VOICE · STORY · PRACTICE</p>
            <h1 id="landing-hero-title">OPIc,<br /><span>ON ME.</span></h1>
            <p className="landing-hero-support">
              <strong>외울 건 줄이고, 바꿔 말할 건 정해두고.</strong>
              <span>OOM은 적은 수의 기본 스크립트를 익힌 뒤,<br className="landing-hero-detail-break" /> 질문에 맞게 필요한 부분만 바꿔 답하는 OPIc 훈련 도구입니다.</span>
            </p>
            <div className="landing-actions">
              <Link className="landing-button landing-button-primary" data-magnetic to="/training/">실전 훈련 둘러보기 <span aria-hidden="true">↗</span></Link>
              <Link className="landing-button landing-button-secondary" data-magnetic to="/exam-guide/">OPIc 수험 가이드 <span aria-hidden="true">→</span></Link>
            </div>
          </div>
          <p aria-hidden="true" className="landing-scroll-cue"><span /> SCROLL TO SHAPE YOUR VOICE</p>
        </section>

        <section aria-labelledby="story-title" className="landing-section landing-story" id="story" data-landing-scene="story">
          <div className="landing-copy landing-copy-left landing-copy-scrim">
            <p className="landing-kicker"><span>01</span> ONE STORY · MANY DIRECTIONS</p>
            <h2 className="landing-korean-heading" id="story-title">
              <span className="landing-heading-line">적게 준비하고,</span>
              <span className="landing-heading-line landing-outline">여러 질문에 돌려씁니다.</span>
            </h2>
            <p className="landing-description">
              <span className="landing-description-line">질문마다 새로운 답안을 외우지 않습니다.</span>
              <span className="landing-description-line">같은 장면에서 필요한 fact를 꺼내고, 질문의 방향만 바꿉니다.</span>
            </p>
          </div>
          <div aria-hidden="true" className="landing-story-map">
            <span className="landing-story-origin">BASE SCENE</span>
            <div className="landing-story-branch branch-a"><i />묘사</div>
            <div className="landing-story-branch branch-b"><i />루틴</div>
            <div className="landing-story-branch branch-c"><i />경험</div>
            <div className="landing-story-branch branch-d"><i />비교</div>
          </div>
        </section>

        <section aria-labelledby="levels-title" className="landing-section landing-levels" id="levels" data-landing-scene="levels">
          <div className="landing-copy landing-copy-scrim">
            <p className="landing-kicker"><span>02</span> SAME SCENE · THREE LEVELS</p>
            <h2 className="landing-korean-heading" id="levels-title">
              <span className="landing-heading-line">같은 스크립트도</span>
              <span className="landing-heading-line landing-outline">목표에 맞게 밀도를 바꿉니다.</span>
            </h2>
            <p className="landing-description">
              <span className="landing-description-line">Course가 이야기의 맥락을 정하고,</span>
              <span className="landing-description-line">Level이 같은 장면의 길이와 답변 밀도를 조절합니다.</span>
            </p>
          </div>
          <div className="landing-level-list">
            {levels.map((level, index) => (
              <article className="landing-level" key={level.band}>
                <span className="landing-level-index">0{index + 1}</span>
                <div><strong>{level.band}</strong><p>{level.grade}</p></div>
                <div className="landing-level-meta"><span>{level.label}</span><span>{level.time}</span></div>
                <p className="landing-level-density">{level.density}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="journey-title" className="landing-section landing-journey" id="journey" data-landing-scene="journey">
          <div className="landing-copy landing-copy-centered landing-copy-scrim">
            <p className="landing-kicker"><span>03</span> TRAINING JOURNEY</p>
            <h2 id="journey-title">SIX STEPS.<br /><span className="landing-outline">ONE VOICE.</span></h2>
          </div>
          <ol className="landing-step-list">
            {steps.map(([number, title, description]) => (
              <li key={number}>
                <span className="landing-step-pulse" />
                <span className="landing-step-number">{number}</span>
                <strong>{title}</strong>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="pivot-title" className="landing-section landing-pivot" id="pivot" data-landing-scene="pivot">
          <div className="landing-copy landing-copy-left landing-copy-scrim">
            <p className="landing-kicker"><span>04</span> QUESTION PIVOT · STEP 4</p>
            <h2 className="landing-korean-heading" id="pivot-title">
              <span className="landing-heading-line">질문이 틀어져도</span>
              <span className="landing-heading-line landing-outline">처음부터 다시 외우지 않습니다.</span>
            </h2>
          </div>
          <div className="landing-pivot-demo">
            <div className="landing-question landing-question-base"><span>BASE QUESTION</span><p>Tell me about a place you often visit.</p></div>
            <div aria-hidden="true" className="landing-pivot-arrow"><b>↓</b><span>질문 방향 변경</span></div>
            <div className="landing-question landing-question-pivot"><span>변형 질문</span><p>Tell me about a memorable change there.</p></div>
            <div className="landing-fact-grid">
              {factStates.map(([state, fact, note]) => (
                <div className={`landing-fact landing-fact-${state.toLowerCase()}`} key={state}>
                  <span>{state}</span><strong>{fact}</strong><p>{note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="exam-title" className="landing-section landing-exam" id="practice" data-landing-scene="practice">
          <div aria-hidden="true" className="landing-rec-handoff"><span>REC</span></div>
          <div className="landing-copy landing-copy-centered landing-copy-scrim">
            <p className="landing-kicker"><span>05</span> SPEAK · REVIEW · RETRY</p>
            <h2 className="landing-korean-heading" id="exam-title">
              <span className="landing-heading-line">말하고, 확인하고,</span>
              <span className="landing-heading-line landing-outline">한 번만 고쳐 다시 말합니다.</span>
            </h2>
            <p className="landing-description landing-practice-description">질문을 듣고 답한 뒤, 내 목소리를 확인하고 AI 피드백을 받아 같은 질문에 한 번 더 답합니다.</p>
          </div>
          <div className="landing-practice-frame">
            <Suspense fallback={<div aria-hidden="true" className="landing-practice-placeholder" />}>
              <LandingPracticePreview />
            </Suspense>
          </div>
        </section>

        <section aria-labelledby="ai-title" className="landing-section landing-ai" id="ai" data-landing-scene="ai">
          <div className="landing-copy landing-copy-centered landing-copy-scrim">
            <p className="landing-kicker"><span>06</span> VOICE SIGNAL · AI ASSIST</p>
            <h2 id="ai-title">AI <span className="landing-outline">COACH</span></h2>
            <p className="landing-ai-lead">혼자 연습해도,<br />무엇을 고칠지는 혼자 찾지 않아도 됩니다.</p>
          </div>
          <div className="landing-ai-panel">
            <div aria-hidden="true" className="landing-ai-visual">
              <div className="landing-ai-wave">
                {Array.from({ length: 18 }, (_, index) => <span className={`bar-${index % 6}`} key={index} />)}
              </div>
              <div className="landing-ai-transcript"><span>TRANSCRIPT</span><i /><i /><i /></div>
              <div className="landing-ai-signal"><span>VOICE</span><b>→</b><span>ANALYZE</span><b>→</b><span>NEXT TRY</span></div>
              <div className="landing-ai-outcomes"><span>KEEP</span><span>FIX</span><span>RETRY</span></div>
            </div>
            <ol className="landing-ai-feature-list">
              {aiCoachFeatures.map(([number, title, description]) => (
                <li key={number}><span>{number}</span><div><strong>{title}</strong><p>{description}</p></div></li>
              ))}
            </ol>
            <p className="landing-ai-disclaimer">AI 피드백은 공식 OPIc 점수·등급 판정이 아닙니다.</p>
          </div>
          <nav aria-label="오픽온미 주요 서비스" className="landing-editorial-links">
            <Link data-magnetic to="/exam-guide/"><span>01 · GUIDE</span><strong>수험 가이드</strong><p>시험 구조부터 신청, 시험 당일, 결과 확인까지.</p><i aria-hidden="true">↗</i></Link>
            <Link data-magnetic to="/training/"><span>02 · TRAINING</span><strong>실전 훈련</strong><p>Course × Level로 이어지는 6 STEP 말하기 루프.</p><i aria-hidden="true">↗</i></Link>
            <Link data-magnetic to="/magazine/"><span>03 · MAGAZINE</span><strong>OOM Magazine</strong><p>말하기 전략과 연습법을 깊이 읽는 editorial archive.</p><i aria-hidden="true">↗</i></Link>
          </nav>
        </section>

        <section aria-labelledby="final-title" className="landing-section landing-final" data-landing-scene="final">
          <div className="landing-final-ring" aria-hidden="true"><span>O</span></div>
          <div className="landing-copy landing-copy-centered landing-copy-scrim">
            <p className="landing-kicker"><span>07</span> START WITH YOUR VOICE</p>
            <h2 id="final-title">PREP LESS.<br /><span className="landing-outline">PRACTICE MORE.</span></h2>
            <p className="landing-description landing-final-description">
              <strong>외울 건 줄이고, 실전은 더 많이.</strong>
              <span>기본 스크립트를 익히고,<br />질문에 맞게 바꾸고,<br />직접 말해보세요.</span>
            </p>
            <div className="landing-actions">
              <Link className="landing-button landing-button-primary" data-magnetic to="/training/">실전 훈련 둘러보기 <span aria-hidden="true">↗</span></Link>
              <Link className="landing-button landing-button-secondary" data-magnetic to="/exam-guide/">수험 가이드 보기 <span aria-hidden="true">→</span></Link>
            </div>
          </div>
          <div className="landing-colophon"><span>OOM · OPIc ON ME</span><span>VOICE → STORY → PRACTICE</span></div>
        </section>
      </main>
    </div>
  );
}
