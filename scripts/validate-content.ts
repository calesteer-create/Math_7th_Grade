import lessonJson from "../src/content/lesson-1.json";
import assessmentJson from "../src/content/assessments/natural-numbers.json";
import practiceJson from "../src/content/practice/natural-numbers.json";
import { validateLessonPublication, type LessonDraft } from "../src/lib/lesson-publication";
import { validatePracticeBank, type PracticeBank } from "../src/lib/practice-grading";
import type { OriginalAssessment } from "../src/lib/assessment";

const lesson = lessonJson as unknown as LessonDraft;
validateLessonPublication(lesson, assessmentJson as OriginalAssessment);
validatePracticeBank(lesson, practiceJson as unknown as PracticeBank);
console.log("Lesson, assessment, notebook and practice content validated.");
