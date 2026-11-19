// واجهة الصفحات للسجل: وحدة واحدة للحقيقة هي src/content/lesson-registry.json.
// لا تُشتق الهوية من رقم الترتيب ولا يُفترض وجود درس أول معيّن.
import { LESSON_REGISTRY } from "@/content/lesson-registry";
import { LESSON_CONTENT_INDEX } from "@/content/lesson-index";
import { ASSESSMENT_INDEX } from "@/content/assessment-index";
import { PRACTICE_INDEX } from "@/content/practice-index";
import { findLesson as findRegistryLesson, lessonsOfUnit, type LessonRecord, type PublishedLessonRecord, type UnitRecord } from "@/lib/lesson-registry";
import { validateLessonPackages, type ResolvedLessonPackage } from "@/lib/lesson-package";

export const units: UnitRecord[] = [...LESSON_REGISTRY.units].sort((a, b) => a.order - b.order);

let packageCache: ResolvedLessonPackage[] | null = null;
/** حزم الدروس المنشورة بعد فحص السجل والمراجع؛ أي خلل يوقف البناء برسالة محددة. */
export function lessonPackages(): ResolvedLessonPackage[] {
  return (packageCache ??= validateLessonPackages(LESSON_REGISTRY, {
    lessons: LESSON_CONTENT_INDEX, assessments: ASSESSMENT_INDEX, practices: PRACTICE_INDEX,
  }));
}

const goalsById = new Map(lessonPackages().map(item => [item.entry.id, item.content.goals]));

export const lessons = LESSON_REGISTRY.lessons.map(lesson => ({
  ...lesson,
  goals: goalsById.get(lesson.id) ?? null,
}));

export const publishedLessons: (PublishedLessonRecord & { goals: string | null })[] = lessons.filter(
  (lesson): lesson is PublishedLessonRecord & { goals: string | null } => lesson.status === "published",
);

export function findLesson(id: number): LessonRecord | undefined {
  return findRegistryLesson(LESSON_REGISTRY, id);
}

export function findUnit(id: number): UnitRecord | undefined {
  return units.find(unit => unit.id === id);
}

export function lessonsInUnit(unitId: number): LessonRecord[] {
  return lessonsOfUnit(LESSON_REGISTRY, unitId);
}

export function lessonPackage(id: number): ResolvedLessonPackage | undefined {
  return lessonPackages().find(item => item.entry.id === id);
}

export type { LessonRecord, PublishedLessonRecord, ResolvedLessonPackage };
