import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LandingNav } from "./components/LandingNav";
import { PointerSignalTrail } from "./components/PointerSignalTrail";
import { useLandingCapabilities } from "./hooks/useLandingCapabilities";
import { useLandingLenis } from "./hooks/useLandingLenis";
import { useLandingPointerInteractions } from "./hooks/useLandingPointerInteractions";
import { useLandingScrollTimeline } from "./hooks/useLandingScrollTimeline";
import "./landing.css";

const VoiceUniverseCanvas = lazy(() => import("./three/VoiceUniverseCanvas").then((module) => ({ default: module.VoiceUniverseCanvas })));

const levels = [
  { band: "3구간", grade: "IM2 / IM1", label: "Foundation", time: "30–45초", density: "핵심 장면을 짧고 분명하게" },
  { band: "2구간", grade: "IH / IM3", label: "Intermediate", time: "45–65초", density: "행동과 이유를 자연스럽게 연결" },
  { band: "1구간", grade: "AL", label: "Advanced", time: "60–90초", density: "변화와 관점까지 유연하게 확장" },
];

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
            <p className="landing-hero-support">내 이야기를 여러 질문에 맞게<br className="landing-mobile-break" /> 바꾸어 말하는 훈련.</p>
            <div className="landing-actions">
              <Link className="landing-button landing-button-primary" data-magnetic to="/training/">실전 훈련 둘러보기 <span aria-hidden="true">↗</span></Link>
              <Link className="landing-button landing-button-secondary" data-magnetic to="/exam-guide/">OPIc 수험 가이드 <span aria-hidden="true">→</span></Link>
            </div>
          </div>
          <p aria-hidden="true" className="landing-scroll-cue"><span /> SCROLL TO SHAPE YOUR VOICE</p>
        </section>

        <section aria-labelledby="story-title" className="landing-section landing-story" id="story" data-landing-scene="story">
          <div className="landing-copy landing-copy-left">
            <p className="landing-kicker"><span>01</span> ONE STORY · MANY DIRECTIONS</p>
            <h2 id="story-title">ONE STORY.<br /><span>MANY QUESTIONS.</span></h2>
            <p className="landing-description">질문마다 새로운 답안을 외우지 않습니다. 같은 장면에서 필요한 fact를 꺼내고, 질문의 방향만 바꿉니다.</p>
          </div>
          <div aria-hidden="true" className="landing-story-map">
            <span className="landing-story-origin">MY STORY</span>
            <div className="landing-story-branch branch-a"><i />묘사</div>
            <div className="landing-story-branch branch-b"><i />루틴</div>
            <div className="landing-story-branch branch-c"><i />경험</div>
            <div className="landing-story-branch branch-d"><i />비교</div>
          </div>
        </section>

        <section aria-labelledby="levels-title" className="landing-section landing-levels" id="levels" data-landing-scene="levels">
          <div className="landing-copy">
            <p className="landing-kicker"><span>02</span> SAME SCENE · THREE LEVELS</p>
            <h2 id="levels-title">YOUR STORY<br /><span>GROWS WITH YOU.</span></h2>
            <p className="landing-description">Course가 이야기의 맥락을 정하고, Level이 같은 장면의 길이와 답변 밀도를 조절합니다.</p>
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
          <div className="landing-copy landing-copy-centered">
            <p className="landing-kicker"><span>03</span> TRAINING JOURNEY</p>
            <h2 id="journey-title">SIX STEPS.<br /><span>ONE VOICE.</span></h2>
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
          <div className="landing-copy landing-copy-left">
            <p className="landing-kicker"><span>04</span> QUESTION PIVOT · STEP 4</p>
            <h2 id="pivot-title">THE QUESTION<br /><span>CHANGES.</span><br />YOUR STORY<br /><span>STAYS YOURS.</span></h2>
          </div>
          <div className="landing-pivot-demo">
            <div className="landing-question landing-question-base"><span>BASE QUESTION</span><p>Tell me about a place you often visit.</p></div>
            <div aria-hidden="true" className="landing-pivot-arrow"><span /> PIVOT</div>
            <div className="landing-question landing-question-pivot"><span>PIVOT QUESTION</span><p>Tell me about a memorable change there.</p></div>
            <div className="landing-fact-grid">
              {factStates.map(([state, fact, note]) => (
                <div className={`landing-fact landing-fact-${state.toLowerCase()}`} key={state}>
                  <span>{state}</span><strong>{fact}</strong><p>{note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="exam-title" className="landing-section landing-exam" id="exam" data-landing-scene="exam">
          <div aria-hidden="true" className="landing-rec-handoff"><span>REC</span></div>
          <div className="landing-copy landing-copy-centered">
            <p className="landing-kicker"><span>05</span> SPEAK · REVIEW · RETRY</p>
            <h2 id="exam-title">LISTEN. SPEAK.<br /><span>REVIEW. RETRY.</span></h2>
            <p className="landing-description">질문을 듣고 답한 뒤, 내 목소리를 다시 확인하고 같은 질문에 한 번 더 답합니다.</p>
          </div>
          <div aria-label="OOM 실전 연습 흐름 미리보기" className="landing-exam-console">
            <div className="landing-console-header"><span>OOM PRACTICE CONSOLE</span><span><i /> READY · LISTEN 0 / 2</span></div>
            <div className="landing-console-body">
              <div className="landing-eva-panel"><div aria-hidden="true" className="landing-eva"><span /><i /></div><p>EVA · QUESTION INTERVIEWER</p></div>
              <div className="landing-listen-panel"><button aria-label="질문 듣기 데모" disabled type="button"><span aria-hidden="true">▶</span></button><p>질문을 먼저 듣고<br />핵심 시제와 명사를 잡습니다.</p></div>
              <div className="landing-review-panel"><span>REVIEW SIGNAL</span><div className="landing-mini-wave" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><p>editable transcript</p><ul><li><b>KEEP</b> 이어갈 한 가지</li><li><b>FIX</b> 고칠 한 가지</li><li><b>RETRY</b> 바로 다시 말하기</li></ul></div>
            </div>
          </div>
        </section>

        <section aria-labelledby="ecosystem-title" className="landing-section landing-ecosystem" id="ecosystem" data-landing-scene="ecosystem">
          <div className="landing-copy">
            <p className="landing-kicker"><span>06</span> OOM ECOSYSTEM</p>
            <h2 id="ecosystem-title">LEARN THE TEST.<br /><span>TRAIN YOUR VOICE.</span></h2>
          </div>
          <nav aria-label="오픽온미 주요 서비스" className="landing-editorial-links">
            <Link data-magnetic to="/exam-guide/"><span>01 · GUIDE</span><strong>수험 가이드</strong><p>시험 구조부터 신청, 시험 당일, 결과 확인까지.</p><i aria-hidden="true">↗</i></Link>
            <Link data-magnetic to="/training/"><span>02 · TRAINING</span><strong>실전 훈련</strong><p>Course × Level로 이어지는 6 STEP 말하기 루프.</p><i aria-hidden="true">↗</i></Link>
            <Link data-magnetic to="/magazine/"><span>03 · MAGAZINE</span><strong>OOM Magazine</strong><p>말하기 전략과 연습법을 깊이 읽는 editorial archive.</p><i aria-hidden="true">↗</i></Link>
          </nav>
        </section>

        <section aria-labelledby="final-title" className="landing-section landing-final" data-landing-scene="final">
          <div className="landing-final-ring" aria-hidden="true"><span>O</span></div>
          <div className="landing-copy landing-copy-centered">
            <p className="landing-kicker"><span>07</span> START WITH YOUR VOICE</p>
            <h2 id="final-title">MAKE IT<br /><span>YOURS.</span></h2>
            <p className="landing-description">남의 모범답안이 아니라, 내 이야기로 시작하세요.</p>
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
