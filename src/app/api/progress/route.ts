import { db } from "@/db";
import { lessonProgress, lessons } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { ensureStudent } from "@/lib/student";

export const dynamic = "force-dynamic";

// حفظ تقدم الطالب داخل درس (آخر مرحلة + اكتماله)
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      lessonId?: number;
      stage?: number;
      completed?: boolean;
    };
    const lessonId = Number(body.lessonId);
    const stage = Math.max(0, Number(body.stage) || 0);
    const completed = !!body.completed;
    if (!Number.isInteger(lessonId)) {
      return Response.json({ error: "معرّف الدرس غير صالح." }, { status: 400 });
    }
    const lesson = await db
      .select({ id: lessons.id })
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1);
    if (!lesson[0]) {
      return Response.json({ error: "الدرس غير موجود." }, { status: 404 });
    }

    const studentId = await ensureStudent();
    const existing = await db
      .select()
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.studentId, studentId),
          eq(lessonProgress.lessonId, lessonId)
        )
      )
      .limit(1);

    if (existing[0]) {
      const prevStages = (existing[0].completedStages as number[]) ?? [];
      await db
        .update(lessonProgress)
        .set({
          stage,
          completedStages: Array.from(new Set([...prevStages, stage])),
          completed: existing[0].completed || completed,
          updatedAt: new Date(),
        })
        .where(eq(lessonProgress.id, existing[0].id));
    } else {
      await db.insert(lessonProgress).values({
        studentId,
        lessonId,
        stage,
        completedStages: [stage],
        completed,
      });
    }
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "تعذر حفظ التقدم." }, { status: 500 });
  }
}
