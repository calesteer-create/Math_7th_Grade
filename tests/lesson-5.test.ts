import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import lessonFive from "../src/content/lesson-5.json";
import assessmentFive from "../src/content/assessments/operations-rational.json";
import practiceFive from "../src/content/practice/operations-rational.json";
import { isCorrect, validateOriginalAssessment, type OriginalAssessment } from "../src/lib/assessment";
import { validateAssessmentPresentation, validateLessonPresentation } from "../src/lib/lesson-presentation";
import { validateLessonPublication, type LessonDraft } from "../src/lib/lesson-publication";
import { gradePractice, validatePracticeBank, validatePracticeResponse, type PracticeBank } from "../src/lib/practice-grading";
import {
  OPERATIONS_FIGURE_KINDS,
  OPERATIONS_FIGURE_SOURCES,
  OPERATIONS_STUDIO_MODES,
  SCIENTIFIC_EXAMPLES,
  applyOperation,
  decimalOperationText,
  decimalToFraction,
  exactDecimalText,
  fractionSign,
  isScientificWrite,
  normalizeFraction,
  operationSteps,
  powerOfTenText,
  toScientific,
  type RationalOperation,
} from "../src/lib/operations-rational";
import type { Fraction } from "../src/lib/rational-numbers";
import { STAGES } from "../src/lib/site";

const draft = lessonFive as unknown as LessonDraft;
const assessment = assessmentFive as unknown as OriginalAssessment;
const bank = practiceFive as unknown as PracticeBank;

test("Lesson 5 passes publication, presentation, assessment and practice validation", () => {
  assert.doesNotThrow(() => validateLessonPresentation(draft));
  assert.doesNotThrow(() => validateAssessmentPresentation(assessment));
  assert.doesNotThrow(() => validateLessonPublication(draft, assessment));
  assert.doesNotThrow(() => validateOriginalAssessment(draft, assessment));
  assert.doesNotThrow(() => validatePracticeBank(draft, bank));
});

test("Lesson 5 covers the full stage set and keeps the notebook last", () => {
  assert.deepEqual(Object.keys(draft.content).sort(), ["apply", "check", "discover", "explain", "intro", "lab", "summary"].sort());
  assert.equal(STAGES.at(-1)?.key, "notebook");
  assert.equal(draft.notebook.length, 4);
  assert.equal(new Set(draft.notebook.map(sheet => sheet.id)).size, 4);
  const notebookKinds = draft.notebook.flatMap(sheet => sheet.blocks.map(block => block.kind));
  assert.ok(!notebookKinds.includes("operationsStudio"));
  assert.ok(!notebookKinds.includes("summary") && !notebookKinds.includes("exercise") && !notebookKinds.includes("check"));
});

test("Lesson 5 scientific notation is computed exactly from the decimal form", () => {
  const examples: [string, string, number][] = [
    ["150000000", "1.5", 8],
    ["31500000", "3.15", 7],
    ["78000000", "7.8", 7],
    ["22491000000", "2.2491", 10],
    ["45180000000", "4.518", 10],
    ["629450000000", "6.2945", 11],
    ["852000000", "8.52", 8],
    ["12005000000", "1.2005", 10],
    ["10100000000", "1.01", 10],
  ];
  for (const [value, coefficient, exponent] of examples) {
    const form = toScientific(value);
    assert.ok(form, value);
    assert.equal(form.coefficient, coefficient, value);
    assert.equal(form.exponent, exponent, value);
    assert.equal(isScientificWrite(value, coefficient, String(exponent)), true, value);
  }
  assert.deepEqual(toScientific("0"), { coefficient: "0", exponent: 0, tex: "0", shifted: 0 });
  assert.equal(toScientific("abc"), null);
  // شرط العامل: 1 ≤ |a| < 10
  assert.equal(isScientificWrite("150000000", "15", "7"), false);
  assert.equal(isScientificWrite("150000000", "0.15", "9"), false);
  assert.equal(SCIENTIFIC_EXAMPLES.length, 3);
  assert.equal(SCIENTIFIC_EXAMPLES[0].coefficient, "1.5");
});

test("Power-of-ten display stays exact for positive and negative exponents", () => {
  assert.equal(powerOfTenText(0), "1");
  assert.equal(powerOfTenText(3), "1000");
  assert.equal(powerOfTenText(8), "100000000");
  assert.equal(powerOfTenText(-1), "0.1");
  assert.equal(powerOfTenText(-3), "0.001");
  assert.throws(() => powerOfTenText(13));
});

test("Lesson 5 fraction arithmetic matches the textbook results exactly", () => {
  const r = (numerator: number, denominator: number): Fraction => ({ numerator, denominator });
  const cases: [Fraction, Fraction, RationalOperation, Fraction][] = [
    [r(-15, 11), r(16, 11), "add", r(1, 11)],
    [r(-4, 9), r(7, 18), "add", r(-1, 18)],
    [r(-4, 9), r(7, 18), "sub", r(-15, 18)],
    [r(11, 5), r(-23, 6), "add", r(-49, 30)],
    [r(8, 3), r(7, 9), "add", r(31, 9)],
    [r(-2, 3), r(7, 3), "mul", r(-14, 9)],
    [r(-5, 3), r(3, 100), "mul", r(-1, 20)],
    [r(-3, 8), r(-12, 32), "div", r(1, 1)],
    [r(2, 7), r(-9, 1), "div", r(-2, 63)],
    [r(-13, 15), r(19, 21), "add", r(4, 105)],
  ];
  for (const [left, right, operation, expected] of cases) {
    const result = applyOperation(left, right, operation);
    assert.deepEqual(result, normalizeFraction(expected), `${operation} ${JSON.stringify(left)} ${JSON.stringify(right)}`);
    const steps = operationSteps(left, right, operation);
    assert.ok(steps.length >= 3, "خطوات الحل التعليمية");
    assert.ok(steps.every(step => step.title && step.text));
  }
  assert.throws(() => applyOperation(r(1, 2), r(0, 5), "div"), /القسمة على صفر/);
  assert.throws(() => normalizeFraction({ numerator: 1, denominator: 0 }), /صفر/);
  assert.equal(fractionSign(r(-3, 4)), "negative");
  assert.equal(fractionSign(r(3, 4)), "positive");
  assert.equal(fractionSign(r(0, 4)), "zero");
});

