import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { scripts } from "./data/scripts";
import { ScriptTrainingTabs } from "./components/script/ScriptTrainingTabs";
import { ScriptQuestionVariants } from "./components/script/ScriptTrainingGuide";
import { TrainingSelectionProvider } from "./training/TrainingSelectionContext";
import { resolveTrainingContext } from "./training/courseRegistry";
import { saveTrainingSelection } from "./training/storage";
import type { LlmSettings, ScriptItem } from "./types";

const settings: LlmSettings = {
  endpoint: "",
  apiKey: "",
  model: "",
  mode: "openai-compatible",
  authType: "bearer",
  customBodyTemplate: "",
};

describe("ScriptTrainingTabs", () => {
  it("shows question variants and the answer blueprint for the selected scene", async () => {
    const user = userEvent.setup();
    render(<ScriptTrainingTabs onToast={() => undefined} script={scripts[0]} settings={settings} />);

    await user.click(screen.getByRole("tab", { name: "질문별 변형" }));
    expect(screen.getByText("좋아하는 장소")).toBeInTheDocument();
    expect(screen.getAllByText("Tell me about a beach destination you enjoyed visiting.")).toHaveLength(2);

    await user.click(screen.getByRole("tab", { name: "답변 설계" }));
    expect(screen.getAllByText(/시작 · 서론/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/핵심 장면 · 본론/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/마무리 · 결론/).length).toBeGreaterThan(0);
    expect(screen.getByText("질문이 바뀌어도, 장면을 새로 만들지 말고 출발점을 바꿉니다.")).toBeInTheDocument();
  });

  it("shows the three learning sections by default and keeps fact-level KEEP/CHANGE/DROP", async () => {
    const user = userEvent.setup();
    render(<ScriptTrainingTabs onToast={() => undefined} script={scripts[0]} settings={settings} />);

    expect(screen.getByText(/시작 · 서론/)).toBeInTheDocument();
    expect(screen.getByText(/핵심 장면 · 본론/)).toBeInTheDocument();
    expect(screen.getByText(/마무리 · 결론/)).toBeInTheDocument();
    expect(screen.getByText(/실제 문단 수를 뜻하는 규칙이 아니라/)).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: "3단 구조 보기" }));
    expect(screen.queryByText(/시작 · 서론/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "질문별 변형" }));
    expect(screen.getAllByText(/CHANGE/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/KEEP/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/DROP/).length).toBeGreaterThan(0);
    expect(screen.queryByText("조립된 답변 보기")).not.toBeInTheDocument();
  });

  it("labels a canonical optional fact as required for a matching question", async () => {
    const user = userEvent.setup();
    saveTrainingSelection({ courseId: "course-3", levelId: "advanced" });
    const storyline = resolveTrainingContext("course-3", "advanced").storylines.find((item) => item.id === "coastal-camp")!;
    const script: ScriptItem = {
      id: storyline.id,
      group: storyline.group,
      title: storyline.title,
      goalLevel: "AL",
      surveyBadges: [...storyline.surveyOptionIds],
      covers: [...storyline.core.reusableFor],
      expectedQuestions: [],
      strategy: storyline.core.anchorScene,
      keywords: [...storyline.core.facts],
      fillerPhrases: [],
      koreanSummary: storyline.active.koreanSummary,
      englishScript: storyline.active.englishScript,
      pointNotes: [...storyline.active.skills],
      trainingLevelId: "advanced",
    };

    render(<TrainingSelectionProvider><ScriptQuestionVariants script={script} /></TrainingSelectionProvider>);
    await user.click(screen.getByText("여행 중 겪은 문제와 해결"));

    expect(screen.getByText("이 질문에서는 필수")).toBeInTheDocument();
    expect(screen.getByText("REQUIRED FOR THIS QUESTION")).toBeInTheDocument();
    expect(screen.getByText("strong wind")).toBeInTheDocument();
    expect(screen.getByText("sunrise by beach")).toBeInTheDocument();
  });
});
