import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  mapPreferences,
  type LearningPreferencesRow,
} from './preferenceTypes';
import {
  getPreferences,
  upsertPreferences,
  clearPreferences,
} from './preferenceRepository';
import {
  TrainingSelectionProvider,
  useTrainingSelection,
} from '../../training/TrainingSelectionContext';
import { AuthContext } from '../../auth/useAuth';
import type { AuthContextValue } from '../../auth/authTypes';
import {
  clearTrainingSelection,
  saveTrainingSelection,
} from '../../training/storage';

// Mock Supabase module
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '../../lib/supabase';

type SupabaseFrom = NonNullable<typeof supabase>['from'];
type FromReturn = ReturnType<SupabaseFrom>;
const mockedFrom = vi.mocked(supabase!.from);

describe('preferenceTypes & mapPreferences', () => {
  it('maps valid database row to LearningPreferences', () => {
    const row: LearningPreferencesRow = {
      user_id: 'user-123',
      target_level: 'advanced',
      course_id: 'course-1',
      created_at: '2026-09-20T00:00:00Z',
      updated_at: '2026-09-20T01:00:00Z',
    };
    const mapped = mapPreferences(row);
    expect(mapped).toEqual({
      userId: 'user-123',
      targetLevel: 'advanced',
      courseId: 'course-1',
      createdAt: '2026-09-20T00:00:00Z',
      updatedAt: '2026-09-20T01:00:00Z',
    });
  });

  it('maps intermediate and foundation levels correctly', () => {
    const rowInter: LearningPreferencesRow = {
      user_id: 'user-456',
      target_level: 'intermediate',
      course_id: 'course-2',
      created_at: '2026-09-20T00:00:00Z',
      updated_at: '2026-09-20T01:00:00Z',
    };
    expect(mapPreferences(rowInter).targetLevel).toBe('intermediate');

    const rowFound: LearningPreferencesRow = {
      user_id: 'user-789',
      target_level: 'foundation',
      course_id: 'course-1',
      created_at: '2026-09-20T00:00:00Z',
      updated_at: '2026-09-20T01:00:00Z',
    };
    expect(mapPreferences(rowFound).targetLevel).toBe('foundation');
  });

  it('maps invalid target_level to null targetLevel', () => {
    const invalidRow = {
      user_id: 'user-000',
      target_level: 'invalid-level',
      course_id: 'course-1',
      created_at: '2026-09-20T00:00:00Z',
      updated_at: '2026-09-20T01:00:00Z',
    } as unknown as LearningPreferencesRow;
    expect(mapPreferences(invalidRow).targetLevel).toBeNull();
  });
});

describe('preferenceRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getPreferences fetches and maps preference row', async () => {
    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        user_id: 'user-1',
        target_level: 'advanced',
        course_id: 'course-1',
        created_at: '2026-09-20T00:00:00Z',
        updated_at: '2026-09-20T01:00:00Z',
      },
      error: null,
    });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    mockedFrom.mockReturnValue({ select: mockSelect } as unknown as FromReturn);

    const prefs = await getPreferences('user-1');
    expect(supabase!.from).toHaveBeenCalledWith('learning_preferences');
    expect(mockSelect).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(prefs?.targetLevel).toBe('advanced');
    expect(prefs?.courseId).toBe('course-1');
  });

  it('getPreferences returns null when row does not exist', async () => {
    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    mockedFrom.mockReturnValue({ select: mockSelect } as unknown as FromReturn);

    const prefs = await getPreferences('user-1');
    expect(prefs).toBeNull();
  });

  it('upsertPreferences upserts preference row and returns mapped data', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        user_id: 'user-1',
        target_level: 'intermediate',
        course_id: 'course-1',
        created_at: '2026-09-20T00:00:00Z',
        updated_at: '2026-09-20T02:00:00Z',
      },
      error: null,
    });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockUpsert = vi.fn().mockReturnValue({ select: mockSelect });
    mockedFrom.mockReturnValue({ upsert: mockUpsert } as unknown as FromReturn);

    const prefs = await upsertPreferences('user-1', {
      targetLevel: 'intermediate',
      courseId: 'course-1',
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        target_level: 'intermediate',
        course_id: 'course-1',
      }),
      { onConflict: 'user_id' }
    );
    expect(prefs?.targetLevel).toBe('intermediate');
  });

  it('clearPreferences deletes preferences for user', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
    mockedFrom.mockReturnValue({ delete: mockDelete } as unknown as FromReturn);

    const ok = await clearPreferences('user-1');
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(ok).toBe(true);
  });
});

