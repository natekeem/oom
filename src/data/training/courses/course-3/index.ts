import type { CourseBundle } from '../../../../training/types';
import { course } from './manifest';
import { survey } from './survey';
import { storylines } from './storylines';
import { roleplays } from './roleplays';
import { questions } from './questions';
import { variantSets } from './variants';
import { replacementGuides } from './replacementGuides';

const bundle: CourseBundle = {
  course,
  survey,
  storylines,
  roleplays,
  questions,
  variantSets,
  replacementGuides,
};
export default bundle;
export { course, survey, storylines, roleplays, questions, variantSets, replacementGuides };
