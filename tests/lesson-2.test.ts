import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import lessonTwo from "../src/content/lesson-2.json";
import assessmentTwo from "../src/content/assessments/integers-add-sub.json";
import practiceTwo from "../src/content/practice/integers-add-sub.json";
import {
  BOOK_CALC_AB,
  BOOK_CALC_C,
  BOOK_LINE_OPS,
  BOOK_MATCH_PAIRS,
  BOOK_SHORT_EXAMPLES,
  GAME_PATHS,
  INTEGER_FIGURE_KINDS,
  INTEGER_FIGURE_SOURCES,
  INT_LINE,
  INT_WARMUP_ROWS,
  describeIntegerOp,
  intLineX,
  signedTeX,
} from "../src/lib/integers";
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

const draft = lessonTwo as unknown as LessonDraft;
const assessment = assessmentTwo as unknown as OriginalAssessment;
const bank = practiceTwo as unknown as PracticeBank;

test("Lesson 2 passes full publication, presentation, assessment, and practice validation", () => {
  assert.doesNotThrow(() => validateLessonPresentation(draft));
  assert.doesNotThrow(() => validateAssessmentPresentation(assessment));
  assert.doesNotThrow(() => validateLessonPublication(draft, assessment));
  assert.doesNotThrow(() => validateOriginalAssessment(draft, assessment));
  assert.doesNotThrow(() => validatePracticeBank(draft, bank));
});

test("Lesson 2 math helpers compute integer operations and geometry accurately", () => {
  // مستقيم الأعداد من -6 إلى +6 بمسافات متساوية
  assert.equal(INT_LINE.min, -6);
  assert.equal(INT_LINE.max, 6);
  assert.equal(intLineX(-6), INT_LINE.start);
  assert.equal(intLineX(6), INT_LINE.start + 12 * INT_LINE.spacing);
  const step = intLineX(1) - intLineX(0);
  for (let n = -6; n < 6; n++) {
    assert.ok(Math.abs(intLineX(n + 1) - intLineX(n) - step) < 1e-6);
  }

  // مسارات لعبة الحاسوب الأربعة وبداية الاستكشاف
  assert.equal(GAME_PATHS.length, 4);
  assert.deepEqual(
    GAME_PATHS.map(p => [p.id, p.stage1 + p.stage2 + p.stage3, p.total]),
    [
      [1, -2, -2],
      [2, 1, 1],
      [3, 3, 3],
      [4, 0, 0],
    ],
  );
  // المسار رقم 3 هو الأكبر بمجموع +3
  const maxPath = GAME_PATHS.reduce((best, cur) => (cur.total > best.total ? cur : best), GAME_PATHS[0]);
  assert.equal(maxPath.id, 3);
  assert.equal(maxPath.total, 3);

  // أمثلة الكتابة المختزلة ص 7
  assert.deepEqual(BOOK_SHORT_EXAMPLES.map(e => e.result), ["+3", "-18", "-2"]);

  // وصف عمليات الجمع والطرح على المستقيم
  const addNeg = describeIntegerOp(-5, "+", 3);
  assert.equal(addNeg.result, -2);
  assert.equal(addNeg.effectiveB, 3);
  assert.equal(addNeg.direction, "right");

  const subNeg = describeIntegerOp(-2, "-", -7);
  assert.equal(subNeg.result, 5);
  assert.equal(subNeg.effectiveB, 7);
  assert.equal(subNeg.direction, "right");
  assert.equal(subNeg.asAddTeX, "(-2) + (+7)");

  // اختبار التبديل مع القيم ±7 دون أي قص أو تغيير في القيمة
  const swappedSubNeg = describeIntegerOp(-7, "-", -2);
  assert.equal(swappedSubNeg.result, -5);
  assert.equal(swappedSubNeg.effectiveB, 2);
  assert.equal(swappedSubNeg.direction, "right");
  assert.notEqual(subNeg.result, swappedSubNeg.result); // الطرح ليس تبديليًا

  const addSeven = describeIntegerOp(7, "+", -3);
  const swappedAddSeven = describeIntegerOp(-3, "+", 7);
  assert.equal(addSeven.result, 4);
  assert.equal(swappedAddSeven.result, 4); // الجمع تبديلي

  const subPos = describeIntegerOp(-4, "-", 2);
  assert.equal(subPos.result, -6);
  assert.equal(subPos.effectiveB, -2);
  assert.equal(subPos.direction, "left");

  assert.equal(signedTeX(4), "+4");
  assert.equal(signedTeX(-4), "-4");
  assert.equal(signedTeX(0), "0");
});

