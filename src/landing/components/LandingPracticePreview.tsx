import { ExamScreenShell } from "../../components/practice/ExamScreenShell";

const noOperation = () => {};

/**
 * Presentation-only reuse of the STEP 6 exam shell.
 * It deliberately mounts no recorder, speech, STT, LLM, or training-state owner.
 */
export function LandingPracticePreview() {
  return (
    <div
      {...({ inert: "" } as Record<string, string>)}
      aria-label="실제 STEP 6 시험 화면 미리보기"
      className="landing-practice-shell"
      data-practice-preview="existing-exam-shell"
    >
      <ExamScreenShell
        courseLabel="Everyday & Getaway"
        elapsedLabel="00:00"
        isSpeaking={false}
        levelLabel="2구간 · IH / IM3"
        listenCount={0}
        maxListenCount={2}
        onListen={noOperation}
        onStartAnswer={noOperation}
        onStopAnswer={noOperation}
        onToggleQuestionText={noOperation}
        questionGroup="공원 / 조깅"
        questionPrompt="Please describe the park you often visit. Where is it located, what does it look like, and what do people usually do there?"
        questionTypeLabel="장소·대상 묘사"
        recommendedStoryScene="일요일 아침 근처 공원에서 조깅 후 벤치에서 커피를 마시는 루틴"
        recommendedStoryTitle="주말 공원 산책과 조깅 루틴"
        showQuestionText={false}
        showStoryHint={false}
        state="ready"
        targetRangeLabel="45–65초"
      />
    </div>
  );
}
