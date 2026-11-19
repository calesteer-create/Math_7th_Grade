import assert from "node:assert/strict";
import { test } from "node:test";
import {
  attemptDateText, parseAttempt, parseAttempts, parsePracticeSolved, parseStage, parseVisited,
  readLocal, writeLocalOnce,
} from "../src/lib/local-progress";
import {
  MAX_LESSON_POINTS, MAX_QUIZ_POINTS, MISSION_POINTS, QUIZ_POINTS_ROUNDING, achievements,
  bestAttemptFor, dashboardStats, didImprove, isQuizPass, lessonStatus, statusLabel, type LessonStatus,
} from "../src/lib/lesson-progress";

const attempt = (score: number, total: number, lessonId?: number, date = "2026-01-01T10:00:00.000Z") =>
  lessonId === undefined ? { title: "اختبار", score, total, date } : { title: "اختبار", score, total, date, lessonId };

const keys = ["a", "b", "c", "d", "e", "f"];
const MAX_TRAINING_BASE = Math.min(30, keys.length * 5);
const status = (overrides: Partial<Parameters<typeof lessonStatus>[0]> = {}) => lessonStatus({
  lessonId: 1, missionKeys: keys, solvedMissionKeys: keys, attempts: [attempt(8, 8, 1)], visited: true, ...overrides,
});

// ————— عتبة النجاح: مقارنة صحيحة بلا تقريب —————
test("عتبة الاجتياز 70٪ تُحسب بلا تقريب قد يغيّر القرار", () => {
  assert.equal(isQuizPass(7, 10), true);
  assert.equal(isQuizPass(6, 10), false);
  assert.equal(isQuizPass(70, 100), true);
  assert.equal(isQuizPass(69, 100), false);
  assert.equal(isQuizPass(6, 8), true);
  assert.equal(isQuizPass(5, 8), false);
  assert.equal(isQuizPass(0, 8), false);
  assert.equal(isQuizPass(8, 8), true);
  assert.equal(isQuizPass(9, 8), false, "score > total غير صالح");
  assert.equal(isQuizPass(0, 0), false);
  assert.equal(isQuizPass(-1, 8), false);
  assert.equal(isQuizPass(6.5, 10), false);
});

test("الإتقان الكامل يعتمد على score === total مهما كان عدد الأسئلة", () => {
  assert.equal(status({ attempts: [attempt(10, 10, 1)] }).mastered, true);
  assert.equal(status({ attempts: [attempt(9, 10, 1)] }).mastered, false);
  assert.equal(status({ attempts: [attempt(9, 10, 1)] }).completed, true);
  assert.equal(status({ attempts: [attempt(6, 6, 1)] }).mastered, true);
});

// ————— الإكمال: تدريب + اجتياز —————
test("الإكمال يتطلب كل مهام الدرس واجتياز الاختبار معًا", () => {
  const trainingOnly = lessonStatus({ lessonId: 1, missionKeys: keys, solvedMissionKeys: keys, attempts: [] });
  assert.equal(trainingOnly.trainingComplete, true);
  assert.equal(trainingOnly.completed, false);
  assert.equal(trainingOnly.points, 30);

  const quizOnly = lessonStatus({ lessonId: 1, missionKeys: keys, solvedMissionKeys: keys.slice(0, 2), attempts: [attempt(10, 10, 1)] });
  assert.equal(quizOnly.trainingComplete, false);
  assert.equal(quizOnly.passed, true);
  assert.equal(quizOnly.completed, false);
  assert.equal(quizOnly.points, 30, "10 تدريب + 20 اختبار");

  const full = lessonStatus({ lessonId: 1, missionKeys: keys, solvedMissionKeys: keys, attempts: [attempt(7, 10, 1)] });
  assert.equal(full.completed, true);
  assert.equal(full.mastered, false);
  assert.equal(full.points, 44, "30 + round(20×0.7)=14");
});

test("التدريب يُحسب من مفاتيح المهام الفعلية لا من عدد ثابت", () => {
  const three = lessonStatus({ lessonId: 1, missionKeys: ["x", "y", "z"], solvedMissionKeys: ["x", "y"], attempts: [] });
  assert.equal(three.missionsTotal, 3);
  assert.equal(three.missionsDone, 2);
  assert.equal(three.trainingComplete, false);

  const ignoreUnknown = lessonStatus({ lessonId: 1, missionKeys: ["x", "y"], solvedMissionKeys: ["x", "outside"], attempts: [] });
  assert.equal(ignoreUnknown.missionsDone, 1, "مفتاح خارج بنك الدرس لا يُحتسب");

  const noMissions = lessonStatus({ lessonId: 1, missionKeys: [], solvedMissionKeys: [], attempts: [attempt(8, 8, 1)] });
  assert.equal(noMissions.trainingComplete, false);
  assert.equal(noMissions.completed, false, "لا إكمال بلا مهام معلنة");
});

