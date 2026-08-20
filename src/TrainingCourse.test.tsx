import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import App from './App';
import { TRAINING_LEVELS } from './training/levels';
import {
  discoveredCourses,
  resolveTrainingContext,
  getTrainingVariantSet,
  getTrainingReplacementGuide,
} from './training/courseRegistry';
import {
  loadTrainingSelection,
  saveTrainingSelection,
  clearTrainingSelection,
  TRAINING_SELECTION_STORAGE_KEY,
} from './training/storage';
import { scripts } from './data/scripts';
import { getViewTitle } from './components/layout/Sidebar';

describe('Training Course Architecture & Regression Suite (6 STEP Flow & Hub Separation)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  /* 1. Level system integrity */
  it('1. has exactly 3 levels with correct presets', () => {
    expect(TRAINING_LEVELS).toHaveLength(3);
    expect(TRAINING_LEVELS.map((l) => l.id)).toEqual(['advanced', 'intermediate', 'foundation']);

    const advanced = TRAINING_LEVELS.find((l) => l.id === 'advanced')!;
    const intermediate = TRAINING_LEVELS.find((l) => l.id === 'intermediate')!;
    const foundation = TRAINING_LEVELS.find((l) => l.id === 'foundation')!;
    expect(advanced.difficulty.label).toBe('5-5');
    expect(intermediate.difficulty.label).toBe('4-4');
    expect(foundation.difficulty.label).toBe('3-3');
  });

  /* 2. Course discovery and standardized naming */
  it('2. discovers all courses with standardized titles', () => {
    expect(discoveredCourses.length).toBeGreaterThanOrEqual(3);
    expect(discoveredCourses[0].id).toBe('course-1');
    expect(discoveredCourses[0].title).toBe('Everyday & Getaway');
    expect(discoveredCourses[1].id).toBe('course-2');
    expect(discoveredCourses[1].title).toBe('Culture & City');
    expect(discoveredCourses[2].id).toBe('course-3');
    expect(discoveredCourses[2].title).toBe('Nature & Weekend');
  });

  /* 3. STEP 4 variation data exists for all 3 courses */
  it('3. Course 1/2/3 has STEP 4 variation data for all canonical storylines', () => {
    const courses = ['course-1', 'course-2', 'course-3'] as const;
    for (const courseId of courses) {
      const ctx = resolveTrainingContext(courseId, 'advanced');
      for (const storyline of ctx.storylines) {
        const variantSet = ctx.variantSets[storyline.id];
        expect(variantSet, `Missing variantSet for ${courseId}/${storyline.id}`).toBeDefined();
        expect(variantSet.variants.length).toBeGreaterThanOrEqual(4);
        for (const v of variantSet.variants) {
          expect(v.id).toBeTruthy();
          expect(v.label).toBeTruthy();
          expect(v.question).toBeTruthy();
          expect(v.keep.length).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });

  /* 4. STEP 4 blueprint data exists for all 3 courses */
  it('4. Course 1/2/3 has blueprint data for all canonical storylines', () => {
    const courses = ['course-1', 'course-2', 'course-3'] as const;
    for (const courseId of courses) {
      const ctx = resolveTrainingContext(courseId, 'intermediate');
      for (const storyline of ctx.storylines) {
        const variantSet = ctx.variantSets[storyline.id];
        expect(variantSet.blueprint.length).toBeGreaterThanOrEqual(4);
        for (const step of variantSet.blueprint) {
          expect(step.id).toBeTruthy();
          expect(step.label).toBeTruthy();
          expect(step.koreanGuide).toBeTruthy();
          expect(step.cue).toBeTruthy();
        }
      }
    }
  });

  /* 5. Course 2/3 does not use Course 1 fallback data */
  it('5. Course 2/3 does not use Course 1 fallback data in storylines, roleplays, or variants', () => {
    const ctx1 = resolveTrainingContext('course-1', 'advanced');
    const ctx2 = resolveTrainingContext('course-2', 'advanced');
    const ctx3 = resolveTrainingContext('course-3', 'advanced');

    // Storyline IDs are distinct
    const ids1 = new Set(ctx1.storylines.map((s) => s.id));
    const ids2 = new Set(ctx2.storylines.map((s) => s.id));
    const ids3 = new Set(ctx3.storylines.map((s) => s.id));

    for (const id of ids2) {
      expect(ids1.has(id)).toBe(false);
    }
    for (const id of ids3) {
      expect(ids1.has(id)).toBe(false);
      expect(ids2.has(id)).toBe(false);
    }

    // Roleplay IDs are distinct
    const rpIds1 = new Set(ctx1.roleplays.map((r) => r.id));
    const rpIds2 = new Set(ctx2.roleplays.map((r) => r.id));
    const rpIds3 = new Set(ctx3.roleplays.map((r) => r.id));

    for (const id of rpIds2) {
      expect(rpIds1.has(id)).toBe(false);
    }
    for (const id of rpIds3) {
      expect(rpIds1.has(id)).toBe(false);
    }

    // Direct lookup test
    const c2v = getTrainingVariantSet('course-2', 'culture-night');
    expect(c2v).toBeDefined();
    expect(c2v?.title).toContain('영화');

    const c1Guide = getTrainingReplacementGuide('course-1', 'outdoor-travel', 'favorite-place');
    const c2Guide = getTrainingReplacementGuide('course-2', 'culture-night', 'favorite-culture');
    expect(c1Guide).toBeDefined();
    expect(c2Guide).toBeDefined();
    expect(c1Guide?.summary).not.toEqual(c2Guide?.summary);
  });

  /* 6. Generic slot routing changes storyline when course changes */
  it('6. Slot 0 resolves to corresponding course storyline upon course change', () => {
    const ctx1 = resolveTrainingContext('course-1', 'advanced');
    const ctx2 = resolveTrainingContext('course-2', 'advanced');
    const ctx3 = resolveTrainingContext('course-3', 'advanced');

    expect(ctx1.storylines[0].id).toBe('outdoor-travel');
    expect(ctx2.storylines[0].id).toBe('culture-night');
    expect(ctx3.storylines[0].id).toBe('trail-photo');

    expect(ctx1.storylines[1].id).toBe('indoor-rest');
    expect(ctx2.storylines[1].id).toBe('smart-shopping');
    expect(ctx3.storylines[1].id).toBe('coastal-camp');
  });

  /* 7. Dynamic sidebar and header titles by Course */
  it('7. Dynamic sidebar and header group titles reflect active course (STEP 4 & STEP 5)', () => {
    const ctx1 = resolveTrainingContext('course-1', 'advanced');
    const ctx2 = resolveTrainingContext('course-2', 'advanced');
    const ctx3 = resolveTrainingContext('course-3', 'advanced');

    expect(getViewTitle('script-outdoor', ctx1)).toBe('STEP 4. 야외 / 여행');
    expect(getViewTitle('script-outdoor', ctx2)).toBe('STEP 4. 문화 / 음악');
    expect(getViewTitle('script-outdoor', ctx3)).toBe('STEP 4. 공원 / 걷기 / 하이킹');

    expect(getViewTitle('roleplay-travel', ctx1)).toBe('STEP 5. 야외 / 여행');
    expect(getViewTitle('roleplay-travel', ctx2)).toBe('STEP 5. 문화 / 음악');
    expect(getViewTitle('roleplay-travel', ctx3)).toBe('STEP 5. 캠핑 / 해변 / 드라이브');
  });

  /* 8. STEP 5 scenario IDs differ across courses */
  it('8. Course 1/2/3 STEP 5 scenario IDs are properly distinct', () => {
    const ctx1 = resolveTrainingContext('course-1', 'intermediate');
    const ctx2 = resolveTrainingContext('course-2', 'intermediate');
    const ctx3 = resolveTrainingContext('course-3', 'intermediate');

    expect(ctx1.roleplays[0].id).toBe('hotel-booking');
    expect(ctx2.roleplays[0].id).toBe('ticket-seat-problem');
    expect(ctx3.roleplays[0].id).toBe('campground-weather-change');
  });

  /* 9. Roleplay level variants change examples while preserving scenario */
  it('9. Changing level on same roleplay scenario updates englishExample and focus', () => {
    const ctxAdv = resolveTrainingContext('course-1', 'advanced');
    const ctxFou = resolveTrainingContext('course-1', 'foundation');

    const rpAdv = ctxAdv.roleplays[0];
    const rpFou = ctxFou.roleplays[0];

    expect(rpAdv.id).toBe(rpFou.id);
    expect(rpAdv.situation).toBe(rpFou.situation);
    expect(rpAdv.prompt).toBe(rpFou.prompt);

    expect(rpAdv.active.englishExample).not.toEqual(rpFou.active.englishExample);
    expect(rpAdv.active.focus).not.toEqual(rpFou.active.focus);
  });

  /* 10. Question type internal IDs normalized across all courses */
  it('10. STEP 6 question type internal IDs follow uniform schema across all courses', () => {
    const allowedTypes = new Set([
      'description',
      'routine',
      'recent-experience',
      'description-reason',
      'routine-detail',
      'experience-change',
      'expanded-experience',
      'comparison-change',
      'problem-opinion',
      'comparison',
      'change',
      'unexpected-situation',
      'problem',
      'opinion',
      'hobby',
      'shopping',
    ]);

    const courses = ['course-1', 'course-2', 'course-3'] as const;
    const levels = ['advanced', 'intermediate', 'foundation'] as const;

    for (const c of courses) {
      for (const l of levels) {
        const ctx = resolveTrainingContext(c, l);
        for (const q of ctx.questions) {
          expect(allowedTypes.has(q.type), `Unexpected type '${q.type}' in ${c}/${l}/${q.id}`).toBe(
            true
          );
        }
      }
    }
  });

  /* 11. Practice question pool isolation */
  it('11. Question pool is strictly isolated by Course and Level', () => {
    const ctx1A = resolveTrainingContext('course-1', 'advanced');
    const ctx2A = resolveTrainingContext('course-2', 'advanced');
    const ctx1F = resolveTrainingContext('course-1', 'foundation');

    const ids1 = new Set(ctx1A.questions.map((q) => q.id));
    const ids2 = new Set(ctx2A.questions.map((q) => q.id));
    const idsF = new Set(ctx1F.questions.map((q) => q.id));

    for (const id of ids1) {
      expect(ids2.has(id)).toBe(false);
      expect(idsF.has(id)).toBe(false);
    }
  });

  /* 12. Course 1 advanced script text preservation */
  it('12. Course 1 advanced script matches original text 100%', () => {
    const ctx = resolveTrainingContext('course-1', 'advanced');
    for (let i = 0; i < scripts.length; i++) {
      const orig = scripts[i];
      const storyline = ctx.storylines.find((s) => s.id === orig.id);
      expect(storyline).toBeDefined();
      expect(storyline?.active.englishScript.trim()).toBe(orig.englishScript.trim());
    }
  });

  /* 13. Persistence and storage fallback */
  it('13. Persists and clears training selection in localStorage', () => {
    expect(loadTrainingSelection()).toBeNull();
    const saved = saveTrainingSelection({ courseId: 'course-2', levelId: 'intermediate' });
    expect(saved.courseId).toBe('course-2');
    expect(saved.levelId).toBe('intermediate');

    const loaded = loadTrainingSelection();
    expect(loaded).toEqual(saved);

    clearTrainingSelection();
    expect(loadTrainingSelection()).toBeNull();
  });

  /* 14. Extensibility: future course ID template literal */
  it('14. Course registry auto-discovery and template literal CourseId support future course', () => {
    const testId: import('./training/types').TrainingCourseId = 'course-99';
    expect(testId).toBe('course-99');
    expect(discoveredCourses.length).toBeGreaterThanOrEqual(3);
  });

  /* 15. TrainingHub (/training) is pure overview hub with 6 roadmap cards and concept cards */
  it('15. TrainingHub renders 6 roadmap cards and 3 concept areas', () => {
    render(
      <MemoryRouter initialEntries={['/training']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('최소한의 스토리로, 더 많은 질문에 답하는 6 STEP 훈련')).toBeInTheDocument();
    expect(screen.getByText('훈련 목적')).toBeInTheDocument();
    expect(screen.getByText('코스 & 레벨 컨셉')).toBeInTheDocument();
    expect(screen.getByText('학습 방법')).toBeInTheDocument();
    expect(screen.getByText('OPIc 실전 훈련 6 STEP 로드맵')).toBeInTheDocument();

    // Exactly 6 STEP cards
    expect(screen.getByText('STEP 1')).toBeInTheDocument();
    expect(screen.getByText('STEP 2')).toBeInTheDocument();
    expect(screen.getByText('STEP 3')).toBeInTheDocument();
    expect(screen.getByText('STEP 4')).toBeInTheDocument();
    expect(screen.getByText('STEP 5')).toBeInTheDocument();
    expect(screen.getByText('STEP 6')).toBeInTheDocument();
  });

  /* 16. STEP 1 (/training/setup) renders setup selector and saves to localStorage */
  it('16. STEP 1 TrainingSetupView renders selector and commits selection', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/training/setup']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('목표 구간과 학습 코스를 먼저 설정합니다.')).toBeInTheDocument();
    expect(screen.getByText('1. 목표 구간 선택')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /이 구성으로 학습 시작/ })).toBeDisabled();

    // Select Level: 1구간
    await user.click(screen.getByRole('button', { name: /1구간/ }));
    expect(screen.getByText('2. 학습 코스 선택')).toBeInTheDocument();

    // Select Course: Culture & City
    await user.click(screen.getByRole('button', { name: /Culture & City/ }));
    const startBtn = screen.getByRole('button', { name: /이 구성으로 학습 시작/ });
    expect(startBtn).toBeEnabled();
    await user.click(startBtn);

    // Selection is saved
    const saved = loadTrainingSelection();
    expect(saved?.courseId).toBe('course-2');
    expect(saved?.levelId).toBe('advanced');

    // After selection, active configuration card appears in setup
    expect(await screen.findByText('현재 학습 설정')).toBeInTheDocument();
    expect(screen.getByText(/1구간 · AL/)).toBeInTheDocument();
    expect(screen.getByText('Culture & City')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '설정 초기화' })).toBeInTheDocument();

    // Click Reset
    await user.click(screen.getByRole('button', { name: '설정 초기화' }));
    expect(loadTrainingSelection()).toBeNull();
    expect(screen.getByText('1. 목표 구간 선택')).toBeInTheDocument();
  });

  /* 16b. TrainingHub is a clean overview without duplicate active selection cards */
  it('16b. TrainingHub is a clean roadmap hub without duplicate selection summary banner', () => {
    saveTrainingSelection({ courseId: 'course-1', levelId: 'advanced' });
    render(
      <MemoryRouter initialEntries={['/training']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('최소한의 스토리로, 더 많은 질문에 답하는 6 STEP 훈련')).toBeInTheDocument();
    expect(screen.queryByText('현재 학습 설정')).not.toBeInTheDocument();
    expect(screen.getByText('OPIc 실전 훈련 6 STEP 로드맵')).toBeInTheDocument();
  });

  /* 17. Training Selection Guard blocks unselected STEP 2 (survey) and routes to setup */
  it('17. TrainingSelectionGuard prevents implicit fallback on STEP 2 (/training/survey)', () => {
    render(
      <MemoryRouter initialEntries={['/training/survey']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('먼저 STEP 1에서 목표 구간과 훈련 코스를 설정해 주세요.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'STEP 1 설정하러 가기' })).toBeInTheDocument();
  });

  /* 18. Training Selection Guard blocks unselected STEP 3 (difficulty) */
  it('18. TrainingSelectionGuard prevents implicit fallback on STEP 3 (/training/difficulty)', () => {
    render(
      <MemoryRouter initialEntries={['/training/difficulty']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('먼저 STEP 1에서 목표 구간과 훈련 코스를 설정해 주세요.')).toBeInTheDocument();
  });

  /* 19. Training Selection Guard blocks unselected STEP 4 (scripts) */
  it('19. TrainingSelectionGuard prevents implicit fallback on STEP 4 (/training/scripts)', () => {
    render(
      <MemoryRouter initialEntries={['/training/scripts']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('먼저 STEP 1에서 목표 구간과 훈련 코스를 설정해 주세요.')).toBeInTheDocument();
  });

  /* 20. Training Selection Guard blocks unselected STEP 5 (roleplay) */
  it('20. TrainingSelectionGuard prevents implicit fallback on STEP 5 (/roleplay)', () => {
    render(
      <MemoryRouter initialEntries={['/roleplay']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('먼저 STEP 1에서 목표 구간과 훈련 코스를 설정해 주세요.')).toBeInTheDocument();
  });

  /* 21. Training Selection Guard blocks unselected STEP 6 (practice) */
  it('21. TrainingSelectionGuard prevents implicit fallback on STEP 6 (/practice)', () => {
    render(
      <MemoryRouter initialEntries={['/practice']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('먼저 STEP 1에서 목표 구간과 훈련 코스를 설정해 주세요.')).toBeInTheDocument();
  });

  /* 22. STEP 5 RoleplayHub integrates formula and course scenarios without absolute score guarantee */
  it('22. STEP 5 RoleplayHub merges 6-step formula and has non-guaranteeing tip phrasing', () => {
    saveTrainingSelection({ courseId: 'course-1', levelId: 'advanced' });
    render(
      <MemoryRouter initialEntries={['/roleplay']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getAllByText('STEP 5. 롤플레이 공식').length).toBeGreaterThan(0);
    expect(screen.getByText('1. 롤플레이란? & 대표 출제 흐름')).toBeInTheDocument();
    expect(screen.getByText('2. 6단계 만능 해결 공식')).toBeInTheDocument();
    expect(screen.getByText('3. 자주 쓰는 롤플레이 만능 표현')).toBeInTheDocument();
    expect(screen.getByText(/4. Everyday & Getaway 코스 실전 시나리오/)).toBeInTheDocument();
    expect(screen.getByText(/문제를 분명히 설명하고, 가능한 대안을 1~2개 제시하는 연습은/)).toBeInTheDocument();
    expect(screen.queryByText(/가장 높은 점수를 받습니다/)).not.toBeInTheDocument();
  });

  /* 23. RoleplayViewV2 has compact formula reminder and back-link */
  it('23. RoleplayViewV2 renders compact formula reminder and back-link', () => {
    saveTrainingSelection({ courseId: 'course-1', levelId: 'advanced' });
    render(
      <MemoryRouter initialEntries={['/roleplay/travel']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getAllByText('STEP 5. 롤플레이 공식').length).toBeGreaterThan(0);
    expect(screen.getByText('6단계 문제 해결 공식 요약')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '롤플레이 공식 전체보기' })).toBeInTheDocument();
  });

  /* 24. Progress mapping across 6 steps */
  it('24. Progress mapping correctly calculates neutral for overview, 0%, 20%, 40%, 60%, 80%, 100%', async () => {
    saveTrainingSelection({ courseId: 'course-1', levelId: 'advanced' });
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/training']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('6 STEP 로드맵')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'STEP 2 이동' }));
    expect(await screen.findByText('훈련 진행 20%')).toBeInTheDocument();
  });

  /* 25. Next-step button labels follow 6 STEPs */
  it('25. Next-step navigation buttons sequentially guide STEP 1 through STEP 6', () => {
    saveTrainingSelection({ courseId: 'course-1', levelId: 'advanced' });
    render(
      <MemoryRouter initialEntries={['/training/difficulty']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getAllByRole('button', { name: '다음 단계: STEP 4' })).toHaveLength(2);
  });

  /* 26. STEP 2 Background Survey Sheet pagination and mode toggle */
  it('26. STEP 2 Background Survey renders single paginated container and resets on mode toggle', async () => {
    saveTrainingSelection({ courseId: 'course-1', levelId: 'advanced' });
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/training/survey']}>
        <App />
      </MemoryRouter>
    );

    // Check Part 1 of 7
    expect(screen.getByText('Part 1 of 7 (1 / 7)')).toBeInTheDocument();
    expect(screen.getByText('이 코스의 4개 핵심 스토리 묶음 (Everyday & Getaway)')).toBeInTheDocument();

    // Navigate to Part 2
    await user.click(screen.getByRole('button', { name: /다음 파트/ }));
    expect(screen.getByText('Part 2 of 7 (2 / 7)')).toBeInTheDocument();

    // Switch to Practice Mode
    await user.click(screen.getByRole('button', { name: '연습 모드' }));
    expect(screen.getByText('Part 1 of 7 (1 / 7)')).toBeInTheDocument();
    expect(screen.getByText(/답을 보지 말고 OOM 조합을 다시 체크해 보세요/)).toBeInTheDocument();
  });

  /* 27. Invalid localStorage JSON recovery */
  it('27. Recovers safely from corrupted localStorage JSON', () => {
    localStorage.setItem(TRAINING_SELECTION_STORAGE_KEY, 'invalid-json-string');
    expect(loadTrainingSelection()).toBeNull();
  });

  /* 28. Overview STEP 1 card displays compact selection status and STEP 2-6 show setup indicator */
  it('28. Overview displays compact status on STEP 1 card and setup badges on STEP 2-6 when unselected', () => {
    render(
      <MemoryRouter initialEntries={['/training']}>
        <App />
      </MemoryRouter>
    );

    // Unselected state
    expect(screen.getByText('설정 필요')).toBeInTheDocument();
    expect(screen.getAllByText('STEP 1 설정 후 이용')).toHaveLength(5);
  });

  it('29. Overview displays compact course/level info on STEP 1 card when selected', () => {
    saveTrainingSelection({ courseId: 'course-2', levelId: 'intermediate' });
    render(
      <MemoryRouter initialEntries={['/training']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/설정 완료:/)).toBeInTheDocument();
    expect(screen.getByText(/2구간 · Culture & City/)).toBeInTheDocument();
    expect(screen.queryByText('STEP 1 설정 후 이용')).not.toBeInTheDocument();
  });

  /* 30. Survey recommendation count distinguishes activities from total items */
  it('30. Survey recommendation clearly distinguishes activity counts from profile/residence presets', () => {
    saveTrainingSelection({ courseId: 'course-2', levelId: 'advanced' });
    render(
      <MemoryRouter initialEntries={['/training/survey']}>
        <App />
      </MemoryRouter>
    );

    // Course 2 has 12 activities
    expect(screen.getByText(/Culture & City 추천 서베이: 활동 12개 추천 \+ 기본 프로필 · 거주 설정/)).toBeInTheDocument();
    expect(screen.getByText(/전체 16개 항목\(활동 12개 및 프로필\/거주지\)을 고정하여/)).toBeInTheDocument();
  });

  /* 31. Survey displayMode switches between paged and all */
  it('31. STEP 2 Survey switches between 파트별 보기 and 전체 보기 preserving selections', async () => {
    saveTrainingSelection({ courseId: 'course-1', levelId: 'advanced' });
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/training/survey']}>
        <App />
      </MemoryRouter>
    );

    // Default is paged (Part 1 of 7)
    expect(screen.getByText('Part 1 of 7 (1 / 7)')).toBeInTheDocument();

    // Switch to '전체 보기'
    await user.click(screen.getByRole('button', { name: '전체 보기' }));
    expect(screen.getByText('전체 7개 파트')).toBeInTheDocument();
    expect(screen.getByText('Part 1 of 7')).toBeInTheDocument();
    expect(screen.getByText('Part 7 of 7')).toBeInTheDocument();

    // Switch back to '파트별 보기'
    await user.click(screen.getByRole('button', { name: '파트별 보기' }));
    expect(screen.getByText('Part 1 of 7 (1 / 7)')).toBeInTheDocument();
  });

  /* 32. STT adapter transcribeAudio builds FormData and handles response */
  it('32. STT adapter transcribeAudio sends audio blob with correct form fields and auth', async () => {
    const { transcribeAudio } = await import('./lib/stt');

    let capturedBody: FormData | null = null;
    let capturedHeaders: Record<string, string> | null = null;

    const originalFetch = window.fetch;
    window.fetch = async (_input: RequestInfo | URL, init?: RequestInit) => {
      capturedBody = init?.body as FormData;
      capturedHeaders = (init?.headers as Record<string, string>) || null;
      return new Response(JSON.stringify({ text: 'I love going to the park.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    try {
      const blob = new Blob(['mock audio data'], { type: 'audio/webm' });
      const result = await transcribeAudio(
        {
          endpoint: 'https://api.openai.com/v1/audio/transcriptions',
          apiKey: 'test-key-123',
          model: 'whisper-1',
          authType: 'bearer',
          autoTranscribe: true,
        },
        blob,
        'audio/webm'
      );

      expect(result).toBe('I love going to the park.');
      expect(capturedHeaders ? capturedHeaders['Authorization'] : undefined).toBe(
        'Bearer test-key-123'
      );
      expect(capturedBody).toBeInstanceOf(FormData);
    } finally {
      window.fetch = originalFetch;
    }
  });

  /* 33. Practice timer respects level targetSeconds */
  it('33. Practice level definitions provide specific target duration and learning focus', () => {
    const adv = TRAINING_LEVELS.find((l) => l.id === 'advanced')!;
    const inter = TRAINING_LEVELS.find((l) => l.id === 'intermediate')!;
    const fnd = TRAINING_LEVELS.find((l) => l.id === 'foundation')!;

    expect(adv.targetSeconds).toEqual([60, 90]);
    expect(inter.targetSeconds).toEqual([45, 65]);
    expect(fnd.targetSeconds).toEqual([30, 45]);

    expect(adv.learningFocus).toContain('질문별 즉흥 변형');
    expect(inter.learningFocus).toContain('핵심 블록 재사용');
    expect(fnd.learningFocus).toContain('누구·어디·무엇·왜');
  });

  /* 34. Practice View renders and allows random question draw */
  it('34. STEP 6 Practice view renders with level-aware pool and resets question', async () => {
    saveTrainingSelection({ courseId: 'course-1', levelId: 'advanced' });
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/practice']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/Everyday & Getaway 랜덤 질문/)).toBeInTheDocument();
    expect(screen.getByText(/1구간 \(AL \(Advanced Low\)\) 레벨에 맞는 질문 풀/)).toBeInTheDocument();

    // Click random draw button
    await user.click(screen.getByRole('button', { name: '랜덤 질문 뽑기' }));
    expect(screen.getByRole('button', { name: /답변 시작/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /추천 스크립트 힌트 보기/ })).toBeInTheDocument();
  });

  /* 35. Complete Content QA & Structural Integrity for Course 1-3 × Level 1-3 */
  it('35. Structural integrity audit: every course has 4 storylines, >=3 roleplays, and 3-level coverage', () => {
    expect(discoveredCourses.length).toBeGreaterThanOrEqual(3);

    for (const course of discoveredCourses) {
      for (const level of TRAINING_LEVELS) {
        const ctx = resolveTrainingContext(course.id, level.id);

        // Survey preset
        expect(ctx.survey.profileOptionIds.length).toBeGreaterThan(0);
        expect(ctx.survey.activityOptionIds.length).toBeGreaterThanOrEqual(12);

        // 4 storylines
        expect(ctx.storylines).toHaveLength(4);
        for (const storyline of ctx.storylines) {
          expect(storyline.core.anchorScene.length).toBeGreaterThan(0);
          expect(storyline.core.facts.length).toBeGreaterThan(0);
          expect(storyline.active.englishScript.length).toBeGreaterThan(0);
          expect(storyline.active.koreanSummary.length).toBeGreaterThan(0);

          // All 3 levels must exist on the storyline
          for (const l of ['advanced', 'intermediate', 'foundation'] as const) {
            expect(storyline.levels[l].englishScript.length).toBeGreaterThan(0);
          }
        }

        // >= 3 roleplays
        expect(ctx.roleplays.length).toBeGreaterThanOrEqual(3);
        for (const roleplay of ctx.roleplays) {
          expect(roleplay.answerStructure.length).toBeGreaterThan(0);
          expect(roleplay.active.englishExample.length).toBeGreaterThan(0);
          for (const l of ['advanced', 'intermediate', 'foundation'] as const) {
            expect(roleplay.levels[l].englishExample.length).toBeGreaterThan(0);
          }
        }

        // Questions pool
        expect(ctx.questions.length).toBeGreaterThanOrEqual(12);
        for (const q of ctx.questions) {
          expect(q.prompt.length).toBeGreaterThan(0);
          expect(q.group.length).toBeGreaterThan(0);
          expect(q.type.length).toBeGreaterThan(0);
        }
      }
    }
  });
});
