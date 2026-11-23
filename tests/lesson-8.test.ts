import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { eqFrac, frac } from "../src/lib/algebraic-expressions";
import {
  EQUATIONS_FIGURE_KINDS,
  EQUATIONS_FIGURE_SOURCES,
  WARMUP_TABLE_ROWS,
  checkLinearSolution,
  exactTerminatingDecimal,
  formatSolutionTeX,
  solveAdditive,
  solveDivisive,
  solveLinearEquation,
  solveMultiplicative,
} from "../src/lib/solving-equations";
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

const lesson = JSON.parse(readFileSync("src/content/lesson-8.json", "utf8")) as LessonDraft & {
  lessonId: number;
  notebook: { id: string; title: string; subtitle: string; blocks: { kind: string }[] }[];
};
const assessment = JSON.parse(readFileSync("src/content/assessments/solving-equations.json", "utf8")) as OriginalAssessment & {
  lessonId: number;
};
const practice = JSON.parse(readFileSync("src/content/practice/solving-equations.json", "utf8")) as PracticeBank & {
  lessonId: number;
};

test("Lesson 8 passes full publication, presentation, assessment, and practice validation", () => {
  assert.doesNotThrow(() => validateLessonPresentation(lesson));
  assert.doesNotThrow(() => validateAssessmentPresentation(assessment));
  assert.doesNotThrow(() => validateLessonPublication(lesson, assessment));
  assert.doesNotThrow(() => validateOriginalAssessment(lesson, assessment));
  assert.doesNotThrow(() => validatePracticeBank(lesson, practice));
  assert.equal(lesson.lessonId, 8);
  assert.equal(assessment.lessonId, 8);
  assert.equal(practice.lessonId, 8);
});

test("Lesson 8 exact BigInt equation solvers handle unique, fractional, and a = 0 edge cases accurately", () => {
  // Verification: 2x - 5 = 1 at x = 3 (true) and x = 4 (false)
  const v1 = checkLinearSolution(frac(2), frac(-5), frac(1), frac(3));
  assert.equal(v1.isSolution, true);
  assert.equal(eqFrac(v1.lhs, frac(1)), true);
  const v2 = checkLinearSolution(frac(2), frac(-5), frac(1), frac(4));
  assert.equal(v2.isSolution, false);

  // Additive & divisive solvers
  assert.equal(eqFrac(solveAdditive(frac(11), frac(-12)), frac(-23)), true);
  assert.equal(eqFrac(solveAdditive(frac(-13), frac(7)), frac(20)), true);
  assert.equal(eqFrac(solveDivisive(frac(-8), frac(-20)), frac(160)), true);
  assert.throws(() => solveDivisive(frac(0), frac(5)), /صفر/);

  // Textbook p. 37 exercise equations: 4x=32, 3x=-15, 2x=-3, -4x=-10, 14x=-2
  const cases: [number, number, [number, number]][] = [
    [4, 32, [8, 1]],
    [3, -15, [-5, 1]],
    [2, -3, [-3, 2]],
    [-4, -10, [5, 2]],
    [14, -2, [-1, 7]],
  ];
  for (const [a, c, [rn, rd]] of cases) {
    const sol = solveMultiplicative(frac(a), frac(c));
    assert.equal(sol.status, "unique");
    assert.equal(eqFrac(sol.value, frac(rn, rd)), true, `${a}x = ${c}`);
  }

  // Exact terminating vs non-terminating decimal detection
  assert.equal(exactTerminatingDecimal(frac(-3, 2)), "-1.5");
  assert.equal(exactTerminatingDecimal(frac(5, 2)), "2.5");
  assert.equal(exactTerminatingDecimal(frac(-1, 7)), null);
  assert.equal(formatSolutionTeX(frac(-3, 2)), "-\\frac{3}{2} = -1.5");
  assert.equal(formatSolutionTeX(frac(-1, 7)), "-\\frac{1}{7}");

  // Edge cases when a = 0
  const noSol = solveMultiplicative(frac(0), frac(7));
  assert.equal(noSol.status, "none");
  const infSol = solveMultiplicative(frac(0), frac(0));
  assert.equal(infSol.status, "infinite");

  // Full linear ax + b = c (e.g. Unit 2 Ex 10: 2x - 3 = -15 => x = -6)
  const lin = solveLinearEquation(frac(2), frac(-3), frac(-15));
  assert.equal(lin.status, "unique");
  assert.equal(eqFrac(lin.value, frac(-6)), true);
});

