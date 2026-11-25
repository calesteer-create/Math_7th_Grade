import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  angleDeg,
  areCollinear,
  areParallel,
  arePerpendicular,
  isMidpoint,
  isParallelogram,
} from "../src/lib/geometry-core";
import {
  CHECK_ANGLE_A_MODEL,
  CONSECUTIVE_PROOF_BCDH,
  PARALLEL_FIGURE_KINDS,
  PARALLEL_FIGURE_SOURCES,
  SYMMETRY_TRANSVERSAL_MODEL,
  TRAIN_ONE_ABCD,
  TRAIN_THREE_TABLE,
  TRAIN_TWO_LEFT_M,
  TRAIN_TWO_RIGHT_M,
  TRANSVERSAL_NON_PARALLEL,
  TRANSVERSAL_PARALLEL,
  VERTICAL_MODEL,
  WARMUP_FIG1,
  WARMUP_FIG2,
  auxiliaryAngleCalc,
  buildTransversalModel,
  verifyLesson11Models,
} from "../src/lib/parallel-lines-transversal";
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

const lesson = JSON.parse(readFileSync("src/content/lesson-11.json", "utf8")) as LessonDraft & {
  lessonId: number;
  notebook: { id: string; title: string; writingTask: string; blocks: { kind: string }[] }[];
};
const assessment = JSON.parse(readFileSync("src/content/assessments/parallel-lines-transversal.json", "utf8")) as OriginalAssessment & {
  lessonId: number;
};
const practice = JSON.parse(readFileSync("src/content/practice/parallel-lines-transversal.json", "utf8")) as PracticeBank & {
  lessonId: number;
};

test("Lesson 11 passes full publication, presentation, assessment, and practice validation", () => {
  assert.doesNotThrow(() => validateLessonPresentation(lesson));
  assert.doesNotThrow(() => validateAssessmentPresentation(assessment));
  assert.doesNotThrow(() => validateLessonPublication(lesson, assessment));
  assert.doesNotThrow(() => validateOriginalAssessment(lesson, assessment));
  assert.doesNotThrow(() => validatePracticeBank(lesson, practice));
  assert.equal(lesson.lessonId, 11);
  assert.equal(assessment.lessonId, 11);
  assert.equal(practice.lessonId, 11);
  assert.equal(lesson.notebook.length, 4);
  assert.ok(!/[\u0660-\u0669\u06f0-\u06f9]/.test(JSON.stringify([lesson, assessment, practice])));
});

test("Lesson 11 geometric invariants: warmup (132+48=180, 52+38=90), vertical angles, and transversal symmetry", () => {
  const checks = verifyLesson11Models();
  assert.equal(checks.fig1Collinear, true);
  assert.equal(checks.fig2Perp, true);
  assert.equal(checks.symMid, true);
  assert.equal(checks.consecParallelogram, true);
  assert.equal(checks.train1Parallelogram, true);

  // Exact warmup angle values
  assert.ok(Math.abs(WARMUP_FIG1.angleCMB - 132) < 1e-6);
  assert.ok(Math.abs(WARMUP_FIG1.angleBMA - 48) < 1e-6);
  assert.ok(Math.abs(WARMUP_FIG1.angleCMB + WARMUP_FIG1.angleBMA - 180) < 1e-6);
  assert.ok(Math.abs(WARMUP_FIG2.angleFGH - 52) < 1e-6);
  assert.ok(Math.abs(WARMUP_FIG2.angleHGE - 38) < 1e-6);
  assert.ok(Math.abs(WARMUP_FIG2.angleFGH + WARMUP_FIG2.angleHGE - 90) < 1e-6);

  // Vertical angles exact equality
  assert.equal(areCollinear(VERTICAL_MODEL.E, VERTICAL_MODEL.M, VERTICAL_MODEL.B), true);
  assert.equal(areCollinear(VERTICAL_MODEL.F, VERTICAL_MODEL.M, VERTICAL_MODEL.A), true);
  assert.ok(Math.abs(VERTICAL_MODEL.angleAMB - VERTICAL_MODEL.angleEMF) < 1e-9);

  // Parallel lines & transversal central symmetry
  const st = SYMMETRY_TRANSVERSAL_MODEL;
  assert.equal(areParallel(st.X, st.Xp, st.Y, st.Yp), true);
  assert.equal(isMidpoint(st.M, st.B, st.C), true);
  assert.ok(Math.abs(st.angleXBZp - st.angleYpCZ) < 1e-9);
  assert.ok(Math.abs(st.angleXpBZp - st.angleYCZ) < 1e-9);
});

test("Lesson 11 geometric invariants: parallel vs non-parallel transversal & consecutive parallelogram proof", () => {
  // Non-parallel: positional definitions hold, but angle equality FAILS
  assert.equal(TRANSVERSAL_NON_PARALLEL.parallel, false);
  assert.ok(Math.abs(TRANSVERSAL_NON_PARALLEL.angles.A3 - TRANSVERSAL_NON_PARALLEL.angles.B1) > 5);

  // Parallel: alternate interior, alternate exterior, and corresponding angles are EXACTLY equal
  const p = TRANSVERSAL_PARALLEL;
  assert.equal(p.parallel, true);
  assert.ok(Math.abs(p.angles.A3 - p.angles.B1) < 1e-9);
  assert.ok(Math.abs(p.angles.A4 - p.angles.B2) < 1e-9);
  assert.ok(Math.abs(p.angles.A1 - p.angles.B3) < 1e-9);
  assert.ok(Math.abs(p.angles.A2 - p.angles.B4) < 1e-9);
  assert.ok(Math.abs(p.angles.A1 - p.angles.B1) < 1e-9);

  // Consecutive angles in BCDH are supplementary
  const cp = CONSECUTIVE_PROOF_BCDH;
  assert.equal(areCollinear(cp.D, cp.C, cp.A), true);
  assert.ok(Math.abs(cp.angleACB - cp.angleCDH) < 1e-9);
  assert.ok(Math.abs(cp.angleBCD + cp.angleCDH - 180) < 1e-9);
});

