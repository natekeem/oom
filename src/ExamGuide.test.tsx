import { render, screen } from "@testing-library/react";
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
});
