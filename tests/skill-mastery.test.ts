import assert from "node:assert/strict";
import { test } from "node:test";
import type { QuizAttempt } from "../src/lib/local-progress";
import {
  MIN_EVIDENCE, classifySkill, skillCards, skillsSummary, statusLabelOf, trendLabel,
  type SkillDefinition,
} from "../src/lib/skill-mastery";

const definitions: SkillDefinition[] = [
  { key: "counting", label: "العدّ", lessonId: 1, questions: 1 },
  { key: "number-line", label: "خط الأعداد", lessonId: 1, questions: 1 },
  { key: "place-value", label: "قيمة المنزلة", lessonId: 1, questions: 3 },
  { key: "reading", label: "قراءة الأعداد", lessonId: 1, questions: 1 },
  { key: "writing", label: "كتابة الأعداد", lessonId: 1, questions: 2 },
];

/** محاولة مفصّلة: outcomes = [صحيحة؟...] لكل سؤال في المهارة. */
function attempt(lessonId: number, outcomes: Record<string, boolean[]>, date = "2026-01-01T10:00:00.000Z"): QuizAttempt {
  const items = Object.entries(outcomes).flatMap(([skill, flags]) =>
    flags.map((correct, index) => ({ id: 0, skill, correct })));
  items.forEach((item, index) => { item.id = index + 1; });
  const correct = items.filter(item => item.correct).length;
  return { title: "اختبار", score: correct, total: items.length, date, lessonId, items };
}

const cardsOf = (attempts: QuizAttempt[], defs: SkillDefinition[] = definitions) => skillCards(defs, attempts);
const card = (attempts: QuizAttempt[], key: string, defs: SkillDefinition[] = definitions) =>
  cardsOf(attempts, defs).find(item => item.key === key)!;

test("التصنيف: العتبات والحد الأدنى للأدلة", () => {
  assert.equal(MIN_EVIDENCE, 2);
  assert.equal(classifySkill(0, 0), "no-evidence");
  assert.equal(classifySkill(1, 1), "insufficient", "سؤال واحد لا يكفي للحكم");
  assert.equal(classifySkill(1, 2), "developing", "50٪ بالضبط");
  assert.equal(classifySkill(0, 2), "needs-review");
  assert.equal(classifySkill(2, 2), "mastered");
  assert.equal(classifySkill(4, 5), "mastered", "80٪ بالضبط");
  assert.equal(classifySkill(3, 4), "developing", "75٪");
  assert.equal(classifySkill(7, 9), "developing", "77.8٪");
  assert.equal(classifySkill(1, 3), "needs-review", "33٪");
  assert.equal(classifySkill(3, 3), "mastered");
  assert.equal(classifySkill(-1, 2), "no-evidence");
  assert.equal(classifySkill(3, 2), "no-evidence");
  assert.equal(classifySkill(1.5, 2), "no-evidence");
  assert.equal(statusLabelOf("insufficient"), "دليل غير كافٍ");
  assert.equal(statusLabelOf("no-evidence"), "لا دليل بعد");
  assert.equal(statusLabelOf("mastered"), "متقنة");
  assert.equal(statusLabelOf("developing"), "قيد التثبيت");
  assert.equal(statusLabelOf("needs-review"), "تحتاج مراجعة");
});

test("لا إتقان من سؤال واحد، ولا حكم قبل أي محاولة", () => {
  const single = card([attempt(1, { counting: [true] })], "counting");
  assert.equal(single.status, "insufficient");
  assert.equal(single.correct, 1);
  assert.equal(single.total, 1);
  assert.equal(single.trend, null);

  const none = card([], "reading");
  assert.equal(none.status, "no-evidence");
  assert.equal(none.total, 0);
});

test("آخر محاولة مفصّلة تحلّ محل السابقة (تحسّن وتراجع)", () => {
  const improved = card([
    attempt(1, { writing: [true, false] }, "2026-01-01T10:00:00.000Z"),
    attempt(1, { writing: [true, true] }, "2026-02-01T10:00:00.000Z"),
  ], "writing");
  assert.equal(improved.status, "mastered");
  assert.equal(improved.correct, 2);
  assert.equal(improved.attempts, 2);
  assert.equal(improved.trend, "up");

  const regressed = card([
    attempt(1, { writing: [true, true] }, "2026-01-01T10:00:00.000Z"),
    attempt(1, { writing: [true, false] }, "2026-02-01T10:00:00.000Z"),
  ], "writing");
  assert.equal(regressed.status, "developing");
  assert.equal(regressed.correct, 1);
  assert.equal(regressed.trend, "down");
});

test("لا جمع بين المحاولات: هجوم الاتحاد لا ينجح", () => {
  // المحاولة الأولى فيها السؤال 1 صحيحة، والثانية فيها السؤال 2 صحيحة فقط.
  const union = card([
    attempt(1, { writing: [true, false] }, "2026-01-01T10:00:00.000Z"),
    attempt(1, { writing: [false, true] }, "2026-02-01T10:00:00.000Z"),
  ], "writing");
  assert.equal(union.correct, 1, "الأحدث فقط: 1 من 2");
  assert.equal(union.total, 2);
  assert.equal(union.status, "developing", "لو جُمعت لصارت 2/2 متقنة");
});

