import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { lessonExercises, lessons, practiceProgress } from "@/db/schema";
import { ensureStudent, getStudentId } from "@/lib/student";
import { gradePractice, publicPractice, validatePracticeResponse, type SavedPractice } from "@/lib/practice-grading";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };
const reply = (value: unknown, status = 200) => Response.json(value, { status, headers });
class PracticeError extends Error { constructor(message: string, public status = 400) { super(message); } }

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const raw = params.get("lesson") ?? "";
    const id = Number(raw);
    if (!/^\d+$/.test(raw) || !Number.isSafeInteger(id) || id < 1 || id > 2147483647) return reply({ error: "معرّف الدرس غير صالح." }, 400);
    const [lesson] = await db.select({ status: lessons.status }).from(lessons).where(eq(lessons.id, id)).limit(1);
    if (lesson?.status !== "published") return reply({ error: "الدرس غير متاح بعد." }, 404);
    const studentId = await getStudentId();
    const exercises = await db.select().from(lessonExercises).where(and(eq(lessonExercises.lessonId, id), eq(lessonExercises.active, true)));
    const progress = studentId ? await db.select().from(practiceProgress).where(and(eq(practiceProgress.lessonId, id), eq(practiceProgress.studentId, studentId))) : [];
    return reply({ exercises: exercises.sort((a, b) => a.definition.sourceOrder - b.definition.sourceOrder).map(exercise => {
      const saved = progress.find(p => p.exerciseKey === exercise.key && p.version === exercise.version);
      return publicPractice(exercise.key, exercise.version, exercise.definition, saved);
    }) });
  } catch (error) {
    console.error("Practice loading failed", error);
    return reply({ error: "تعذر تحميل الأنشطة. أعد المحاولة." }, 500);
  }
}

export async function POST(request: Request) {
  try {
    const text = await request.text();
    if (text.length > 16000) return reply({ error: "حجم الإجابة أكبر من المسموح." }, 413);
    const body = JSON.parse(text) as { lessonId?: unknown; exerciseKey?: unknown; version?: unknown; action?: unknown; response?: unknown };
    if (!body || typeof body.lessonId !== "number" || !Number.isSafeInteger(body.lessonId) || body.lessonId < 1 || body.lessonId > 2147483647
      || typeof body.exerciseKey !== "string" || !/^[a-z][a-z0-9-]{1,63}$/.test(body.exerciseKey)
      || typeof body.version !== "string" || body.version.length !== 36 || !["check", "hint", "solution"].includes(String(body.action))) {
      return reply({ error: "طلب نشاط غير صالح." }, 400);
    }
    const lessonId = body.lessonId;
    const key = body.exerciseKey;
    const studentId = await ensureStudent();
    const result = await db.transaction(async tx => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`practice:${studentId}:${lessonId}:${key}`}))`);
      const [lesson] = await tx.select({ status: lessons.status }).from(lessons).where(eq(lessons.id, lessonId)).limit(1);
      if (lesson?.status !== "published") throw new PracticeError("الدرس غير متاح بعد.", 404);
      const [exercise] = await tx.select().from(lessonExercises).where(and(eq(lessonExercises.lessonId, lessonId), eq(lessonExercises.key, key), eq(lessonExercises.active, true))).limit(1);
      if (!exercise) throw new PracticeError("النشاط غير موجود.", 404);
      if (exercise.version !== body.version) throw new PracticeError("تغيّر هذا النشاط. أعد تحميله للحصول على النسخة الجديدة.", 409);
      const identity = { studentId, lessonId, exerciseKey: key, version: exercise.version };
      const [previous] = await tx.select().from(practiceProgress).where(and(eq(practiceProgress.studentId, studentId), eq(practiceProgress.lessonId, lessonId), eq(practiceProgress.exerciseKey, key), eq(practiceProgress.version, exercise.version))).limit(1);
      const state: SavedPractice = previous ? { response: previous.response, attempts: previous.attempts, solved: previous.solved, hintsShown: previous.hintsShown, solutionViewed: previous.solutionViewed } : { response: {}, attempts: 0, solved: false, hintsShown: 0, solutionViewed: false };
      if (body.action === "check") {
        try { state.response = validatePracticeResponse(exercise.definition, body.response); }
        catch (error) { throw new PracticeError(error instanceof Error ? error.message : "أكمل الإجابات أولًا."); }
        const grade = gradePractice(exercise.definition, state.response);
        state.attempts += 1;
        state.solved = state.solved || grade.correct;
      } else if (body.action === "hint") {
        state.hintsShown = Math.min(state.hintsShown + 1, exercise.definition.hints.length);
      } else {
        if (state.attempts < 1) throw new PracticeError("جرّب حل جميع أجزاء المهمة أولًا، ثم نراجع الحل معًا.", 403);
        state.solutionViewed = true;
      }
      await tx.insert(practiceProgress).values({ ...identity, ...state, updatedAt: new Date() })
        .onConflictDoUpdate({ target: [practiceProgress.studentId, practiceProgress.lessonId, practiceProgress.exerciseKey, practiceProgress.version], set: { ...state, updatedAt: new Date() } });
      return publicPractice(key, exercise.version, exercise.definition, state);
    });
    return reply({ exercise: result });
  } catch (error) {
    if (error instanceof PracticeError) return reply({ error: error.message }, error.status);
    if (error instanceof SyntaxError) return reply({ error: "صيغة الطلب غير صالحة." }, 400);
    console.error("Practice action failed", error);
    return reply({ error: "تعذر حفظ المحاولة. لم نغيّر نتيجتك السابقة؛ أعد المحاولة." }, 500);
  }
}
