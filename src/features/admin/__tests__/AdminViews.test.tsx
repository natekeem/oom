import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as adminApi from "../adminApi";
import { AdminAuditView } from "../AdminAuditView";
import { AdminDashboardView } from "../AdminDashboardView";
import { AdminLearningView } from "../AdminLearningView";
import { AdminUsersView } from "../AdminUsersView";
import * as useAdminAccessModule from "../useAdminAccess";

vi.mock("../adminApi");
vi.mock("../useAdminAccess", () => ({
  useAdminAccess: vi.fn(),
}));

describe("Admin Console Views", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAdminAccessModule.useAdminAccess).mockReturnValue({
      status: "authorized",
      role: "owner",
      adminUser: {
        userId: "admin-uuid-1",
        role: "owner",
        displayName: "Admin Kim",
        avatarUrl: null,
      },
      error: null,
      refresh: vi.fn(),
    });
  });

  describe("AdminDashboardView", () => {
    it("renders real operational metrics and no fake AI/revenue metrics", async () => {
      vi.mocked(adminApi.fetchAdminOverview).mockResolvedValueOnce({
        metrics: {
          timezone: "Asia/Seoul",
          todayBoundaryIso: "2026-09-20T15:00:00.000Z",
          totalUsers: 142,
          newUsersToday: 5,
          newUsers7d: 28,
          usersWithPreferences: 80,
          learningSessionsToday: 12,
          learningSessions7d: 85,
          learningActivitiesToday: 19,
          learningActivities7d: 110,
          activeLearners24h: 31,
          activeLearners7d: 74,
        },
        recentUsers: [
          {
            id: "user-1",
            displayName: "홍길동",
            avatarUrl: null,
            planDisplay: "FREE",
            createdAt: "2026-09-20T10:00:00Z",
          },
        ],
        recentLearningActivity: [
          {
            id: "sess-1",
            userId: "user-1",
            type: "session",
            modeOrCategory: "빠른 연습",
            detail: "세션 상태: 완료",
            status: "completed",
            timestamp: "2026-09-20T11:00:00Z",
          },
        ],
      });

      render(
        <MemoryRouter initialEntries={["/admin/"]}>
          <AdminDashboardView />
        </MemoryRouter>
      );

      expect(await screen.findByText("142")).toBeInTheDocument();
      expect(screen.getByText("Asia/Seoul (KST, UTC+9)", { exact: false })).toBeInTheDocument();
      expect(screen.getByText("홍길동")).toBeInTheDocument();
      expect(screen.getByText("빠른 연습")).toBeInTheDocument();

      // Ensure NO fake AI/revenue cards exist
      expect(screen.queryByText(/AI 비용/)).not.toBeInTheDocument();
      expect(screen.queryByText(/매출/)).not.toBeInTheDocument();
      expect(screen.queryByText(/PRO 결제/)).not.toBeInTheDocument();
    });
  });

  describe("AdminUsersView & AdminUserDetailModal", () => {
    it("renders user table, allows search, and opens user detail modal", async () => {
      vi.mocked(adminApi.fetchAdminUsers).mockResolvedValue({
        users: [
          {
            id: "user-abc-123",
            email: "test@example.com",
            displayName: "이순신",
            avatarUrl: null,
            joinedAt: "2026-09-18T10:00:00Z",
            lastSignInAt: "2026-09-20T08:00:00Z",
            planDisplay: "FREE",
            hasLearningPreferences: true,
            learningSessionCount: 3,
            learningActivityCount: 5,
            lastLearningAt: "2026-09-20T08:30:00Z",
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      });

      vi.mocked(adminApi.fetchAdminUserDetail).mockResolvedValue({
        id: "user-abc-123",
        email: "test@example.com",
        displayName: "이순신",
        avatarUrl: null,
        joinedAt: "2026-09-18T10:00:00Z",
        lastSignInAt: "2026-09-20T08:00:00Z",
        planDisplay: "FREE",
        learningPreferences: {
          targetLevel: "advanced",
          courseId: "course-1",
          updatedAt: "2026-09-19T00:00:00Z",
        },
        summary: {
          totalSessions: 3,
          completedSessions: 2,
          totalAttempts: 15,
          totalActivities: 5,
          lastLearningAt: "2026-09-20T08:30:00Z",
        },
        recentSessions: [],
        recentActivities: [],
      });

      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={["/admin/users/"]}>
          <AdminUsersView />
        </MemoryRouter>
      );

      expect((await screen.findAllByText("이순신"))[0]).toBeInTheDocument();
      expect(screen.getAllByText("FREE")[0]).toBeInTheDocument();

      // Click detail button to open modal
      const detailBtn = screen.getAllByRole("button", { name: "상세보기" })[0];
      await user.click(detailBtn);

      expect(await screen.findByText("학습 설정 (learning_preferences)")).toBeInTheDocument();
      expect(screen.getByText(/목표 레벨: advanced/)).toBeInTheDocument();

      // Close modal
      const closeBtn = screen.getAllByRole("button", { name: "닫기" })[0];
      await user.click(closeBtn);
      await waitFor(() => {

        expect(screen.queryByText("학습 설정 (learning_preferences)")).not.toBeInTheDocument();
      });
    });
  });

  describe("AdminLearningView", () => {
    it("renders learning activity and sessions metadata with filters", async () => {
      vi.mocked(adminApi.fetchAdminLearning).mockResolvedValue({
        records: [
          {
            id: "rec-1",
            userId: "user-1",
            userDisplayName: "학습자1",
            type: "session",
            modeOrType: "실전 모의고사",
            targetLevel: "intermediate",
            status: "completed",
            questionCount: 15,
            answeredCount: 15,
            timestamp: "2026-09-20T12:00:00Z",
          },
          {
            id: "rec-2",
            userId: "user-2",
            userDisplayName: "학습자2",
            type: "activity",
            modeOrType: "서베이 완료",
            courseId: "course-1",
            targetLevel: "advanced",
            contentId: "survey-rehearsal",
            timestamp: "2026-09-20T13:00:00Z",
          },
        ],
        total: 2,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      });

      render(
        <MemoryRouter initialEntries={["/admin/learning/"]}>
          <AdminLearningView />
        </MemoryRouter>
      );

      expect((await screen.findAllByText("학습자1"))[0]).toBeInTheDocument();
      expect(screen.getAllByText("실전 모의고사")[0]).toBeInTheDocument();
      expect((await screen.findAllByText("학습자2"))[0]).toBeInTheDocument();
      expect(screen.getAllByText("서베이 완료")[0]).toBeInTheDocument();
    });

  });

  describe("AdminAuditView", () => {
    it("shows truthful empty state when no audit records exist", async () => {
      vi.mocked(adminApi.fetchAdminAudit).mockResolvedValue({
        logs: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      });

      render(
        <MemoryRouter initialEntries={["/admin/audit/"]}>
          <AdminAuditView />
        </MemoryRouter>
      );

      expect(
        await screen.findByText("아직 기록된 관리자 변경 작업이 없습니다.")
      ).toBeInTheDocument();
      expect(
        screen.getByText("향후 권한·구독·운영 설정 변경이 이곳에 안전하게 기록됩니다.")
      ).toBeInTheDocument();
    });

    it("renders audit records when available", async () => {
      vi.mocked(adminApi.fetchAdminAudit).mockResolvedValue({
        logs: [
          {
            id: "log-1",
            adminUserId: "admin-1",
            adminDisplayName: "Owner Kim",
            action: "admin_user_role_update",
            targetType: "admin_users",
            targetId: "user-2",
            metadata: { newRole: "support" },
            createdAt: "2026-09-20T14:00:00Z",
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      });

      render(
        <MemoryRouter initialEntries={["/admin/audit/"]}>
          <AdminAuditView />
        </MemoryRouter>
      );

      expect(await screen.findByText("admin_user_role_update")).toBeInTheDocument();
      expect(screen.getByText("Owner Kim")).toBeInTheDocument();
    });

    it("restricts audit view when role is support", () => {
      vi.mocked(useAdminAccessModule.useAdminAccess).mockReturnValue({
        status: "authorized",
        role: "support",
        adminUser: {
          userId: "support-1",
          role: "support",
          displayName: "Support Choi",
          avatarUrl: null,
        },
        error: null,
        refresh: vi.fn(),
      });

      render(
        <MemoryRouter initialEntries={["/admin/audit/"]}>
          <AdminAuditView />
        </MemoryRouter>
      );

      expect(screen.getByText("감사 로그 접근 제한")).toBeInTheDocument();
      expect(
        screen.getByText(/운영 지원\(support\) 권한은 보안 정책상 감사 로그를 열람할 수 없습니다/)
      ).toBeInTheDocument();
    });
  });
});
