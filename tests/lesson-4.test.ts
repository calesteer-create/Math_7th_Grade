import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import lessonFour from "../src/content/lesson-4.json";
import assessmentFour from "../src/content/assessments/rational-numbers.json";
import practiceFour from "../src/content/practice/rational-numbers.json";
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
import {
  COMMON_DENOMINATOR_EXAMPLE,
  RATIONAL_ASCENDING_ORDER,
  RATIONAL_CHECK_SLOTS,
  RATIONAL_DESCENDING_ORDER,
  RATIONAL_FIGURE_KINDS,
  RATIONAL_FIGURE_SOURCES,
  RATIONAL_WARMUP_ROWS,
  betweenIntegers,
  compareFractions,
  compareRationalText,
  fractionFromText,
  lcmNumber,
  mixedNumberText,
  sortRationalTexts,
} from "../src/lib/rational-numbers";
import { STAGES } from "../src/lib/site";

const draft = lessonFour as unknown as LessonDraft;
const assessment = assessmentFour as unknown as OriginalAssessment;
const bank = practiceFour as unknown as PracticeBank;

test("Lesson 4 passes full publication, presentation, assessment, and practice validation", () => {
  assert.doesNotThrow(() => validateLessonPresentation(draft));
  assert.doesNotThrow(() => validateAssessmentPresentation(assessment));
  assert.doesNotThrow(() => validateLessonPublication(draft, assessment));
  assert.doesNotThrow(() => validateOriginalAssessment(draft, assessment));
  assert.doesNotThrow(() => validatePracticeBank(draft, bank));
});

test("Lesson 4 warmup table keeps every source option and the correct column is computed, not guessed", () => {
  assert.equal(RATIONAL_WARMUP_ROWS.length, 4);
  assert.deepEqual(RATIONAL_WARMUP_ROWS.map(row => row.value), ["7", "-4", "3.5", "4.25"]);
  for (const row of RATIONAL_WARMUP_ROWS) {
    const target = Number(row.value);
    for (const option of ["A", "B", "C"] as const) {
      const fraction = row.options[option];
      const value = fraction.numerator / fraction.denominator;
      assert.equal(value === target, row.answer === option, `السطر ${row.value}: العمود ${option}`);
    }
    const correct = row.options[row.answer];
    assert.equal(correct.numerator / correct.denominator, target);
  }
  // القيم الحرفية للكتابات كما في المصدر
  assert.deepEqual(RATIONAL_WARMUP_ROWS[0].options.C, { numerator: -14, denominator: -2 });
  assert.deepEqual(RATIONAL_WARMUP_ROWS[1].options.B, { numerator: -24, denominator: 6 });
  assert.deepEqual(RATIONAL_WARMUP_ROWS[2].options.A, { numerator: 7, denominator: 2 });
  assert.deepEqual(RATIONAL_WARMUP_ROWS[3].options.B, { numerator: 425, denominator: 100 });
});

test("Lesson 4 rational helpers compare and sort exactly, including negatives and fractions", () => {
  assert.equal(compareFractions({ numerator: -13, denominator: 15 }, { numerator: -19, denominator: 21 }), 1);
  assert.equal(compareFractions({ numerator: 5, denominator: 4 }, { numerator: 5, denominator: 4 }), 0);
  assert.equal(compareRationalText("-2", "-1.25"), -1);
  assert.equal(compareRationalText("-1/2", "0"), -1);
  assert.equal(compareRationalText("5/4", "2"), -1);
  assert.equal(compareRationalText("569/1458", "-645/1956"), 1);
  assert.equal(compareRationalText("12/32", "0.375"), 0);
  assert.deepEqual(sortRationalTexts(["-200", "+78", "-6.25", "+10", "+25.14"]), ["-200", "-6.25", "+10", "+25.14", "+78"]);
  assert.deepEqual(sortRationalTexts(["12/32", "-125/225", "-4/8", "2"], "desc"), ["2", "12/32", "-4/8", "-125/225"]);
  assert.deepEqual(RATIONAL_ASCENDING_ORDER, ["-200", "-6.25", "+10", "+25.14", "+78"]);
  assert.deepEqual(RATIONAL_DESCENDING_ORDER, ["2", "12/32", "-4/8", "-125/225"]);
});

