import type { OriginalAssessment } from "@/lib/assessment";
import type { PracticeBank } from "@/lib/practice-grading";
import { ASSESSMENT_INDEX } from "@/content/assessment-index";
import { PRACTICE_INDEX } from "@/content/practice-index";
import { LESSON_REGISTRY } from "@/content/lesson-registry";
import { publishedLessons } from "@/lib/lesson-registry";

// بحث آمن للمتصفح: يعتمد على السجل والمراجع فقط، ولا يسحب محتوى الدروس أو دفترها.
// لا يوجد أي سقوط إلى «الدرس الأول»؛ الدرس غير المنشور أو المجهول بلا بنك.
function publishedEntry(id: number) {
  return publishedLessons(LESSON_REGISTRY).find(lesson => lesson.id === id);
}

export function assessmentForLesson(id: number): OriginalAssessment | null {
  const entry = publishedEntry(id);
  if (!entry) return null;
  const bank = ASSESSMENT_INDEX[entry.assessmentRef];
  return (bank as OriginalAssessment | undefined) ?? null;
}

export function practiceForLesson(id: number): PracticeBank | null {
  const entry = publishedEntry(id);
  if (!entry?.practiceRef) return null;
  const bank = PRACTICE_INDEX[entry.practiceRef];
  return (bank as PracticeBank | undefined) ?? null;
}
