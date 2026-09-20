import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../../auth/useAuth";
import { StudyCompletion } from "./StudyCompletion";
import { StudyActivitySection } from "./StudyActivitySection";
import { useStudyCompletion } from "./useStudyCompletion";
import * as repo from "./activityRepository";
import { LearningShortcuts } from "../../auth/LearningShortcuts";
import { PricingPage } from "../../components/pricing/PricingPage";
import { ServiceFooter } from "../../components/layout/ServiceFooter";
import type { AuthContextValue } from "../../auth/authTypes";
import { BackgroundSurveySheet } from "../../components/survey/BackgroundSurveySheet";
import { allSurveyPresets } from "../../training/courseRegistry";
import { backgroundSurveySections } from "../../data/fixedSurvey";
import { MyPage } from "../../auth/MyPage";

vi.mock("../../auth/useAuth");
vi.mock("./activityRepository");
vi.mock("../../training/TrainingSelectionContext", () => ({ useTrainingSelection: () => ({ selection: { courseId: "course-1", levelId: "advanced" }, isAccountSynced: true, isLoadingPreferences: false }) }));
vi.mock("../history/useLearningHistory", () => ({ useLearningHistory: () => ({ sessions: [], status: "success", isEmpty: true, retry: vi.fn() }) }));
const unit: repo.StudyUnit = { activity_type: "universal_script_completed", course_id: "course-1", level_id: "advanced", content_id: "outdoor" };
const event: repo.ActivityEvent = { ...unit, id: "event-a", user_id: "a", occurred_at: "2026-09-20T10:00:00Z", created_at: "2026-09-20T10:00:00Z" };
function login(id: string | null) {
  vi.mocked(useAuth).mockReturnValue({ status: id ? "authenticated" : "anonymous", user: id ? { id } : null } as AuthContextValue);
}
beforeEach(() => { vi.resetAllMocks(); login("a"); vi.mocked(repo.insertActivity).mockResolvedValue(true); vi.mocked(repo.getRecentActivities).mockResolvedValue([]); });

describe("explicit study completion", () => {
  it("records Survey only after exact grading, never on checkbox changes or failed grading", async () => {
    render(<BackgroundSurveySheet />);
    fireEvent.click(screen.getByRole("button", { name: "연습 모드", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "전체 보기", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "선택한 서베이 답안 채점하기" }));
    expect(repo.insertActivity).not.toHaveBeenCalled();
    const survey = allSurveyPresets.find(item => item.courseId === "course-1")!;
    const ids = [...survey.profileOptionIds, ...survey.residenceOptionIds, ...survey.activityOptionIds];
    for (const option of backgroundSurveySections.flatMap(section => section.options).filter(option => ids.includes(option.id))) {
      fireEvent.click(screen.getByLabelText(option.label, { exact: true }));
    }
    expect(repo.insertActivity).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "선택한 서베이 답안 채점하기" }));
    await waitFor(() => expect(repo.insertActivity).toHaveBeenCalledExactlyOnceWith("a", expect.any(String), { activity_type: "survey_completed", course_id: "course-1", level_id: "advanced", content_id: survey.id }));
  });
  it("does not write on mount, and anonymous completion stays usable", async () => {
    login(null);
    render(<StudyCompletion unit={unit} />);
    expect(repo.insertActivity).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "학습 완료" }));
    expect(await screen.findByText(/학습을 완료했어요/)).toBeInTheDocument();
    expect(repo.insertActivity).not.toHaveBeenCalled();
  });
  it("inserts one event for simultaneous completion calls and locks the completed unit", async () => {
    const { result } = renderHook(() => useStudyCompletion(unit));
    await act(async () => { await Promise.all([result.current.complete(), result.current.complete()]); });
    await act(async () => { await result.current.complete(); });
    expect(repo.insertActivity).toHaveBeenCalledExactlyOnceWith("a", expect.any(String), unit);
    expect(result.current.status).toBe("saved");
  });
  it("allows repeat study after reopening with a new event ID", async () => {
    const first = renderHook(() => useStudyCompletion(unit));
    await act(async () => { await first.result.current.complete(); });
    first.unmount();
    const second = renderHook(() => useStudyCompletion(unit));
    await act(async () => { await second.result.current.complete(); });
    const calls = vi.mocked(repo.insertActivity).mock.calls;
    expect(calls).toHaveLength(2);
    expect(calls[0][1]).not.toBe(calls[1][1]);
  });
  it("shows a safe failure and retries the same ID without blocking other actions", async () => {
    vi.mocked(repo.insertActivity).mockRejectedValueOnce(new Error("private database detail"));
    const navigate = vi.fn();
    render(<><StudyCompletion unit={unit} /><button onClick={navigate}>다음 단계</button></>);
    fireEvent.click(screen.getByRole("button", { name: "학습 완료" }));
    await screen.findByText(/기록을 저장하지 못했어요/);
    fireEvent.click(screen.getByText("다음 단계"));
    expect(navigate).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "완료 기록 다시 시도" }));
    await screen.findByText(/계정에 기록했어요/);
    const calls = vi.mocked(repo.insertActivity).mock.calls;
    expect(calls[0][1]).toBe(calls[1][1]);
    expect(screen.queryByText(/private database/)).not.toBeInTheDocument();
  });
  it("isolates completion state when user or content changes", async () => {
    const { result, rerender } = renderHook(({ content_id }) => useStudyCompletion({ ...unit, content_id }), { initialProps: { content_id: "one" } });
    await act(async () => { await result.current.complete(); });
    login("b"); rerender({ content_id: "two" });
    expect(result.current.status).toBe("idle");
    await act(async () => { await result.current.complete(); });
    expect(repo.insertActivity).toHaveBeenLastCalledWith("b", expect.any(String), { ...unit, content_id: "two" });
  });
});

