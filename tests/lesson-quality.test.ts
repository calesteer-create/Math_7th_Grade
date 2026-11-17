import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { validateOriginalAssessment, isCorrect, normalizeAnswer, displayAnswer, type OriginalAssessment } from "../src/lib/assessment";
import { BOOK_GROUPS, BOOK_NUMBER, BOOK_LINE_POINT, COUNTING_GROUPS, LINE, lineX, placeColumns, FIGURE_SOURCES } from "../src/lib/natural-numbers";
import { STAGES, WHATSAPP_URL } from "../src/lib/site";

const lesson = JSON.parse(readFileSync("src/content/lesson-1.json", "utf8"));
const bank = JSON.parse(readFileSync("src/content/assessments/natural-numbers.json", "utf8")) as OriginalAssessment;

test("the assessment bank is separate from lesson content and notebook", () => {
  assert.equal(lesson.quiz, undefined);
  assert.equal(lesson.assessmentRef, "assessments/natural-numbers.json");
  assert.equal(bank.questions.length, 8);
  assert.doesNotThrow(() => validateOriginalAssessment(lesson, bank));
});
test("all authored questions are original, varied and aligned to the lesson skills", () => {
  assert.deepEqual(new Set(bank.questions.map(q => q.type)), new Set(["mcq", "truefalse", "fill", "problem"]));
  assert.deepEqual(new Set(bank.questions.map(q => q.skill)), new Set(Object.keys(bank.skills)));
  assert.equal(new Set(bank.questions.map(q => q.difficulty)).size, 3);
  for (const q of bank.questions) {
    assert.equal(q.origin, "original");
    assert.ok(q.explanation.length > 40);
    assert.ok(!JSON.stringify(lesson.content).includes(q.question));
    assert.ok(!JSON.stringify(lesson.notebook).includes(q.question));
  }
});
test("validator rejects reused textbook case numbers", () => {
  const copied = structuredClone(bank);
  copied.questions[2].question = "احسب قيمة الرقم 4 في العدد 143282.";
  assert.throws(() => validateOriginalAssessment(lesson, copied), /مكررة/);
});
test("validator rejects a copied exercise, even if labelled original", () => {
  const copied = structuredClone(bank);
  copied.questions[0].question = lesson.solutions[0].question;
  assert.throws(() => validateOriginalAssessment(lesson, copied), /تكرار/);
});
test("validator rejects unsupported skills and incomplete explanations", () => {
  const unsupported = structuredClone(bank);
  unsupported.questions[0].skill = "geometry-not-in-lesson";
  assert.throws(() => validateOriginalAssessment(lesson, unsupported), /بمهارة/);
  const incomplete = structuredClone(bank);
  incomplete.questions[0].explanation = "";
  assert.throws(() => validateOriginalAssessment(lesson, incomplete), /التفسير/);
});
test("mathematical answers to the new cases are correct", () => {
  assert.equal(bank.questions[0].options?.[Number(bank.questions[0].answer)], "0");
  assert.equal(bank.questions[1].options?.[Number(bank.questions[1].answer)], "11 فترة");
  assert.equal(Number(bank.questions[2].answer), Number("678241"[1]) * 10000);
  assert.equal(bank.questions[3].answer, "false");
  assert.equal(bank.questions[4].answer, "2");
  assert.equal(Number(bank.questions[5].answer), 6 * 1000000 + 32 * 1000 + 9);
  assert.equal(Number("12004000006"), 12 * 1000000000 + 4 * 1000000 + 6);
  assert.equal(bank.questions[6].answer, "0");
  assert.equal(Number(bank.questions[7].answer), 2 * 10000 + 9 * 100 + 7);
});
test("grading accepts valid numeric formatting, not numeric prefixes or blank answers", () => {
  assert.equal(isCorrect("70000", "70,000", "problem"), true);
  assert.equal(isCorrect("70000", "٧٠٠٠٠", "problem"), true);
  assert.equal(isCorrect("70000", "70000abc", "problem"), false);
  assert.equal(isCorrect("70000", "70,00", "problem"), false);
  assert.equal(isCorrect("0", "", "fill"), false);
  assert.equal(isCorrect("1", "1.0", "mcq"), false);
  assert.equal(isCorrect("false", "false", "truefalse"), true);
  assert.equal(normalizeAnswer(" ۲۰۹۰۷ "), "20907");
});
test("answer keys display option text, not a hidden index", () => {
  assert.equal(displayAnswer(bank.questions[1]), "11 فترة");
  assert.equal(displayAnswer(bank.questions[3]), "خطأ");
});
test("source groups preserve counts, labels, choices, and dots inside their ellipses", () => {
  assert.deepEqual(BOOK_GROUPS.map(g => g.label), ["A", "B", "C"]);
  assert.deepEqual(BOOK_GROUPS.map(g => g.count), [5, 3, 4]);
  assert.deepEqual(BOOK_GROUPS.map(g => g.option), [400, 4000, 4]);
  for (const group of BOOK_GROUPS) {
    assert.equal(group.dots.length, group.count);
    for (const [x, y] of group.dots) assert.ok(((x - 50) / 32) ** 2 + ((y - 55) / 48) ** 2 < 1);
  }
});
test("counting sequence is exactly the source sequence 0,1,2,3,4", () => {
  assert.deepEqual(COUNTING_GROUPS.map(g => g.length), [0, 1, 2, 3, 4]);
});
test("number line uses increasing equally spaced coordinates, and M at 5", () => {
  assert.equal(BOOK_LINE_POINT, 5);
  for (let i = 1; i <= 12; i++) assert.equal(lineX(i) - lineX(i - 1), LINE.spacing);
  assert.ok(lineX(0) < lineX(12));
  assert.ok(lineX(12) < LINE.width);
});
test("place-value figure preserves all 12 source cells and zeros", () => {
  const cells = placeColumns(BOOK_NUMBER, true);
  assert.equal(cells.length, 12);
  assert.equal(cells.map(c => c.digit).join(""), "083000050002");
  assert.deepEqual(cells.filter((_, i) => i % 3 === 0).map(c => c.group), ["المليارات (البلايين)", "الملايين", "الآلاف", "الوحدات"]);
  assert.equal(cells.reduce((n, c) => n + c.value, 0), Number(BOOK_NUMBER));
  assert.deepEqual(cells.slice(-3).map(c => c.place), ["مئات", "عشرات", "آحاد"]);
});
test("interactive places handle zeros, repeated digits, largest input and empty input accurately", () => {
  assert.deepEqual(placeColumns("525793").filter(c => c.digit === 5).map(c => c.value), [500000, 5000]);
  assert.equal(placeColumns("999999999999").reduce((n, c) => n + c.value, 0), 999999999999);
  assert.deepEqual(placeColumns(""), []);
  assert.deepEqual(placeColumns("abc"), []);
  assert.deepEqual(placeColumns("1234567890123"), []);
  assert.equal(placeColumns("0").reduce((n, c) => n + c.value, 0), 0);
});
test("all figures are source-indexed and notebook remains the last lesson stage", () => {
  assert.equal(Object.keys(FIGURE_SOURCES).length, 4);
  for (const f of Object.values(FIGURE_SOURCES)) assert.ok([3, 4].includes(f.page));
  assert.equal(STAGES.at(-1)?.key, "notebook");
  assert.ok(JSON.stringify(lesson.content).includes('"figure":"warmup"'));
  assert.ok(JSON.stringify(lesson.notebook).includes('"figure":"placeValue"'));
  assert.equal(new URL(WHATSAPP_URL).pathname, "/963930210222");
});
test("English digits remain in lesson and assessment display content", () => {
  assert.ok(!/[\u0660-\u0669\u06f0-\u06f9]/.test(JSON.stringify([lesson, bank])));
});