test("Lesson 2 textbook practice answers match the Syrian 7th-grade curriculum pp. 5–9", () => {
  assert.equal(bank.exercises.length, 8);
  const byKey = Object.fromEntries(bank.exercises.map(ex => [ex.key, ex]));

  // انطلاقة نشطة ص 5
  assert.equal(INT_WARMUP_ROWS.length, 3);
  assert.deepEqual(byKey["int-warmup"].expected, { temp: "A", coordM: "C", distG: "C" });

  // لعبة الحاسوب ص 6
  assert.deepEqual(byKey["game-paths"].expected, { p1: "-2", p2: "1", p3: "3", p4: "0", best: "3" });

  // المصعد والغواصة ص 9 (تدريب 1–2)
  assert.deepEqual(byKey["elevator-sub"].expected, { elevator: "4", submarine: "-25" });

  // حساب A و B ص 9 (تدريب 3)
  assert.equal(BOOK_CALC_AB.length, 6);
  assert.deepEqual(byKey["calc-ab"].expected, {
    a1: String(2 + -6),
    a2: String(-3 - 5),
    a3: String(-4 + -2),
    b1: String(9 - -1),
    b2: String(-8 + 5 - 11),
    b3: String(-7 - (-9 - -22)),
  });

  // حساب C ص 9 (تدريب 3)
  assert.equal(BOOK_CALC_C.length, 3);
  assert.deepEqual(byKey["calc-c"].expected, {
    c1: String(-3 + 5 - 2 - 1),
    c2: String(2 - 6 + 1 - 5 + 8),
    c3: String(-22 + 10 - 32),
  });

  // التوصيل ص 9 (تدريب 4)
  assert.equal(BOOK_MATCH_PAIRS.length, 5);
  assert.deepEqual(byKey["match-short"].expected, {
    m1: "9-3",
    m2: "-4+7",
    m3: "-6-2",
    m4: "9+3",
    m5: "6+2",
  });

  // المستقيم ص 9 (تدريب 5)
  assert.equal(BOOK_LINE_OPS.length, 3);
  assert.deepEqual(byKey["line-ops"].expected, {
    la: String(-5 + 2),
    lb: String(-2 + 2),
    lc: String(-2 - -5),
  });

  // تحقق من فهمك ص 8 + تدريب 6 ص 9
  assert.deepEqual(byKey["int-reasoning"].expected, { counter: "B", whyComm: "B", whyAssoc: "B" });
});

test("signed-integer practice grading canonicalizes signs, Arabic digits, and rejects invalid input", () => {
  const ctxTask = bank.exercises.find(ex => ex.key === "elevator-sub")!;
  // قبول +4 أو 4 مع الأرقام العربية أو الإنجليزية
  assert.equal(gradePractice(ctxTask, validatePracticeResponse(ctxTask, { elevator: "+4", submarine: "-25" })).correct, true);
  assert.equal(gradePractice(ctxTask, validatePracticeResponse(ctxTask, { elevator: "4", submarine: "−٢٥" })).correct, true);
  assert.equal(gradePractice(ctxTask, validatePracticeResponse(ctxTask, { elevator: "+٤", submarine: " -25 " })).correct, true);

  // رفض خطأ الإشارة وإعطاء تغذية راجعة مخصصة
  const wrongSign = gradePractice(ctxTask, validatePracticeResponse(ctxTask, { elevator: "4", submarine: "25" }));
  assert.equal(wrongSign.correct, false);
  assert.ok(wrongSign.fields.some(f => !f.correct && f.message.includes("السالبة")));

  // رفض النص الفارغ أو الأحرف
  assert.throws(() => validatePracticeResponse(ctxTask, { elevator: "+4", submarine: "abc" }));
  assert.throws(() => validatePracticeResponse(ctxTask, { elevator: "", submarine: "-25" }));

  // قبول -0 كـ 0 في مسار 4
  const gameTask = bank.exercises.find(ex => ex.key === "game-paths")!;
  assert.equal(
    gradePractice(gameTask, validatePracticeResponse(gameTask, { p1: "-2", p2: "+1", p3: "+3", p4: "-0", best: "3" })).correct,
    true,
  );
});

