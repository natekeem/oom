import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { MockPostExamNav } from "./MockPostExamNav";

it("uses the shared three-tab result workspace semantics", async () => {
  const onChange = vi.fn();
  const user = userEvent.setup();
  render(<MockPostExamNav active="summary" onChange={onChange} />);

  expect(screen.getByRole("tablist", { name: "모의고사 결과 보기" })).toBeInTheDocument();
  expect(screen.getAllByRole("tab")).toHaveLength(3);
  expect(screen.getByRole("tab", { name: "결과 요약" })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("tab", { name: "답변 복기" })).toHaveAttribute("aria-selected", "false");

  await user.click(screen.getByRole("tab", { name: "훈련 리포트" }));
  expect(onChange).toHaveBeenCalledWith("report");
});
