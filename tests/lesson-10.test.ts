import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  arePerpendicular,
  dist,
  isParallelogram,
  polygonArea,
} from "../src/lib/geometry-core";
import {
  AREA_FIGURE_KINDS,
  AREA_FIGURE_SOURCES,
  CUT_PASTE_MODEL,
  SHADED_RATIO_MODELS,
  TRAIN_FOUR_MODELS,
  TWO_HEIGHTS_MODEL,
  UNIT_MISMATCH_MODEL,
  WORKED_EXAMPLE_MODEL,
  areaWithUnits,
  convertLength,
  solveFourthLength,
  twoHeightsCalculation,
} from "../src/lib/parallelogram-area";
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

const lesson = JSON.parse(readFileSync("src/content/lesson-10.json", "utf8")) as LessonDraft & {
  lessonId: number;
  notebook: { id: string; title: string; writingTask: string; blocks: { kind: string }[] }[];
};
const assessment = JSON.parse(readFileSync("src/content/assessments/parallelogram-area.json", "utf8")) as OriginalAssessment & {
  lessonId: number;
};
const practice = JSON.parse(readFileSync("src/content/practice/parallelogram-area.json", "utf8")) as PracticeBank & {
  lessonId: number;
};

test("Lesson 10 passes full publication, presentation, assessment, and practice validation", () => {
  assert.doesNotThrow(() => validateLessonPresentation(lesson));
  assert.doesNotThrow(() => validateAssessmentPresentation(assessment));
  assert.doesNotThrow(() => validateLessonPublication(lesson, assessment));
  assert.doesNotThrow(() => validateOriginalAssessment(lesson, assessment));
  assert.doesNotThrow(() => validatePracticeBank(lesson, practice));
  assert.equal(lesson.lessonId, 10);
  assert.equal(assessment.lessonId, 10);
  assert.equal(practice.lessonId, 10);
  assert.equal(lesson.notebook.length, 4);
  assert.ok(!/[\u0660-\u0669\u06f0-\u06f9]/.test(JSON.stringify([lesson, assessment, practice])));
});

test("Lesson 10 geometric invariants: cut-and-paste area conservation & unit mismatch model", () => {
  const cp = CUT_PASTE_MODEL;
  assert.equal(isParallelogram(cp.A, cp.B, cp.C, cp.D), true);
  assert.equal(arePerpendicular(cp.A, cp.H, cp.D, cp.C), true);
  assert.ok(Math.abs(cp.areaParallelogram - cp.areaRectangle) < 1e-9);
  assert.ok(Math.abs(cp.areaParallelogram - cp.base * cp.height) < 1e-9);
  assert.ok(Math.abs(cp.areaCutTriangle - cp.areaMovedTriangle) < 1e-9);

  // Unit mismatch (300 cm and 1 m)
  const um = UNIT_MISMATCH_MODEL;
  assert.equal(isParallelogram(um.C, um.B, um.A, um.D), true);
  assert.equal(arePerpendicular(um.D, um.H, um.C, um.B), true);
  assert.equal(convertLength(300, "cm", "m"), 3);
  assert.equal(areaWithUnits(300, "cm", 1, "m", "m").area, 3);
  assert.equal(areaWithUnits(300, "cm", 1, "m", "cm").area, 30000);
});