// ————— النقاط لا تتضاعف —————
test("تكرار الاختبار نفسه أو التدريب لا يضاعف النقاط", () => {
  const once = status({ attempts: [attempt(8, 8, 1)] });
  const fiveTimes = status({ attempts: Array.from({ length: 5 }, () => attempt(8, 8, 1)) });
  assert.equal(once.points, 50);
  assert.equal(fiveTimes.points, 50);
  assert.equal(fiveTimes.attempts, 5, "المحاولات تُعدّ للعرض فقط");
  assert.equal(didImprove(Array.from({ length: 5 }, () => attempt(8, 8, 1)), 1), false);
});

test("إعادة بنتيجة مساوية أو أقل لا تمنح نقاطًا، والتحسّن يُحتسب مرة واحدة", () => {
  // المحاولات تُخزَّن الأحدث أولًا، والتاريخ يفصل الترتيب الزمني.
  const older = "2026-01-01T10:00:00.000Z";
  const newer = "2026-01-02T10:00:00.000Z";
  const lowerAttempts = [attempt(4, 8, 1, newer), attempt(6, 8, 1, older)];
  const lower = status({ attempts: lowerAttempts });
  assert.equal(lower.best?.score, 6);
  assert.equal(lower.points, 30 + 15);
  assert.equal(didImprove(lowerAttempts, 1), false);

  const equalAttempts = [attempt(6, 8, 1, newer), attempt(6, 8, 1, older)];
  const equal = status({ attempts: equalAttempts });
  assert.equal(equal.points, 30 + 15);
  assert.equal(didImprove(equalAttempts, 1), false);

  const betterAttempts = [attempt(8, 8, 1, newer), attempt(6, 8, 1, older)];
  const better = status({ attempts: betterAttempts });
  assert.equal(better.points, 50);
  assert.equal(better.mastered, true);
  assert.equal(didImprove(betterAttempts, 1), true);
});

test("سقف نقاط الدرس لا يُتجاوز ولا تُحتسب المهام الزائدة", () => {
  const manyKeys = Array.from({ length: 12 }, (_, i) => `k${i}`);
  const full = lessonStatus({ lessonId: 1, missionKeys: manyKeys, solvedMissionKeys: manyKeys, attempts: [attempt(8, 8, 1)] });
  assert.equal(full.points, MAX_LESSON_POINTS);
  assert.equal(MAX_LESSON_POINTS, 50);
  assert.ok(full.points <= 50);
});

// ————— المحاولات القديمة والإحصاءات —————
test("المحاولات القديمة غير المنسوبة تُحفظ ولا تدخل إحصاءات الدروس", () => {
  const legacy = attempt(3, 8);
  const current = attempt(8, 8, 1);
  assert.equal(bestAttemptFor([legacy], 1), null);
  assert.equal(bestAttemptFor([legacy, current], 1)?.score, 8);

  const withLesson = status({ attempts: [legacy, current] });
  const stats = dashboardStats([withLesson]);
  assert.equal(stats.points, 50);
  assert.equal(stats.attempts, 1, "المحاولة القديمة غير محسوبة");
  assert.equal(stats.average, 100);
  assert.equal(stats.completed, 1);

  const legacyOnly = status({ attempts: [legacy] });
  const legacyStats = dashboardStats([legacyOnly]);
  assert.equal(legacyStats.attempts, 0);
  assert.equal(legacyStats.average, 0);
  assert.equal(legacyStats.points, 30, "التدريب وحده يبقى محسوبًا");
});

test("متوسط النتائج يستخدم أفضل محاولة لكل درس لا كل الإعادات", () => {
  const first = status({ lessonId: 1, solvedMissionKeys: [], attempts: [attempt(8, 10, 1), attempt(4, 10, 1)] });
  const second = status({ lessonId: 2, solvedMissionKeys: [], attempts: [attempt(5, 10, 2)] });
  const stats = dashboardStats([first, second]);
  assert.equal(stats.average, 65, "(80% + 50%) / 2");
  assert.equal(stats.completed, 0, "لا إكمال بلا تدريب");
  assert.equal(stats.points, 16 + 10);
});

