import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import lessonThree from "../src/content/lesson-3.json";
import assessmentThree from "../src/content/assessments/integers-mul-div.json";
import practiceThree from "../src/content/practice/integers-mul-div.json";
import {
  BOOK_CALC_GROUP_A,
  BOOK_CALC_GROUP_B,
  BOOK_CALC_GROUP_C,
  BOOK_DIV_EXAMPLES,
  BOOK_FILL_EQUATIONS,
  BOOK_MUL_EXAMPLES,
  BOOK_MUL_SHORT_ROWS,
  BOOK_SIGN_EXERCISES,
  INTEGER_MUL_DIV_FIGURE_KINDS,
  INTEGER_MUL_DIV_FIGURE_SOURCES,
  MULDIV_WARMUP_ROWS,
  analyzeDivision,
  analyzeProduct,
  buildMulPattern,
  signedIntTeX,
} from "../src/lib/integers-mul-div";
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

const draft = lessonThree as unknown as LessonDraft;
const assessment = assessmentThree as unknown as OriginalAssessment;
const bank = practiceThree as unknown as PracticeBank;

test("Lesson 3 passes full publication, presentation, assessment, and practice validation", () => {
  assert.doesNotThrow(() => validateLessonPresentation(draft));
  assert.doesNotThrow(() => validateAssessmentPresentation(assessment));
  assert.doesNotThrow(() => validateLessonPublication(draft, assessment));
  assert.doesNotThrow(() => validateOriginalAssessment(draft, assessment));
  assert.doesNotThrow(() => validatePracticeBank(draft, bank));
});

test("Lesson 3 math helpers compute sign patterns, multi-factor products, and division accurately", () => {
  // تدرّج النمط عند a = -4 من b = 3 إلى b = -5
  const pattern = buildMulPattern(-4, 3, -5);
  assert.equal(pattern.length, 9);
  assert.deepEqual(
    pattern.map(r => [r.b, r.product]),
    [
      [3, -12],
      [2, -8],
      [1, -4],
      [0, 0],
      [-1, 4],
      [-2, 8],
      [-3, 12],
      [-4, 16],
      [-5, 20],
    ],
  );

  // أمثلة الضرب والقسمة والاختزال في الكتاب
  assert.deepEqual(BOOK_MUL_EXAMPLES.map(x => x.result), [12, -25, 20, -14]);
  assert.equal(BOOK_MUL_SHORT_ROWS.length, 3);
  assert.deepEqual(BOOK_DIV_EXAMPLES.map(x => x.result), [3, 12, 8, -1, -5, -9]);

  // تحليل الجداء متعدد العوامل: عدّ السوالب والصفر
  const fourNeg = analyzeProduct([-2, -3, -4, -5]);
  assert.equal(fourNeg.product, 120);
  assert.equal(fourNeg.negativeCount, 4);
  assert.equal(fourNeg.signParity, "even");
  assert.equal(fourNeg.hasZero, false);

  const threeNeg = analyzeProduct([-1, -2, -5]);
  assert.equal(threeNeg.product, -10);
  assert.equal(threeNeg.negativeCount, 3);
  assert.equal(threeNeg.signParity, "odd");

  const withZero = analyzeProduct([-12, -4, 0, -9]);
  assert.equal(withZero.product, 0);
  assert.equal(withZero.signParity, "zero");
  assert.equal(withZero.hasZero, true);

  // تحليل القسمة: قسمة الصفر مقابل القسمة على الصفر، وعدم التبديل
  const zeroDiv = analyzeDivision(0, -3);
  assert.equal(zeroDiv.possible, true);
  assert.equal(zeroDiv.quotient, 0);

  const divByZero = analyzeDivision(4, 0);
  assert.equal(divByZero.possible, false);
  assert.equal(divByZero.quotientText, "غير ممكنة");

  const d1 = analyzeDivision(-24, -2);
  const d2 = analyzeDivision(-2, -24);
  assert.equal(d1.possible && d1.quotient, 12);
  assert.equal(d2.possible && d2.exactInteger, false);

  assert.equal(signedIntTeX(8), "+8");
  assert.equal(signedIntTeX(8, false), "8");
  assert.equal(signedIntTeX(-8), "-8");
  assert.equal(signedIntTeX(0), "0");
});

