// مسار نشر داخلي فقط، لا يُستورد من مكونات العميل أو يُكشف كواجهة عامة.
import { createHash, randomUUID } from "node:crypto";
import { and, asc, eq, gt, sql } from "drizzle-orm";
import { db } from "@/db";
import { lessons, lessonExercises, quizQuestions, settings, teacherSolutions } from "@/db/schema";
import type { OriginalAssessment } from "@/lib/assessment";
import { canonicalPractice, validatePracticeBank, type PracticeBank } from "@/lib/practice-grading";
import { validateLessonPublication, type LessonDraft } from "@/lib/lesson-publication";

export type LessonPublication = {
  lessonId: number;
  lesson: LessonDraft;
  assessment: OriginalAssessment;
  practice?: PracticeBank;
};

/**
 * الدرس + دفتر الطالب + اختبار النهاية + حلول المصدر = معاملة واحدة.
 * لا نجاح جزئي: أي استثناء يعيد النسخة السابقة، ولا يمس تقدم الطالب أو محاولاته.
 * لا ينشئ هذا المسار اختبار وحدة؛ جميع الأسئلة المدرجة نطاقها lesson حصريًا.
 */
export async function publishLessonWithAssessment(input: LessonPublication) {
  const { lessonId } = input;
  if (!Number.isSafeInteger(lessonId) || lessonId < 1 || lessonId > 2147483647) {
    throw new Error("معرّف الدرس غير صالح للنشر.");
  }
  // تثبيت المدخلات قبل الانتظار يمنع تبديل الحزمة أثناء عملية النشر.
  const lesson = structuredClone(input.lesson);
  const assessment = structuredClone(input.assessment);
  validateLessonPublication(lesson, assessment);
  const practice = input.practice ? structuredClone(input.practice) : undefined;
  validatePracticeBank(lesson, practice);

  return db.transaction(async tx => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`publish-lesson:${lessonId}`}))`);
    const [target] = await tx.select({ id: lessons.id, unitId: lessons.unitId }).from(lessons).where(eq(lessons.id, lessonId)).limit(1);
    if (!target) throw new Error("الدرس غير موجود في فهرس الكتاب؛ لا يمكن نشره.");

    const oldQuestions = await tx.select().from(quizQuestions)
      .where(and(eq(quizQuestions.lessonId, target.id), eq(quizQuestions.scope, "lesson")))
      .orderBy(asc(quizQuestions.order));
    const hasChanges = oldQuestions.length !== assessment.questions.length || oldQuestions.some((old, index) => {
      const next = assessment.questions[index];
      return !next || old.question !== next.question || old.answer !== next.answer
        || old.explanation !== next.explanation || old.type !== next.type
        || JSON.stringify(old.options) !== JSON.stringify(next.options ?? null);
    });
    if (hasChanges && oldQuestions.length) {
      const snapshot = JSON.stringify(oldQuestions);
      const digest = createHash("sha256").update(snapshot).digest("hex").slice(0, 20);
      await tx.insert(settings).values({ key: `quiz_archive:${target.id}:${digest}`, value: snapshot }).onConflictDoNothing();
    }

    for (const [index, question] of assessment.questions.entries()) {
      const values = {
        lessonId: target.id, unitId: target.unitId, scope: "lesson", type: question.type,
        question: question.question, options: question.options ?? null, answer: question.answer,
        explanation: question.explanation, difficulty: question.difficulty, order: index + 1,
        source: `${assessment.source} المهارة: ${assessment.skills[question.skill]} [${assessment.revision}]`,
      };
      const existing = oldQuestions.find(q => q.order === index + 1);
      if (existing) await tx.update(quizQuestions).set(values).where(eq(quizQuestions.id, existing.id));
      else await tx.insert(quizQuestions).values(values);
    }
    await tx.delete(quizQuestions).where(and(eq(quizQuestions.lessonId, target.id), eq(quizQuestions.scope, "lesson"), gt(quizQuestions.order, assessment.questions.length)));

    for (const solution of lesson.solutions) {
      const [existing] = await tx.select({ id: teacherSolutions.id }).from(teacherSolutions)
        .where(and(eq(teacherSolutions.lessonId, target.id), eq(teacherSolutions.order, solution.order))).limit(1);
      const values = {
        lessonId: target.id, unitId: target.unitId, title: solution.title, source: solution.source,
        question: solution.question, answer: solution.answer, steps: solution.steps, law: solution.law ?? null,
        notes: solution.notes ?? null, commonMistakes: solution.commonMistakes ?? [], status: "ready", order: solution.order,
      };
      if (existing) await tx.update(teacherSolutions).set(values).where(eq(teacherSolutions.id, existing.id));
      else await tx.insert(teacherSolutions).values(values);
    }

    // فحص ما حُفظ فعليًا قبل نشر الدرس، بما في ذلك كشف أي ترتيب مكرر سابقًا.
    const savedQuestions = await tx.select({ order: quizQuestions.order, answer: quizQuestions.answer, explanation: quizQuestions.explanation })
      .from(quizQuestions).where(and(eq(quizQuestions.lessonId, target.id), eq(quizQuestions.scope, "lesson"))).orderBy(asc(quizQuestions.order));
    if (savedQuestions.length !== assessment.questions.length || savedQuestions.some((q, index) => q.order !== index + 1 || !q.answer.trim() || !q.explanation?.trim())) {
      throw new Error("لم تكتمل مطابقة أسئلة اختبار نهاية الدرس؛ أُلغيت عملية النشر كاملة.");
    }

    // الأنشطة الأصلية تُنشر مع الدرس، والإصدارات السابقة تبقى لسجل الطالب.
    if (practice) {
      const previousExercises = await tx.select().from(lessonExercises).where(eq(lessonExercises.lessonId, target.id));
      await tx.update(lessonExercises).set({ active: false }).where(eq(lessonExercises.lessonId, target.id));
      for (const definition of practice.exercises) {
        const same = previousExercises.find(row => row.key === definition.key && row.authorRevision === practice.revision && canonicalPractice(row.definition) === canonicalPractice(definition));
        if (same) await tx.update(lessonExercises).set({ active: true }).where(and(eq(lessonExercises.lessonId, target.id), eq(lessonExercises.key, same.key), eq(lessonExercises.version, same.version)));
        else await tx.insert(lessonExercises).values({ lessonId: target.id, key: definition.key, version: randomUUID(), authorRevision: practice.revision, definition, active: true });
      }
    }

    // آخر كتابة في المعاملة: الدرس لا يظهر للطالب قبل أن يكون اختباره جاهزًا.
    await tx.update(lessons).set({
      title: lesson.title, goals: lesson.goals, content: lesson.content,
      notebook: lesson.notebook, sourcePage: lesson.sourcePage, status: "published",
    }).where(eq(lessons.id, target.id));

    return { lessonId: target.id, quizCount: savedQuestions.length, solutionCount: lesson.solutions.length, practiceCount: practice?.exercises.length ?? 0 };
  });
}
