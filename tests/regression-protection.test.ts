import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { LESSON_REGISTRY } from "../src/content/lesson-registry";
import { publishedLessons } from "../src/lib/lesson-registry";
import { validateLessonPackages } from "../src/lib/lesson-package";
import { LESSON_CONTENT_INDEX } from "../src/content/lesson-index";
import { ASSESSMENT_INDEX } from "../src/content/assessment-index";
import { PRACTICE_INDEX } from "../src/content/practice-index";
import { STAGES } from "../src/lib/site";

const sha256 = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");
const fingerprints = JSON.parse(readFileSync("tests/fixtures/regression-fingerprints.json", "utf8")) as { base: string; files: Record<string, string> };
const files = fingerprints.files;

test("StudentNotebook and its CSS are byte-identical to the approved base branch", () => {
  assert.equal(sha256("src/components/StudentNotebook.tsx"), files["src/components/StudentNotebook.tsx"], "StudentNotebook تغيّر");
  assert.equal(sha256("src/app/learning-activities.css"), files["src/app/learning-activities.css"], "CSS دفتر الطالب تغيّر");
  const notebook = readFileSync("src/components/StudentNotebook.tsx", "utf8");
  assert.match(notebook, /data-student-copybook="true"/);
  assert.match(notebook, /math7:copybook:/);
  assert.match(notebook, /window\.print\(\)/);
  const css = readFileSync("src/app/learning-activities.css", "utf8");
  for (const selector of [".copybook-intro", ".copybook-toolbar", ".copybook-tabs", ".copybook-sheet", ".copybook-writing-task", ".copybook-personal-note"]) {
    assert.ok(css.includes(selector), selector);
  }
});

test("Lessons 1–4 content, practice banks and assessments are byte-identical to the base branch", () => {
  const frozen = [
    "src/content/lesson-1.json", "src/content/lesson-2.json", "src/content/lesson-3.json", "src/content/lesson-4.json",
    "src/content/practice/natural-numbers.json", "src/content/practice/integers-add-sub.json",
    "src/content/practice/integers-mul-div.json", "src/content/practice/rational-numbers.json",
    "src/content/assessments/natural-numbers.json", "src/content/assessments/integers-add-sub.json",
    "src/content/assessments/integers-mul-div.json", "src/content/assessments/rational-numbers.json",
  ];
  for (const file of frozen) assert.equal(sha256(file), files[file], `${file} تغيّر`);
});

test("Progress, mastery, quiz and lesson shell files are unchanged, so no regression in scoring", () => {
  for (const file of ["src/lib/lesson-progress.ts", "src/lib/skill-mastery.ts", "src/lib/local-progress.ts", "src/components/QuizPlayer.tsx", "src/components/LessonShell.tsx"]) {
    assert.equal(sha256(file), files[file], `${file} تغيّر`);
  }
});

test("Published lessons 1–4 keep their identity, order and package references", () => {
  const published = publishedLessons(LESSON_REGISTRY).map(lesson => [lesson.id, lesson.key, lesson.title, lesson.contentRef, lesson.assessmentRef, lesson.practiceRef]);
  assert.deepEqual(published.slice(0, 4), [
    [1, "natural-numbers", "الأعداد الطبيعية", "lesson-1.json", "assessments/natural-numbers.json", "practice/natural-numbers.json"],
    [2, "integers-add-sub", "الأعداد الصحيحة (الجمع والطرح)", "lesson-2.json", "assessments/integers-add-sub.json", "practice/integers-add-sub.json"],
    [3, "integers-mul-div", "الأعداد الصحيحة (الضرب والقسمة)", "lesson-3.json", "assessments/integers-mul-div.json", "practice/integers-mul-div.json"],
    [4, "rational-numbers", "الأعداد العادية", "lesson-4.json", "assessments/rational-numbers.json", "practice/rational-numbers.json"],
  ]);
});

test("Previous lessons still validate through the shared package validator, and notebook stays last", () => {
  const packages = validateLessonPackages(LESSON_REGISTRY, {
    lessons: LESSON_CONTENT_INDEX, assessments: ASSESSMENT_INDEX, practices: PRACTICE_INDEX,
  });
  for (const id of [1, 2, 3, 4]) {
    const item = packages.find(pkg => pkg.entry.id === id);
    assert.ok(item, `الحزمة ${id}`);
    assert.equal(item.content.notebook.length, 4);
    assert.ok(item.assessment.questions.length >= 8);
    assert.ok((item.practice?.exercises.length ?? 0) >= 6);
  }
  assert.equal(STAGES.at(-1)?.key, "notebook");
});

test("New studios and practice widgets are additive: old block kinds and figures remain registered", () => {
  const content = readFileSync("src/lib/lesson-content.ts", "utf8");
  for (const kind of ["lead", "book", "explain", "def", "law", "example", "steps", "mistake", "note", "math", "check", "summary", "activity", "exercise", "guide", "labtool", "naturalStudio", "integersStudio", "integersMulDivStudio", "rationalStudio", "operationsStudio", "coordinateStudio", "bookFigure"]) {
    assert.ok(content.includes(`"${kind}"`), `نوع الكتلة ${kind}`);
  }
  const renderer = readFileSync("src/components/ContentRenderer.tsx", "utf8");
  for (const studio of ["NaturalNumbersStudio", "IntegersStudio", "IntegersMulDivStudio", "RationalNumbersStudio", "OperationsStudio", "CoordinateStudio"]) {
    assert.ok(renderer.includes(studio), studio);
  }
  const widgets = readFileSync("src/components/practice/PracticeWidgets.tsx", "utf8");
  for (const prefix of ["int-", "muldiv-", "rat-", "op-", "cp-"]) assert.ok(widgets.includes(`startsWith("${prefix}")`), prefix);
});

test("Notebook content of the new lessons uses writing-only blocks", () => {
  for (const file of ["src/content/lesson-5.json", "src/content/lesson-6.json"]) {
    const lesson = JSON.parse(readFileSync(file, "utf8")) as { notebook: { blocks: { kind: string }[] }[] };
    for (const sheet of lesson.notebook) {
      for (const block of sheet.blocks) {
        assert.ok(!["summary", "exercise", "guide", "check", "labtool", "naturalStudio", "integersStudio", "integersMulDivStudio", "rationalStudio", "operationsStudio", "coordinateStudio"].includes(block.kind), `${file}: ${block.kind}`);
      }
    }
  }
});