// ————— الشارات —————
test("الشارات لا تُمنح قبل تحقق شرطها الفعلي", () => {
  const nothing = status({ solvedMissionKeys: [], attempts: [], visited: false });
  assert.deepEqual(achievements([nothing]).map(badge => badge.earned), [false, false, false, false]);

  const training = status({ attempts: [] });
  assert.deepEqual(achievements([training]).map(badge => badge.earned), [false, true, false, false]);

  const completed = status({ attempts: [attempt(7, 8, 1)] });
  assert.deepEqual(achievements([completed]).map(badge => badge.earned), [true, true, false, false]);

  const perfect = status({ attempts: [attempt(8, 8, 1)] });
  assert.deepEqual(achievements([perfect]).map(badge => badge.earned), [true, true, true, false]);

  const improved = status({ attempts: [attempt(6, 8, 1, "2026-01-01T10:00:00.000Z"), attempt(8, 8, 1, "2026-02-01T10:00:00.000Z")] });
  assert.deepEqual(achievements([improved]).map(badge => badge.earned), [true, true, true, true]);

  const repeated = status({ attempts: [attempt(8, 8, 1), attempt(8, 8, 1)] });
  assert.equal(achievements([repeated])[3].earned, false, "التكرار بلا تحسّن لا يمنح «مجتهد»");
});

test("وصف الحالة يفصل الزيارة والتدريب والاجتياز والإتمام", () => {
  const labels: Record<string, string> = {
    empty: statusLabel(status({ solvedMissionKeys: [], attempts: [], visited: false })),
    visited: statusLabel(status({ solvedMissionKeys: [], attempts: [], visited: true })),
    training: statusLabel(status({ solvedMissionKeys: keys.slice(0, 2), attempts: [] })),
    trainingDone: statusLabel(status({ attempts: [] })),
    passed: statusLabel(status({ solvedMissionKeys: keys.slice(0, 1), attempts: [attempt(8, 8, 1)] })),
    attemptedOnly: statusLabel(status({ solvedMissionKeys: [], attempts: [attempt(1, 8, 1)], visited: true })),
    completed: statusLabel(status({ attempts: [attempt(7, 8, 1)] })),
    mastered: statusLabel(status({ attempts: [attempt(8, 8, 1)] })),
  };
  assert.equal(labels.empty, "لم يبدأ");
  assert.equal(labels.visited, "زيارة فقط");
  assert.equal(labels.training, "تدريب جارٍ");
  assert.equal(labels.trainingDone, "التدريب منجز — اجتز الاختبار");
  assert.equal(labels.passed, "نجحت في الاختبار — أكمل التدريب");
  assert.equal(labels.attemptedOnly, "محاولة اختبار دون اجتياز", "محاولة فاشلة ليست «لم يبدأ»");
  assert.equal(labels.completed, "درس مكتمل");
  assert.equal(labels.mastered, "إتقان كامل");
});

// ————— قراءة آمنة للبيانات القديمة والتالفة —————
test("البيانات القديمة تُقرأ وتُحفظ كما هي في الذاكرة", () => {
  const legacyAttempts = [
    { title: "اختبار درس: الأعداد الطبيعية", score: 6, total: 8, date: "2025-09-01T08:00:00.000Z" },
  ];
  const parsed = parseAttempts(legacyAttempts);
  assert.equal(parsed.invalid, 0);
  assert.equal(parsed.attempts.length, 1);
  assert.equal(parsed.attempts[0].lessonId, undefined, "المحاولة القديمة تبقى بلا هوية درس");

  const withId = parseAttempt({ ...legacyAttempts[0], lessonId: 1 });
  assert.equal(withId?.lessonId, 1);
  assert.equal(parseStage("7", 9), null);
  assert.equal(parseStage(8, 9), 8);
  assert.equal(parseStage(9, 9), null);
  assert.deepEqual(parseVisited([0, 3, 3, 9, "2", -1], 9), [0, 3]);
  assert.equal(parsePracticeSolved({ solved: true, attempts: 2 }), true);
  assert.equal(parsePracticeSolved({ solved: true }), false, "بلا محاولة مسجلة لا إنجاز");
  assert.equal(parsePracticeSolved({ solved: "true", attempts: 1 }), false);
  assert.equal(parsePracticeSolved(null), false);
});

