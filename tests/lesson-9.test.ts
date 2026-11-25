import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  angleDeg,
  areCollinear,
  areParallel,
  dist,
  isMidpoint,
  isParallelogram,
  pt,
  reflectPoint,
} from "../src/lib/geometry-core";
import {
  BOOK_PARALLELOGRAM_ABCD,
  DOUBLE_PARALLELOGRAM_EXAMPLE,
  IDENTIFY_FIVE_SHAPES,
  PARALLELOGRAM_FIGURE_KINDS,
  PARALLELOGRAM_FIGURE_SOURCES,
  SYMMETRY_PROOF_BCDH,
  TRAIN_CENTER_G,
  TRAIN_COORD_OBCD,
  UNIT_LAUNCH_ANGLES,
  UNIT_LAUNCH_QUAD,
  UNIT_LAUNCH_Z,
  buildParallelogramFromSidesAngle,
  completeParallelogramFromCenter,
  coordinateParallelogram,
} from "../src/lib/parallelogram-symmetry";
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

const lesson = JSON.parse(readFileSync("src/content/lesson-9.json", "utf8")) as LessonDraft & {
  lessonId: number;
  notebook: { id: string; title: string; writingTask: string; blocks: { kind: string }[] }[];
};
const assessment = JSON.parse(readFileSync("src/content/assessments/parallelogram-symmetry.json", "utf8")) as OriginalAssessment & {
  lessonId: number;
};
const practice = JSON.parse(readFileSync("src/content/practice/parallelogram-symmetry.json", "utf8")) as PracticeBank & {
  lessonId: number;
};

test("Lesson 9 passes full publication, presentation, assessment, and practice validation", () => {
  assert.doesNotThrow(() => validateLessonPresentation(lesson));
  assert.doesNotThrow(() => validateAssessmentPresentation(assessment));
  assert.doesNotThrow(() => validateLessonPublication(lesson, assessment));
  assert.doesNotThrow(() => validateOriginalAssessment(lesson, assessment));
  assert.doesNotThrow(() => validatePracticeBank(lesson, practice));
  assert.equal(lesson.lessonId, 9);
  assert.equal(assessment.lessonId, 9);
  assert.equal(practice.lessonId, 9);
  assert.equal(lesson.notebook.length, 4);
  assert.ok(!/[\u0660-\u0669\u06f0-\u06f9]/.test(JSON.stringify([lesson, assessment, practice])));
});

test("Lesson 9 geometric invariants: p. 41 Unit 3 active launch figures (quad, angles, Z symmetry)", () => {
  // 1) MTCB is a general non-parallelogram quadrilateral
  const { M, B, C, T } = UNIT_LAUNCH_QUAD;
  assert.equal(isParallelogram(M, B, C, T), false);
  assert.equal(areParallel(M, B, T, C), false);

  // 2) Only Figure 2 shares a single vertex; Figures 1 and 3 have distinct vertices
  assert.ok(dist(UNIT_LAUNCH_ANGLES.fig1.v1, UNIT_LAUNCH_ANGLES.fig1.v2) > 1);
  assert.ok(dist(UNIT_LAUNCH_ANGLES.fig3.vTop, UNIT_LAUNCH_ANGLES.fig3.vBot) > 1);
  assert.equal(UNIT_LAUNCH_ANGLES.fig2.v.x, 0);
  assert.equal(UNIT_LAUNCH_ANGLES.fig2.v.y, 0);

  // 3) Letter Z is invariant under 180° central symmetry around (2.5, 2.5), NOT under vertical or horizontal mirror
  const [z0, z1, z2, z3] = UNIT_LAUNCH_Z.vertices;
  const O = UNIT_LAUNCH_Z.center;
  assert.ok(dist(reflectPoint(z0, O), z3) < 1e-9);
  assert.ok(dist(reflectPoint(z1, O), z2) < 1e-9);
  // Mirror across vertical line x = 2.5 sends diagonal z1=(4,4)->z2=(1,1) to (1,4)->(4,1), which is perpendicular, not coincident!
  const midDiag = pt(2.5, 2.5);
  assert.equal(areCollinear(z1, midDiag, z2), true);
  assert.equal(areCollinear(z1, pt(2, 3), z2), false);
});

test("Lesson 9 geometric invariants: p. 42 five shapes classification & BCDH central symmetry proof", () => {
  // Shapes 3 (rectangle) and 4 (slanted parallelogram) satisfy isParallelogram; shapes 1, 2, 5 fail
  for (const s of IDENTIFY_FIVE_SHAPES) {
    const [a, b, c, d] = s.vertices;
    assert.equal(isParallelogram(a, b, c, d), s.isParallelogram, `Shape ${s.id} classification mismatch`);
  }
  assert.deepEqual(IDENTIFY_FIVE_SHAPES.filter(s => s.isParallelogram).map(s => s.id), [3, 4]);

  // BCDH central symmetry proof
  const { B, C, D, H, M } = SYMMETRY_PROOF_BCDH;
  assert.equal(isParallelogram(B, C, D, H), true);
  assert.equal(isMidpoint(M, B, D), true);
  assert.ok(dist(reflectPoint(C, M), H) < 1e-9);
  assert.ok(dist(reflectPoint(B, M), D) < 1e-9);
  assert.equal(areParallel(B, C, H, D), true);
  assert.equal(areParallel(C, D, B, H), true);
  assert.ok(Math.abs(dist(B, C) - dist(D, H)) < 1e-9);
  assert.ok(Math.abs(angleDeg(B, C, D) - angleDeg(D, H, B)) < 1e-9);
});