test("Lesson 11 geometric invariants: Check A = 90°, Train 1 ABCD, Train 2 M = 107° & 113°, Train 3 Table x = 140°", () => {
  // p. 53 Check: 3 parallel lines + 135° & 135° => A = 90°
  const ca = CHECK_ANGLE_A_MODEL;
  assert.equal(areParallel(ca.d1Bot, ca.d1Top, ca.dMidBot, ca.dMidTop), true);
  assert.equal(areParallel(ca.dMidBot, ca.dMidTop, ca.d2Bot, ca.d2Top), true);
  assert.ok(Math.abs(ca.leftGivenDeg - 135) < 1e-6);
  assert.ok(Math.abs(ca.rightGivenDeg - 135) < 1e-6);
  assert.ok(Math.abs(ca.leftPartA - 45) < 1e-6);
  assert.ok(Math.abs(ca.rightPartA - 45) < 1e-6);
  assert.ok(Math.abs(ca.totalA - 90) < 1e-6);

  // p. 54 Train 1: d1 || d2, C1 = B1 => (AB) || (DC) and ABCD parallelogram
  const t1 = TRAIN_ONE_ABCD;
  assert.equal(areParallel(t1.d1L, t1.d1R, t1.d2L, t1.d2R), true);
  assert.equal(areParallel(t1.C, t1.D, t1.B, t1.A), true);
  assert.ok(Math.abs(t1.angleC1 - t1.angleB1) < 1e-9);
  assert.equal(isParallelogram(t1.A, t1.B, t1.C, t1.D), true);

  // p. 54 Train 2 Right: 110° and 37° => M = 107°
  const tr = TRAIN_TWO_RIGHT_M;
  assert.equal(areParallel(tr.d1L, tr.d1R, tr.d2L, tr.d2R), true);
  assert.ok(Math.abs(tr.topGivenDeg - 110) < 1e-6);
  assert.ok(Math.abs(tr.botGivenDeg - 37) < 1e-6);
  assert.ok(Math.abs(tr.angleM - 107) < 1e-6);

  // p. 54 Train 2 Left: 90° and 157° => M = 113°
  const tl = TRAIN_TWO_LEFT_M;
  assert.equal(areParallel(tl.d1Bot, tl.d1Top, tl.d2Bot, tl.d2Top), true);
  assert.equal(arePerpendicular(tl.P, tl.R, tl.P, tl.Q), true);
  assert.ok(Math.abs(tl.cornerDeg - 90) < 1e-6);
  assert.ok(Math.abs(tl.rightGivenDeg - 157) < 1e-6);
  assert.ok(Math.abs(tl.angleM - 113) < 1e-6);

  // p. 54 Train 3 Table: 40° => x = 140°
  const tb = TRAIN_THREE_TABLE;
  assert.equal(tb.validLeg, true);
  assert.ok(Math.abs(tb.givenDeg - 40) < 1e-6);
  assert.ok(Math.abs(tb.xDeg - 140) < 1e-6);
  assert.ok(Math.abs(tb.givenDeg + tb.xDeg - 180) < 1e-6);

  // Auxiliary line studio math helper & transversal sweep
  assert.deepEqual(auxiliaryAngleCalc(110, 37), { topPart: 70, botPart: 37, total: 107, supplementaryCheck: true });
  assert.deepEqual(auxiliaryAngleCalc(135, 45), { topPart: 45, botPart: 45, total: 90, supplementaryCheck: true });
  for (const deg of [40, 65, 110]) {
    const m = buildTransversalModel(0, deg);
    assert.equal(m.parallel, true);
    assert.ok(Math.abs(m.angles.A1 - m.angles.B1) < 1e-9);
    assert.ok(Math.abs(m.angles.A3 - m.angles.B1) < 1e-9);
  }
});

test("Lesson 11 practice exercises, attempt-gated solutions, and assessment answers verify accurately", () => {
  assert.equal(Object.keys(PARALLEL_FIGURE_SOURCES).length, PARALLEL_FIGURE_KINDS.length);
  for (const ex of practice.exercises) {
    const clean = validatePracticeResponse(ex, ex.expected);
    const fb = gradePractice(ex, clean);
    assert.equal(fb.correct, true, `Expected answer failed for ${ex.key}`);
    const locked = publicPractice(ex.key, practice.revision, ex);
    assert.equal(locked.solution, undefined);
  }

  assert.equal(isCorrect(assessment.questions[0].answer, "27", "fill"), true);
  assert.equal(isCorrect(assessment.questions[3].answer, "138", "problem"), true);
  assert.equal(isCorrect(assessment.questions[5].answer, "107", "fill"), true);
  assert.equal(isCorrect(assessment.questions[8].answer, "126", "problem"), true);
  assert.equal(isCorrect(assessment.questions[9].answer, "85", "problem"), true);
});

// تأكيد أن الزوايا المحسوبة باستخدام angleDeg متوافقة مع مجموع الزاوية المستقيمة 180°
test("Lesson 11 supplementary angle check on line (C,M,A)", () => {
  const sum = angleDeg(WARMUP_FIG1.C, WARMUP_FIG1.M, WARMUP_FIG1.B) + angleDeg(WARMUP_FIG1.B, WARMUP_FIG1.M, WARMUP_FIG1.A);
  assert.ok(Math.abs(sum - 180) < 1e-9);
});
