import "dotenv/config";
import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { and, eq } from "drizzle-orm";
import { db, pool } from "@/db";
import { lessons, units } from "@/db/schema";
import { publishLessonWithAssessment } from "@/db/publish-lesson";
import type { OriginalAssessment } from "@/lib/assessment";
import type { LessonDraft } from "@/lib/lesson-publication";
import type { PracticeBank } from "@/lib/practice-grading";

export async function seedLessonOne() {
  try {
    const lesson = JSON.parse(await readFile("src/content/lesson-1.json", "utf8")) as LessonDraft;
    if (typeof lesson.assessmentRef !== "string" || !lesson.assessmentRef.trim()) {
      throw new Error("ملف اختبار نهاية الدرس إلزامي ضمن عملية إضافة الدرس نفسها.");
    }
    const assessmentPath = resolve("src/content", lesson.assessmentRef);
    if (!assessmentPath.startsWith(resolve("src/content/assessments") + sep)) {
      throw new Error("مرجع اختبار الدرس يجب أن يكون ضمن مجلد الاختبارات الخاص.");
    }
    // يُحمَّل الاختبار في هذه العملية، لا في سكربت لاحق أو بطلب إضافي من المالك.
    const assessment = JSON.parse(await readFile(assessmentPath, "utf8")) as OriginalAssessment;
    if (!lesson.practiceRef) throw new Error("ملف الأنشطة التفاعلية للكتاب مطلوب.");
    const practicePath = resolve("src/content", lesson.practiceRef);
    if (!practicePath.startsWith(resolve("src/content/practice") + sep)) throw new Error("مرجع الأنشطة غير صالح.");
    const practice = JSON.parse(await readFile(practicePath, "utf8")) as PracticeBank;
    const [target] = await db.select({ id: lessons.id }).from(lessons)
      .innerJoin(units, eq(units.id, lessons.unitId)).where(and(eq(units.order, 1), eq(lessons.order, 1))).limit(1);
    if (!target) throw new Error("فهرس الكتاب غير موجود؛ هيّئ الوحدات أولًا.");
    const result = await publishLessonWithAssessment({ lessonId: target.id, lesson: { ...lesson, sourcePage: 3 }, assessment, practice });
    // لا نعلن النجاح إلا بعد اكتمال COMMIT.
    console.log(`نُشر الدرس ${result.lessonId} واختبار نهايته معًا: ${result.quizCount} أسئلة جديدة و${result.practiceCount} أنشطة كتاب و${result.solutionCount} حلول محمية، مع حفظ التقدم والمحاولات.`);
  } finally {
    await pool.end();
  }
}
