import "dotenv/config";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { test, after, type TestContext } from "node:test";
import { and, asc, eq, like } from "drizzle-orm";
import { db, pool } from "../src/db";
import { lessonProgress, lessons, lessonExercises, practiceProgress, quizAttempts, quizQuestions, settings, students, teacherSolutions, units } from "../src/db/schema";
import { publishLessonWithAssessment } from "../src/db/publish-lesson";
import { validateLessonPublication, type LessonDraft } from "../src/lib/lesson-publication";
import type { OriginalAssessment } from "../src/lib/assessment";
import type { PracticeBank } from "../src/lib/practice-grading";

const source = JSON.parse(readFileSync("src/content/lesson-1.json", "utf8")) as LessonDraft;
const assessment = JSON.parse(readFileSync("src/content/assessments/natural-numbers.json", "utf8")) as OriginalAssessment;
const practice = JSON.parse(readFileSync("src/content/practice/natural-numbers.json", "utf8")) as PracticeBank;
const draft = (): LessonDraft => ({ ...structuredClone(source), sourcePage: 3 });
after(async () => { await pool.end(); });

// بيانات فحص معزولة ومعلّمة بوضوح؛ تُحذف هذه المعرّفات وحدها حتى إن فشل اختبار.
async function fixture(t: TestContext) {
  const suffix = randomUUID();
  const [unit] = await db.insert(units).values({ title: `qa-publication-unit-${suffix}`, order: 2000000000, description: "بيانات فحص مؤقتة" }).returning();
  let lessonId: number | undefined;
  let studentId: number | undefined;
  t.after(async () => {
    if (lessonId) await db.delete(settings).where(like(settings.key, `quiz_archive:${lessonId}:%`));
    if (studentId) await db.delete(students).where(eq(students.id, studentId));
    await db.delete(units).where(eq(units.id, unit.id));
  });
  const [lesson] = await db.insert(lessons).values({ unitId: unit.id, title: `qa-publication-draft-${suffix}`, order: 1, status: "pending" }).returning();
  lessonId = lesson.id;
  const [student] = await db.insert(students).values({ name: `qa-publication-student-${suffix}` }).returning();
  studentId = student.id;
  return { unitId: unit.id, lessonId, studentId };
}

async function snapshot(id: number) {
  return {
    lesson: await db.select().from(lessons).where(eq(lessons.id, id)),
    questions: await db.select().from(quizQuestions).where(eq(quizQuestions.lessonId, id)).orderBy(asc(quizQuestions.id)),
    solutions: await db.select().from(teacherSolutions).where(eq(teacherSolutions.lessonId, id)).orderBy(asc(teacherSolutions.id)),
    archives: await db.select().from(settings).where(like(settings.key, `quiz_archive:${id}:%`)).orderBy(asc(settings.key)),
    progress: await db.select().from(lessonProgress).where(eq(lessonProgress.lessonId, id)),
    activities: await db.select().from(lessonExercises).where(eq(lessonExercises.lessonId,id)).orderBy(asc(lessonExercises.key),asc(lessonExercises.version)),
    practice: await db.select().from(practiceProgress).where(eq(practiceProgress.lessonId,id)),
    attempts: await db.select().from(quizAttempts).where(eq(quizAttempts.lessonId, id)),
  };
}

test("publication readiness requires the final quiz in the same bundle", () => {
  assert.throws(() => validateLessonPublication(draft(), undefined), /دون اختبار نهاية جاهز/);
  assert.throws(() => validateLessonPublication(draft(), null), /دون اختبار نهاية جاهز/);
  assert.throws(() => validateLessonPublication(draft(), { ...assessment, questions: [] }), /دون اختبار نهاية جاهز/);
  assert.doesNotThrow(() => validateLessonPublication(draft(), assessment));
});

test("publication readiness requires completed learning stages and notebook", () => {
  const missingStage = draft(); missingStage.content.explain = [];
  assert.throws(() => validateLessonPublication(missingStage, assessment), /الشرح التفصيلي/);
  const missingNotebook = draft(); missingNotebook.notebook = [];
  assert.throws(() => validateLessonPublication(missingNotebook, assessment), /دفتر الطالب/);
});

test("publication readiness rejects missing questions, explanations and skill coverage", () => {
  const missingText = structuredClone(assessment); missingText.questions[0].question = " ";
  assert.throws(() => validateLessonPublication(draft(), missingText), /نص السؤال/);
  const missingExplanation = structuredClone(assessment); missingExplanation.questions[0].explanation = "";
  assert.throws(() => validateLessonPublication(draft(), missingExplanation), /التفسير/);
  const missingSkill = structuredClone(assessment); missingSkill.questions = missingSkill.questions.filter(q => q.skill !== "number-line");
  assert.throws(() => validateLessonPublication(draft(), missingSkill), /مهاراته/);
});

test("a missing assessment leaves the database draft entirely unchanged", async t => {
  const f = await fixture(t);
  const before = await snapshot(f.lessonId);
  await assert.rejects(publishLessonWithAssessment({ lessonId: f.lessonId, lesson: draft(), assessment: undefined as unknown as OriginalAssessment }), /دون اختبار نهاية جاهز/);
  assert.deepEqual(await snapshot(f.lessonId), before);
});

