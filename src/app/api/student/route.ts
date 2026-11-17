import { db } from "@/db";
import {
  lessonProgress,
  lessons,
  quizAttempts,
  students,
  units,
} from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { ensureStudent, getStudentId, renameStudent } from "@/lib/student";

export const dynamic = "force-dynamic";

const BADGES = [
  { id: "first", title: "الخطوة الأولى", desc: "أكملت أول درس" },
  { id: "five", title: "مثابر", desc: "أكملت 5 دروس" },
  { id: "perfect", title: "علامة كاملة", desc: "نتيجة كاملة في اختبار" },
  { id: "persistent", title: "مجتهد", desc: "5 محاولات اختبار أو أكثر" },
];

async function buildOverview(studentId: number) {
  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);
  const progress = await db
    .select()
    .from(lessonProgress)
    .where(eq(lessonProgress.studentId, studentId));
  const attempts = await db
    .select()
    .from(quizAttempts)
    .where(eq(quizAttempts.studentId, studentId))
    .orderBy(desc(quizAttempts.createdAt))
    .limit(50);

  const allUnits = await db.select().from(units).orderBy(units.order);
  const allLessons = await db.select().from(lessons);
  const lessonUnit = new Map(allLessons.map((l) => [l.id, l.unitId]));
  const lessonTitle = new Map(allLessons.map((l) => [l.id, l.title]));

  const completed = progress.filter((p) => p.completed);
  const points =
    completed.length * 50 + attempts.reduce((s, a) => s + a.score * 10, 0);

  const badges = BADGES.map((b) => ({
    ...b,
    earned:
      b.id === "first"
        ? completed.length >= 1
        : b.id === "five"
        ? completed.length >= 5
        : b.id === "perfect"
        ? attempts.some((a) => a.total > 0 && a.score === a.total)
        : attempts.length >= 5,
  }));

  const unitStats = allUnits.map((u) => ({
    id: u.id,
    title: u.title,
    total: allLessons.filter((l) => l.unitId === u.id).length,
    published: allLessons.filter(
      (l) => l.unitId === u.id && l.status === "published"
    ).length,
    completed: completed.filter((p) => lessonUnit.get(p.lessonId) === u.id)
      .length,
  }));

  return {
    student: { id: student.id, name: student.name },
    points,
    badges,
    progress: progress.map((p) => ({
      lessonId: p.lessonId,
      title: lessonTitle.get(p.lessonId) ?? "درس",
      unitTitle:
        allUnits.find((u) => u.id === lessonUnit.get(p.lessonId))?.title ?? "",
      stage: p.stage,
      completed: p.completed,
    })),
    attempts: attempts.map((a) => ({
      id: a.id,
      scope: a.scope,
      title: a.title,
      score: a.score,
      total: a.total,
      createdAt: a.createdAt,
    })),
    units: unitStats,
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { name?: string };
    let studentId: number;
    if (body.name && body.name.trim()) {
      await renameStudent(body.name);
      studentId = await ensureStudent();
    } else {
      studentId = await ensureStudent();
    }
    const overview = await buildOverview(studentId);
    return Response.json(overview);
  } catch (e) {
    console.error(e);
    return Response.json({ error: "تعذر تحميل بيانات الطالب." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const studentId = await getStudentId();
    if (!studentId) {
      return Response.json({
        student: null,
        points: 0,
        badges: BADGES.map((b) => ({ ...b, earned: false })),
        progress: [],
        attempts: [],
        units: [],
      });
    }
    return Response.json(await buildOverview(studentId));
  } catch (e) {
    console.error(e);
    return Response.json({ error: "تعذر تحميل بيانات الطالب." }, { status: 500 });
  }
}
