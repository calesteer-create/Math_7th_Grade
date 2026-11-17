import { createHash } from "node:crypto";
import { db } from "@/db";
import { lessons, quizAttempts, quizQuestions, units, type QuizQuestion } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { ensureStudent } from "@/lib/student";
import { displayAnswer, isCorrect } from "@/lib/assessment";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };
type Scope = "lesson" | "unit";
const json = (data: unknown, status = 200) => Response.json(data, { status, headers });

function publicQuestion(q: QuizQuestion) {
  return { id: q.id, type: q.type, question: q.question, options: (q.options as string[] | null) ?? null, difficulty: q.difficulty };
}
// لا تدخل مفاتيح الإجابة في بصمة النسخة؛ البصمة مبنية على بيانات الأسئلة العامة وإصدار المصدر فقط.
function versionOf(questions: QuizQuestion[]) {
  return createHash("sha256").update(JSON.stringify(questions.map(q => ({ ...publicQuestion(q), source: q.source })))).digest("hex");
}

async function loadQuestions(scope: Scope, id: number) {
  if (scope === "lesson") {
    const [lesson] = await db.select({ status: lessons.status }).from(lessons).where(eq(lessons.id, id)).limit(1);
    if (lesson?.status !== "published") return [];
  }
  return db.select().from(quizQuestions)
    .where(and(eq(quizQuestions.scope, scope), scope === "lesson" ? eq(quizQuestions.lessonId, id) : eq(quizQuestions.unitId, id)))
    .orderBy(asc(quizQuestions.order), asc(quizQuestions.id));
}

export async function GET(req: Request) {
  try {
    const params = new URL(req.url).searchParams;
    if (params.has("lesson") === params.has("unit")) return json({ error: "اختر اختبار درس أو وحدة واحدة." }, 400);
    const scope: Scope = params.has("lesson") ? "lesson" : "unit";
    const raw = params.get(scope) ?? "";
    const id = Number(raw);
    if (!/^\d+$/.test(raw) || !Number.isSafeInteger(id) || id <= 0) return json({ error: "معرّف الاختبار غير صالح." }, 400);
    const questions = await loadQuestions(scope, id);
    return json({ version: versionOf(questions), questions: questions.map(publicQuestion) });
  } catch (error) {
    console.error("Quiz loading failed", error);
    return json({ error: "تعذر تحميل الاختبار. أعد المحاولة." }, 500);
  }
}

export async function POST(req: Request) {
  try {
    if (Number(req.headers.get("content-length")) > 32768) return json({ error: "حجم الطلب كبير جدًا." }, 413);
    const body = await req.json().catch(() => null) as { scope?: unknown; id?: unknown; version?: unknown; answers?: unknown } | null;
    if (!body || (body.scope !== "lesson" && body.scope !== "unit") || typeof body.id !== "number" || !Number.isSafeInteger(body.id) || body.id <= 0) {
      return json({ error: "طلب اختبار غير صالح." }, 400);
    }
    const scope = body.scope;
    const id = body.id;
    const questions = await loadQuestions(scope, id);
    if (!questions.length) return json({ error: "لا يوجد اختبار متاح بعد." }, 404);
    const version = versionOf(questions);
    if (body.version !== version) return json({ error: "تم تحديث أسئلة الاختبار. حمّل النسخة الجديدة قبل الإجابة.", code: "STALE_QUIZ" }, 409);
    if (!body.answers || typeof body.answers !== "object" || Array.isArray(body.answers)) return json({ error: "الإجابات غير صالحة." }, 400);
    const answers = body.answers as Record<string, unknown>;
    const complete = Object.keys(answers).length === questions.length && questions.every(q => {
      const answer = answers[q.id];
      if (typeof answer !== "string" || !answer.trim() || answer.length > 160) return false;
      if (q.type === "mcq") return /^\d+$/.test(answer) && Array.isArray(q.options) && Number(answer) < q.options.length;
      if (q.type === "truefalse") return answer === "true" || answer === "false";
      return true;
    });
    if (!complete) return json({ error: "أجب عن جميع الأسئلة بإجابات صالحة قبل تسليم الاختبار." }, 400);

    const results = questions.map(q => ({
      id: q.id,
      correct: isCorrect(q.answer, answers[q.id] as string, q.type),
      answer: displayAnswer(q),
      explanation: q.explanation,
    }));
    const score = results.filter(r => r.correct).length;
    let title = "اختبار";
    if (scope === "lesson") {
      const [lesson] = await db.select({ title: lessons.title }).from(lessons).where(eq(lessons.id, id)).limit(1);
      title = `اختبار درس: ${lesson?.title ?? ""}`;
    } else {
      const [unit] = await db.select({ title: units.title }).from(units).where(eq(units.id, id)).limit(1);
      title = `اختبار الوحدة: ${unit?.title ?? ""}`;
    }
    const studentId = await ensureStudent();
    await db.insert(quizAttempts).values({
      studentId, lessonId: scope === "lesson" ? id : null, unitId: scope === "unit" ? id : null,
      scope, title, score, total: questions.length,
      // لقطة خاصة بهذه المحاولة كي يبقى معناها محفوظًا عند تحديث الاختبار مستقبلًا.
      answers: { version, responses: answers, questions: questions.map(publicQuestion), results },
    });
    return json({ score, total: questions.length, results });
  } catch (error) {
    console.error("Quiz grading failed", error);
    return json({ error: "تعذر حفظ النتيجة. أعد المحاولة." }, 500);
  }
}