test("Lesson 4 decimal, mixed-number and between-integers helpers are exact", () => {
  assert.deepEqual(fractionFromText("3.5"), { numerator: 7, denominator: 2 });
  assert.deepEqual(fractionFromText("4.25"), { numerator: 17, denominator: 4 });
  assert.deepEqual(fractionFromText("0.03"), { numerator: 3, denominator: 100 });
  assert.deepEqual(fractionFromText("-6.25"), { numerator: -25, denominator: 4 });
  assert.equal(fractionFromText("abc"), null);
  assert.equal(mixedNumberText({ numerator: 5, denominator: 4 }), "1\\frac{1}{4}");
  assert.equal(mixedNumberText({ numerator: -9, denominator: 4 }), "-2\\frac{1}{4}");
  assert.equal(mixedNumberText({ numerator: 8, denominator: 4 }), "2");
  assert.deepEqual(betweenIntegers(-2.25), { lower: -3, upper: -2 });
  assert.deepEqual(betweenIntegers(3), { lower: 3, upper: 3 });
  assert.equal(lcmNumber(15, 21), 105);
  assert.equal(COMMON_DENOMINATOR_EXAMPLE.commonDenominator, 105);
  assert.deepEqual(COMMON_DENOMINATOR_EXAMPLE.firstScaled, { numerator: -91, denominator: 105 });
  assert.deepEqual(COMMON_DENOMINATOR_EXAMPLE.secondScaled, { numerator: -95, denominator: 105 });
});

test("Lesson 4 check-line slots are sorted from left to right and match the six required letters", () => {
  assert.deepEqual(RATIONAL_CHECK_SLOTS.map(slot => slot.label), ["D", "G", "C", "F", "H", "E"]);
  for (let i = 1; i < RATIONAL_CHECK_SLOTS.length; i++) {
    assert.ok(RATIONAL_CHECK_SLOTS[i - 1].value < RATIONAL_CHECK_SLOTS[i].value);
  }
  assert.equal(RATIONAL_CHECK_SLOTS.find(slot => slot.label === "G")?.value, -2.25);
  assert.equal(RATIONAL_CHECK_SLOTS.find(slot => slot.label === "H")?.value, 2.25);
});

test("Lesson 4 textbook practice answers match the source data and every task grades correctly", () => {
  assert.equal(bank.exercises.length, 7);
  const byKey = Object.fromEntries(bank.exercises.map(exercise => [exercise.key, exercise]));

  assert.deepEqual(byKey["rat-warmup"].expected, {
    r1: RATIONAL_WARMUP_ROWS[0].answer,
    r2: RATIONAL_WARMUP_ROWS[1].answer,
    r3: RATIONAL_WARMUP_ROWS[2].answer,
    r4: RATIONAL_WARMUP_ROWS[3].answer,
  });
  assert.deepEqual(byKey["rat-represent"].expected, { n1: "-14", d1: "2", n2: "36", d2: "3" });
  assert.deepEqual(byKey["rat-decimal"].expected, { n1: "35", n2: "425", n3: "3" });
  assert.deepEqual(byKey["rat-line"].expected, { p1: "D", p2: "G", p3: "C", p4: "F", p5: "H", p6: "E" });
  assert.deepEqual(byKey["rat-compare"].expected, { c1: "<", c2: "<", c3: "<", c4: ">", c5: ">" });
  assert.deepEqual(byKey["rat-order-asc"].expected, { o1: "-200", o2: "-6.25", o3: "+10", o4: "+25.14", o5: "+78" });
  assert.deepEqual(byKey["rat-order-desc"].expected, { o1: "2", o2: "12/32", o3: "-4/8", o4: "-125/225" });

  for (const task of bank.exercises) {
    const response = validatePracticeResponse(task, task.expected);
    const result = gradePractice(task, response);
    assert.equal(result.correct, true, `المهمة ${task.key} يجب أن تُصحح صحيحة`);
    assert.ok(task.hints.length >= 2);
    assert.ok(task.solution.steps.length >= 3);
  }

  // إجابة خاطئة واحدة تُفشل المهمة وترشد إلى الخطوة، دون إفشال الحقول الصحيحة.
  const warmup = byKey["rat-warmup"];
  const wrong = gradePractice(warmup, validatePracticeResponse(warmup, { r1: "A", r2: "B", r3: "A", r4: "B" }));
  assert.equal(wrong.correct, false);
  assert.equal(wrong.fields.find(field => field.key === "r1")?.correct, false);
  assert.equal(wrong.fields.find(field => field.key === "r2")?.correct, true);

  // رفض الحقول الناقصة أو قيمة ليست من الخيارات.
  assert.throws(() => validatePracticeResponse(warmup, { r1: "A", r2: "B", r3: "A" }));
  assert.throws(() => validatePracticeResponse(warmup, { r1: "D", r2: "B", r3: "A", r4: "B" }));
  const zeroDenominator = gradePractice(byKey["rat-represent"], validatePracticeResponse(byKey["rat-represent"], { n1: "-14", d1: "2", n2: "36", d2: "0" }));
  assert.equal(zeroDenominator.correct, false);
  assert.equal(zeroDenominator.fields.find(field => field.key === "d2")?.correct, false);
});

