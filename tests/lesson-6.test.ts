import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import lessonSix from "../src/content/lesson-6.json";
import assessmentSix from "../src/content/assessments/coordinate-plane.json";
import practiceSix from "../src/content/practice/coordinate-plane.json";
import { isCorrect, validateOriginalAssessment, type OriginalAssessment } from "../src/lib/assessment";
import { validateAssessmentPresentation, validateLessonPresentation } from "../src/lib/lesson-presentation";
import { validateLessonPublication, type LessonDraft } from "../src/lib/lesson-publication";
import { gradePractice, validatePracticeBank, validatePracticeResponse, type PracticeBank } from "../src/lib/practice-grading";
import {
  COORDINATE_FIGURE_KINDS,
  COORDINATE_FIGURE_SOURCES,
  COORDINATE_STUDIO_MODES,
  LAB_GRID_POINTS,
  PLOT_POINTS,
  QUADRANT_SIGN_RULES,
  READING_GRID_POINTS,
  TRAINING_POINTS_2,
  TRAINING_TABLE_3,
  axisRelation,
  choiceOptions,
  coordinatesText,
  inGrid,
  matchesPoint,
  relationLabel,
} from "../src/lib/coordinate-plane";

const draft = lessonSix as unknown as LessonDraft;
const assessment = assessmentSix as unknown as OriginalAssessment;
const bank = practiceSix as unknown as PracticeBank;

test("Lesson 6 passes publication, presentation, assessment and practice validation", () => {
  assert.doesNotThrow(() => validateLessonPresentation(draft));
  assert.doesNotThrow(() => validateAssessmentPresentation(assessment));
  assert.doesNotThrow(() => validateLessonPublication(draft, assessment));
  assert.doesNotThrow(() => validateOriginalAssessment(draft, assessment));
  assert.doesNotThrow(() => validatePracticeBank(draft, bank));
});

test("Lesson 6 has all seven stages, four notebook sheets, and no practice blocks in the notebook", () => {
  assert.deepEqual(Object.keys(draft.content).sort(), ["apply", "check", "discover", "explain", "intro", "lab", "summary"].sort());
  assert.equal(draft.notebook.length, 4);
  assert.equal(new Set(draft.notebook.map(sheet => sheet.id)).size, 4);
  const kinds = draft.notebook.flatMap(sheet => sheet.blocks.map(block => block.kind));
  assert.ok(!kinds.includes("coordinateStudio") && !kinds.includes("summary") && !kinds.includes("check") && !kinds.includes("exercise"));
  assert.equal((draft.content.explain[0] as { sections: unknown[] }).sections.length, 6);
});

test("Quadrant and axis classification is exact for every source point", () => {
  for (const item of TRAINING_POINTS_2) assert.equal(axisRelation(item.point), item.relation, item.label);
  const expected = {
    "5,3": "first", "-8,2": "second", "1,-4": "fourth", "-2,-3": "third",
    "0,5": "ordinate-axis", "3,0": "abscissa-axis", "-4,0": "abscissa-axis", "0,-1": "ordinate-axis",
    "0,0": "origin",
  } as const;
  for (const [key, relation] of Object.entries(expected)) {
    const [x, y] = key.split(",").map(Number);
    assert.equal(axisRelation({ x, y }), relation, key);
  }
  assert.equal(relationLabel({ x: -2, y: 3 }), "الربع الثاني");
  assert.equal(relationLabel({ x: 0, y: 0 }), "المبدأ");
  assert.deepEqual(QUADRANT_SIGN_RULES.map(rule => rule.example), ["(+,+)", "(-,+)", "(-,-)", "(+,-)"]);
});

test("Training table and reading figure keep the coordinates declared in code", () => {
  assert.deepEqual(TRAINING_TABLE_3.map(item => [item.label, item.point.x, item.point.y]), [
    ["a", 2, 3], ["b", -2, 3], ["c", 0, -3], ["d", -1, -2], ["e", -2, -1],
  ]);
  assert.deepEqual(READING_GRID_POINTS.map(item => [item.label, item.point.x, item.point.y]), [
    ["a", 3, 3], ["b", -2, 1], ["c", 0, -2], ["d", 4, -1],
  ]);
  assert.deepEqual(PLOT_POINTS.map(item => [item.label, item.point.x, item.point.y]), [["e", 3, -1], ["f", 5, 0], ["g", -4, 0]]);
  for (const item of LAB_GRID_POINTS) assert.ok(inGrid(item.point), item.label);
  assert.equal(inGrid({ x: 6, y: 0 }), false);
  assert.equal(matchesPoint("3", "-1", { x: 3, y: -1 }), true);
  assert.equal(matchesPoint("3.5", "-1", { x: 3, y: -1 }), false);
});

