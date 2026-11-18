import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { validateLessonPublication, type LessonDraft } from "../src/lib/lesson-publication";
import type { OriginalAssessment } from "../src/lib/assessment";
const source = JSON.parse(readFileSync("src/content/lesson-1.json", "utf8")) as LessonDraft;
const assessment = JSON.parse(readFileSync("src/content/assessments/natural-numbers.json", "utf8")) as OriginalAssessment;
const draft = (): LessonDraft => ({ ...structuredClone(source), sourcePage: 3 });

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