describe("activity history", () => {
  it("shows real activity alongside My Page profile/settings and practice history", async () => {
    vi.mocked(repo.getRecentActivities).mockResolvedValue([event]);
    render(<MemoryRouter><MyPage /></MemoryRouter>);
    expect(await screen.findByText("최근 학습 활동")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "학습 바로가기" })).toBeInTheDocument();
    expect(screen.getByText("최근 연습 기록")).toBeInTheDocument();
    await screen.findByText("학습 완료");
  });
  it("renders real activities and hides A synchronously on B switch", async () => {
    vi.mocked(repo.getRecentActivities).mockResolvedValueOnce([event]).mockReturnValueOnce(new Promise(() => {}));
    const { rerender } = render(<StudyActivitySection />);
    await screen.findByText("만능 스크립트");
    login("b"); rerender(<StudyActivitySection />);
    expect(screen.queryByText("만능 스크립트")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("불러오는 중");
  });
  it("ignores a late response after logout", async () => {
    let resolve!: (events: repo.ActivityEvent[]) => void;
    vi.mocked(repo.getRecentActivities).mockReturnValue(new Promise(done => { resolve = done; }));
    const { rerender } = render(<StudyActivitySection />);
    login(null); rerender(<StudyActivitySection />);
    await act(async () => { resolve([event]); });
    expect(screen.queryByText("만능 스크립트")).not.toBeInTheDocument();
  });
  it("supports empty, failure and retry", async () => {
    vi.mocked(repo.getRecentActivities).mockRejectedValueOnce(new Error("secret"));
    render(<StudyActivitySection />);
    await screen.findByRole("alert");
    fireEvent.click(screen.getByText("활동 다시 불러오기"));
    await screen.findByText(/아직 완료한 학습 활동이 없어요/);
    expect(repo.getRecentActivities).toHaveBeenCalledTimes(2);
  });
});

describe("learning navigation and plans", () => {
  it("links all five learning destinations", () => {
    render(<MemoryRouter><LearningShortcuts /></MemoryRouter>);
    expect(screen.getAllByRole("link").map(link => link.getAttribute("href"))).toEqual(["/training/setup/", "/training/survey/", "/training/scripts/", "/roleplay/", "/practice/"]);
  });
  it("offers only real free start and a disabled planned PRO", () => {
    render(<MemoryRouter><PricingPage /></MemoryRouter>);
    expect(screen.getByRole("link", { name: "무료로 시작하기" })).toHaveAttribute("href", "/training/setup/");
    expect(screen.getByRole("button", { name: "PRO 준비 중" })).toBeDisabled();
  });
  it("exposes pricing in the shared footer", async () => {
    render(<MemoryRouter><ServiceFooter /></MemoryRouter>);
    await waitFor(() => expect(screen.getByRole("link", { name: "요금제" })).toHaveAttribute("href", "/pricing/"));
    expect(screen.getByText(`© ${new Date().getFullYear()} OOM · 오픽온미`)).toBeInTheDocument();
  });
});
