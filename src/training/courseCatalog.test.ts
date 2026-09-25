import { describe, expect, it } from 'vitest';
import { discoveredCourses, getCourseNavigation } from './courseCatalog';
import { resolveTrainingContext } from './courseRegistry';
describe('lightweight catalog parity', () => {
  it.each(discoveredCourses)('$id shell labels match canonical data at every level', course => {
    for (const level of ['advanced', 'intermediate', 'foundation'] as const) {
      const context = resolveTrainingContext(course.id, level);
      expect(getCourseNavigation(course.id)).toEqual({ storylines: context.storylines.map(({ group }) => ({ group })), roleplays: context.roleplays.map(({ group }) => ({ group })) });
      expect(context.questions.length).toBeGreaterThanOrEqual(12);
    }
  });
});
