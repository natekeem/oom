import { useEffect, useRef, useState } from "react";
import { callInternalLlm } from "../../lib/llm";
import { transcribeAudio } from "../../lib/stt";
import { stopSpeech } from "../../lib/speech";
import { getTtsManager } from "../../lib/tts/TtsManager";
import type { TtsRuntimeStatus } from "../../lib/tts/types";
import { useTtsPreferences } from "../../lib/tts/useTtsPreferences";
import { formatTime } from "../../lib/utils";
import type { LlmSettings, SttSettings } from "../../types";
import { Recorder, type RecorderHandle, type RecordingResult } from "./Recorder";
import { ExamScreenShell, type ExamSessionState } from "./ExamScreenShell";
import { PracticeReviewPanel } from "./PracticeReviewPanel";
import { deriveSttUiStatus } from "./sttUiStatus";
import { TrainingSelectionGuard } from "../training/TrainingSelectionGuard";
import type { ViewId } from "../layout/Sidebar";
import type { ResolvedTrainingContext } from "../../training/types";
import { OomWavePlayer, type OomWavePlayerHandle } from "../audio/OomWavePlayer";

type PracticeViewProps = {
  settings: LlmSettings;
  sttSettings?: SttSettings;
  onToast: (title: string, description?: string, tone?: "success" | "error" | "info") => void;
  onNavigate?: (view: ViewId) => void;
};

type PracticeItem = {
  id: string;
  group: string;
  type: string;
  prompt: string;
  storylineId?: string;
};

const questionTypeLabels: Record<string, string> = {
  description: "장소·대상 묘사",
  routine: "일상 루틴 / 활동",
  "recent-experience": "최근 경험",
  "description-reason": "묘사 및 선호 이유",
  "routine-detail": "세부 루틴 / 활동",
  "experience-change": "경험과 변화",
  "expanded-experience": "기억에 남는 경험",
  "comparison-change": "과거·현재 비교 및 변화",
  "problem-opinion": "문제 해결 및 의견",
  comparison: "과거·현재 비교",
  change: "변화와 선호",
  "unexpected-situation": "예상 밖 상황",
  problem: "문제 해결",
  opinion: "의견 / 선호",
  preference: "선호와 선택 이유",
  hobby: "취미 / 관심사",
  shopping: "구매 / 쇼핑",
};