test("Choice options for plotting never repeat the correct pair", () => {
  for (let target = 0; target < READING_GRID_POINTS.length; target++) {
    const options = choiceOptions(READING_GRID_POINTS, target);
    assert.equal(options.length, 4);
    assert.equal(new Set(options).size, 4);
    assert.ok(options.includes(coordinatesText(READING_GRID_POINTS[target].point)));
  }
});

test("Every Lesson 6 practice task accepts its documented answer and flags mistakes", () => {
  assert.equal(bank.exercises.length, 6);
  for (const exercise of bank.exercises) {
    const response = validatePracticeResponse(exercise, exercise.expected);
    assert.equal(gradePractice(exercise, response).correct, true, exercise.key);
    const first = exercise.view.fields[0];
    const wrong = first.type === "choice"
      ? (first.choices ?? []).find(choice => choice !== exercise.expected[first.key])!
      : "99";
    const wrongFeedback = gradePractice(exercise, { ...response, [first.key]: wrong });
    assert.equal(wrongFeedback.correct, false, exercise.key);
    assert.equal(wrongFeedback.fields[0].correct, false, exercise.key);
  }
  assert.ok(bank.exercises.every(exercise => exercise.hints.length >= 3));
  assert.ok(bank.exercises.every(exercise => exercise.solution.steps.length >= 3));
});

test("Practice blocks and source solutions stay linked in Lesson 6", () => {
  const blocks = Object.values(draft.content).flat().filter(block => block.kind === "exercise") as { practiceId?: string; source: string }[];
  assert.equal(blocks.length, bank.exercises.length);
  assert.deepEqual(blocks.map(block => block.practiceId).sort(), bank.exercises.map(exercise => exercise.key).sort());
  assert.equal(draft.solutions.length, 6);
  const orders = new Set(draft.solutions.map(solution => solution.order));
  for (const exercise of bank.exercises) assert.ok(orders.has(exercise.sourceOrder), exercise.key);
  for (const block of blocks) assert.match(block.source, /ص\s*\d+/);
});

test("Lesson 6 assessment answers are correct and cover every declared skill", () => {
  assert.equal(assessment.questions.length, 11);
  const q = assessment.questions;
  assert.equal(q[0].options?.[Number(q[0].answer)], "\\((0,3)\\)");
  assert.equal(q[2].options?.[Number(q[2].answer)], "\\((6,-2)\\)");
  assert.equal(q[3].options?.[Number(q[3].answer)], "الربع الثاني");
  assert.equal(q[4].options?.[Number(q[4].answer)], "محور الفواصل");
  assert.equal(q[6].options?.[Number(q[6].answer)], "\\((4,-5)\\)");
  assert.equal(q[8].options?.[Number(q[8].answer)], "\\((1,1)\\)");
  assert.equal(q[9].options?.[Number(q[9].answer)], "\\((3,0)\\) و\\((-8,0)\\)");
  assert.equal(isCorrect(q[7].answer, "0", q[7].type), true);
  assert.equal(isCorrect(q[7].answer, "7", q[7].type), false);
  assert.equal(q[5].answer, "false");
  assert.deepEqual(new Set(q.map(question => question.skill)), new Set(Object.keys(assessment.skills)));
  assert.equal(new Set(q.map(question => question.difficulty)).size, 3);
});

test("Lesson 6 figures are source-indexed and the coordinate lab is declared", () => {
  assert.equal(COORDINATE_FIGURE_KINDS.length, 5);
  for (const kind of COORDINATE_FIGURE_KINDS) {
    const source = COORDINATE_FIGURE_SOURCES[kind];
    assert.ok([20, 21, 22].includes(source.page), kind);
    assert.ok(source.title.length > 4 && source.detail.length > 20, kind);
  }
  assert.deepEqual([...COORDINATE_STUDIO_MODES], ["full", "explore", "plot", "quadrants"]);
  const studio = Object.values(draft.content).flat().filter(block => block.kind === "coordinateStudio");
  assert.equal(studio.length, 1);
  assert.equal((studio[0] as { mode?: string }).mode, "full");
  const raw = readFileSync("src/content/lesson-6.json", "utf8");
  assert.ok(!/[٠-٩۰-۹]/.test(raw), "الأرقام إنجليزية فقط");
});