test("تكرار المحاولة نفسها خمس مرات لا يضخّم النتيجة", () => {
  const repeated = card(Array.from({ length: 5 }, (_, index) =>
    attempt(1, { "place-value": [true, false, true] }, `2026-0${index + 1}-01T10:00:00.000Z`)), "place-value");
  assert.equal(repeated.correct, 2);
  assert.equal(repeated.total, 3);
  assert.equal(repeated.status, "developing");
  assert.equal(repeated.attempts, 5);
});

test("المحاولات بلا تفصيل أو بتفصيل ناقص لا تعطي أدلة", () => {
  const legacy: QuizAttempt = { title: "قديم", score: 8, total: 8, date: "2025-09-01T08:00:00.000Z", lessonId: 1 };
  const legacyCard = card([legacy], "place-value");
  assert.equal(legacyCard.status, "no-evidence");
  assert.equal(legacyCard.total, 0);

  const partial: QuizAttempt = { ...legacy, items: [{ id: 1, skill: "place-value", correct: true }] };
  assert.equal(card([partial], "place-value").total, 0, "التفصيل الناقص لا يُحتسب");
});

test("مهارة في أكثر من درس تُجمع من آخر محاولة في كل درس", () => {
  const twoLessons: SkillDefinition[] = [
    { key: "place-value", label: "قيمة المنزلة", lessonId: 1, questions: 2 },
    { key: "place-value", label: "قيمة المنزلة", lessonId: 2, questions: 2 },
  ];
  const cards = cardsOf([
    attempt(1, { "place-value": [true, true] }, "2026-01-01T10:00:00.000Z"),
    attempt(2, { "place-value": [true, false] }, "2026-01-05T10:00:00.000Z"),
  ], twoLessons);
  assert.equal(cards.length, 1);
  assert.equal(cards[0].correct, 3);
  assert.equal(cards[0].total, 4);
  assert.equal(cards[0].status, "developing", "75٪ أقل من 80٪");
});

test("مهارة غير معلنة في الكتالوج لا تُنشئ بطاقة", () => {
  const cards = cardsOf([attempt(1, { mystery: [true, true] })]);
  assert.equal(cards.some(item => item.key === "mystery"), false);
  assert.equal(cards.length, definitions.length);
});

test("الاتجاه يتساوى عند تساوي النسبة ويظهر بنص عربي", () => {
  const same = card([
    attempt(1, { "place-value": [true, false, true] }, "2026-01-01T10:00:00.000Z"),
    attempt(1, { "place-value": [true, true, false] }, "2026-02-01T10:00:00.000Z"),
  ], "place-value");
  assert.equal(same.trend, "same");
  assert.equal(trendLabel("same"), "→ لا تغيير منذ المحاولة المفصّلة السابقة");
  assert.equal(trendLabel("up"), "↑ تحسّنت منذ المحاولة المفصّلة السابقة");
  assert.equal(trendLabel("down"), "↓ تراجعت منذ المحاولة المفصّلة السابقة");
  assert.equal(trendLabel(null), null);
});

test("الشرح العربي يذكر العدد ويؤكد أن قلة الأدلة ليست ضعفًا", () => {
  const insufficient = card([attempt(1, { counting: [true] })], "counting");
  assert.match(insufficient.note, /1 من 1/);
  assert.match(insufficient.note, /لا تعني ضعفًا/);

  const mastered = card([attempt(1, { writing: [true, true] })], "writing");
  assert.match(mastered.note, /2 من 2/);

  const none = card([], "reading");
  assert.match(none.note, /ليس ضعفًا/);

  const review = card([attempt(1, { "place-value": [false, false, true] })], "place-value");
  assert.match(review.note, /1 من 3/);
});

test("روابط التوجيه تذهب إلى المرحلة المناسبة", () => {
  const none = card([], "reading");
  assert.equal(none.guidance.href, "/lessons/1?stage=quiz");
  const mastered = card([attempt(1, { writing: [true, true] })], "writing");
  assert.equal(mastered.guidance.href, "/lessons/1?stage=check");
  const insufficient = card([attempt(1, { counting: [true] })], "counting");
  assert.equal(insufficient.guidance.href, "/lessons/1?stage=quiz");
  const review = card([attempt(1, { "place-value": [false, false, true] })], "place-value");
  assert.equal(review.guidance.href, "/lessons/1?stage=check");
});

test("ملخص المهارات يعدّ الحالات بدقة", () => {
  const cards = cardsOf([
    attempt(1, {
      counting: [true],
      "number-line": [true],
      "place-value": [true, true, true],
      writing: [true, true],
      reading: [false, false],
    }),
  ]);
  const summary = skillsSummary(cards);
  assert.equal(summary.total, 5);
  assert.equal(summary.mastered, 2, "place-value وwriting");
  assert.equal(summary.developing, 0);
  assert.equal(summary.needsWork, 1, "reading");
  assert.equal(summary.withoutEvidence, 2, "counting وnumber-line");
});