test("Lesson 10 geometric invariants: two heights perpendicularity & exact p. 48 worked example", () => {
  const th = TWO_HEIGHTS_MODEL;
  assert.equal(isParallelogram(th.A, th.B, th.C, th.D), true);
  assert.equal(arePerpendicular(th.A, th.E, th.B, th.C), true);
  assert.equal(arePerpendicular(th.A, th.E, th.A, th.D), true);
  assert.equal(arePerpendicular(th.A, th.F, th.D, th.C), true);
  assert.ok(th.fParam > 0 && th.fParam < 1, "Foot F must lie strictly on segment [DC]");
  assert.ok(Math.abs(th.area1 - th.area2) < 1e-9);

  // Exact worked example: BC = 5, CD = 4, AH = 3, AG = 3.75 => S = 15
  const ex = WORKED_EXAMPLE_MODEL;
  assert.equal(isParallelogram(ex.A, ex.B, ex.C, ex.D), true);
  assert.equal(arePerpendicular(ex.A, ex.H, ex.B, ex.C), true);
  assert.equal(arePerpendicular(ex.A, ex.G, ex.C, ex.D), true);
  assert.ok(ex.hParam > 0 && ex.hParam < 1, "Foot H must lie strictly inside [BC]");
  assert.ok(ex.gParam > 0 && ex.gParam < 1, "Foot G must lie strictly inside [CD]");
  assert.ok(Math.abs(ex.bc - 5) < 1e-9);
  assert.ok(Math.abs(ex.cd - 4) < 1e-9);
  assert.ok(Math.abs(ex.ah - 3) < 1e-9);
  assert.ok(Math.abs(ex.ag - 3.75) < 1e-9);
  assert.ok(Math.abs(ex.area1 - 15) < 1e-9);
  assert.ok(Math.abs(ex.area2 - 15) < 1e-9);
  assert.equal(solveFourthLength(5, 3, 3.75), 4);
});

test("Lesson 10 geometric invariants: shaded ratios (1/2, 1/3, 1/4) & four training parallelograms", () => {
  const expectedRatios = [1 / 2, 1 / 3, 1 / 4];
  SHADED_RATIO_MODELS.forEach((item, idx) => {
    assert.equal(isParallelogram(...item.outer), true);
    assert.equal(isParallelogram(...item.shaded), true);
    const ratio = polygonArea(item.shaded) / polygonArea(item.outer);
    assert.ok(Math.abs(ratio - expectedRatios[idx]) < 1e-9, `Case ${item.id} ratio mismatch`);
  });
  // Case 3 has 3 interior black dots dividing [CB] into 4 equal segments
  assert.equal(SHADED_RATIO_MODELS[2].dots.length, 3);
  assert.equal(SHADED_RATIO_MODELS[2].bottomTicks.length, 4);

  // Training a, b, c, d: exact areas & perpendicular altitudes
  const expectedAreas = { a: 96, b: 7.5, c: 120, d: 108 };
  for (const m of TRAIN_FOUR_MODELS) {
    assert.equal(isParallelogram(...m.vertices), true, `Train ${m.id} must be a strict parallelogram`);
    const [h1, h2] = m.heightSeg;
    const baseEdge = m.orientation === "horizontal-base" ? [m.vertices[0], m.vertices[1]] : [m.vertices[0], m.vertices[3]];
    assert.equal(arePerpendicular(h1, h2, baseEdge[0], baseEdge[1]), true, `Train ${m.id} altitude must be perpendicular`);
    assert.ok(Math.abs(dist(baseEdge[0], baseEdge[1]) - m.base) < 1e-9);
    assert.ok(Math.abs(dist(h1, h2) - m.height) < 1e-9);
    assert.ok(Math.abs(polygonArea(m.vertices) - expectedAreas[m.id]) < 1e-9);
  }
});

test("Lesson 10 studio two-heights invariance, practice grading, and assessment answers", () => {
  for (const theta of [35, 48.59, 65, 82]) {
    const calc = twoHeightsCalculation(5, 4, theta);
    assert.equal(calc.valid, true);
    assert.ok(Math.abs(calc.area1 - calc.area2) < 1e-9);
  }
  assert.equal(Object.keys(AREA_FIGURE_SOURCES).length, AREA_FIGURE_KINDS.length);
  for (const ex of practice.exercises) {
    const clean = validatePracticeResponse(ex, ex.expected);
    const fb = gradePractice(ex, clean);
    assert.equal(fb.correct, true, `Expected answer failed for ${ex.key}`);
    const locked = publicPractice(ex.key, practice.revision, ex);
    assert.equal(locked.solution, undefined);
  }

  assert.equal(isCorrect(assessment.questions[2].answer, "126", "fill"), true);
  assert.equal(isCorrect(assessment.questions[4].answer, "9", "problem"), true);
  assert.equal(isCorrect(assessment.questions[6].answer, "6", "problem"), true);
  assert.equal(isCorrect(assessment.questions[7].answer, "12", "fill"), true);
});
