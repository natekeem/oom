import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScriptDetail } from "./components/script/ScriptDetail";
import { ScriptTrainingTabs } from "./components/script/ScriptTrainingTabs";
import { buildTransformedAnswer, buildVariantAnswerSections } from "./components/script/scriptVariantTransform";
import { getTrainingReplacementGuide } from "./training/courseRegistry";
import { resolveTrainingContext } from "./training/courseRegistry";
import { TrainingSelectionProvider } from "./training/TrainingSelectionContext";
import { clearTrainingSelection, saveTrainingSelection } from "./training/storage";
import type { TrainingCourseId, TrainingLevelId } from "./training/types";
import type { LlmSettings, ScriptItem } from "./types";

const settings: LlmSettings = {
  endpoint: "",
  apiKey: "",
  model: "",
  mode: "openai-compatible",
  authType: "bearer",
  customBodyTemplate: "",
};

function getScript(
  courseId: TrainingCourseId = "course-1",
  levelId: TrainingLevelId = "advanced",
  storylineId?: string
): ScriptItem {
  const context = resolveTrainingContext(courseId, levelId);
  const storyline = storylineId
    ? context.storylines.find((item) => item.id === storylineId)!
    : context.storylines[0];
  return {
    id: storyline.id,
    group: storyline.group,
    title: storyline.title,
    goalLevel: levelId === "advanced" ? "AL" : levelId === "intermediate" ? "IH" : "IM3",
    surveyBadges: [...storyline.surveyOptionIds],
    covers: [...storyline.core.reusableFor],
    expectedQuestions: [],
    strategy: storyline.core.anchorScene,
    keywords: [...storyline.core.facts],
    fillerPhrases: [],
    koreanSummary: storyline.active.koreanSummary,
    englishScript: storyline.active.englishScript,
    pointNotes: [...storyline.active.skills],
    trainingLevelId: levelId,
    targetSeconds: context.level.targetSeconds,
    trainingCourseId: courseId,
    baseQuestion: storyline.baseQuestion,
  };
}

function renderTabs(script: ScriptItem, courseId: TrainingCourseId, levelId: TrainingLevelId) {
  saveTrainingSelection({ courseId, levelId });
  return render(
    <TrainingSelectionProvider>
      <ScriptTrainingTabs onToast={() => undefined} script={script} settings={settings} />
    </TrainingSelectionProvider>
  );
}

beforeEach(() => {
  clearTrainingSelection();
});