test("Lesson 2 practice tasks enforce progressive hints and attempt-gated coaching solutions", () => {
  for (const task of bank.exercises) {
    // قبل أي محاولة: الحل مقفل ولا تُكشف الإجابات
    const initial = publicPractice(task.key, bank.revision, task);
    assert.equal("expected" in initial, false);
    assert.equal(initial.solution, undefined);

    // بعد تلميح فقط بلا محاولة: الحل ما زال مقفلًا
    const hinted = publicPractice(task.key, bank.revision, task, {
      response: {},
      attempts: 0,
      solved: false,
      hintsShown: 1,
      solutionViewed: false,
    });
    assert.equal(hinted.solution, undefined);
    assert.equal(hinted.state.hints.length, 1);

    // بعد محاولة فعلية وطلب عرض الحل: يظهر الحل التفصيلي
    const afterAttempt = publicPractice(task.key, bank.revision, task, {
      response: {},
      attempts: 1,
      solved: false,
      hintsShown: 1,
      solutionViewed: true,
    });
    assert.ok(afterAttempt.solution && afterAttempt.solution.steps.length >= 3);
  }
});

test("Lesson 2 original assessment covers all 5 skills with 2 verified questions each", () => {
  assert.equal(assessment.questions.length, 10);
  const skillKeys = Object.keys(assessment.skills);
  assert.deepEqual(skillKeys, [
    "int-order-opposite",
    "int-addition",
    "int-subtraction",
    "int-short-properties",
    "int-applications",
  ]);
  for (const key of skillKeys) {
    const count = assessment.questions.filter(q => q.skill === key).length;
    assert.equal(count, 2, `المهارة ${key} يجب أن تملك سؤالين على الأقل`);
  }

  // التحقق الحسابي من إجابات الأسئلة العشرة
  const expectedAnswers = [
    "1",                                    // Q1: -12° أبرد درجة
    "false",                                // Q2: البعد ليس سالبًا
    String(-16 + 29),                       // Q3: 13
    "1",                                    // Q4: خطأ (-17)+(-19) = -36
    String(-14 - -23),                      // Q5: 9
    String(-11 - 6),                        // Q6: -17
    "2",                                    // Q7: -18-7+12
    "false",                                // Q8: الطرح ليس تجميعيًا
    String(19 - 28 + 11 - 14 + 12),         // Q9: 0
    String(-12 - (-5 - -19)),               // Q10: -26
  ];
  assert.deepEqual(assessment.questions.map(q => q.answer), expectedAnswers);

  // التحقق من قبول التصحيح للصيغ المتكافئة مثل +13 و 13 و -١٧
  assert.equal(isCorrect(assessment.questions[2].answer, "+13", assessment.questions[2].type), true);
  assert.equal(isCorrect(assessment.questions[4].answer, "٩", assessment.questions[4].type), true);
  assert.equal(isCorrect(assessment.questions[5].answer, "-17", assessment.questions[5].type), true);
  assert.equal(isCorrect(assessment.questions[5].answer, "17", assessment.questions[5].type), false);
  assert.equal(isCorrect(assessment.questions[9].answer, "-26", assessment.questions[9].type), true);
});

test("Lesson 2 uses 6 guided explain tabs, 4 writing notebook sheets, indexed figures, and English digits", () => {
  const guide = draft.content.explain[0] as { kind: string; sections: unknown[] };
  assert.equal(guide.kind, "guide");
  assert.equal(guide.sections.length, 6);

  assert.equal(draft.notebook.length, 4);
  assert.equal(new Set(draft.notebook.map(s => s.id)).size, 4);

  for (const kind of INTEGER_FIGURE_KINDS) {
    assert.ok(INTEGER_FIGURE_SOURCES[kind], `مصدر الشكل ${kind} مفقود`);
  }

  const rawFiles = [
    readFileSync("src/content/lesson-2.json", "utf8"),
    readFileSync("src/content/assessments/integers-add-sub.json", "utf8"),
    readFileSync("src/content/practice/integers-add-sub.json", "utf8"),
  ];
  for (const text of rawFiles) {
    assert.equal(/[\u0660-\u0669\u06f0-\u06f9]/.test(text), false, "يجب اعتماد الأرقام الإنجليزية 0-9 في ملفات المحتوى");
  }
});
