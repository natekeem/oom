import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSessionPersistence } from './useSessionPersistence';
import * as repo from './historyRepository';
const auth = vi.hoisted(() => ({ id: 'user-1' }));
vi.mock('../../auth/useAuth', () => ({ useAuth: () => ({ user: { id: auth.id }, status: 'authenticated' }) }));
vi.mock('./historyRepository', () => ({ createSession: vi.fn(), createAttempt: vi.fn(), completeSession: vi.fn(), updateSession: vi.fn() }));
beforeEach(() => {
  vi.resetAllMocks(); auth.id = 'user-1';
  vi.mocked(repo.createSession).mockResolvedValue({ id: 'session-1' } as never);
  vi.mocked(repo.createAttempt).mockResolvedValue('attempt-1');
  vi.mocked(repo.completeSession).mockResolvedValue(true);
});
describe('attempt and explicit completion lifecycle', () => {
  it('returns the persisted ID and deduplicates concurrent completion callbacks and rerenders', async () => {
    const { result, rerender, unmount } = renderHook(() => useSessionPersistence('quick_practice'));
    await Promise.all([result.current.startSession('advanced'), result.current.startSession('advanced')]);
    const ids = await Promise.all([result.current.recordAttempt('q1', 1, 20), result.current.recordAttempt('q1', 1, 20)]);
    rerender();
    expect(await result.current.recordAttempt('q1', 1, 20)).toBe('attempt-1');
    expect(ids).toEqual(['attempt-1', 'attempt-1']);
    expect(repo.createSession).toHaveBeenCalledTimes(1);
    expect(repo.createAttempt).toHaveBeenCalledTimes(1);
    expect(repo.completeSession).not.toHaveBeenCalled();
    unmount();
    expect(repo.completeSession).not.toHaveBeenCalled();
  });
  it('waits for a pending attempt and completes once with the actual saved count', async () => {
    let resolve!: (id: string | null) => void;
    vi.mocked(repo.createAttempt).mockReturnValue(new Promise(r => { resolve = r; }));
    const { result } = renderHook(() => useSessionPersistence('quick_practice'));
    await result.current.startSession('advanced');
    const pending = result.current.recordAttempt('q1', 1, 30);
    const end = result.current.completeSession();
    expect(repo.completeSession).not.toHaveBeenCalled();
    resolve('attempt-1');
    await pending;
    await Promise.all([end, result.current.completeSession()]);
    await result.current.completeSession();
    expect(repo.completeSession).toHaveBeenCalledExactlyOnceWith('session-1', 1);
  });
  it('returns null on failed persistence and excludes it from the saved count', async () => {
    vi.mocked(repo.createAttempt).mockRejectedValue(new Error('offline'));
    const { result } = renderHook(() => useSessionPersistence('quick_practice'));
    await result.current.startSession('advanced');
    expect(await result.current.recordAttempt('q1', 1, 30)).toBeNull();
    await result.current.completeSession();
    expect(repo.completeSession).toHaveBeenCalledWith('session-1', 0);
  });
  it('separates account lifecycle state', async () => {
    const { result, rerender } = renderHook(() => useSessionPersistence('quick_practice'));
    await result.current.startSession('advanced');
    act(() => { auth.id = 'user-2'; rerender(); });
    expect(result.current.getSessionId()).toBeNull();
    expect(await result.current.recordAttempt('q1', 1, 20)).toBeNull();
    expect(repo.createAttempt).not.toHaveBeenCalled();
  });
});