test("Lesson 4 practice hides answers and solutions until a real attempt", () => {
  for (const task of bank.exercises) {
    const initial = publicPractice(task.key, bank.revision, task);
    assert.equal("expected" in initial, false);
    assert.equal(initial.solution, undefined);
    const attempted = publicPractice(task.key, bank.revision, task, {
      response: task.expected,
      attempts: 1,
      solved: true,
      hintsShown: 1,
      solutionViewed: true,
    });
    assert.ok(attempted.solution && attempted.solution.steps.length >= 3);
    assert.equal(attempted.state.solved, true);
    assert.ok(attempted.state.feedback?.correct);
  }
});

test("Lesson 4 assessment covers 5 skills with 2 original questions each and correct keys", () => {
  assert.equal(assessment.questions.length, 10);
  const skills = Object.keys(assessment.skills);
  assert.deepEqual(skills, ["rational-meaning", "rational-forms", "rational-line", "rational-compare", "rational-order"]);
  for (const skill of skills) {
    assert.equal(assessment.questions.filter(question => question.skill === skill).length, 2, `المهارة ${skill}`);
  }
  assert.deepEqual(new Set(assessment.questions.map(question => question.type)), new Set(["mcq", "truefalse", "fill", "problem"]));
  for (const question of assessment.questions) assert.equal(question.origin, "original");

  // مفاتيح الاختيار تشير إلى نص الخيار المقصود.
  assert.equal(assessment.questions[0].options?.[Number(assessment.questions[0].answer)], "\\(\\frac{3.5}{2}\\)");
  assert.equal(assessment.questions[4].options?.[Number(assessment.questions[4].answer)], "بين \\(-3\\) و\\(-2\\)");
  assert.equal(assessment.questions[7].options?.[Number(assessment.questions[7].answer)], "\\(-\\frac{9}{4}<-2\\)");
  assert.equal(assessment.questions[8].options?.[Number(assessment.questions[8].answer)], "\\(-2<-\\frac{2}{3}<0<\\frac{1}{2}<\\frac{5}{4}\\)");
});

test("Lesson 4 grading accepts equivalent fraction and decimal answers for the same value", () => {
  const forms = [
    { answer: "7/4", given: ["7/4", "14/8", "1.75"] },
    { answer: "-30", given: ["-30", "-٣٠"] },
    { answer: "-11/4", given: ["-11/4", "-2.75", "-٢.٧٥"] },
  ];
  for (const form of forms) {
    for (const given of form.given) assert.equal(isCorrect(form.answer, given, "problem"), true, `${form.answer} مقابل ${given}`);
  }
  assert.equal(isCorrect("7/4", "4/7", "problem"), false);
  assert.equal(isCorrect("-11/4", "-2.25", "problem"), false);
  assert.equal(isCorrect("true", "false", "truefalse"), false);
});

test("Lesson 4 uses 5 guided explain tabs, 4 notebook sheets, 4 indexed figures, and English digits", () => {
  const guide = draft.content.explain[0] as { kind: string; sections: unknown[] };
  assert.equal(guide.kind, "guide");
  assert.equal(guide.sections.length, 5);

  assert.equal(draft.notebook.length, 4);
  assert.equal(new Set(draft.notebook.map(sheet => sheet.id)).size, 4);
  assert.equal(STAGES.at(-1)?.key, "notebook");

  assert.equal(RATIONAL_FIGURE_KINDS.length, 4);
  for (const kind of RATIONAL_FIGURE_KINDS) {
    const source = RATIONAL_FIGURE_SOURCES[kind];
    assert.ok(source, `مصدر الشكل ${kind} مفقود`);
    assert.ok([13, 14].includes(source.page), `صفحة غير متوقعة للشكل ${kind}`);
    assert.ok(source.title.trim() && source.detail.trim());
  }

  const rawFiles = [
    readFileSync("src/content/lesson-4.json", "utf8"),
    readFileSync("src/content/assessments/rational-numbers.json", "utf8"),
    readFileSync("src/content/practice/rational-numbers.json", "utf8"),
  ];
  for (const text of rawFiles) {
    assert.equal(/[\u0660-\u0669\u06f0-\u06f9]/.test(text), false, "يجب اعتماد الأرقام الإنجليزية 0-9 في ملفات المحتوى");
  }
});