test("one publication makes the lesson, notebook, quiz and protected solutions available together", async t => {
  const f = await fixture(t);
  const result = await publishLessonWithAssessment({ lessonId: f.lessonId, lesson: draft(), assessment, practice });
  assert.deepEqual(result, { lessonId: f.lessonId, quizCount: 8, solutionCount: 7, practiceCount: 6 });
  const saved = await snapshot(f.lessonId);
  assert.equal(saved.lesson[0].status, "published");
  assert.deepEqual(saved.lesson[0].content, source.content);
  assert.deepEqual(saved.lesson[0].notebook, source.notebook);
  assert.equal(saved.questions.length, 8);
  assert.equal(saved.solutions.length, 7);
  assert.equal(saved.activities.filter(a => a.active).length, 6);
  assert.ok(saved.questions.every(q => q.scope === "lesson" && q.lessonId === f.lessonId && q.unitId === f.unitId));
  assert.deepEqual(saved.questions.map(q => q.question), assessment.questions.map(q => q.question));
  const unitQuizzes = await db.select().from(quizQuestions).where(and(eq(quizQuestions.unitId, f.unitId), eq(quizQuestions.scope, "unit")));
  assert.equal(unitQuizzes.length, 0);
});

test("republication preserves attempts and progress without duplicating the final quiz", async t => {
  const f = await fixture(t);
  await publishLessonWithAssessment({ lessonId: f.lessonId, lesson: draft(), assessment, practice });
  await db.insert(lessonProgress).values({ studentId: f.studentId, lessonId: f.lessonId, stage: 3, completedStages: [0, 1, 2, 3], completed: false });
  await db.insert(quizAttempts).values({ studentId: f.studentId, lessonId: f.lessonId, unitId: f.unitId, scope: "lesson", title: "qa-publication-attempt", score: 6, total: 8, answers: { version: "qa-existing", responses: {} } });
  const before = await snapshot(f.lessonId);
  await publishLessonWithAssessment({ lessonId: f.lessonId, lesson: draft(), assessment, practice });
  const afterState = await snapshot(f.lessonId);
  assert.deepEqual(afterState.progress, before.progress);
  assert.deepEqual(afterState.attempts, before.attempts);
  assert.deepEqual(afterState.questions, before.questions);
  assert.equal(afterState.solutions.length, 7);
  assert.deepEqual(afterState.activities, before.activities);
  assert.deepEqual(afterState.archives, before.archives);
});

test("an invalid replacement does not alter a previously published lesson or its quiz", async t => {
  const f = await fixture(t);
  await publishLessonWithAssessment({ lessonId: f.lessonId, lesson: draft(), assessment, practice });
  const before = await snapshot(f.lessonId);
  const changed = draft(); changed.title = "لا ينبغي نشر هذا التعديل";
  await assert.rejects(publishLessonWithAssessment({ lessonId: f.lessonId, lesson: changed, assessment: { ...assessment, questions: [] } }), /دون اختبار/);
  assert.deepEqual(await snapshot(f.lessonId), before);
});

test("a late consistency failure rolls back questions, solutions, archive and publication atomically", async t => {
  const f = await fixture(t);
  // محاكاة بيانات قديمة غير متسقة: صفّان يحملان ترتيب السؤال نفسه.
  await db.insert(quizQuestions).values([0, 1].map(i => ({
    lessonId: f.lessonId, unitId: f.unitId, scope: "lesson", type: "fill", question: `qa-legacy-question-${i}`, answer: "1", explanation: "qa-legacy-explanation", order: 1,
  })));
  const before = await snapshot(f.lessonId);
  // يقوم الناشر بتحديث/إدراج الأسئلة والحلول ثم يكشف العدد الزائد قبل حالة published.
  await assert.rejects(publishLessonWithAssessment({ lessonId: f.lessonId, lesson: draft(), assessment, practice }), /أُلغيت عملية النشر كاملة/);
  const afterState = await snapshot(f.lessonId);
  assert.deepEqual(afterState, before);
  assert.equal(afterState.lesson[0].status, "pending");
  assert.equal(afterState.questions.length, 2);
  assert.equal(afterState.solutions.length, 0);
  assert.equal(afterState.archives.length, 0);
});


test("a textbook exercise without an interactive bank cannot be published", async t => {
  const f = await fixture(t);
  const before = await snapshot(f.lessonId);
  await assert.rejects(publishLessonWithAssessment({ lessonId: f.lessonId, lesson: draft(), assessment }), /تحتاج إلى أنشطة تفاعلية/);
  assert.deepEqual(await snapshot(f.lessonId), before);
});

test("a revised practice retains old progress and retires only the changed definition", async t => {
  const f = await fixture(t);
  await publishLessonWithAssessment({ lessonId: f.lessonId, lesson: draft(), assessment, practice });
  const [original] = await db.select().from(lessonExercises).where(and(eq(lessonExercises.lessonId,f.lessonId),eq(lessonExercises.key,"count-five"),eq(lessonExercises.active,true)));
  await db.insert(practiceProgress).values({ studentId:f.studentId,lessonId:f.lessonId,exerciseKey:original.key,version:original.version,response:{group:"A"},attempts:1,solved:true });
  const changed = structuredClone(practice);
  changed.exercises[0].view.instruction += " راجع اختيارك بهدوء.";
  await publishLessonWithAssessment({ lessonId:f.lessonId,lesson:draft(),assessment,practice:changed });
  const state = await snapshot(f.lessonId);
  assert.equal(state.activities.length,7);
  assert.equal(state.activities.filter(a=>a.active).length,6);
  assert.equal(state.activities.find(a=>a.version===original.version)?.active,false);
  assert.equal(state.practice.length,1);
  assert.equal(state.practice[0].version,original.version);
  assert.equal(state.practice[0].solved,true);
});