describe("ScriptTrainingTabs", () => {
  it("renders the bilingual base question above a plain, complete canonical answer", () => {
    const script = getScript();
    renderTabs(script, "course-1", "advanced");

    expect(screen.getByText("기준 질문과 전체 답변")).toBeInTheDocument();
    expect(screen.getByText(script.baseQuestion!.en)).toBeInTheDocument();
    expect(screen.getByText(script.baseQuestion!.ko)).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "3단 구조 보기" })).not.toBeChecked();
    for (const paragraph of script.englishScript.split(/\n\s*\n/)) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
  });

  it("uses the structure checkbox only for emphasis and resets it when the source changes", async () => {
    const user = userEvent.setup();
    const first = getScript("course-1", "advanced", "outdoor-travel");
    const second = getScript("course-1", "intermediate", "indoor-rest");
    const view = render(<ScriptDetail onToast={() => undefined} script={first} settings={settings} />);
    const checkbox = screen.getByRole("checkbox", { name: "3단 구조 보기" });

    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(screen.getByLabelText("서론 본론 결론 3단 학습 구조")).toBeInTheDocument();
    expect(screen.getByText(/시작 · 서론/)).toBeInTheDocument();
    expect(screen.getByText(/핵심 장면 · 본론/)).toBeInTheDocument();
    expect(screen.getByText(/마무리 · 결론/)).toBeInTheDocument();
    expect(screen.getByText(/실제 문단 수를 뜻하는 규칙이 아니라/)).toBeInTheDocument();

    await user.click(checkbox);
    for (const paragraph of first.englishScript.split(/\n\s*\n/)) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }

    await user.click(checkbox);
    view.rerender(<ScriptDetail onToast={() => undefined} script={second} settings={settings} />);
    expect(screen.getByRole("checkbox", { name: "3단 구조 보기" })).not.toBeChecked();
    for (const paragraph of second.englishScript.split(/\n\s*\n/)) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
  });

  it("uses the same four-scenario selector and keeps the selected variant across tabs", async () => {
    const user = userEvent.setup();
    const script = getScript();
    renderTabs(script, "course-1", "advanced");

    await user.click(screen.getByRole("tab", { name: "질문별 변형" }));
    const variationSelector = screen.getByLabelText("변형 질문 선택");
    expect(within(variationSelector).getAllByRole("button")).toHaveLength(4);
    await user.click(within(variationSelector).getByText("여행지에서 한 활동"));
    expect(within(variationSelector).getByText("여행지에서 한 활동").closest("button")).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("tab", { name: "답변 설계" }));
    const blueprintSelector = screen.getByLabelText("설계도 질문 선택");
    expect(within(blueprintSelector).getAllByRole("button")).toHaveLength(4);
    expect(within(blueprintSelector).getByText("여행지에서 한 활동").closest("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("shows base and pivot questions bilingually before a deterministic full-answer comparison", async () => {
    const user = userEvent.setup();
    const script = getScript();
    renderTabs(script, "course-1", "advanced");
    await user.click(screen.getByRole("tab", { name: "질문별 변형" }));

    expect(screen.getByText(script.baseQuestion!.en)).toBeInTheDocument();
    expect(screen.getByText(script.baseQuestion!.ko)).toBeInTheDocument();
    expect(screen.getByText("Tell me about a beach destination you enjoyed visiting.")).toBeInTheDocument();
    expect(screen.getByText("즐겁게 방문했던 바닷가 여행지를 말해 주세요.")).toBeInTheDocument();
    expect(screen.getByText("질문 초점 변화")).toBeInTheDocument();

    const guide = getTrainingReplacementGuide("course-1", script.id, "favorite-place");
    const sections = buildVariantAnswerSections(script, guide, "advanced");
    const baseAnswer = screen.getByLabelText("기본 전체 답변");
    const transformedAnswer = screen.getByLabelText("변형 전체 답변");
    for (const section of sections) {
      expect(within(baseAnswer).getByText(section.sourceText)).toBeInTheDocument();
      expect(within(transformedAnswer).getByText(section.transformedText)).toBeInTheDocument();
    }
    expect(within(baseAnswer).getByText("CHANGE 전")).toBeInTheDocument();
    expect(within(transformedAnswer).getByText("CHANGE")).toBeInTheDocument();
  });

  it("promotes an optional fact to required without also labeling it optional", async () => {
    const user = userEvent.setup();
    const script = getScript("course-3", "advanced", "coastal-camp");
    renderTabs(script, "course-3", "advanced");
    await user.click(screen.getByRole("tab", { name: "질문별 변형" }));
    await user.click(screen.getByText("여행 중 겪은 문제와 해결"));

    expect(screen.getAllByText("이 질문에서는 필수").length).toBeGreaterThan(0);
    expect(screen.getByText("REQUIRED FOR THIS QUESTION")).toBeInTheDocument();
    expect(screen.getAllByText("strong wind").length).toBeGreaterThan(0);
    const optionalCard = screen.getByText("OPTIONAL · 여유가 있으면").closest("div")!;
    expect(within(optionalCard).queryByText("strong wind")).not.toBeInTheDocument();
    expect(within(optionalCard).getByText("sunrise by beach")).toBeInTheDocument();
  });

  it("keeps the blueprint rule-focused and cross-navigates without losing the variant", async () => {
    const user = userEvent.setup();
    const script = getScript();
    renderTabs(script, "course-1", "advanced");
    await user.click(screen.getByRole("tab", { name: "질문별 변형" }));
    await user.click(screen.getByText("여행 방식의 변화"));
    await user.click(screen.getByRole("button", { name: /이 질문의 설계 원리 보기/ }));

    expect(screen.getByText("그 변형을 내가 직접 만드는 방법")).toBeInTheDocument();
    expect(screen.getByText("내가 직접 말할 때")).toBeInTheDocument();
    expect(screen.getByText("여행 방식의 변화").closest("button")).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByLabelText("변형 전체 답변")).not.toBeInTheDocument();
    expect(screen.queryByText("전체 답변 비교")).not.toBeInTheDocument();
    expect(screen.getAllByText("OPEN", { exact: false }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("SCENE", { exact: false }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("CLOSE", { exact: false }).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /완성된 변형 답변 보기/ }));
    expect(screen.getByText("질문이 바뀌면 실제 전체 답변이 이렇게 바뀝니다")).toBeInTheDocument();
    expect(screen.getByText("여행 방식의 변화").closest("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("uses the complete original script for copy and TTS", async () => {
    const user = userEvent.setup();
    const script = getScript();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    class MockSpeechSynthesisUtterance {
      text: string;
      lang = "";
      voice: SpeechSynthesisVoice | null = null;
      rate = 1;
      constructor(text: string) { this.text = text; }
    }
    vi.stubGlobal("SpeechSynthesisUtterance", MockSpeechSynthesisUtterance);
    const speak = vi.spyOn(window.speechSynthesis, "speak").mockImplementation(() => undefined);
    render(<ScriptDetail onToast={() => undefined} script={script} settings={settings} />);

    await user.click(screen.getByRole("button", { name: "영어 스크립트 복사" }));
    expect(writeText).toHaveBeenCalledWith(script.englishScript);
    await user.click(screen.getByRole("button", { name: "영어 스크립트 재생" }));
    expect((speak.mock.calls[0][0] as SpeechSynthesisUtterance).text).toBe(script.englishScript);
    vi.unstubAllGlobals();
  });

  it("removes every replaced source block from the transformed full answer", () => {
    const script = getScript("course-3", "advanced", "coastal-camp");
    const guide = getTrainingReplacementGuide("course-3", script.id, "travel-problem")!;
    const sections = buildVariantAnswerSections(script, guide, "advanced");
    const transformed = buildTransformedAnswer(script, guide, "advanced");

    for (const section of sections.filter((item) => item.status === "change")) {
      expect(transformed).not.toContain(section.sourceText);
      expect(transformed).toContain(section.transformedText);
    }
    expect(transformed).toContain("strong winds");
    expect(transformed).toContain("experienced camper nearby");
  });
});
