import { LESSON_REGISTRY } from "../src/content/lesson-registry";
import { LESSON_CONTENT_INDEX } from "../src/content/lesson-index";
import { ASSESSMENT_INDEX } from "../src/content/assessment-index";
import { PRACTICE_INDEX } from "../src/content/practice-index";
import { publishedLessons } from "../src/lib/lesson-registry";
import { validateLessonPackages } from "../src/lib/lesson-package";

const packages = validateLessonPackages(LESSON_REGISTRY, {
  lessons: LESSON_CONTENT_INDEX, assessments: ASSESSMENT_INDEX, practices: PRACTICE_INDEX,
});
const published = publishedLessons(LESSON_REGISTRY);
const pending = LESSON_REGISTRY.lessons.filter(lesson => lesson.status !== "published");
console.log(`Lesson registry valid: ${LESSON_REGISTRY.units.length} units, ${LESSON_REGISTRY.lessons.length} lessons, ${published.length} published, ${pending.length} pending.`);
console.log(`Lesson packages valid: ${packages.map(item => `#${item.entry.id} «${item.entry.key}»`).join(", ") || "none"}.`);
