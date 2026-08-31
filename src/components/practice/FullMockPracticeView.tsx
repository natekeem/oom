import { useCallback, useEffect, useRef, useState } from "react";
import { SELF_INTRODUCTION_PROMPT, getSelfIntroduction } from "../../data/training/selfIntroduction";
import { callInternalLlm } from "../../lib/llm";
import { stopSpeech } from "../../lib/speech";
import { transcribeAudio } from "../../lib/stt";
import { EXAM_TTS_RATE } from "../../lib/tts/ratePreferences";
import { getTtsManager } from "../../lib/tts/TtsManager";
import type { TtsMediaPlaybackSource, TtsRuntimeStatus } from "../../lib/tts/types";
import { useTtsPreferences } from "../../lib/tts/useTtsPreferences";
import { formatTime } from "../../lib/utils";
import { resolveTrainingContext } from "../../training/courseRegistry";
import { TRAINING_LEVELS } from "../../training/levels";
import type { ResolvedTrainingContext } from "../../training/types";
import type { LlmSettings, SttSettings } from "../../types";
import { OomWavePlayer, type OomWavePlayerHandle } from "../audio/OomWavePlayer";
import type { ViewId } from "../layout/Sidebar";
import { Card } from "../ui/Card";
import { TrainingSelectionGuard } from "../training/TrainingSelectionGuard";
import { ExamScreenShell, type ExamSessionState } from "./ExamScreenShell";
import { PracticeReviewPanel } from "./PracticeReviewPanel";
import { Recorder, type RecorderHandle, type RecordingResult } from "./Recorder";
import { deriveSttUiStatus } from "./sttUiStatus";
import { MockAdjustmentScreen } from "./mock/MockAdjustmentScreen";
import type { MockPostExamView } from "./mock/MockPostExamNav";
import { MockReportView } from "./mock/MockReportView";
import { MockResultView } from "./mock/MockResultView";
import { MockPreTestScreen, MockSelfAssessmentScreen, MockSurveyScreen } from "./mock/MockOrientationScreens";
import {
  completeMockPlanAfterAdjustment,
  createInitialMockPlan,
  createMockSeed,
  resolveAdjustedPromptLevel,
} from "./mock/mockSessionPlanner";
import type {
  MockAdjustment,
  MockAttempt,
  MockPhase,
  MockQuestion,
  MockSessionPlan,
  MockSurveySelection,
} from "./mock/mockSessionTypes";
import { createInitialMockSurveySelection } from "./mock/mockSurvey";
import { createMockTrainingReport } from "./mock/mockReport";

const MOCK_DURATION_SECONDS = 40 * 60;

type FullMockPracticeViewProps = {
  resolved: ResolvedTrainingContext;
  settings: LlmSettings;
  sttSettings?: SttSettings;
  onToast: (title: string, description?: string, tone?: "success" | "error" | "info") => void;
  onNavigate?: (view: ViewId) => void;
  onSetNavigationGuard?: (guard: (() => boolean) | null) => void;
};

function phaseSession(phase: MockPhase): 1 | 2 | null {
  if (phase.phase === "session-1") return 1;
  if (phase.phase === "session-2") return 2;
  return null;
}

function describeTtsStatus(status: TtsRuntimeStatus, warmup: boolean) {
  const subject = warmup ? "자기소개 안내" : "질문";
  if (status.phase === "loading-model") {
    const progress = typeof status.progress === "number" ? ` · ${Math.round(status.progress)}%` : "";
    return `음성 모델 준비 중 · 최초 1회${progress}`;
  }
  if (status.phase === "generating") {
    const progress =
      typeof status.completedChunks === "number" && typeof status.totalChunks === "number"
        ? ` · ${status.completedChunks}/${status.totalChunks}`
        : typeof status.progress === "number"
          ? ` · ${Math.round(status.progress)}%`
          : "";
    return `${subject} 음성 생성 중${progress}`;
  }
  if (status.phase === "fallback") return "시스템 음성으로 재생 중";
  return `${subject} 음성 준비 완료`;
}