test("البيانات التالفة لا تُسقط الصفحة ولا تُقصّ بصمت", () => {
  assert.deepEqual(parseAttempts({ not: "array" }), { attempts: [], invalid: 1 });
  assert.deepEqual(parseAttempts("not-json"), { attempts: [], invalid: 1 });
  assert.deepEqual(parseAttempts(null), { attempts: [], invalid: 0 });
  assert.deepEqual(parseAttempts([]), { attempts: [], invalid: 0 });

  const mixed = parseAttempts([
    attempt(8, 8, 1),
    { title: "سيئة", score: 9, total: 8, date: "2026-01-01" },
    { title: "سيئة", score: 1, total: 0, date: "2026-01-01" },
    { title: "سيئة", score: -1, total: 8, date: "2026-01-01" },
    { title: "سيئة", score: 2, total: 8 },
    { title: "", score: 2, total: 8, date: "2026-01-01" },
    { title: "سيئة", score: 2, total: 8, date: "2026-01-01", lessonId: "1" },
    { title: "سيئة", score: 2, total: 8, date: "2026-01-01", lessonId: 0 },
    null, 42,
  ]);
  assert.equal(mixed.attempts.length, 1);
  assert.equal(mixed.invalid, 9);
  assert.equal(mixed.attempts[0].lessonId, 1);
  assert.equal(attemptDateText("not-a-date"), "—");
});

test("الإحصاءات تبقى متسقة عند مزج بيانات سليمة وتالفة وقديمة", () => {
  const parsed = parseAttempts([attempt(7, 10, 1), { broken: true }, attempt(10, 10)]);
  const one = lessonStatus({ lessonId: 1, missionKeys: keys, solvedMissionKeys: keys, attempts: parsed.attempts });
  const stats: ReturnType<typeof dashboardStats> = dashboardStats([one] as LessonStatus[]);
  assert.equal(parsed.invalid, 1);
  assert.equal(stats.completed, 1);
  assert.equal(stats.attempts, 1);
  assert.equal(stats.average, 70);
});

// ————— سياسة النقاط: أرضية لا تقريب لأعلى —————
test("نقاط الاختبار تُقرَّب للأرض: الجدول الكامل مثبَّت", () => {
  assert.equal(QUIZ_POINTS_ROUNDING, "floor", "السياسة المعتمدة صريحة في الكود");
  assert.equal(MAX_QUIZ_POINTS, 20);
  assert.equal(MISSION_POINTS, 5);

  const cases: [number, number, number][] = [
    [0, 8, 0], [1, 8, 2], [2, 8, 5], [3, 8, 7], [5, 8, 12], [6, 8, 15], [7, 8, 17], [8, 8, 20],
    [1, 3, 6], [2, 3, 13], [1, 10, 2], [7, 10, 14],
    [69, 100, 13], [70, 100, 14], [99, 100, 19], [100, 100, 20],
  ];
  for (const [score, total, expected] of cases) {
    const result = lessonStatus({ lessonId: 1, missionKeys: keys, solvedMissionKeys: keys, attempts: [attempt(score, total, 1)] });
    assert.equal(result.points - MAX_TRAINING_BASE, expected, `${score}/${total} ⇒ ${expected}`);
    const exact = (MAX_QUIZ_POINTS * score) / total;
    assert.ok(result.points - MAX_TRAINING_BASE <= exact, `${score}/${total} لا يمنح أكثر من الناتج الدقيق`);
    assert.equal(result.points - MAX_TRAINING_BASE, Math.floor(exact), `${score}/${total} أرضية`);
  }
});

test("النقاط رتيبة: نتيجة أعلى لا تعطي نقاطًا أقل", () => {
  for (const total of [3, 8, 10, 100]) {
    let previous = -1;
    for (let score = 0; score <= total; score++) {
      const points = lessonStatus({ lessonId: 1, missionKeys: keys, solvedMissionKeys: keys, attempts: [attempt(score, total, 1)] }).points;
      assert.ok(points >= previous, `${score}/${total} نقاط أقل من سابقتها`);
      assert.ok(points <= MAX_LESSON_POINTS, "السقف لا يُتجاوز");
      previous = points;
    }
  }
});

