import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSessionPersistence } from "./useSessionPersistence";
import { useLearningHistory } from "./useLearningHistory";
import * as repo from "./historyRepository";
import { useAuth } from "../../auth/useAuth";
import type { LearningSession } from "./historyTypes";

vi.mock("../../auth/useAuth");
vi.mock("./historyRepository");

const mockAuth = useAuth as ReturnType<typeof vi.fn>;
const mockCreateSession = repo.createSession as ReturnType<typeof vi.fn>;
const mockRecordAttempt = repo.createAttempt as ReturnType<typeof vi.fn>;
const mockCompleteSession = repo.completeSession as ReturnType<typeof vi.fn>;
const mockGetRecentSessions = repo.getRecentSessions as ReturnType<typeof vi.fn>;

describe("useSessionPersistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does nothing for anonymous users", async () => {
    mockAuth.mockReturnValue({ status: "anonymous", user: null });
    const { result } = renderHook(() => useSessionPersistence("quick_practice"));
    
    const sid = await result.current.startSession("advanced", 5);
    expect(sid).toBeNull();
    expect(mockCreateSession).not.toHaveBeenCalled();

    result.current.recordAttempt("q1", 1, 60);
    expect(mockRecordAttempt).not.toHaveBeenCalled();

    result.current.completeSession();
    expect(mockCompleteSession).not.toHaveBeenCalled();
  });

  it("persists for authenticated users", async () => {
    mockAuth.mockReturnValue({
      status: "authenticated",
      user: { id: "user-1" },
    });
    mockCreateSession.mockResolvedValue({ id: "session-1" } as LearningSession);
    
    const { result } = renderHook(() => useSessionPersistence("quick_practice"));
    
    const sid = await result.current.startSession("advanced", 5);
    expect(sid).toBe("session-1");
    expect(mockCreateSession).toHaveBeenCalledWith("user-1", "quick_practice", "advanced", 5);
    
    result.current.recordAttempt("q1", 1, 60);
    expect(mockRecordAttempt).toHaveBeenCalledWith("user-1", "session-1", "q1", 1, 60, true);
    
    result.current.completeSession();
    expect(mockCompleteSession).toHaveBeenCalledWith("session-1", 1);
  });
});

describe("useLearningHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty for anonymous users", () => {
    mockAuth.mockReturnValue({ status: "anonymous", user: null });
    const { result } = renderHook(() => useLearningHistory());
    
    expect(result.current.sessions).toEqual([]);
    expect(result.current.status).toBe("idle");
    expect(mockGetRecentSessions).not.toHaveBeenCalled();
  });

  it("fetches history for authenticated users", async () => {
    mockAuth.mockReturnValue({
      status: "authenticated",
      user: { id: "user-1" },
    });
    const mockSessions: LearningSession[] = [
      {
        id: "s1",
        mode: "quick_practice",
        status: "completed",
        targetLevel: "advanced",
        questionCount: 0,
        answeredCount: 5,
        startedAt: "2026-09-19T00:00:00Z",
        completedAt: "2026-09-19T00:10:00Z",
      },
    ];
    mockGetRecentSessions.mockResolvedValue(mockSessions);
    
    const { result } = renderHook(() => useLearningHistory());
    
    expect(result.current.status).toBe("loading");
    
    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });
    
    expect(result.current.sessions).toEqual(mockSessions);
    expect(mockGetRecentSessions).toHaveBeenCalledWith(20);
  });

  it("handles errors gracefully", async () => {
    mockAuth.mockReturnValue({
      status: "authenticated",
      user: { id: "user-1" },
    });
    mockGetRecentSessions.mockRejectedValue(new Error("Failed"));
    
    const { result } = renderHook(() => useLearningHistory());
    
    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });
    
    expect(result.current.sessions).toEqual([]);
  });
});