export function FullMockPracticeView({
  resolved,
  settings,
  sttSettings,
  onToast,
  onNavigate,
  onSetNavigationGuard,
}: FullMockPracticeViewProps) {
  const [phase, setPhase] = useState<MockPhase>({ phase: "survey" });
  const [surveySelection, setSurveySelection] = useState<MockSurveySelection>(() => createInitialMockSurveySelection(resolved));
  const [mockInitialLevelId, setMockInitialLevelId] = useState(resolved.level.id);
  const [plan, setPlan] = useState<MockSessionPlan | null>(null);
  const [plannerError, setPlannerError] = useState("");
  const [attempts, setAttempts] = useState<MockAttempt[]>([]);
  const [questionState, setQuestionState] = useState<ExamSessionState>("ready");
  const [listenCount, setListenCount] = useState(0);
  const [warmupListenCount, setWarmupListenCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(MOCK_DURATION_SECONDS);
  const [micFailed, setMicFailed] = useState(false);
  const [hasResponded, setHasResponded] = useState(false);
  const [attemptKey, setAttemptKey] = useState(0);
  const [questionAudioSource, setQuestionAudioSource] = useState<TtsMediaPlaybackSource | null>(null);
  const [questionPlayRequest, setQuestionPlayRequest] = useState(0);
  const [questionTtsStatus, setQuestionTtsStatus] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedAudioUrl, setSelectedAudioUrl] = useState<string | null>(null);
  const [selectedReviewAttemptId, setSelectedReviewAttemptId] = useState<string | undefined>();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  const recorderRef = useRef<RecorderHandle | null>(null);
  const questionPlayerRef = useRef<OomWavePlayerHandle | null>(null);
  const listenRequestRef = useRef(0);
  const staticFallbackAttemptRef = useRef(false);
  const answerTimerRef = useRef<number | null>(null);
  const mainTimerRef = useRef<number | null>(null);
  const mainStartedAtRef = useRef<number | null>(null);
  const attemptedQuestionIdRef = useRef<string | null>(null);
  const pendingAttemptRef = useRef<{
    question: MockQuestion;
    session: 1 | 2;
    sessionIndex: number;
    listenCount: number;
  } | null>(null);
  const timerExpiredRef = useRef(false);
  const sttAbortRef = useRef<AbortController | null>(null);
  const reviewRequestRef = useRef(0);
  const { preferences } = useTtsPreferences();

  const session = phaseSession(phase);
  const sessionQuestions = session === 1 ? plan?.session1 ?? [] : session === 2 ? plan?.session2 ?? [] : [];
  const sessionIndex = phase.phase === "session-1" || phase.phase === "session-2" ? phase.index : 0;
  const activeQuestion = sessionQuestions[sessionIndex];
  const warmup = phase.phase === "warmup";
  const activePrompt = warmup ? SELF_INTRODUCTION_PROMPT : activeQuestion?.prompt;
  const activeLevelId = activeQuestion?.sourceLevelId ?? mockInitialLevelId;
  const activeLevel = TRAINING_LEVELS.find((level) => level.id === activeLevelId) ?? resolved.level;
  const selfIntroduction = getSelfIntroduction(mockInitialLevelId);
  const activeListenCount = warmup ? warmupListenCount : listenCount;
  const selectedAttempt = attempts.find((attempt) => attempt.id === selectedReviewAttemptId);
  const activeMockPhase = ["warmup", "session-1", "adjustment", "session-2"].includes(phase.phase);

  useEffect(() => {
    if (!onSetNavigationGuard) return;
    const guard = () =>
      !activeMockPhase ||
      !hasResponded ||
      window.confirm("진행 중인 모의고사와 녹음 답변을 삭제하고 다른 화면으로 이동할까요?");
    onSetNavigationGuard(guard);
    return () => onSetNavigationGuard(null);
  }, [activeMockPhase, hasResponded, onSetNavigationGuard]);

  const resetQuestionRuntime = useCallback(() => {
    stopSpeech();
    listenRequestRef.current += 1;
    questionPlayerRef.current?.stop();
    attemptedQuestionIdRef.current = null;
    pendingAttemptRef.current = null;
    staticFallbackAttemptRef.current = false;
    setQuestionAudioSource(null);
    setQuestionPlayRequest(0);
    setQuestionTtsStatus("");
    setIsSpeaking(false);
    setQuestionState("ready");
    setListenCount(0);
    setElapsedSeconds(0);
    setMicFailed(false);
    setAttemptKey((key) => key + 1);
  }, []);

  useEffect(() => {
    listenRequestRef.current += 1;
    const requestId = listenRequestRef.current;
    staticFallbackAttemptRef.current = false;
    if (!activePrompt) return;
    void getTtsManager()
      .resolveStaticPlayback({ text: activePrompt, voice: preferences.examVoice, speed: EXAM_TTS_RATE })
      .then((source) => {
        if (requestId !== listenRequestRef.current || !source) return;
        setQuestionAudioSource(source);
        setQuestionTtsStatus(warmup ? "정적 자기소개 안내 준비 완료" : "정적 질문 음성 준비 완료");
      });
  }, [activePrompt, preferences.examVoice, warmup]);

  useEffect(() => {
    if (questionState !== "recording") return;
    answerTimerRef.current = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
    return () => {
      if (answerTimerRef.current) window.clearInterval(answerTimerRef.current);
      answerTimerRef.current = null;
    };
  }, [questionState]);

  const expireMockRef = useRef<() => void>(() => undefined);
  useEffect(() => {
    const timerRunning = ["session-1", "adjustment", "session-2"].includes(phase.phase);
    if (!timerRunning || mainStartedAtRef.current === null) return;
    const tick = () => {
      const elapsed = Math.floor((Date.now() - (mainStartedAtRef.current ?? Date.now())) / 1000);
      const next = Math.max(0, MOCK_DURATION_SECONDS - elapsed);
      setRemainingSeconds(next);
      if (next === 0) expireMockRef.current();
    };
    tick();
    mainTimerRef.current = window.setInterval(tick, 1000);
    return () => {
      if (mainTimerRef.current) window.clearInterval(mainTimerRef.current);
      mainTimerRef.current = null;
    };
  }, [phase.phase]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!activeMockPhase || !hasResponded) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [activeMockPhase, hasResponded]);

  useEffect(() => {
    let disposed = false;
    if (!selectedAttempt?.recording) {
      queueMicrotask(() => {
        if (!disposed) setSelectedAudioUrl(null);
      });
      return;
    }
    const url = URL.createObjectURL(selectedAttempt.recording.blob);
    queueMicrotask(() => {
      if (!disposed) setSelectedAudioUrl(url);
    });
    return () => {
      disposed = true;
      URL.revokeObjectURL(url);
    };
  }, [selectedAttempt?.id, selectedAttempt?.recording]);

  useEffect(() => {
    const player = questionPlayerRef.current;
    const recorder = recorderRef.current;
    return () => {
      stopSpeech();
      listenRequestRef.current += 1;
      reviewRequestRef.current += 1;
      player?.stop();
      sttAbortRef.current?.abort();
      recorder?.stop({ discard: true });
      if (answerTimerRef.current) window.clearInterval(answerTimerRef.current);
      if (mainTimerRef.current) window.clearInterval(mainTimerRef.current);
    };
  }, []);

  const activeQuestionAudioSource =
    questionAudioSource?.voice === preferences.examVoice ? questionAudioSource : null;

  const preparePlayback = async (requestId: number, skipStatic = false) => {
    if (!activePrompt) return;
    try {
      const source = await getTtsManager().preparePlayback(
        { text: activePrompt, voice: preferences.examVoice, speed: EXAM_TTS_RATE },
        (status) => {
          if (requestId === listenRequestRef.current) setQuestionTtsStatus(describeTtsStatus(status, warmup));
        },
        { skipStatic },
      );
      if (requestId !== listenRequestRef.current) return;
      if (source.kind === "audio" || source.kind === "static") {
        setQuestionAudioSource(source);
        setQuestionPlayRequest(requestId);
        setQuestionTtsStatus(
          source.kind === "static"
            ? warmup ? "정적 자기소개 안내 재생 중" : "정적 질문 음성 재생 중"
            : warmup ? "Kokoro 자기소개 안내 재생 중" : "Kokoro 질문 음성 재생 중",
        );
        return;
      }
      setQuestionTtsStatus("시스템 음성으로 재생 중");
      source.play({
        onEnd: () => {
          if (requestId === listenRequestRef.current) {
            setIsSpeaking(false);
            setQuestionTtsStatus(warmup ? "자기소개 안내 재생 완료" : "질문 음성 재생 완료");
          }
        },
        onError: () => {
          if (requestId === listenRequestRef.current) {
            setIsSpeaking(false);
            setQuestionTtsStatus("시스템 음성을 재생할 수 없습니다.");
          }
        },
      });
    } catch (error) {
      setIsSpeaking(false);
      setQuestionTtsStatus("질문 음성을 재생할 수 없습니다.");
      onToast("질문 음성 재생 실패", error instanceof Error ? error.message : "브라우저 음성을 확인해 주세요.", "error");
    }
  };

  const handleListen = async () => {
    if (!activePrompt || questionState === "recording" || activeListenCount >= 2) return;
    listenRequestRef.current += 1;
    const requestId = listenRequestRef.current;
    if (warmup) setWarmupListenCount((count) => count + 1);
    else setListenCount((count) => count + 1);
    setIsSpeaking(true);
    stopSpeech();
    if (activeQuestionAudioSource) {
      setQuestionTtsStatus(
        activeQuestionAudioSource.kind === "static"
          ? warmup ? "정적 자기소개 안내 재생 중" : "정적 질문 음성 재생 중"
          : warmup ? "Kokoro 자기소개 안내 재생 중" : "Kokoro 질문 음성 재생 중",
      );
      setQuestionPlayRequest(requestId);
      return;
    }
    await preparePlayback(requestId);
  };

  const startAnswer = async () => {
    if (!activePrompt) return;
    stopSpeech();
    listenRequestRef.current += 1;
    questionPlayerRef.current?.stop();
    setIsSpeaking(false);
    setQuestionTtsStatus("");
    setMicFailed(false);
    const success = (await recorderRef.current?.start()) ?? false;
    if (!success) {
      setMicFailed(true);
      return;
    }
    if (!warmup) setHasResponded(true);
    if (!warmup && activeQuestion && session) {
      pendingAttemptRef.current = { question: activeQuestion, session, sessionIndex, listenCount };
    }
    setElapsedSeconds(0);
    setQuestionState("recording");
  };

  const startTimerOnly = () => {
    stopSpeech();
    listenRequestRef.current += 1;
    questionPlayerRef.current?.stop();
    setIsSpeaking(false);
    setQuestionTtsStatus("");
    setMicFailed(false);
    if (!warmup) setHasResponded(true);
    if (!warmup && activeQuestion && session) {
      pendingAttemptRef.current = { question: activeQuestion, session, sessionIndex, listenCount };
    }
    setElapsedSeconds(0);
    setQuestionState("recording");
  };

  const storeAttempt = useCallback((recording?: RecordingResult) => {
    const pending = pendingAttemptRef.current ?? (
      activeQuestion && session
        ? { question: activeQuestion, session, sessionIndex, listenCount }
        : null
    );
    if (!pending || attemptedQuestionIdRef.current === pending.question.mockId) return;
    attemptedQuestionIdRef.current = pending.question.mockId;
    const durationSeconds = recording?.durationSeconds ?? elapsedSeconds;
    const attempt: MockAttempt = {
      id: `${plan?.seed ?? "mock"}:${pending.question.mockId}`,
      question: pending.question,
      session: pending.session,
      sessionIndex: pending.sessionIndex,
      listenCount: pending.listenCount,
      durationSeconds,
      recording,
      transcript: "",
      feedback: "",
      completedAt: Date.now(),
    };
    pendingAttemptRef.current = null;
    setAttempts((current) => [...current.filter((item) => item.id !== attempt.id), attempt]);
  }, [activeQuestion, elapsedSeconds, listenCount, plan?.seed, session, sessionIndex]);

  const handleRecordingReady = (recording: RecordingResult) => {
    if (warmup) return;
    storeAttempt(recording);
    setQuestionState("complete");
    if (timerExpiredRef.current) setPhase({ phase: "complete" });
  };

  const completeWarmup = () => {
    if (!plan?.session1.length) {
      setPlannerError("현재 Course에 모의고사를 시작할 질문이 없습니다.");
      setPhase({ phase: "pre-test" });
      return;
    }
    resetQuestionRuntime();
    mainStartedAtRef.current = Date.now();
    setRemainingSeconds(MOCK_DURATION_SECONDS);
    setPhase({ phase: "session-1", index: 0 });
  };

  const stopAnswer = () => {
    if (warmup) {
      if (recorderRef.current?.isRecording()) recorderRef.current.stop({ discard: true });
      completeWarmup();
      return;
    }
    const hadRecording = recorderRef.current?.isRecording() ?? false;
    if (hadRecording) {
      recorderRef.current?.stop();
      return;
    }
    storeAttempt();
    setQuestionState("complete");
  };

  const expireMock = useCallback(() => {
    if (timerExpiredRef.current || phase.phase === "complete") return;
    timerExpiredRef.current = true;
    stopSpeech();
    listenRequestRef.current += 1;
    questionPlayerRef.current?.stop();
    if (recorderRef.current?.isRecording()) {
      recorderRef.current.stop();
      return;
    }
    if (questionState === "recording") storeAttempt();
    setQuestionState("complete");
    setPhase({ phase: "complete" });
  }, [phase.phase, questionState, storeAttempt]);

  useEffect(() => {
    expireMockRef.current = expireMock;
  }, [expireMock]);

  const startMock = () => {
    try {
      const initialResolved = resolveTrainingContext(resolved.course.id, mockInitialLevelId);
      const initial = createInitialMockPlan(
        {
          resolved: initialResolved,
          initialLevelId: mockInitialLevelId,
          surveySelection,
        },
        createMockSeed(),
      );
      if (initial.session1.length === 0) throw new Error("사용 가능한 연습 질문이 없습니다.");
      setPlan(initial);
      setPlannerError("");
      setAttempts([]);
      setSelectedReviewAttemptId(undefined);
      setWarmupListenCount(0);
      setRemainingSeconds(MOCK_DURATION_SECONDS);
      setHasResponded(false);
      timerExpiredRef.current = false;
      mainStartedAtRef.current = null;
      resetQuestionRuntime();
      setPhase({ phase: "warmup" });
    } catch (error) {
      setPlannerError(error instanceof Error ? error.message : "모의고사 문항을 구성하지 못했습니다.");
    }
  };

  const goNext = () => {
    if (!session || !plan) return;
    const currentQuestions = session === 1 ? plan.session1 : plan.session2;
    if (sessionIndex + 1 < currentQuestions.length) {
      resetQuestionRuntime();
      setPhase({ phase: session === 1 ? "session-1" : "session-2", index: sessionIndex + 1 });
      return;
    }
    resetQuestionRuntime();
    setPhase(session === 1 ? { phase: "adjustment" } : { phase: "complete" });
  };

  const selectAdjustment = (adjustment: MockAdjustment) => {
    if (!plan || plan.adjustment) return;
    try {
      const effectiveLevel = resolveAdjustedPromptLevel(plan.selectedLevelId, adjustment);
      const secondResolved = resolveTrainingContext(plan.selectedCourseId, effectiveLevel);
      const completed = completeMockPlanAfterAdjustment(plan, adjustment, secondResolved);
      if (completed.session2.length === 0) throw new Error("2nd Session에 사용할 문항이 없습니다.");
      setPlan(completed);
      resetQuestionRuntime();
      setPhase({ phase: "session-2", index: 0 });
    } catch (error) {
      setPlannerError(error instanceof Error ? error.message : "2nd Session 문항을 구성하지 못했습니다.");
      onToast("모의고사 구성을 계속할 수 없습니다.", "빠른 연습으로 돌아가 다시 시도해 주세요.", "error");
    }
  };

  const restartMock = () => {
    recorderRef.current?.stop({ discard: true });
    stopSpeech();
    listenRequestRef.current += 1;
    reviewRequestRef.current += 1;
    sttAbortRef.current?.abort();
    questionPlayerRef.current?.stop();
    setAttempts([]);
    setSelectedReviewAttemptId(undefined);
    setPlan(null);
    setPlannerError("");
    setSurveySelection(createInitialMockSurveySelection(resolved));
    setMockInitialLevelId(resolved.level.id);
    setWarmupListenCount(0);
    setRemainingSeconds(MOCK_DURATION_SECONDS);
    setHasResponded(false);
    timerExpiredRef.current = false;
    mainStartedAtRef.current = null;
    resetQuestionRuntime();
    setPhase({ phase: "survey" });
  };

  const updateAttempt = (attemptId: string, patch: Partial<MockAttempt>) => {
    setAttempts((current) => current.map((attempt) => attempt.id === attemptId ? { ...attempt, ...patch } : attempt));
  };

  const selectReviewAttempt = (attemptId?: string) => {
    reviewRequestRef.current += 1;
    sttAbortRef.current?.abort();
    setIsTranscribing(false);
    setIsFeedbackLoading(false);
    const nextAttemptId = attemptId ?? selectedReviewAttemptId ?? attempts[0]?.id;
    setSelectedReviewAttemptId(nextAttemptId);
    setPhase({ phase: "review", selectedAttemptId: nextAttemptId });
  };

  const navigatePostExam = (view: MockPostExamView) => {
    reviewRequestRef.current += 1;
    sttAbortRef.current?.abort();
    setIsTranscribing(false);
    setIsFeedbackLoading(false);
    if (view === "summary") {
      setPhase({ phase: "complete" });
      return;
    }
    if (view === "review") {
      selectReviewAttempt();
      return;
    }
    setPhase({ phase: "report", returnAttemptId: selectedReviewAttemptId });
  };

  const performTranscribe = async () => {
    if (!selectedAttempt?.recording) {
      onToast("변환할 녹음이 없습니다.", "이 문항은 타이머 기록만 저장되었습니다.", "info");
      return;
    }
    if (!sttSettings?.endpoint?.trim()) {
      onToast("STT 설정이 필요합니다.", "AI 설정에서 STT Endpoint를 먼저 저장해 주세요.", "info");
      return;
    }
    sttAbortRef.current?.abort();
    const controller = new AbortController();
    sttAbortRef.current = controller;
    const requestId = ++reviewRequestRef.current;
    setIsTranscribing(true);
    updateAttempt(selectedAttempt.id, { sttError: undefined });
    try {
      const transcript = await transcribeAudio(
        sttSettings,
        selectedAttempt.recording.blob,
        selectedAttempt.recording.mimeType,
        controller.signal,
      );
      if (!controller.signal.aborted && requestId === reviewRequestRef.current) {
        updateAttempt(selectedAttempt.id, { transcript });
        onToast("음성을 텍스트로 변환했습니다.", "수정 후 선택한 답변의 AI 피드백을 요청할 수 있습니다.", "success");
      }
    } catch (error) {
      if (!controller.signal.aborted && requestId === reviewRequestRef.current) {
        const message = error instanceof Error ? error.message : "STT 변환에 실패했습니다.";
        updateAttempt(selectedAttempt.id, { sttError: message });
        onToast("STT 변환 실패", "녹음은 그대로 보존되어 있습니다.", "error");
      }
    } finally {
      if (!controller.signal.aborted && requestId === reviewRequestRef.current) setIsTranscribing(false);
    }
  };

  const getFeedback = async () => {
    if (!selectedAttempt?.transcript.trim()) return;
    if (!settings.endpoint.trim()) {
      updateAttempt(selectedAttempt.id, {
        feedback: "KEEP\n모의고사를 끝까지 완료하고 선택한 답변을 직접 복기했습니다.\n\nFIX\n질문에 첫 문장부터 직접 답했는지 한 가지만 확인하세요.\n\nRETRY\nTranscript를 자연스럽게 다듬은 뒤 별도의 빠른 연습에서 다시 말해 보세요.",
      });
      onToast("AI 설정이 필요합니다.", "설정 화면에서 LLM Endpoint를 입력해 주세요.", "info");
      return;
    }
    const requestId = ++reviewRequestRef.current;
    setIsFeedbackLoading(true);
    try {
      const feedback = await callInternalLlm(settings, [
        {
          role: "system",
          content: "You are an OPIc speaking coach. Reply in Korean with concise KEEP, FIX, RETRY sections. Do not claim an official score or grade. Do not assess pronunciation from a transcript.",
        },
        {
          role: "user",
          content: `Question: ${selectedAttempt.question.prompt}\nStudent transcript: ${selectedAttempt.transcript}\nDuration: ${selectedAttempt.durationSeconds}s\nThis is a post-exam review of one selected answer.`,
        },
      ]);
      if (requestId === reviewRequestRef.current) {
        updateAttempt(selectedAttempt.id, { feedback });
        onToast("선택한 답변의 AI 피드백을 받았습니다.", undefined, "success");
      }
    } catch (error) {
      if (requestId === reviewRequestRef.current) {
        updateAttempt(selectedAttempt.id, { feedback: `KEEP\n답변 복기 흐름을 완료했습니다.\n\nFIX\n첫 문장의 직접성을 확인하세요.\n\nRETRY\n같은 핵심 장면을 더 짧고 분명하게 말해 보세요.\n\nAI 요청 실패: ${error instanceof Error ? error.message : "설정을 확인해 주세요."}` });
        onToast("AI 피드백에 실패했습니다.", "녹음과 Transcript는 그대로 보존됩니다.", "error");
      }
    } finally {
      if (requestId === reviewRequestRef.current) setIsFeedbackLoading(false);
    }
  };

  const totalQuestions = (plan?.session1.length ?? 0) + (plan?.session2.length ?? 0);
  const totalTestSeconds = MOCK_DURATION_SECONDS - remainingSeconds;

  if (phase.phase === "survey") {
    return (
      <MockSurveyScreen
        onChange={setSurveySelection}
        onNext={() => setPhase({ phase: "self-assessment" })}
        resolved={resolved}
        selection={surveySelection}
      />
    );
  }

  if (phase.phase === "self-assessment") {
    return (
      <MockSelfAssessmentScreen
        onBack={() => setPhase({ phase: "survey" })}
        onChange={setMockInitialLevelId}
        onNext={() => setPhase({ phase: "pre-test" })}
        selectedLevelId={mockInitialLevelId}
      />
    );
  }

  if (phase.phase === "pre-test") {
    return (
      <MockPreTestScreen
        onBack={() => setPhase({ phase: "self-assessment" })}
        onStart={startMock}
        plannerError={plannerError}
        resolved={resolved}
        selectedLevelId={mockInitialLevelId}
      />
    );
  }

  if (phase.phase === "adjustment") {
    return (
      <div className="space-y-4">
        <MockAdjustmentScreen onSelect={selectAdjustment} remainingTime={formatTime(remainingSeconds)} />
        {plannerError ? <p role="alert" className="text-center text-sm text-red-600 dark:text-red-300">{plannerError}</p> : null}
      </div>
    );
  }

  if (phase.phase === "report" && plan) {
    const report = createMockTrainingReport({ attempts, totalQuestions, totalTestSeconds });
    return (
      <MockReportView
        attempts={attempts}
        onNavigate={navigatePostExam}
        onRestart={restartMock}
        report={report}
      />
    );
  }

  if (phase.phase === "complete" || phase.phase === "review") {
    const sttStatus = deriveSttUiStatus({
      endpoint: sttSettings?.endpoint,
      isTranscribing,
      transcript: selectedAttempt?.transcript ?? "",
      error: selectedAttempt?.sttError ?? null,
    });
    return (
      <MockResultView
        attempts={attempts}
        onNavigate={navigatePostExam}
        onRestart={restartMock}
        onReview={selectReviewAttempt}
        reviewing={phase.phase === "review"}
        selectedAttemptId={selectedAttempt?.id}
        totalQuestions={totalQuestions}
        totalTestSeconds={totalTestSeconds}
      >
        {selectedAttempt ? (
          <PracticeReviewPanel
            allowRetry={false}
            answer={selectedAttempt.transcript}
            audioUrl={selectedAudioUrl}
            autoTranscribe={false}
            durationSeconds={selectedAttempt.durationSeconds}
            feedback={selectedAttempt.feedback}
            hasRecording={Boolean(selectedAttempt.recording)}
            isFeedbackLoading={isFeedbackLoading}
            layout="mock"
            onAnswerChange={(transcript) => updateAttempt(selectedAttempt.id, { transcript })}
            onFeedback={getFeedback}
            onNavigateToSettings={onNavigate ? () => onNavigate("ai-settings") : undefined}
            onRetryAttempt={() => undefined}
            onTranscribe={performTranscribe}
            sttError={selectedAttempt.sttError}
            sttStatus={sttStatus}
          />
        ) : (
          <Card className="p-6 text-sm text-zinc-600 dark:text-zinc-300">왼쪽에서 복기할 답변을 선택하세요.</Card>
        )}
      </MockResultView>
    );
  }

  const progressLabel = warmup
    ? "SELF INTRODUCTION · 자기소개 워밍업"
    : `SESSION ${session} · 문항 ${sessionIndex + 1} / ${sessionQuestions.length}`;
  const advanceLabel = sessionIndex + 1 >= sessionQuestions.length
    ? session === 1 ? "난이도 재조정" : "시험 결과 보기"
    : "다음 문항";

  return (
    <div
      className="space-y-5"
      data-mock-initial-level={plan?.selectedLevelId ?? mockInitialLevelId}
      data-mock-phase={phase.phase}
      data-question-source-level={activeQuestion?.sourceLevelId}
    >
      <Recorder
        mode="engine"
        notifyOnSave={false}
        onRecordingReady={handleRecordingReady}
        onToast={onToast}
        ref={recorderRef}
        resetKey={attemptKey}
      />
      <ExamScreenShell
        advanceLabel={!warmup && questionState === "complete" ? advanceLabel : undefined}
        audioPlayer={activeQuestionAudioSource ? (
          <OomWavePlayer
            audioUrl={activeQuestionAudioSource.kind === "static" ? activeQuestionAudioSource.url : undefined}
            autoPlayRequest={questionPlayRequest}
            blob={activeQuestionAudioSource.kind === "audio" ? activeQuestionAudioSource.blob : undefined}
            controls={false}
            onError={(error) => {
              if (activeQuestionAudioSource.kind === "static" && !staticFallbackAttemptRef.current) {
                staticFallbackAttemptRef.current = true;
                setQuestionAudioSource(null);
                setQuestionTtsStatus("정적 음성 오류 · 브라우저 음성 준비 중");
                void preparePlayback(listenRequestRef.current, true);
                return;
              }
              setIsSpeaking(false);
              setQuestionTtsStatus("질문 음성을 재생할 수 없습니다.");
              onToast("질문 음성 재생 실패", error.message, "error");
            }}
            onFinish={() => {
              setIsSpeaking(false);
              setQuestionTtsStatus(warmup ? "자기소개 안내 재생 완료" : "질문 음성 재생 완료");
            }}
            onPlaybackChange={(playing) => setIsSpeaking(playing)}
            precomputedDuration={activeQuestionAudioSource.kind === "static" ? activeQuestionAudioSource.duration : undefined}
            precomputedPeaks={activeQuestionAudioSource.kind === "static" ? activeQuestionAudioSource.peaks : undefined}
            ref={questionPlayerRef}
            surface="console"
            variant="exam"
          />
        ) : undefined}
        courseLabel={resolved.course.title}
        completionMessage={!warmup && questionState === "complete" ? "중간 복기 없이 다음 문항으로 이어집니다." : undefined}
        elapsedLabel={formatTime(elapsedSeconds)}
        experience="mock"
        globalTimeLabel={warmup ? undefined : formatTime(remainingSeconds)}
        isSpeaking={isSpeaking}
        levelLabel={`${activeLevel.displayName} · ${activeLevel.targetLabel}`}
        listenCount={activeListenCount}
        maxListenCount={2}
        micFailed={micFailed}
        mode={warmup ? "warmup" : "question"}
        onAdvance={!warmup && questionState === "complete" ? goNext : undefined}
        onListen={handleListen}
        onStartAnswer={startAnswer}
        onStartTimerOnly={startTimerOnly}
        onStopAnswer={stopAnswer}
        onToggleQuestionText={() => undefined}
        questionProgressLabel={progressLabel}
        questionPrompt={activePrompt}
        showQuestionMetadata={false}
        showQuestionText={false}
        showQuestionTextToggle={false}
        showTargetRange={warmup}
        state={questionState}
        targetRangeLabel={warmup ? selfIntroduction.durationLabel.replace(/^약\s*/, "") : ""}
        ttsStatus={questionTtsStatus || undefined}
      />
    </div>
  );
}

export function FullMockPracticeRoute({
  settings,
  sttSettings,
  onToast,
  onNavigate,
  onSetNavigationGuard,
}: Omit<FullMockPracticeViewProps, "resolved">) {
  return (
    <TrainingSelectionGuard onNavigate={onNavigate} stepName="STEP 6. 실전 모의고사">
      {(resolved) => (
        <FullMockPracticeView
          onNavigate={onNavigate}
          onSetNavigationGuard={onSetNavigationGuard}
          onToast={onToast}
          resolved={resolved}
          settings={settings}
          sttSettings={sttSettings}
        />
      )}
    </TrainingSelectionGuard>
  );
}