test("Lesson 8 warmup table rows match computed mathematical answers", () => {
  assert.equal(WARMUP_TABLE_ROWS.length, 5);
  assert.equal(10 + 8 * 2, 26);
  assert.equal(WARMUP_TABLE_ROWS[0].options[WARMUP_TABLE_ROWS[0].correct], "26");
  assert.equal(7 * 6 + 4 / 2, 44);
  assert.equal(WARMUP_TABLE_ROWS[1].options[WARMUP_TABLE_ROWS[1].correct], "44");
  assert.equal(3 * (7 + 5) - 38, -2);
  assert.equal(WARMUP_TABLE_ROWS[2].options[WARMUP_TABLE_ROWS[2].correct], "-2");
  assert.equal(120 / 10, 12);
  assert.equal(WARMUP_TABLE_ROWS[3].options[WARMUP_TABLE_ROWS[3].correct], "+10");
  assert.equal(WARMUP_TABLE_ROWS[4].options[WARMUP_TABLE_ROWS[4].correct], "2x + 7");
});

test("Lesson 8 textbook practice tasks accept exact equivalents and reject approximations", () => {
  assert.equal(practice.exercises.length, 6);
  for (const task of practice.exercises) {
    const ok = gradePractice(task, validatePracticeResponse(task, task.expected));
    assert.equal(ok.correct, true, `${task.key} should accept documented answers`);
    assert.ok(ok.fields.every(field => field.correct), task.key);

    const first = task.view.fields[0];
    const wrongVal = first.type === "choice"
      ? (first.choices ?? []).find(choice => choice !== task.expected[first.key])!
      : String(Number(task.expected[first.key]) + 7);
    const bad = gradePractice(task, validatePracticeResponse(task, { ...task.expected, [first.key]: wrongVal }));
    assert.equal(bad.correct, false, `${task.key} should reject wrong answer`);
    assert.equal(bad.fields[0].correct, false, task.key);
    assert.ok(bad.fields[0].message.length > 5);
  }

  // Exact signed-integer normalization & choice verification in eq-train-axc (7x=63, -5x=15, (2/5)x=-5, 3x=-9, -2x=-5)
  const axc = practice.exercises.find(e => e.key === "eq-train-axc")!;
  assert.equal(
    gradePractice(axc, validatePracticeResponse(axc, { e1: "+9", e2: "-03", e3: "\\(-\\frac{25}{2}\\)", e4: "-3", e5: "\\(\\frac{5}{2}\\)" })).correct,
    true,
    "Canonical signed integers & exact fraction choices must be accepted",
  );
  // Exact rational comparison in assessment grader: accepts exact equivalents, rejects approximations and division by zero
  assert.equal(isCorrect("-25/2", "-12.5", "fill"), true);
  assert.equal(isCorrect("5/2", "2.5", "fill"), true);
  assert.equal(isCorrect("-1/7", "-2/14", "fill"), true);
  assert.equal(isCorrect("-1/7", "-0.14", "fill"), false, "Decimal approximation -0.14 for -1/7 must be rejected");
  assert.equal(isCorrect("-1/7", "-0.143", "fill"), false, "Decimal approximation -0.143 for -1/7 must be rejected");
  assert.equal(isCorrect("1/0", "1/0", "fill"), false, "Undefined division by zero must be rejected");
});

test("Lesson 8 practice tasks enforce progressive hints and attempt-gated coaching solutions", () => {
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

test("Lesson 8 original assessment covers all 5 skills with 10 verified questions and varied MCQ keys", () => {
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

test("Lesson 8 uses 7 stages, 6 explain tabs, 4 writing-only notebook sheets, indexed figures, and clean citations", () => {
  assert.deepEqual(Object.keys(lesson.content).sort(), ["apply", "check", "discover", "explain", "intro", "lab", "summary"]);
  const guide = lesson.content.explain.find((block: { kind: string }) => block.kind === "guide") as { sections: unknown[] };
  assert.equal(guide.sections.length, 6);
  assert.equal(lesson.notebook.length, 4);
  for (const sheet of lesson.notebook) {
    for (const block of sheet.blocks) {
      assert.ok(block.kind !== "exercise" && block.kind !== "equationsStudio", `No interactive widgets in notebook: ${block.kind}`);
    }
  }
  for (const kind of EQUATIONS_FIGURE_KINDS) {
    assert.ok(EQUATIONS_FIGURE_SOURCES[kind].page >= 36 && EQUATIONS_FIGURE_SOURCES[kind].page <= 37);
  }
  for (const block of [...lesson.content.intro, ...lesson.content.discover, ...lesson.content.explain, ...lesson.content.summary]) {
    const json = JSON.stringify(block);
    assert.doesNotMatch(json, /صفحة\s*\d+|ص\s*\d+/, "No raw page citations in lesson prose");
  }
});