test("اتساق المجموع: نقاط الدرس = تدريب + اختبار، والإجمالي = مجموع الدروس", () => {
  const statuses = [
    lessonStatus({ lessonId: 1, missionKeys: keys, solvedMissionKeys: keys, attempts: [attempt(7, 8, 1)] }),
    lessonStatus({ lessonId: 2, missionKeys: keys, solvedMissionKeys: keys.slice(0, 2), attempts: [attempt(3, 4, 2)] }),
    lessonStatus({ lessonId: 3, missionKeys: keys, solvedMissionKeys: [], attempts: [] }),
  ];
  for (const status of statuses) {
    const training = Math.min(30, status.missionsDone * 5);
    const quiz = status.best ? Math.floor((20 * status.best.score) / status.best.total) : 0;
    assert.equal(status.points, Math.min(50, training + quiz));
  }
  const stats = dashboardStats(statuses);
  assert.equal(stats.points, statuses.reduce((sum, status) => sum + status.points, 0));
  assert.equal(stats.points, 47 + 25 + 0, "17 + 7 و 10 + 10");
});

// ————— النسخة الاحتياطية: كتابة لمرة واحدة —————
test("النسخة الاحتياطية لا تُستبدل إذا كان المفتاح موجودًا", () => {
  const store = new Map<string, string>();
  const fake = {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => { store.set(key, String(value)); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => { store.clear(); },
    key: (index: number) => [...store.keys()][index] ?? null,
    get length() { return store.size; },
  };
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", { value: fake, configurable: true, writable: true });
  try {
    assert.equal(writeLocalOnce("math7-quiz-attempts-backup", { first: true }), true);
    assert.equal(writeLocalOnce("math7-quiz-attempts-backup", { second: true }), false);
    assert.equal(writeLocalOnce("math7-quiz-attempts-backup", { third: true }), false);
    assert.equal(store.get("math7-quiz-attempts-backup"), JSON.stringify({ first: true }));
    assert.deepEqual(readLocal("math7-quiz-attempts-backup", null), { first: true });

    // تخزين معطّل لا يرمي استثناء ولا يكتب شيئًا.
    Object.defineProperty(globalThis, "localStorage", {
      value: { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } },
      configurable: true, writable: true,
    });
    assert.equal(writeLocalOnce("math7-quiz-attempts-backup", { any: true }), false);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, "localStorage", descriptor);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});

// ————— التفصيل المهاري داخل المحاولة: توافق خلفي كامل —————
test("المحاولة القديمة تبقى صالحة بلا تفصيل مهاري", () => {
  const legacy = { title: "اختبار قديم", score: 6, total: 8, date: "2025-09-01T08:00:00.000Z" };
  const parsed = parseAttempt(legacy);
  assert.ok(parsed);
  assert.equal(parsed.items, undefined, "لا يُضاف تفصيل غير موجود");
  assert.deepEqual(parseAttempts([legacy]).attempts[0], parsed);
  assert.equal(parseAttempts([legacy]).invalid, 0, "المحاولة القديمة ليست تالفة");
});

test("التفصيل المهاري الصالح يُقرأ كاملًا ويُحفظ كما هو", () => {
  const items = [
    { id: 1, skill: "place-value", correct: true },
    { id: 2, skill: "place-value", correct: false },
    { id: 3, skill: "writing", correct: true },
    { id: 4, skill: "counting", correct: true },
  ];
  const parsed = parseAttempt({ title: "اختبار", score: 3, total: 4, date: "2026-01-01T00:00:00.000Z", lessonId: 1, items });
  assert.ok(parsed?.items);
  assert.equal(parsed.items.length, 4);
  assert.deepEqual(parsed.items[1], { id: 2, skill: "place-value", correct: false });
});

test("تفصيل ناقص أو مكرر أو خاطئ الأنواع يُسقَط وحده دون فقدان المحاولة", () => {
  const base = { title: "اختبار", score: 2, total: 2, date: "2026-01-01T00:00:00.000Z", lessonId: 1 };
  const cases: unknown[] = [
    [{ id: 1, skill: "writing", correct: true }],
    [{ id: 1, skill: "writing", correct: true }, { id: 1, skill: "writing", correct: true }],
    [{ id: 1, skill: "writing", correct: true }, { id: 2, skill: "", correct: true }],
    [{ id: 1, skill: "writing", correct: true }, { id: 2, skill: "writing", correct: "true" }],
    [{ id: 0, skill: "writing", correct: true }, { id: 2, skill: "writing", correct: true }],
    [{ id: 1, skill: "writing", correct: true }, "not-an-object"],
    [],
    { 1: true },
  ];
  for (const items of cases) {
    const parsed = parseAttempt({ ...base, items });
    assert.ok(parsed, "المحاولة تبقى صالحة");
    assert.equal(parsed.items, undefined, `تفصيل غير صالح: ${JSON.stringify(items).slice(0, 40)}`);
    assert.equal(parsed.score, 2);
    assert.equal(parsed.total, 2);
  }
});