test("Lesson 3 textbook practice answers match the Syrian 7th-grade curriculum pp. 10–12", () => {
  assert.equal(bank.exercises.length, 7);
  const byKey = Object.fromEntries(bank.exercises.map(ex => [ex.key, ex]));

  // انطلاقة نشطة ص 10
  assert.equal(MULDIV_WARMUP_ROWS.length, 5);
  assert.deepEqual(byKey["muldiv-warmup"].expected, { r1: "A", r2: "C", r3: "B", r4: "A", r5: "A" });

  // تدريب 1 ص 12: تعيين الإشارة
  assert.equal(BOOK_SIGN_EXERCISES.length, 4);
  assert.deepEqual(byKey["muldiv-signs"].expected, { s1: "-", s2: "-", s3: "+", s4: "-" });

  // تدريب 2 ص 12 — المجموعات A و B و C
  assert.equal(BOOK_CALC_GROUP_A.length, 3);
  assert.deepEqual(byKey["muldiv-calc-a"].expected, {
    a1: String(2 * -6),
    a2: String(-36 / 6),
    a3: String(-4 * -2),
  });

  assert.equal(BOOK_CALC_GROUP_B.length, 3);
  assert.deepEqual(byKey["muldiv-calc-b"].expected, {
    b1: String(9 / -1),
    b2: String(0 / -3),
    b3: String(-1 * -2 * -5),
  });

  assert.equal(BOOK_CALC_GROUP_C.length, 3);
  assert.deepEqual(byKey["muldiv-calc-c"].expected, {
    c1: String(-2 * -3 * -4 * -5),
    c2: String((5 - 9) * (10 - 12)),
    c3: String((-3 + 6) * (-25 + 50 - 18 - 7)),
  });

  // تدريب 3 ص 12 — ملء الفراغات
  assert.equal(BOOK_FILL_EQUATIONS.length, 4);
  assert.deepEqual(byKey["muldiv-fill"].expected, { f1: "1", f2: "-5", f3a: "1", f3b: "2", f4: "0" });

  // تحقق من فهمك ص 10–12
  assert.deepEqual(byKey["muldiv-understand"].expected, { q1: "A", q2: "B", q3: "C" });
});

test("muldiv-fill accepts all integer factor pairs whose product is +2 and rejects wrong pairs or formats", () => {
  const fillTask = bank.exercises.find(ex => ex.key === "muldiv-fill")!;

  // قبول كل الأزواج الصحيحة التي جداؤها +2 مع + أو أرقام عربية
  for (const [f3a, f3b] of [
    ["1", "2"],
    ["+2", "+1"],
    ["-1", "-2"],
    ["−٢", "−١"],
  ]) {
    const res = gradePractice(
      fillTask,
      validatePracticeResponse(fillTask, { f1: "+1", f2: "-5", f3a, f3b, f4: "0" }),
    );
    assert.equal(res.correct, true, `الزوج (${f3a}, ${f3b}) يجب أن يُقبل`);
  }

  // رفض زوج جداؤه -2 أو +3 مع رسالة توضيح للمساواة (3)
  const wrongSignPair = gradePractice(
    fillTask,
    validatePracticeResponse(fillTask, { f1: "1", f2: "-5", f3a: "1", f3b: "-2", f4: "0" }),
  );
  assert.equal(wrongSignPair.correct, false);
  assert.equal(wrongSignPair.fields.find(f => f.key === "f3a")?.correct, false);
  assert.equal(wrongSignPair.fields.find(f => f.key === "f3b")?.correct, false);
  assert.equal(wrongSignPair.fields.find(f => f.key === "f1")?.correct, true);

  const wrongMagPair = gradePractice(
    fillTask,
    validatePracticeResponse(fillTask, { f1: "1", f2: "-5", f3a: "1", f3b: "3", f4: "0" }),
  );
  assert.equal(wrongMagPair.correct, false);

  // رفض المدخلات غير الصالحة
  assert.throws(() => validatePracticeResponse(fillTask, { f1: "1", f2: "-5", f3a: "1.5", f3b: "2", f4: "0" }));
  assert.throws(() => validatePracticeResponse(fillTask, { f1: "", f2: "-5", f3a: "1", f3b: "2", f4: "0" }));

  // التحقق من قبول +8 و -0 في تدريب الحساب
  const calcB = bank.exercises.find(ex => ex.key === "muldiv-calc-b")!;
  assert.equal(gradePractice(calcB, validatePracticeResponse(calcB, { b1: "-٩", b2: "-0", b3: "-10" })).correct, true);
});