describe('TrainingSelectionContext integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearTrainingSelection();
    localStorage.clear();
  });

  const createAuthContext = (overrides: Partial<AuthContextValue> = {}): AuthContextValue => ({
    user: null,
    session: null,
    profile: null,
    status: 'anonymous',
    error: null,
    profileError: null,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    refreshProfile: vi.fn(),
    ...overrides,
  });

  it('works as local-first for anonymous visitor without Supabase calls', async () => {
    const authVal = createAuthContext({ status: 'anonymous', user: null });
    const wrapper = ({ children }: PropsWithChildren) => (
      <AuthContext.Provider value={authVal}>
        <TrainingSelectionProvider>{children}</TrainingSelectionProvider>
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useTrainingSelection(), { wrapper });

    expect(result.current.selection).toBeNull();
    expect(result.current.isAccountSynced).toBe(false);
    expect(result.current.isLoadingPreferences).toBe(false);

    // Anonymous selection
    act(() => {
      result.current.select({ levelId: 'advanced', courseId: 'course-1' });
    });

    expect(result.current.selection).toMatchObject({
      levelId: 'advanced',
      courseId: 'course-1',
    });
    expect(result.current.isAccountSynced).toBe(false);
    expect(supabase!.from).not.toHaveBeenCalled();
  });

  it('authoritatively restores server preferences for authenticated user', async () => {
    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        user_id: 'user-existing',
        target_level: 'foundation',
        course_id: 'course-1',
        created_at: '2026-09-20T00:00:00Z',
        updated_at: '2026-09-20T01:00:00Z',
      },
      error: null,
    });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    mockedFrom.mockReturnValue({ select: mockSelect } as unknown as FromReturn);

    const authVal = createAuthContext({
      status: 'authenticated',
      user: { id: 'user-existing', email: 'user@example.com' } as unknown as User,
    });

    const wrapper = ({ children }: PropsWithChildren) => (
      <AuthContext.Provider value={authVal}>
        <TrainingSelectionProvider>{children}</TrainingSelectionProvider>
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useTrainingSelection(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAccountSynced).toBe(true);
      expect(result.current.selection?.levelId).toBe('foundation');
      expect(result.current.selection?.courseId).toBe('course-1');
    });
  });

  it('does NOT silently auto-upload local anonymous state on first login when no server preferences exist', async () => {
    // 1. User sets local selection while anonymous
    saveTrainingSelection({
      levelId: 'intermediate',
      courseId: 'course-1',
    });

    // 2. Server has no preferences for this user (first login)
    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockUpsert = vi.fn();
    mockedFrom.mockReturnValue({
      select: mockSelect,
      upsert: mockUpsert,
    } as unknown as FromReturn);

    const authVal = createAuthContext({
      status: 'authenticated',
      user: { id: 'user-new', email: 'new@example.com' } as unknown as User,
    });

    const wrapper = ({ children }: PropsWithChildren) => (
      <AuthContext.Provider value={authVal}>
        <TrainingSelectionProvider>{children}</TrainingSelectionProvider>
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useTrainingSelection(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoadingPreferences).toBe(false);
    });

    // Local selection remains visible in UI
    expect(result.current.selection?.levelId).toBe('intermediate');
    // But is NOT marked as account synced
    expect(result.current.isAccountSynced).toBe(false);
    // And NO upsert occurred silently!
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('explicitly saves to Supabase and updates isAccountSynced when select() is called by authenticated user', async () => {
    const mockMaybeSingleGet = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockEqGet = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingleGet });
    const mockSelectGet = vi.fn().mockReturnValue({ eq: mockEqGet });

    const mockSingleUpsert = vi.fn().mockResolvedValue({
      data: {
        user_id: 'user-1',
        target_level: 'advanced',
        course_id: 'course-1',
        created_at: '2026-09-20T00:00:00Z',
        updated_at: '2026-09-20T03:00:00Z',
      },
      error: null,
    });
    const mockSelectUpsert = vi.fn().mockReturnValue({ single: mockSingleUpsert });
    const mockUpsert = vi.fn().mockReturnValue({ select: mockSelectUpsert });

    mockedFrom.mockImplementation((() => ({
      select: mockSelectGet,
      upsert: mockUpsert,
    })) as unknown as SupabaseFrom);

    const authVal = createAuthContext({
      status: 'authenticated',
      user: { id: 'user-1', email: 'user@example.com' } as unknown as User,
    });

    const wrapper = ({ children }: PropsWithChildren) => (
      <AuthContext.Provider value={authVal}>
        <TrainingSelectionProvider>{children}</TrainingSelectionProvider>
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useTrainingSelection(), { wrapper });

    await waitFor(() => expect(result.current.isLoadingPreferences).toBe(false));
    expect(result.current.isAccountSynced).toBe(false);

    // User clicks confirm/save in setup view
    await act(async () => {
      await result.current.select({ levelId: 'advanced', courseId: 'course-1' });
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        target_level: 'advanced',
        course_id: 'course-1',
      }),
      { onConflict: 'user_id' }
    );
    expect(result.current.isAccountSynced).toBe(true);
    expect(result.current.selection?.levelId).toBe('advanced');
  });

  it('isolates user preferences: clears in-memory state on logout so User B never sees User A data', async () => {
    let authState: AuthContextValue = createAuthContext({
      status: 'authenticated',
      user: { id: 'user-a', email: 'a@example.com' } as unknown as User,
    });

    const mockMaybeSingleA = vi.fn().mockResolvedValue({
      data: {
        user_id: 'user-a',
        target_level: 'advanced',
        course_id: 'course-1',
        created_at: '2026-09-20T00:00:00Z',
        updated_at: '2026-09-20T01:00:00Z',
      },
      error: null,
    });
    const mockEqA = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingleA });
    const mockSelectA = vi.fn().mockReturnValue({ eq: mockEqA });
    mockedFrom.mockReturnValue({ select: mockSelectA } as unknown as FromReturn);

    const { result, rerender } = renderHook(() => useTrainingSelection(), {
      wrapper: ({ children }: PropsWithChildren) => (
        <AuthContext.Provider value={authState}>
          <TrainingSelectionProvider>{children}</TrainingSelectionProvider>
        </AuthContext.Provider>
      ),
    });

    await waitFor(() => {
      expect(result.current.selection?.levelId).toBe('advanced');
      expect(result.current.isAccountSynced).toBe(true);
    });

    // User A logs out
    authState = createAuthContext({
      status: 'anonymous',
      user: null,
    });
    rerender();

    await waitFor(() => {
      expect(result.current.selection).toBeNull();
      expect(result.current.isAccountSynced).toBe(false);
    });

    // User B logs in (has intermediate level)
    const mockMaybeSingleB = vi.fn().mockResolvedValue({
      data: {
        user_id: 'user-b',
        target_level: 'intermediate',
        course_id: 'course-1',
        created_at: '2026-09-20T00:00:00Z',
        updated_at: '2026-09-20T01:00:00Z',
      },
      error: null,
    });
    const mockEqB = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingleB });
    const mockSelectB = vi.fn().mockReturnValue({ eq: mockEqB });
    mockedFrom.mockReturnValue({ select: mockSelectB } as unknown as FromReturn);

    authState = createAuthContext({
      status: 'authenticated',
      user: { id: 'user-b', email: 'b@example.com' } as unknown as User,
    });
    rerender();

    await waitFor(() => {
      expect(result.current.selection?.levelId).toBe('intermediate');
      expect(result.current.isAccountSynced).toBe(true);
    });
  });

  it('handles Supabase fetch failure gracefully without breaking local workflow', async () => {
    const mockMaybeSingle = vi.fn().mockRejectedValue(new Error('Network offline'));
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    mockedFrom.mockReturnValue({ select: mockSelect } as unknown as FromReturn);

    const authVal = createAuthContext({
      status: 'authenticated',
      user: { id: 'user-offline', email: 'offline@example.com' } as unknown as User,
    });

    const wrapper = ({ children }: PropsWithChildren) => (
      <AuthContext.Provider value={authVal}>
        <TrainingSelectionProvider>{children}</TrainingSelectionProvider>
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useTrainingSelection(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoadingPreferences).toBe(false);
    });

    expect(result.current.isAccountSynced).toBe(false);
    // User can still select locally
    act(() => {
      result.current.select({ levelId: 'foundation', courseId: 'course-1' });
    });
    expect(result.current.selection?.levelId).toBe('foundation');
  });
});
