import type { Block, NotebookSection } from "@/components/ContentRenderer";
import { validateOriginalAssessment, type OriginalAssessment } from "@/lib/assessment";
import { STAGES } from "@/lib/site";
import { validateLessonPresentation, validateAssessmentPresentation } from "@/lib/lesson-presentation";

export const LESSON_PUBLICATION_NOTICE = "يتاح اختبار نهاية الدرس فور نشر الدرس، ضمن العملية نفسها؛ دون طلب منفصل أو انتظار اكتمال الوحدة.";

export type LessonDraft = {
  title: string;
  goals: string;
  source: string;
  sourcePage?: number;
  assessmentRef: string;
  practiceRef?: string;
  content: Record<string, Block[]>;
  notebook: NotebookSection[];
  solutions: {
    title: string;
    source: string;
    question: string;
    answer: string;
    steps: string[];
    order: number;
    law?: string;
    notes?: string;
    commonMistakes?: string[];
  }[];
};

const hasText = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

/** النشر خطوة واحدة، لا درس منشور الآن واختبار مؤجل إلى مهمة أخرى. */
export function validateLessonPublication(
  lesson: LessonDraft,
  assessment: OriginalAssessment | null | undefined,
): asserts assessment is OriginalAssessment {
  if (!assessment || !Array.isArray(assessment.questions) || assessment.questions.length === 0) {
    throw new Error("لا يمكن نشر الدرس دون اختبار نهاية جاهز ضمن العملية نفسها.");
  }
  if (!lesson || !hasText(lesson.title) || !hasText(lesson.goals) || !hasText(lesson.source)) {
    throw new Error("عنوان الدرس وأهدافه ومصدره مطلوبة للنشر.");
  }
  if (lesson.sourcePage !== undefined && (!Number.isSafeInteger(lesson.sourcePage) || lesson.sourcePage < 1 || lesson.sourcePage > 2147483647)) {
    throw new Error("رقم صفحة المصدر غير صالح.");
  }
  for (const stage of STAGES.filter(s => s.key !== "quiz" && s.key !== "notebook")) {
    if (!Array.isArray(lesson.content?.[stage.key]) || lesson.content[stage.key].length === 0) {
      throw new Error(`الدرس غير مكتمل: مرحلة «${stage.title}» فارغة.`);
    }
  }
  if (!Array.isArray(lesson.notebook) || !lesson.notebook.length || lesson.notebook.some(section => !hasText(section.id) || !hasText(section.title) || !hasText(section.writingTask) || !Array.isArray(section.blocks) || !section.blocks.length)) {
    throw new Error("دفتر الطالب مطلوب بأوراق كتابة ومهام تدوين ضمن حزمة نشر الدرس.");
  }
  const sheetIds = lesson.notebook.map(section => section.id);
  if (new Set(sheetIds).size !== sheetIds.length || sheetIds.some(id => !/^[a-z][a-z0-9-]{1,63}$/.test(id) || ["constructor", "prototype"].includes(id))) {
    throw new Error("معرّفات أوراق دفتر الطالب يجب أن تكون ثابتة وفريدة وصالحة.");
  }
  if (!Array.isArray(lesson.solutions)) throw new Error("يجب إرفاق حلول أسئلة المصدر مع حزمة النشر.");
  const solutionOrders = new Set<number>();
  for (const solution of lesson.solutions) {
    if (!hasText(solution.title) || !hasText(solution.source) || !hasText(solution.question) || !hasText(solution.answer)
      || !Array.isArray(solution.steps) || !solution.steps.length || solution.steps.some(step => !hasText(step))
      || !Number.isSafeInteger(solution.order) || solution.order < 1 || solution.order > 2147483647 || solutionOrders.has(solution.order)) {
      throw new Error("حلول المصدر غير مكتملة أو ترتيبها مكرر.");
    }
    solutionOrders.add(solution.order);
  }
  validateLessonPresentation(lesson);
  validateOriginalAssessment(lesson, assessment);
  validateAssessmentPresentation(assessment);
  // لا تكفي أسئلة جاهزة شكليًا إذا لم تغطِ المهارات المحددة للاختبار.
  const coveredSkills = new Set(assessment.questions.map(question => question.skill));
  if (Object.keys(assessment.skills).some(skill => !coveredSkills.has(skill))) {
    throw new Error("اختبار نهاية الدرس لا يغطي جميع مهاراته المحددة.");
  }
}
