import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

describe("OPIc exam guide", () => {
  it("opens the guide hub", async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByRole("button", { name: "OPIc 수험 가이드" })).toBeInTheDocument();
  });

  it("opens guide child routes directly", async () => {
    render(
      <MemoryRouter initialEntries={["/exam-guide/overview"]}>
        <App />
      </MemoryRouter>
    );
    expect(await screen.findByRole("heading", { name: "OPIc의 방식과 등급을 먼저 이해해요." })).toBeInTheDocument();
  });

  it("opens the Q&A guide route directly", async () => {
    render(
      <MemoryRouter initialEntries={["/exam-guide/faq"]}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { name: "시험 전에 헷갈리는 질문만 빠르게 확인하세요." })).toBeInTheDocument();
    expect(screen.getByText("자기소개를 안 하면 감점되나요?")).toBeInTheDocument();
  });

  it("shows only the OPIc fee on the application guide", async () => {
    render(
      <MemoryRouter initialEntries={["/exam-guide/apply/"]}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { name: "시험 응시료" })).toBeInTheDocument();
    expect(screen.getByText("84,000원")).toBeInTheDocument();
    expect(screen.queryByText("WPT")).not.toBeInTheDocument();
    expect(screen.queryByText("L&Rcat")).not.toBeInTheDocument();
    expect(screen.queryByText("OPI")).not.toBeInTheDocument();
  });

  it("opens the exam screen guide route directly and renders demo callouts", async () => {
    render(
      <MemoryRouter initialEntries={["/exam-guide/screen/"]}>
        <App />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("heading", {
        name: "시험장에서 화면이 낯설지 않도록 미리 익혀보세요.",
      })
    ).toBeInTheDocument();
    expect(screen.getByText("인터뷰어 영역")).toBeInTheDocument();
    expect(screen.getByText("Replay / 청취 횟수")).toBeInTheDocument();
    expect(screen.getByText("시험 조작 인터페이스 구성 도식")).toBeInTheDocument();
  });

  it("allows interactive callout selection between screen badges and explanation cards", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/exam-guide/screen/"]}>
        <App />
      </MemoryRouter>
    );

    // Callout 3 badge
    const badge3 = screen.getByRole("button", { name: "3번 영역 설명 보기" });
    await user.click(badge3);
    expect(badge3).toHaveAttribute("aria-pressed", "true");

    // Card 4 click
    const card4 = screen.getByRole("button", { name: "4번 마이크 · 녹음 상태 설명 카드" });
    await user.click(card4);
    expect(card4).toHaveAttribute("aria-pressed", "true");
    const badge4 = screen.getByRole("button", { name: "4번 영역 설명 보기" });
    expect(badge4).toHaveAttribute("aria-pressed", "true");
  });
});
