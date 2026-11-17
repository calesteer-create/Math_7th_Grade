import { db } from "@/db";
import {
  lessonProgress,
  lessons,
  quizAttempts,
  quizQuestions,
  students,
  teacherSolutions,
  units,
} from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { isTeacher } from "@/lib/teacher-auth";
import { displayAnswer } from "@/lib/assessment";

export const dynamic = "force-dynamic";

// بيانات منطقة المعلم — محمية: لا تُرجع إلا بجلسة معلم موثقة
export async function GET() {
  if (!(await isTeacher())) {
    return Response.json({ error: "غير مصرح." }, { status: 401 });
  }
  try {
    const allUnits = await db.select().from(units).orderBy(asc(units.order));
    const allLessons = await db.select().from(lessons);
    const allSolutions = await db
      .select()
      .from(teacherSolutions)
      .orderBy(asc(teacherSolutions.order), asc(teacherSolutions.id));
    const allQuestions = await db.select().from(quizQuestions);
    const attemptsRows = await db
      .select({
        id: quizAttempts.id,
        studentName: students.name,
        title: quizAttempts.title,
        scope: quizAttempts.scope,
        score: quizAttempts.score,
        total: quizAttempts.total,
        createdAt: quizAttempts.createdAt,
      })
      .from(quizAttempts)
      .innerJoin(students, eq(quizAttempts.studentId, students.id))
      .orderBy(desc(quizAttempts.createdAt))
      .limit(100);
    await db.select().from(lessonProgress); // يضمن تحميل الجدول (للمتابعة لاحقًا)

    const unitTitle = new Map(allUnits.map((u) => [u.id, u.title]));
    const lessonTitle = new Map(allLessons.map((l) => [l.id, l.title]));

    const solutions = allSolutions.map((s) => ({
      id: s.id,
      unitTitle: unitTitle.get(s.unitId ?? 0) ?? "",
      lessonTitle: s.lessonId ? lessonTitle.get(s.lessonId) ?? "" : null,
      title: s.title,
      source: s.source,
      question: s.question,
      answer: s.answer,
      steps: (s.steps as string[] | null) ?? null,
      law: s.law,
      notes: s.notes,
      commonMistakes: (s.commonMistakes as string[] | null) ?? null,
      status: s.status,
    }));

    // تجميع مفاتيح الإجابات حسب الاختبار
    const keyGroups = new Map<string, typeof allQuestions>();
    for (const q of allQuestions) {
      const key = q.scope === "lesson" ? `lesson:${q.lessonId}` : `unit:${q.unitId}`;
      if (!keyGroups.has(key)) keyGroups.set(key, []);
      keyGroups.get(key)!.push(q);
    }
    const quizKeys = Array.from(keyGroups.entries()).map(([key, qs]) => {
      const [scope, rawId] = key.split(":");
      const idNum = Number(rawId);
      const title =
        scope === "lesson"
          ? `اختبار درس: ${lessonTitle.get(idNum) ?? ""}`
          : `اختبار الوحدة: ${unitTitle.get(idNum) ?? ""}`;
      return {
        id: key,
        scope,
        title,
        questions: qs
          .sort((a, b) => a.order - b.order || a.id - b.id)
          .map((q) => ({
            id: q.id,
            type: q.type,
            question: q.question,
            answer: displayAnswer(q),
            explanation: q.explanation,
            source: q.source,
          })),
      };
    });

    return Response.json({
      stats: {
        lessons: allLessons.length,
        published: allLessons.filter((l) => l.status === "published").length,
        solutions: allSolutions.length,
        quizQuestions: allQuestions.length,
        attempts: attemptsRows.length,
      },
      units: allUnits.map((u) => ({
        id: u.id,
        title: u.title,
        lessons: allLessons
          .filter((l) => l.unitId === u.id)
          .map((l) => ({ id: l.id, title: l.title, status: l.status })),
      })),
      solutions,
      quizKeys,
      attempts: attemptsRows.map((a) => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "تعذر تحميل بيانات المعلم." }, { status: 500 });
  }
}
