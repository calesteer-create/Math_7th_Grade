import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  ALGEBRA_FIGURE_KINDS,
  ALGEBRA_FIGURE_SOURCES,
  ENVELOPE_SHAPES,
  areLikeTerms,
  combineLikeTerms,
  distributeScalar,
  eqFrac,
  evaluateLinear,
  frac,
  fracToPlain,
  fracToTeX,
  linearToTeX,
  simplifyDistributed,
  trianglePerimeter,
} from "../src/lib/algebraic-expressions";
import { isCorrect, validateOriginalAssessment, type OriginalAssessment } from "../src/lib/assessment";
import { validateAssessmentPresentation, validateLessonPresentation } from "../src/lib/lesson-presentation";
import { validateLessonPublication, type LessonDraft } from "../src/lib/lesson-publication";
import {
  gradePractice,
  publicPractice,
  validatePracticeBank,
  validatePracticeResponse,
  type PracticeBank,
} from "../src/lib/practice-grading";

const lesson = JSON.parse(readFileSync("src/content/lesson-7.json", "utf8")) as LessonDraft & {
  lessonId: number;
  notebook: { id: string; title: string; subtitle: string; blocks: { kind: string }[] }[];
};
const assessment = JSON.parse(readFileSync("src/content/assessments/algebraic-expressions.json", "utf8")) as OriginalAssessment & {
  lessonId: number;
};
const practice = JSON.parse(readFileSync("src/content/practice/algebraic-expressions.json", "utf8")) as PracticeBank & {
  lessonId: number;
};

test("Lesson 7 passes full publication, presentation, assessment, and practice validation", () => {
  assert.doesNotThrow(() => validateLessonPresentation(lesson));
  assert.doesNotThrow(() => validateAssessmentPresentation(assessment));
  assert.doesNotThrow(() => validateLessonPublication(lesson, assessment));
  assert.doesNotThrow(() => validateOriginalAssessment(lesson, assessment));
  assert.doesNotThrow(() => validatePracticeBank(lesson, practice));
  assert.equal(lesson.lessonId, 7);
  assert.equal(assessment.lessonId, 7);
  assert.equal(practice.lessonId, 7);
});

test("Lesson 7 exact BigInt algebraic helpers evaluate, combine, distribute, and simplify accurately", () => {
  assert.equal(fracToPlain(frac(6, -8)), "-3/4");
  assert.equal(fracToTeX(frac(-6, 8)), "-\\frac{3}{4}");
  assert.throws(() => frac(1, 0), /صفر/);

  // Evaluating textbook expressions
  assert.equal(eqFrac(evaluateLinear(frac(2), frac(3), frac(50)), frac(103)), true);
  assert.equal(eqFrac(evaluateLinear(frac(50), frac(0), frac(3)), frac(150)), true);
  assert.equal(eqFrac(evaluateLinear(frac(50), frac(0), frac(6)), frac(300)), true);
  assert.equal(eqFrac(evaluateLinear(frac(1, 3), frac(5), frac(240)), frac(85)), true);

  // Like terms & combining (exact with fractions)
  assert.equal(areLikeTerms("x", "x"), true);
  assert.equal(areLikeTerms("x", "y"), false);
  const combined = combineLikeTerms([
    { coef: frac(1, 2), variable: "x" },
    { coef: frac(-1, 4), variable: "x" },
    { coef: frac(4), variable: "" },
    { coef: frac(1), variable: "" },
  ]);
  assert.equal(eqFrac(combined.x, frac(1, 4)), true);
  assert.equal(eqFrac(combined[""], frac(5)), true);

  // Distributing & simplifying textbook examples
  const d1 = distributeScalar(frac(-18), frac(-2), frac(7));
  assert.equal(linearToTeX(d1.a, d1.b), "36x - 126");

  // 3(2x - 12) + 8x = 14x - 36
  const s1 = simplifyDistributed(frac(3), frac(2), frac(-12), frac(8), frac(0));
  assert.equal(linearToTeX(s1.a, s1.b), "14x - 36");

  // 5(3x - 2) + 2(x + 1) = 17x - 8
  const p1 = distributeScalar(frac(5), frac(3), frac(-2));
  const p2 = distributeScalar(frac(2), frac(1), frac(1));
  assert.equal(linearToTeX(frac(p1.a.num + p2.a.num), frac(p1.b.num + p2.b.num)), "17x - 8");

  // Triangle perimeter x, 8, 2x + 1
  const tri = trianglePerimeter(3);
  assert.deepEqual(tri.sides, [3, 8, 7]);
  assert.equal(tri.perimeter, 18);
  assert.equal(tri.validTriangle, true);
  assert.equal(trianglePerimeter(1).validTriangle, false);
});

