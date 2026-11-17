import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import katex from "katex";
import { splitMathText, splitLtrTokens, assertMathText, assertValidTeX, hasSourcePage } from "../src/lib/math-text";
import { validateBlockPresentation, validateLessonPresentation, validateAssessmentPresentation } from "../src/lib/lesson-presentation";
import { EXTRA_EXPLANATION_LABEL, type Block } from "../src/lib/lesson-content";
import { validateOriginalAssessment, type OriginalAssessment } from "../src/lib/assessment";
import type { LessonDraft } from "../src/lib/lesson-publication";

const lesson = JSON.parse(readFileSync("src/content/lesson-1.json", "utf8")) as LessonDraft;
const assessment = JSON.parse(readFileSync("src/content/assessments/natural-numbers.json", "utf8")) as OriginalAssessment;

test("the expanded lesson and assessment obey shared presentation rules", () => {
  assert.doesNotThrow(() => validateLessonPresentation(lesson));
  assert.doesNotThrow(() => validateAssessmentPresentation(assessment));
  assert.doesNotThrow(() => validateOriginalAssessment(lesson, assessment));
  assert.equal(EXTRA_EXPLANATION_LABEL, "شرح إضافي للكتاب");
});
test("expanded explanation is organized into six guided ideas, not a wall of prose", () => {
  const guide = lesson.content.explain.find(block => block.kind === "guide");
  assert.ok(guide && guide.kind === "guide");
  assert.equal(guide.sections.length, 6);
  assert.deepEqual(guide.sections.map(s => s.title), ["الرقم والعدد", "قيمة المنزلة", "نحلّ مثالًا", "الأعداد الكبيرة", "الصيغ الثلاث", "أتأكد من فهمي"]);
  assert.ok(guide.sections.every(section => section.blocks.length >= 3));
  assert.ok(JSON.stringify(guide).includes("143282"));
  assert.ok(JSON.stringify(guide).includes("83000050002"));
  assert.ok(guide.sections.flatMap(section => section.blocks).some(b => b.kind === "check" && b.options?.length));
});
test("source pages remain in internal metadata and exercise cards", () => {
  assert.ok(hasSourcePage(lesson.source));
  const exercises = lesson.content.apply.filter(block => block.kind === "exercise");
  assert.equal(exercises.length, 6);
  for (const block of exercises) assert.ok(hasSourcePage(block.source ?? ""));
  assert.doesNotThrow(() => validateBlockPresentation({ kind: "book", origin: "book", title: "الفكرة", text: "نبدأ بالصفر.", source: "ص 3" }));
  assert.throws(() => validateBlockPresentation({ kind: "explain", origin: "supplement", text: "راجع الصفحة 3." }), /التمارين فقط/);
  assert.doesNotThrow(() => validateBlockPresentation({ kind: "exercise", origin: "book", title: "تدريب", text: "أجب عن التمرين.", source: "ص 4" }));
});
test("provenance must be explicit before publishing future lessons", () => {
  assert.throws(() => validateBlockPresentation({ kind: "explain", text: "فكرة جديدة" } as Block), /أصل كل كتلة/);
  assert.doesNotThrow(() => validateBlockPresentation({ kind: "explain", origin: "supplement", text: "فكرة جديدة" }));
});
test("inline expressions are parsed separately from Arabic without losing operands", () => {
  const text = String.raw`نحسب \(4\times10000=40000\)، ثم نراجع النتيجة.`;
  assert.deepEqual(splitMathText(text), [
    { kind: "text", value: "نحسب " }, { kind: "math", value: String.raw`4\times10000=40000` }, { kind: "text", value: "، ثم نراجع النتيجة." },
  ]);
  assert.doesNotThrow(() => assertMathText(text));
  assert.ok(splitLtrTokens("المسافة 20 m الآن").includes("20 m"));
});
test("raw relations, malformed math and unsafe commands are rejected", () => {
  assert.throws(() => assertMathText("نحسب 4 × 100 = 400."), /KaTeX/);
  assert.throws(() => assertMathText("نبسّط x+2."), /KaTeX/);
  assert.throws(() => assertMathText("قارن a/b."), /KaTeX/);
  assert.doesNotThrow(() => assertMathText("السرعة 20 m/s."));
  assert.throws(() => assertMathText(String.raw`نحسب \(4+5 دون إغلاق`), /غير مكتملة/);
  assert.throws(() => assertValidTeX(String.raw`\frac{1}{`));
  assert.throws(() => assertValidTeX(String.raw`\href{javascript:alert(1)}{x}`), /غير مسموح/);
});
test("fractions are vertical, but standard compound units stay linear", () => {
  const fraction = katex.renderToString(String.raw`\frac{3}{4}`, { throwOnError: true, strict: "error" });
  assert.match(fraction, /class="mfrac"/);
  const quantity = katex.renderToString(String.raw`20\,\mathrm{m/s}`, { throwOnError: true, strict: "error" });
  assert.doesNotMatch(quantity, /class="mfrac"/);
  assert.match(quantity, /20/);
});
test("source detection does not confuse Arabic words with page citations", () => {
  assert.equal(hasSourcePage("المصدر: ص 4"), true);
  assert.equal(hasSourcePage("راجع الصفحة 3"), true);
  assert.equal(hasSourcePage("العدد ناقص 4"), false);
  assert.equal(hasSourcePage("نص 3 أسطر"), false);
});
