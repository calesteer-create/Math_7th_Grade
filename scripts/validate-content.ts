import { LESSON_REGISTRY } from "../src/content/lesson-registry";
import { LESSON_CONTENT_INDEX } from "../src/content/lesson-index";
import { ASSESSMENT_INDEX } from "../src/content/assessment-index";
import { PRACTICE_INDEX } from "../src/content/practice-index";
import { UNIT_EXERCISES_INDEX } from "../src/content/unit-exercise-index";
import { publishedLessons } from "../src/lib/lesson-registry";
import { validateLessonPackages } from "../src/lib/lesson-package";
import { validateUnitExercises } from "../src/lib/unit-exercises";

const packages = validateLessonPackages(LESSON_REGISTRY, {
  lessons: LESSON_CONTENT_INDEX, assessments: ASSESSMENT_INDEX, practices: PRACTICE_INDEX,
});
const published = publishedLessons(LESSON_REGISTRY);
const pending = LESSON_REGISTRY.lessons.filter(lesson => lesson.status !== "published");
const unitExercises = Object.entries(UNIT_EXERCISES_INDEX).map(([unitId, file]) => validateUnitExercises(file, `unit-exercises/unit-${unitId}.json`));
console.log(`Lesson registry valid: ${LESSON_REGISTRY.units.length} units, ${LESSON_REGISTRY.lessons.length} lessons, ${published.length} published, ${pending.length} pending.`);
console.log(`Lesson packages valid: ${packages.map(item => `#${item.entry.id} «${item.entry.key}»`).join(", ") || "none"}.`);
console.log(`Unit exercises valid: ${unitExercises.map(item => `unit ${item.unitId} (${item.exercises.length} exercises)`).join(", ") || "none"}.`);