test("Lesson 7 textbook practice tasks grade exact answers and catch errors across all 8 tasks", () => {
  assert.equal(practice.exercises.length, 8);
  for (const task of practice.exercises) {
    const ok = gradePractice(task, validatePracticeResponse(task, task.expected));
    assert.equal(ok.correct, true, `${task.key} should accept documented expected answers`);
    assert.ok(ok.fields.every(field => field.correct), task.key);

    const first = task.view.fields[0];
    const wrongVal = first.type === "choice"
      ? (first.choices ?? []).find(choice => choice !== task.expected[first.key])!
      : String(Number(task.expected[first.key]) + 7);
    const bad = gradePractice(task, validatePracticeResponse(task, { ...task.expected, [first.key]: wrongVal }));
    assert.equal(bad.correct, false, `${task.key} should reject wrong answer`);
    assert.equal(bad.fields[0].correct, false, task.key);
    assert.ok(bad.fields[0].message.length > 5, `${task.key} should provide error feedback`);
  }

  // Arabic digits normalization on numeric practice fields
  const warmup = practice.exercises.find(e => e.key === "alg-warmup-table")!;
  assert.equal(
    gradePractice(warmup, validatePracticeResponse(warmup, { ...warmup.expected, g1: "١٥٠", g2: "٣٠٠" })).correct,
    true,
  );
  // Reject non-numeric / empty input
  const triTask = practice.exercises.find(e => e.key === "alg-train-triangle")!;
  assert.throws(() => validatePracticeResponse(triTask, { expr: "\\(3x + 9\\)", perim: "18abc" }));
  assert.throws(() => validatePracticeResponse(triTask, { expr: "\\(3x + 9\\)", perim: "" }));
});

test("Lesson 7 practice tasks enforce progressive hints and attempt-gated coaching solutions", () => {
  for (const task of practice.exercises) {
    assert.ok(task.hints.length >= 2, `${task.key} needs >= 2 hints`);
    const initial = publicPractice(task.key, practice.revision, task);
    assert.equal("expected" in initial, false);
    assert.equal(initial.solution, undefined);

    const hinted = publicPractice(task.key, practice.revision, task, {
      response: {},
      attempts: 0,
      solved: false,
      hintsShown: 1,
      solutionViewed: false,
    });
    assert.equal(hinted.solution, undefined);
    assert.equal(hinted.state.hints.length, 1);

    const afterAttempt = publicPractice(task.key, practice.revision, task, {
      response: {},
      attempts: 1,
      solved: false,
      hintsShown: 1,
      solutionViewed: true,
    });
    assert.ok(afterAttempt.solution && afterAttempt.solution.steps.length >= 3);
  }
});

test("Lesson 7 original assessment covers all 5 skills with 10 verified questions and varied MCQ keys", () => {
  assert.equal(assessment.questions.length, 10);
  const skillCounts = new Map<string, number>();
  const mcqKeys = new Set<number>();
  for (const q of assessment.questions) {
    assert.equal(q.origin, "original");
    skillCounts.set(q.skill, (skillCounts.get(q.skill) ?? 0) + 1);
    if (q.type === "mcq") mcqKeys.add(Number(q.answer));
    assert.equal(isCorrect(q.answer, q.answer, q.type), true, `Question answer should grade correct`);
  }
  assert.equal(skillCounts.size, 5);
  for (const [skill, count] of skillCounts) {
    assert.equal(count, 2, `Skill ${skill} should have 2 questions`);
  }
  assert.ok(mcqKeys.size >= 3, "MCQ correct option positions must be varied");
});

test("Lesson 7 uses 7 stages, 6 explain tabs, 4 writing-only notebook sheets, indexed figures, and clean citations", () => {
  assert.deepEqual(Object.keys(lesson.content).sort(), ["apply", "check", "discover", "explain", "intro", "lab", "summary"]);
  const guide = lesson.content.explain.find((block: { kind: string }) => block.kind === "guide") as { sections: unknown[] };
  assert.equal(guide.sections.length, 6);
  assert.equal(lesson.notebook.length, 4);
  for (const sheet of lesson.notebook) {
    for (const block of sheet.blocks) {
      assert.ok(block.kind !== "exercise" && block.kind !== "algebraStudio", `No interactive widgets in notebook: ${block.kind}`);
    }
  }
  assert.equal(ENVELOPE_SHAPES.length, 4);
  for (const kind of ALGEBRA_FIGURE_KINDS) {
    assert.ok(ALGEBRA_FIGURE_SOURCES[kind].page >= 28 && ALGEBRA_FIGURE_SOURCES[kind].page <= 35);
  }
  for (const block of [...lesson.content.intro, ...lesson.content.discover, ...lesson.content.explain, ...lesson.content.summary]) {
    const json = JSON.stringify(block);
    assert.doesNotMatch(json, /صفحة\s*\d+|ص\s*\d+/, "No raw page citations in lesson prose");
  }
});