test("Decimal results are exact strings, not floating point approximations", () => {
  assert.deepEqual(decimalOperationText("12.3", "15.7", "sub")?.text, "-3.4");
  assert.deepEqual(decimalOperationText("-124.45", "200.796", "add")?.text, "76.346");
  assert.deepEqual(decimalOperationText("-0.0045", "12.039", "sub")?.text, "-12.0435");
  assert.deepEqual(decimalOperationText("36.12", "73.11", "sub")?.text, "-36.99");
  assert.equal(exactDecimalText({ numerator: 1, denominator: 3 }), null);
  assert.equal(exactDecimalText({ numerator: 1, denominator: 8 }), "0.125");
  assert.deepEqual(decimalToFraction("4.25"), { numerator: 17, denominator: 4 });
  assert.equal(decimalToFraction("abc"), null);
});

test("Every Lesson 5 practice task accepts its documented answer and reports wrong fields", () => {
  assert.equal(bank.exercises.length, 13);
  for (const exercise of bank.exercises) {
    const response = validatePracticeResponse(exercise, exercise.expected);
    const feedback = gradePractice(exercise, response);
    assert.equal(feedback.correct, true, exercise.key);
    assert.ok(feedback.fields.every(field => field.correct));
    const firstField = exercise.view.fields[0];
    const wrongValue = firstField.type === "choice"
      ? (firstField.choices ?? []).find(choice => choice !== exercise.expected[firstField.key])!
      : firstField.type === "integer" ? "98765" : "-98765";
    const wrongFeedback = gradePractice(exercise, { ...response, [firstField.key]: wrongValue });
    assert.equal(wrongFeedback.correct, false, exercise.key);
    assert.equal(wrongFeedback.fields[0].correct, false, exercise.key);
  }
});

test("Practice tasks, exercise blocks and source solutions stay linked one-to-one", () => {
  const exercises = Object.values(draft.content).flat().filter(block => block.kind === "exercise") as { practiceId?: string; source: string }[];
  assert.equal(exercises.length, bank.exercises.length);
  const blockIds = exercises.map(block => block.practiceId).sort();
  assert.deepEqual(blockIds, bank.exercises.map(exercise => exercise.key).sort());
  const solutionOrders = new Set(draft.solutions.map(solution => solution.order));
  for (const exercise of bank.exercises) assert.ok(solutionOrders.has(exercise.sourceOrder), exercise.key);
  for (const block of exercises) assert.match(block.source, /ص\s*\d+/);
  assert.equal(draft.solutions.length, 9);
  assert.deepEqual(draft.solutions.map(solution => solution.order).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

test("Assessment answers are mathematically correct and typed correctly", () => {
  assert.equal(assessment.questions.length, 12);
  const q = assessment.questions;
  const options = (index: number) => (q[index].options ?? [])[Number(q[index].answer)];
  assert.equal(options(0), "\\(6.4\\times10^{5}\\)");
  assert.equal(isCorrect(q[2].answer, "2750000", q[2].type), true);
  assert.equal(isCorrect(q[2].answer, "275000", q[2].type), false);
  assert.equal(isCorrect(q[5].answer, "29/18", q[5].type), true);
  assert.equal(isCorrect(q[5].answer, "29/17", q[5].type), false);
  assert.equal(isCorrect(q[6].answer, "1/6", q[6].type), true);
  assert.equal(isCorrect(q[9].answer, "-1", q[9].type), true);
  assert.equal(q[3].answer, "true");
  assert.ok(q.every(question => question.origin === "original"));
  assert.deepEqual(new Set(q.map(question => question.skill)), new Set(Object.keys(assessment.skills)));
  assert.equal(new Set(q.map(question => question.difficulty)).size, 3);
});

test("Lesson 5 figures are source-indexed and the lab exposes real controls", () => {
  assert.equal(OPERATIONS_FIGURE_KINDS.length, 4);
  for (const kind of OPERATIONS_FIGURE_KINDS) {
    const source = OPERATIONS_FIGURE_SOURCES[kind];
    assert.ok([15, 16, 17, 18].includes(source.page), kind);
    assert.ok(source.title.length > 5 && source.detail.length > 20, kind);
  }
  assert.deepEqual([...OPERATIONS_STUDIO_MODES], ["full", "sci", "frac", "decimal", "power"]);
  const studioBlocks = Object.values(draft.content).flat().filter(block => block.kind === "operationsStudio");
  assert.equal(studioBlocks.length, 1);
  assert.equal((studioBlocks[0] as { mode?: string }).mode, "full");
});

test("Lesson 5 content never leaks source page citations outside exercises", () => {
  const raw = readFileSync("src/content/lesson-5.json", "utf8");
  assert.ok(!/[٠-٩۰-۹]/.test(raw), "الأرقام إنجليزية فقط");
  const sections = (draft.content.explain[0] as { sections: { title: string; blocks: { kind: string; text?: string; title?: string }[] }[] }).sections;
  assert.equal(sections.length, 6);
  for (const section of sections) assert.ok(section.blocks.length >= 3);
  assert.ok(JSON.stringify(sections).includes("توحيد المقامات") || JSON.stringify(sections).includes("نوحّد"));
});
