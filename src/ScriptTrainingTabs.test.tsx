import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { scripts } from "./data/scripts";
import { ScriptTrainingTabs } from "./components/script/ScriptTrainingTabs";
import type { LlmSettings } from "./types";

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
    expect(screen.getAllByText("Tell me about a park or beach you enjoy going to.")).toHaveLength(2);

    await user.click(screen.getByRole("tab", { name: "답변 설계" }));
    expect(screen.getByText("질문의 중심 명사 고르기")).toBeInTheDocument();
    expect(screen.getByText("질문이 바뀌어도, 장면을 새로 만들지 말고 출발점을 바꿉니다.")).toBeInTheDocument();
  });

  it("labels story sections and highlights replacement paragraphs in the assembled answer", async () => {
    const user = userEvent.setup();
    render(<ScriptTrainingTabs onToast={() => undefined} script={scripts[0]} settings={settings} />);

    expect(screen.getByText("INTRO")).toBeInTheDocument();
    expect(screen.getByText("MAIN")).toBeInTheDocument();
    expect(screen.getByText("FINISH")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "질문별 변형" }));
    await user.click(screen.getByText("조립된 답변 보기"));

    expect(screen.getByText("교체 문단")).toBeInTheDocument();
    expect(screen.getAllByText("유지 문단")).toHaveLength(2);
  });
});
