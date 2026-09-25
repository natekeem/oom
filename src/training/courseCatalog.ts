import type { CourseDefinition, TrainingCourseId } from './types';
const manifests = import.meta.glob<{ course: CourseDefinition }>('/src/data/training/courses/*/manifest.ts', { eager: true });
type Navigation = { storylines: { group: string }[]; roleplays: { group: string }[] };
const navigation = import.meta.glob<{ navigation: Navigation }>('/src/data/training/courses/*/navigation.ts', { eager: true });
export const discoveredCourses = Object.values(manifests).map(m => m.course).sort((a,b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
export function getCourseNavigation(id: TrainingCourseId): Navigation | null {
  return navigation['/src/data/training/courses/' + id + '/navigation.ts']?.navigation ?? null;
}