function PracticeViewContent({
  resolved,
  settings,
  sttSettings,
  onToast,
  onNavigate,
}: {
  resolved: ResolvedTrainingContext;
  settings: LlmSettings;
  sttSettings?: SttSettings;
  onToast: (title: string, description?: string, tone?: "success" | "error" | "info") => void;
  onNavigate?: (view: ViewId) => void;
}) {
  const availableQuestions: PracticeItem[] = resolved.questions.map((q) => ({
    id: q.id,
    group: q.group,
    type: q.type,
    prompt: q.prompt,
    storylineId: q.storylineId,
  }));

  const [question, setQuestion] = useState<PracticeItem | null>(() => {
    return availableQuestions.length > 0 ? availableQuestions[0] : null;
  });

  const [listenCount, setListenCount] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [questionAudioBlob, setQuestionAudioBlob] = useState<Blob | null>(null);
  const [questionPlayRequest, setQuestionPlayRequest] = useState(0);
  const [questionTtsStatus, setQuestionTtsStatus] = useState("");
  const [showQuestionText, setShowQuestionText] = useState(false);
  const [showStoryHint, setShowStoryHint] = useState(false);

  const [sessionState, setSessionState] = useState<ExamSessionState>("ready");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [micFailed, setMicFailed] = useState(false);

  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [sttError, setSttError] = useState<string | null>(null);

  const [attemptKey, setAttemptKey] = useState(0);
  const [recordingResult, setRecordingResult] = useState<RecordingResult | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const recorderRef = useRef<RecorderHandle | null>(null);
  const questionPlayerRef = useRef<OomWavePlayerHandle | null>(null);
  const listenRequestRef = useRef(0);
  const sttAbortRef = useRef<AbortController | null>(null);
  const attemptIdRef = useRef(0);
  const timerIntervalRef = useRef<number | null>(null);

  const targetRangeLabel = `${resolved.level.targetSeconds[0]}–${resolved.level.targetSeconds[1]}초`;
  const levelLabel = `${resolved.level.displayName} (${resolved.level.targetLabel})`;
  const { preferences } = useTtsPreferences();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      listenRequestRef.current += 1;
      sttAbortRef.current?.abort();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // Elapsed timer tick when recording
  useEffect(() => {
    if (sessionState === "recording") {
      timerIntervalRef.current = window.setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [sessionState]);

  const [questionChanged, setQuestionChanged] = useState(false);
  const questionChangeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (questionChangeTimerRef.current) {
        window.clearTimeout(questionChangeTimerRef.current);
      }
    };
  }, []);

  const drawQuestion = () => {
    stopSpeech();
    listenRequestRef.current += 1;
    questionPlayerRef.current?.stop();
    sttAbortRef.current?.abort();
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    const candidates =
      availableQuestions.length > 1 && question
        ? availableQuestions.filter((item) => item.id !== question.id)
        : availableQuestions;

    const next =
      candidates.length > 0
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : null;

    setQuestion(next);
    setListenCount(0);
    setIsSpeaking(false);
    setQuestionAudioBlob(null);
    setQuestionTtsStatus("");
    setShowQuestionText(false);
    setShowStoryHint(false);
    setSessionState("ready");
    setElapsedSeconds(0);
    setMicFailed(false);
    setAnswer("");
    setFeedback("");
    setIsFeedbackLoading(false);
    setIsTranscribing(false);
    setSttError(null);
    setRecordingResult(null);

    attemptIdRef.current += 1;
    setAttemptKey((k) => k + 1);

    setQuestionChanged(true);
    if (questionChangeTimerRef.current) {
      window.clearTimeout(questionChangeTimerRef.current);
    }
    questionChangeTimerRef.current = window.setTimeout(() => {
      setQuestionChanged(false);
    }, 1200);
  };

  const describeTtsStatus = (status: TtsRuntimeStatus) => {
    if (status.phase === "loading-model") {
      const progress = typeof status.progress === "number" ? ` · ${Math.round(status.progress)}%` : "";
      return `음성 모델 준비 중 · 최초 1회${progress}`;
    }
    if (status.phase === "generating") {
      const progress = typeof status.progress === "number" ? ` · ${Math.round(status.progress)}%` : "";
      return `질문 음성 생성 중${progress}`;
    }
    if (status.phase === "fallback") return "시스템 음성으로 재생 중";
    return "질문 음성 준비 완료";
  };

  const handleListen = async () => {
    if (!question || sessionState === "recording" || listenCount >= 2) return;

    listenRequestRef.current += 1;
    const requestId = listenRequestRef.current;
    setListenCount((count) => count + 1);
    setIsSpeaking(true);
    stopSpeech();

    if (questionAudioBlob) {
      setQuestionTtsStatus("Kokoro 질문 음성 재생 중");
      setQuestionPlayRequest(requestId);
      return;
    }

    try {
      const source = await getTtsManager().preparePlayback(
        { text: question.prompt, voice: preferences.examVoice, speed: 0.95 },
        (status) => {
          if (requestId === listenRequestRef.current) {
            setQuestionTtsStatus(describeTtsStatus(status));
          }
        },
      );

      if (requestId !== listenRequestRef.current) return;

      if (source.kind === "audio") {
        setQuestionAudioBlob(source.blob);
        setQuestionPlayRequest(requestId);
        setQuestionTtsStatus("Kokoro 질문 음성 재생 중");
        return;
      }

      setQuestionTtsStatus("시스템 음성으로 재생 중");
      source.play({
        onEnd: () => {
          if (requestId === listenRequestRef.current) {
            setIsSpeaking(false);
            setQuestionTtsStatus("질문 음성 재생 완료");
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
      onToast(
        "음성 읽기(TTS)를 지원하지 않는 브라우저입니다.",
        error instanceof Error
          ? `${error.message} 문제 텍스트 보기 버튼으로 질문을 확인해 주세요.`
          : "문제 텍스트 보기 버튼으로 질문을 확인해 주세요.",
        "info"
      );
    }
  };

  const startAnswer = async () => {
    if (!question) {
      onToast("먼저 질문을 뽑아 주세요.", "랜덤 질문을 정한 뒤 답변을 시작할 수 있습니다.", "info");
      return;
    }

    stopSpeech();
    listenRequestRef.current += 1;
    questionPlayerRef.current?.stop();
    setIsSpeaking(false);
    setQuestionTtsStatus("");
    setMicFailed(false);
    setShowStoryHint(false);

    const success = (await recorderRef.current?.start()) ?? false;
    if (!success) {
      setMicFailed(true);
      return;
    }

    setElapsedSeconds(0);
    setSessionState("recording");
  };

  const startTimerOnly = () => {
    stopSpeech();
    listenRequestRef.current += 1;
    questionPlayerRef.current?.stop();
    setIsSpeaking(false);
    setQuestionTtsStatus("");
    setMicFailed(false);
    setShowStoryHint(false);
    setElapsedSeconds(0);
    setSessionState("recording");
  };

  const stopAnswer = () => {
    if (recorderRef.current?.isRecording()) {
      recorderRef.current.stop();
    }
    setSessionState("complete");
  };

  const handleRecordingReady = async (recording: RecordingResult) => {
    setRecordingResult(recording);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    const newUrl = URL.createObjectURL(recording.blob);
    setAudioUrl(newUrl);
    setSessionState("complete");

    if (!sttSettings?.endpoint?.trim() || !sttSettings.autoTranscribe) {
      return;
    }

    await performTranscribe(recording.blob, recording.mimeType);
  };

  const performTranscribe = async (blob: Blob, mimeType: string) => {
    if (!sttSettings?.endpoint?.trim()) {
      onToast("STT 설정이 필요합니다.", "AI 설정에서 STT Endpoint를 먼저 저장해 주세요.", "info");
      return;
    }

    sttAbortRef.current?.abort();
    const controller = new AbortController();
    sttAbortRef.current = controller;
    const requestAttemptId = attemptIdRef.current;

    setIsTranscribing(true);
    setSttError(null);

    try {
      const text = await transcribeAudio(sttSettings, blob, mimeType, controller.signal);
      if (!controller.signal.aborted && requestAttemptId === attemptIdRef.current) {
        setAnswer(text);
        onToast("음성을 텍스트로 변환했습니다.", "필요시 수정 후 AI 피드백을 요청하세요.", "success");
      }
    } catch (error) {
      if (!controller.signal.aborted && requestAttemptId === attemptIdRef.current) {
        const msg = error instanceof Error ? error.message : "STT 변환에 실패했습니다.";
        setSttError(msg);
        onToast("STT 변환 실패", `${msg} (직접 입력하거나 다시 변환할 수 있습니다)`, "error");
      }
    } finally {
      if (!controller.signal.aborted && requestAttemptId === attemptIdRef.current) {
        setIsTranscribing(false);
      }
    }
  };

  const handleManualTranscribe = () => {
    if (!recordingResult) {
      onToast("변환할 녹음이 없습니다.", "먼저 답변을 녹음해 주세요.", "info");
      return;
    }
    performTranscribe(recordingResult.blob, recordingResult.mimeType);
  };

  const retryAttempt = () => {
    stopSpeech();
    listenRequestRef.current += 1;
    questionPlayerRef.current?.stop();
    sttAbortRef.current?.abort();
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    attemptIdRef.current += 1;
    setListenCount(0);
    setIsSpeaking(false);
    setQuestionAudioBlob(null);
    setQuestionTtsStatus("");
    setShowQuestionText(false);
    setShowStoryHint(false);
    setSessionState("ready");
    setElapsedSeconds(0);
    setMicFailed(false);
    setAnswer("");
    setFeedback("");
    setIsFeedbackLoading(false);
    setIsTranscribing(false);
    setSttError(null);
    setRecordingResult(null);
    setAttemptKey((k) => k + 1);

    onToast("재도전 준비 완료", "질문을 다시 듣거나 '답변 시작'을 눌러 말해 보세요.", "info");
  };

  const getFeedback = async () => {
    if (!answer.trim()) {
      onToast("답변 텍스트가 비어 있습니다.", "음성을 녹음하거나 텍스트를 입력해 주세요.", "info");
      return;
    }

    if (!settings.endpoint.trim()) {
      setFeedback(
        "KEEP\n답변을 직접 말하고 Transcript로 확인하는 복기 흐름을 완료했습니다.\n\n" +
          "FIX\n질문의 시제와 첫 문장 직접 답하기 중 한 가지만 우선 확인하세요.\n\n" +
          "RETRY\n질문의 핵심 표현으로 첫 문장을 시작해 같은 답변을 다시 말하세요.\n\n" +
          `상세 체크리스트 · ${levelLabel}\n` +
          `1. 목표 시간 (${resolved.level.targetSeconds.join("–")}초) 내에 주요 장면을 완성했는가?\n` +
          `2. 질문에 첫 문장부터 직접 답했는가?\n` +
          `3. 시제와 핵심 명사 2개 이상이 명확하게 들어갔는가?\n` +
          `4. 침묵 대신 자연스러운 필러로 문장을 연결했는가?`
      );
      onToast("AI 설정이 필요합니다.", "설정 화면으로 이동해 내부 LLM Endpoint를 입력해 주세요.", "info");
      return;
    }

    setIsFeedbackLoading(true);

    try {
      const criteria = resolved.level.learningFocus.join(", ");
      const courseInfo = `Course: ${resolved.course.title}`;
      const durationSeconds = recordingResult?.durationSeconds ?? elapsedSeconds;
      const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
      const wpm = durationSeconds > 0 ? Math.round((wordCount / durationSeconds) * 60) : 0;

      const courseRecommendedStory = question?.storylineId
        ? resolved.storylines.find((story) => story.id === question.storylineId)
        : null;

      const storylineContext = courseRecommendedStory
        ? `Anchor Scene: ${courseRecommendedStory.core.anchorScene}, Core Facts: ${courseRecommendedStory.core.facts.join(" / ")}`
        : "";

      const result = await callInternalLlm(settings, [
        {
          role: "system",
          content:
            `You are an expert OPIc speaking coach. Provide concise, constructive, and highly actionable feedback in Korean.\n` +
            `Evaluate specifically against target level: ${levelLabel}.\n` +
            `Level Learning Focus: ${criteria}.\n` +
            `Target Duration: ${resolved.level.targetSeconds.join("–")}s.\n\n` +
            `Start with exactly these three concise sections, in this order:\nKEEP\n(one strength)\nFIX\n(one highest-priority correction)\nRETRY\n(one immediate same-question mission)\n\n` +
            `Then add a section titled 상세 진단 with optional detail on target-level fit, direct question response, ANSWER/SCENE-ACTION/RESULT structure, tense and specificity, word count/WPM/duration, and up to 3 natural alternatives.\n\n` +
            `Rules:\n` +
            `- Do NOT claim an official OPIc score or guarantee any grade.\n` +
            `- Do NOT grade pronunciation or intonation from text.\n` +
            `- Do NOT require exact script memorization; value natural communication and scene delivery.`,
        },
        {
          role: "user",
          content:
            `Question: ${question?.prompt ?? "General OPIc question"}\n\n` +
            `Student Answer Transcript:\n"${answer}"\n\n` +
            `Context:\n` +
            `- ${courseInfo}\n` +
            `- Target Level: ${levelLabel}\n` +
            `- Recording Duration: ${durationSeconds > 0 ? `${durationSeconds}s` : "Text direct input"}\n` +
            `- Word Count: ${wordCount} words\n` +
            `- Calculated WPM: ${wpm > 0 ? `${wpm} WPM` : "N/A"}\n` +
            (storylineContext ? `- Associated Storyline: ${storylineContext}\n` : ""),
        },
      ]);

      setFeedback(result);
      onToast("AI 피드백을 받았습니다.", "고칠 점과 다음 시도 미션을 확인해 보세요.", "success");
    } catch (error) {
      setFeedback(
        `KEEP\nTranscript를 확인하고 같은 질문 재도전까지 준비했습니다.\n\nFIX\n첫 문장이 질문에 직접 답하는지 한 가지만 확인하세요.\n\nRETRY\n첫 문장을 고쳐 같은 답변을 다시 말하세요.\n\n상세 진단\nAI 요청 실패: ${error instanceof Error ? error.message : "설정과 CORS 정책을 확인해 주세요."}`
      );
      onToast("AI 피드백에 실패했습니다.", "내장 체크리스트로 먼저 연습을 이어가세요.", "error");
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  const courseRecommended = question?.storylineId
    ? resolved.storylines.find((story) => story.id === question.storylineId)
    : null;

  const sttStatus = deriveSttUiStatus({
    endpoint: sttSettings?.endpoint,
    isTranscribing,
    transcript: answer,
    error: sttError,
  });

  const showReviewPanel =
    sessionState === "complete" ||
    Boolean(recordingResult) ||
    Boolean(audioUrl) ||
    Boolean(answer.trim()) ||
    Boolean(feedback);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <span className="text-xs font-bold uppercase tracking-wider">
            STEP 6. 실전 연습
          </span>
        </div>
        <h1 className="mt-1.5 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">
          시험 화면 스타일로 질문을 듣고, 말하고, 복기합니다.
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          실제 OPIc 시험 화면처럼 가상 인터뷰어의 질문을 최대 2회 듣고 답변을 녹음한 뒤, 내 발화를 다시 듣고 STT와 AI 맞춤 피드백으로 개선점을 점검합니다.
        </p>
      </div>

      {/* Headless Recorder engine; ExamScreenShell owns the visible controls. */}
      <Recorder
        mode="engine"
        onRecordingReady={handleRecordingReady}
        onToast={onToast}
        ref={recorderRef}
        resetKey={attemptKey}
      />

      {/* Phase A: Exam Screen Console */}
      <ExamScreenShell
        audioPlayer={questionAudioBlob ? (
          <OomWavePlayer
            autoPlayRequest={questionPlayRequest}
            blob={questionAudioBlob}
            controls={false}
            onError={(error) => {
              setIsSpeaking(false);
              setQuestionTtsStatus("질문 음성을 재생할 수 없습니다.");
              onToast("질문 음성 재생 실패", error.message, "error");
            }}
            onFinish={() => {
              setIsSpeaking(false);
              setQuestionTtsStatus("질문 음성 재생 완료");
            }}
            onPlaybackChange={(playing) => {
              setIsSpeaking(playing);
              if (playing) setQuestionTtsStatus("Kokoro 질문 음성 재생 중");
            }}
            ref={questionPlayerRef}
            surface="console"
            variant="exam"
          />
        ) : undefined}
        courseLabel={resolved.course.title}
        elapsedLabel={formatTime(elapsedSeconds)}
        isSpeaking={isSpeaking}
        levelLabel={levelLabel}
        listenCount={listenCount}
        maxListenCount={2}
        micFailed={micFailed}
        onDrawQuestion={drawQuestion}
        onListen={handleListen}
        onNavigateToGuide={onNavigate ? () => onNavigate("exam-screen") : undefined}
        onStartAnswer={startAnswer}
        onStartTimerOnly={startTimerOnly}
        onStopAnswer={stopAnswer}
        onToggleQuestionText={() => setShowQuestionText((s) => !s)}
        onToggleStoryHint={() => setShowStoryHint((s) => !s)}
        questionChanged={questionChanged}
        questionGroup={question?.group}
        questionPrompt={question?.prompt}
        questionTypeLabel={question ? questionTypeLabels[question.type] ?? question.type : undefined}
        recommendedStoryScene={courseRecommended?.core.anchorScene}
        recommendedStoryTitle={courseRecommended?.title}
        showQuestionText={showQuestionText}
        showStoryHint={showStoryHint}
        state={sessionState}
        targetRangeLabel={targetRangeLabel}
        ttsStatus={questionTtsStatus || undefined}
      />

      {/* Phase B: Post-Answer Coaching Review Panel (visible when complete or answer exists) */}
      {showReviewPanel ? (
        <div className="pt-2">
          <PracticeReviewPanel
            answer={answer}
            audioUrl={audioUrl}
            autoTranscribe={sttSettings?.autoTranscribe ?? true}
            durationSeconds={recordingResult?.durationSeconds ?? elapsedSeconds}
            feedback={feedback}
            hasRecording={Boolean(recordingResult || audioUrl)}
            isFeedbackLoading={isFeedbackLoading}
            onAnswerChange={setAnswer}
            onFeedback={getFeedback}
            onNavigateToSettings={onNavigate ? () => onNavigate("ai-settings") : undefined}
            onRetryAttempt={retryAttempt}
            onTranscribe={handleManualTranscribe}
            sttError={sttError}
            sttStatus={sttStatus}
          />
        </div>
      ) : null}
    </div>
  );
}

export function PracticeView({
  settings,
  sttSettings,
  onToast,
  onNavigate,
}: PracticeViewProps) {
  return (
    <TrainingSelectionGuard onNavigate={onNavigate} stepName="STEP 6. 실전 연습">
      {(resolved) => (
        <PracticeViewContent
          onNavigate={onNavigate}
          onToast={onToast}
          resolved={resolved}
          settings={settings}
          sttSettings={sttSettings}
        />
      )}
    </TrainingSelectionGuard>
  );
}