test("Lesson 9 geometric invariants: ABCD four properties, double parallelogram midpoint, center G, and OBCD grid", () => {
  // ABCD four properties
  const { A, B, C, D, M } = BOOK_PARALLELOGRAM_ABCD;
  assert.equal(isParallelogram(A, B, C, D), true);
  assert.equal(isMidpoint(M, A, C), true);
  assert.equal(isMidpoint(M, B, D), true);
  assert.ok(Math.abs(dist(A, B) - dist(D, C)) < 1e-9);
  assert.ok(Math.abs(dist(B, C) - dist(A, D)) < 1e-9);
  assert.ok(Math.abs(angleDeg(D, A, B) - angleDeg(B, C, D)) < 1e-9);
  assert.ok(Math.abs(angleDeg(A, B, C) - angleDeg(C, D, A)) < 1e-9);

  // Double parallelogram worked example: BCDH and BCTD sharing [CB] => D is midpoint of [HT]
  const ex = DOUBLE_PARALLELOGRAM_EXAMPLE;
  assert.equal(isParallelogram(ex.B, ex.C, ex.T, ex.D), true);
  assert.equal(isParallelogram(ex.B, ex.C, ex.D, ex.H), true);
  assert.equal(areCollinear(ex.H, ex.D, ex.T), true);
  assert.equal(isMidpoint(ex.D, ex.H, ex.T), true);
  assert.ok(Math.abs(dist(ex.H, ex.D) - dist(ex.C, ex.B)) < 1e-9);
  assert.ok(Math.abs(dist(ex.D, ex.T) - dist(ex.C, ex.B)) < 1e-9);

  // Training 1: complete ABCD from A, B and center G
  const cg = TRAIN_CENTER_G;
  assert.equal(isParallelogram(cg.A, cg.B, cg.C, cg.D), true);
  assert.equal(isMidpoint(cg.G, cg.A, cg.C), true);
  assert.equal(isMidpoint(cg.G, cg.B, cg.D), true);

  // Training 2: OBCD in orthogonal grid
  const ob = TRAIN_COORD_OBCD;
  assert.deepEqual(ob.C, { x: 10, y: 4 });
  assert.deepEqual(ob.G, { x: 5, y: 2 });
  assert.equal(isParallelogram(ob.O, ob.B, ob.C, ob.D), true);
  assert.equal(isMidpoint(ob.G, ob.O, ob.C), true);
  assert.equal(isMidpoint(ob.G, ob.B, ob.D), true);
});

test("Lesson 9 studio builders preserve strict parallelogram constraints across parameter sweeps", () => {
  for (const deg of [35, 60, 90, 125]) {
    const pg = buildParallelogramFromSidesAngle(5.5, 3.2, deg);
    assert.equal(pg.valid, true);
    assert.ok(Math.abs(pg.ab - pg.dc) < 1e-9);
    assert.ok(Math.abs(pg.bc - pg.ad) < 1e-9);
    assert.ok(Math.abs(pg.ma - pg.mc) < 1e-9);
    assert.ok(Math.abs(pg.mb - pg.md) < 1e-9);
    assert.ok(Math.abs(pg.angleA - pg.angleC) < 1e-9);
    assert.ok(Math.abs(pg.angleB - pg.angleD) < 1e-9);
    assert.ok(Math.abs(pg.angleA + pg.angleB - 180) < 1e-9);
  }
  const crd = coordinateParallelogram(pt(8, 1), pt(2, 3));
  assert.equal(crd.valid, true);
  assert.equal(crd.cIsDoubleG, true);
  assert.equal(crd.gIsMidpointBD, true);
  assert.equal(crd.gIsMidpointOC, true);
  assert.equal(crd.oppositeParallel, true);

  const comp = completeParallelogramFromCenter(pt(5, 1), pt(1, 1), pt(4, 3));
  assert.equal(comp.valid, true);
  assert.deepEqual(comp.C, pt(3, 5));
  assert.deepEqual(comp.D, pt(7, 5));
});

test("Lesson 9 practice exercises, attempt-gated solutions, and assessment answers verify accurately", () => {
  assert.equal(Object.keys(PARALLELOGRAM_FIGURE_SOURCES).length, PARALLELOGRAM_FIGURE_KINDS.length);
  for (const ex of practice.exercises) {
    const clean = validatePracticeResponse(ex, ex.expected);
    const fb = gradePractice(ex, clean);
    assert.equal(fb.correct, true, `Expected answer failed for ${ex.key}`);
    const locked = publicPractice(ex.key, practice.revision, ex);
    assert.equal(locked.solution, undefined);
  }

  // Assessment mathematical answers
  assert.equal(isCorrect(assessment.questions[4].answer, "12", "fill"), true);
  assert.equal(isCorrect(assessment.questions[6].answer, "6", "problem"), true);
  assert.equal(isCorrect(assessment.questions[7].answer, "74", "fill"), true);
  assert.equal(isCorrect(assessment.questions[8].answer, "5", "problem"), true);
});