test("Lesson 3 practice tasks enforce progressive hints and attempt-gated coaching solutions", () => {
  for (const task of bank.exercises) {
    const initial = publicPractice(task.key, bank.revision, task);
    assert.equal("expected" in initial, false);
    assert.equal(initial.solution, undefined);

    const hinted = publicPractice(task.key, bank.revision, task, {
      response: {},
      attempts: 0,
      solved: false,
      hintsShown: 1,
      solutionViewed: false,
    });
    assert.equal(hinted.solution, undefined);
    assert.equal(hinted.state.hints.length, 1);

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

test("Lesson 3 original assessment covers all 5 skills with 2 verified questions each", () => {
  assert.equal(assessment.questions.length, 10);
  const skillKeys = Object.keys(assessment.skills);
  assert.deepEqual(skillKeys, [
    "muldiv-two-signs",
    "muldiv-properties-multi",
    "muldiv-shorthand",
    "muldiv-division",
    "muldiv-combined-apps",
  ]);
  for (const key of skillKeys) {
    const count = assessment.questions.filter(q => q.skill === key).length;
    assert.equal(count, 2, `المهارة ${key} يجب أن تملك سؤالين على الأقل`);
  }

  const expectedAnswers = [
    "1",                                    // Q1: -56 / +8 = -7
    String(-12 * -9),                       // Q2: 108
    "1",                                    // Q3: 3 عوامل سالبة => سالبة
    "false",                                // Q4: 0 عامل يجعل الناتج 0 لا موجبًا
    "1",                                    // Q5: (-8)(+4) = -32
    String(-6 * 7 + -3 * -4),               // Q6: -30
    "2",                                    // Q7: (-14) ÷ 0 غير ممكنة
    "false",                                // Q8: القسمة ليست تجميعية
    String(-135 / -15),                     // Q9: 9 دقائق
    String((4 - 11) * (-18 + 24 - 12)),     // Q10: 42
  ];
  assert.deepEqual(assessment.questions.map(q => q.answer), expectedAnswers);

  assert.equal(isCorrect(assessment.questions[1].answer, "+108", assessment.questions[1].type), true);
  assert.equal(isCorrect(assessment.questions[5].answer, "-٣٠", assessment.questions[5].type), true);
  assert.equal(isCorrect(assessment.questions[5].answer, "30", assessment.questions[5].type), false);
  assert.equal(isCorrect(assessment.questions[8].answer, "+9", assessment.questions[8].type), true);
  assert.equal(isCorrect(assessment.questions[9].answer, "42", assessment.questions[9].type), true);
});

test("Lesson 3 uses 6 guided explain tabs, 4 writing notebook sheets, indexed figures, and English digits", () => {
  const guide = draft.content.explain[0] as { kind: string; sections: unknown[] };
  assert.equal(guide.kind, "guide");
  assert.equal(guide.sections.length, 6);

  assert.equal(draft.notebook.length, 4);
  assert.equal(new Set(draft.notebook.map(s => s.id)).size, 4);

  for (const kind of INTEGER_MUL_DIV_FIGURE_KINDS) {
    assert.ok(INTEGER_MUL_DIV_FIGURE_SOURCES[kind], `مصدر الشكل ${kind} مفقود`);
  }

  const rawFiles = [
    readFileSync("src/content/lesson-3.json", "utf8"),
    readFileSync("src/content/assessments/integers-mul-div.json", "utf8"),
    readFileSync("src/content/practice/integers-mul-div.json", "utf8"),
  ];
  for (const text of rawFiles) {
    assert.equal(/[\u0660-\u0669\u06f0-\u06f9]/.test(text), false, "يجب اعتماد الأرقام الإنجليزية 0-9 في ملفات المحتوى");
  }
});
