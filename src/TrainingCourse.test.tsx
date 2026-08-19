import { describe, it, expect, beforeEach } from 'vitest';
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
} from './training/storage';
import { scripts } from './data/scripts';
import { getViewTitle } from './components/layout/Sidebar';

describe('Training Course Architecture & Regression Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  /* 1. Level system integrity */
  it('has exactly 3 levels with correct presets', () => {
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
  it('discovers all courses with standardized titles', () => {
    expect(discoveredCourses.length).toBeGreaterThanOrEqual(3);
    expect(discoveredCourses[0].id).toBe('course-1');
    expect(discoveredCourses[0].title).toBe('Everyday & Getaway');
    expect(discoveredCourses[1].id).toBe('course-2');
    expect(discoveredCourses[1].title).toBe('Culture & City');
    expect(discoveredCourses[2].id).toBe('course-3');
    expect(discoveredCourses[2].title).toBe('Nature & Weekend');
  });

  /* 3. STEP 3 variation data exists for all 3 courses */
  it('1. Course 1/2/3 has STEP 3 variation data for all canonical storylines', () => {
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

  /* 4. STEP 3 blueprint data exists for all 3 courses */
  it('2. Course 1/2/3 has blueprint data for all canonical storylines', () => {
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
  it('3. Course 2/3 does not use Course 1 fallback data in storylines, roleplays, or variants', () => {
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
  it('4. Slot 0 resolves to corresponding course storyline upon course change', () => {
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
  it('5. Dynamic sidebar and header group titles reflect active course', () => {
    const ctx1 = resolveTrainingContext('course-1', 'advanced');
    const ctx2 = resolveTrainingContext('course-2', 'advanced');
    const ctx3 = resolveTrainingContext('course-3', 'advanced');

    expect(getViewTitle('script-outdoor', ctx1)).toBe('STEP 3. 야외 / 여행');
    expect(getViewTitle('script-outdoor', ctx2)).toBe('STEP 3. 문화 / 음악');
    expect(getViewTitle('script-outdoor', ctx3)).toBe('STEP 3. 공원 / 걷기 / 하이킹');

    expect(getViewTitle('roleplay-travel', ctx1)).toBe('STEP 4. 야외 / 여행');
    expect(getViewTitle('roleplay-travel', ctx2)).toBe('STEP 4. 문화 / 음악');
    expect(getViewTitle('roleplay-travel', ctx3)).toBe('STEP 4. 캠핑 / 해변 / 드라이브');
  });

  /* 8. STEP 4 scenario IDs differ across courses */
  it('6. Course 1/2/3 STEP 4 scenario IDs are properly distinct', () => {
    const ctx1 = resolveTrainingContext('course-1', 'intermediate');
    const ctx2 = resolveTrainingContext('course-2', 'intermediate');
    const ctx3 = resolveTrainingContext('course-3', 'intermediate');

    expect(ctx1.roleplays[0].id).toBe('hotel-booking');
    expect(ctx2.roleplays[0].id).toBe('ticket-seat-problem');
    expect(ctx3.roleplays[0].id).toBe('campground-weather-change');
  });

  /* 9. Roleplay level variants change examples while preserving scenario */
  it('7. Changing level on same roleplay scenario updates englishExample and focus', () => {
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
  it('8. STEP 5 question type internal IDs follow uniform schema across all courses', () => {
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
  it('9. Question pool is strictly isolated by Course and Level', () => {
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
  it('10. Course 1 advanced script matches original text 100%', () => {
    const ctx = resolveTrainingContext('course-1', 'advanced');
    for (let i = 0; i < scripts.length; i++) {
      const orig = scripts[i];
      const storyline = ctx.storylines.find((s) => s.id === orig.id);
      expect(storyline).toBeDefined();
      expect(storyline?.active.englishScript.trim()).toBe(orig.englishScript.trim());
    }
  });

  /* 13. Persistence and storage fallback */
  it('11. Persists and clears training selection in localStorage', () => {
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
  it('12. Course registry auto-discovery and template literal CourseId support future course', () => {
    const testId: import('./training/types').TrainingCourseId = 'course-99';
    expect(testId).toBe('course-99');
    expect(discoveredCourses.length).toBeGreaterThanOrEqual(3);
  });
});
