import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { test } from "node:test";
import unitOne from "../src/content/unit-exercises/unit-1.json";
import { UNIT_EXERCISES_INDEX, hasUnitExercises, unitExercisesRef } from "../src/content/unit-exercise-index";
import { UNIT_EXERCISE_NOTICE, gradeUnitExercise, validateUnitExercises, type UnitExercise } from "../src/lib/unit-exercises";

const data = validateUnitExercises(unitOne, "unit-exercises/unit-1.json");

test("Unit exercise file validates strictly and is registered for unit 1 only", () => {
  assert.equal(data.unitId, 1);
  assert.equal(data.exercises.length, 25);
  assert.equal(data.groups.length, 5);
  assert.equal(hasUnitExercises(1), true);
  assert.equal(hasUnitExercises(2), false);
  assert.equal(unitExercisesRef(2), null);
  assert.equal(Object.keys(UNIT_EXERCISES_INDEX).length, 1);
});

test("Every textbook exercise number 1–21 from pages 23–26 is covered", () => {
  const numbers = new Set(data.exercises.map(exercise => exercise.number));
  for (let number = 1; number <= 21; number++) assert.ok(numbers.has(number), `التمرين ${number}`);
  for (const exercise of data.exercises) {
    assert.match(exercise.source, /ص\s*(23|24|25|26)/, exercise.key);
    assert.ok([1, 2, 3, 4, 5, 6].includes(exercise.lessonId ?? 0), exercise.key);
    assert.ok(exercise.hints.length >= 2, exercise.key);
    assert.ok(exercise.solution.steps.length >= 3, exercise.key);
  }
  const groupIds = new Set(data.groups.map(group => group.id));
  for (const exercise of data.exercises) assert.ok(groupIds.has(exercise.group), exercise.key);
});

test("Grouping is skill-based and each group links to the right lessons", () => {
  const expected = {
    "number-line-read": [1, 4],
    "number-forms": [1],
    "integer-operations": [2, 3],
    "compare-order": [2, 4],
    applications: [2, 3, 5, 6],
  } as const;
  for (const group of data.groups) assert.deepEqual(group.lessonIds, [...expected[group.id as keyof typeof expected]]);
  const counts = Object.fromEntries(data.groups.map(group => [group.id, data.exercises.filter(exercise => exercise.group === group.id).length]));
  assert.equal(Object.values(counts).reduce((sum, value) => sum + value, 0), data.exercises.length);
  for (const count of Object.values(counts)) assert.ok(count >= 3, "كل مجموعة فيها ثلاثة تمارين على الأقل");
});

const wrongValue = (exercise: UnitExercise, key: string): string => {
  const field = exercise.fields.find(item => item.key === key)!;
  if (field.type === "choice") return (field.choices ?? []).find(choice => choice !== exercise.expected[key])!;
  if (field.type === "range") return String(field.min!);
  return field.type === "integer" ? "987654" : "-987654";
};

const answerFor = (exercise: UnitExercise) => {
  const response = { ...exercise.expected };
  for (const field of exercise.fields) if (field.type === "range") response[field.key] = String((field.min! + field.max!) / 2);
  return response;
};

test("Every documented answer is graded correct, and a wrong value is caught", () => {
  for (const exercise of data.exercises) {
    const feedback = gradeUnitExercise(exercise, answerFor(exercise));
    assert.equal(feedback.correct, true, exercise.key);
    assert.ok(feedback.fields.every(field => field.correct), exercise.key);
    const first = exercise.fields[0];
    const wrong = gradeUnitExercise(exercise, { ...answerFor(exercise), [first.key]: wrongValue(exercise, first.key) });
    assert.equal(wrong.correct, false, exercise.key);
    assert.equal(wrong.fields[0].correct, false, exercise.key);
    assert.ok(wrong.fields[0].message.length > 5, "رسالة تفسير الخطأ");
  }
});

test("Range questions accept any interior number and reject the boundaries", () => {
  const exercise = data.exercises.find(item => item.key === "u1-18")!;
  assert.equal(gradeUnitExercise(exercise, { a: "3.05", b: "0.8", c: "-1.5", d: "0" }).correct, true);
  const boundary = gradeUnitExercise(exercise, { a: "3", b: "0.75", c: "-2", d: "-6.2" });
  assert.equal(boundary.correct, false);
  assert.ok(boundary.fields.every(field => !field.correct));
  const outside = gradeUnitExercise(exercise, { a: "3.5", b: "2", c: "0", d: "7" });
  assert.equal(outside.correct, false);
});

test("Numeric answers are exact: no equality through floating point, no partial strings", () => {
  const sums = data.exercises.find(item => item.key === "u1-08")!;
  assert.equal(gradeUnitExercise(sums, { a: "-9", b: "-3", c: "-2", d: "20" }).correct, true);
  assert.equal(gradeUnitExercise(sums, { a: "-09", b: "-3", c: "-2", d: "20" }).correct, true, "الصفر البادئ لا يغيّر القيمة");
  assert.equal(gradeUnitExercise(sums, { a: "-9abc", b: "-3", c: "-2", d: "20" }).correct, false);
  assert.equal(gradeUnitExercise(sums, { a: "-9", b: "-3", c: "-2", d: "" }).correct, false);
});

test("Unit exercises are independent from lesson progress: no storage keys, no points, no mastery", () => {
  const files = [
    "src/components/UnitExercises.tsx",
    "src/components/unit-exercises/UnitExerciseFigure.tsx",
    "src/lib/unit-exercises.ts",
    "src/app/units/[unitId]/exercises/page.tsx",
  ];
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    assert.ok(!/localStorage\s*[.[]/.test(source), `${file}: لا تخزين محلي`);
    assert.ok(!/math7[-:]/.test(source), `${file}: لا مفاتيح تقدّم دروس`);
    assert.ok(!/lessonStatus|dashboardStats|achievements|skillCards|writeLocal/.test(source), `${file}: لا احتساب نقاط أو إتقان`);
  }
  assert.match(UNIT_EXERCISE_NOTICE, /لا تُضاف نقاطها/);
  assert.match(UNIT_EXERCISE_NOTICE, /خريطة المهارات/);
  // صفحة قسم التمرينات لا تقرأ أي بنك دروس أو اختبارات.
  const page = readFileSync("src/app/units/[unitId]/exercises/page.tsx", "utf8");
  assert.ok(!/assessmentForLesson|practiceForLesson|lessonPackage/.test(page));
});

test("Only units with a declared data file may publish an exercises section", () => {
  const files = readdirSync("src/content/unit-exercises").filter(name => name.endsWith(".json"));
  assert.deepEqual(files, ["unit-1.json"]);
  const index = readFileSync("src/content/unit-exercise-index.ts", "utf8");
  assert.match(index, /1:\s*unitOneExercises/);
  assert.ok(!/2:\s*/.test(index));
});
