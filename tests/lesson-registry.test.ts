import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { findLesson, lessonsOfUnit, publishedLessons, validateLessonRegistry, type LessonRegistry } from "../src/lib/lesson-registry";
import { validateBlockKinds, validateLessonPackages, type LessonPackageIndexes } from "../src/lib/lesson-package";
import { assessmentForLesson, practiceForLesson } from "../src/lib/lesson-banks";
import { LESSON_REGISTRY } from "../src/content/lesson-registry";
import type { LessonDraft } from "../src/lib/lesson-publication";
import type { OriginalAssessment } from "../src/lib/assessment";
import type { PracticeBank } from "../src/lib/practice-grading";

const readJson = (path: string) => JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
const lessonOne = readJson("src/content/lesson-1.json") as LessonDraft & { lessonId: number; assessmentRef: string; practiceRef?: string };
const assessmentOne = readJson("src/content/assessments/natural-numbers.json") as OriginalAssessment & { lessonId: number };
const practiceOne = readJson("src/content/practice/natural-numbers.json") as PracticeBank & { lessonId: number };

const indexes = (): LessonPackageIndexes => ({
  lessons: { "lesson-1.json": structuredClone(lessonOne) },
  assessments: { "assessments/natural-numbers.json": structuredClone(assessmentOne) },
  practices: { "practice/natural-numbers.json": structuredClone(practiceOne) },
});
const registry = (): LessonRegistry => structuredClone(LESSON_REGISTRY) as LessonRegistry;

const rx = (text: string) => new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
const asContent = (indexesValue: LessonPackageIndexes) => indexesValue.lessons["lesson-1.json"] as Record<string, any>;
const asBank = (indexesValue: LessonPackageIndexes) => indexesValue.practices["practice/natural-numbers.json"] as Record<string, any>;
const asAssessment = (indexesValue: LessonPackageIndexes) => indexesValue.assessments["assessments/natural-numbers.json"] as Record<string, any>;

/** يطبق عطلًا اصطناعيًا ويتأكد أن الفشل رسالة مدقق عربية تحدد الملف والمسار، لا خطأ JavaScript خام. */
function expectValidatorFailure(mutate: (indexesValue: LessonPackageIndexes) => void, pathPattern: RegExp, problemPattern?: RegExp) {
  const broken = indexes();
  mutate(broken);
  assert.throws(() => validateLessonPackages(LESSON_REGISTRY, broken), (error: unknown) => {
    const message = (error as Error).message;
    assert.match(message, /^حزمة المحتوى \(.+\) ← .+:/, `رسالة غير منسوبة للملف والمسار: ${message}`);
    assert.doesNotMatch(message, /is not a function|Cannot convert|of undefined|of null|not iterable/, `تسرب خطأ JavaScript خام: ${message}`);
    assert.match(message, pathPattern);
    if (problemPattern) assert.match(message, problemPattern);
    return true;
  });
}

const byId = (source: LessonRegistry) => Object.fromEntries(source.lessons.map(lesson => [lesson.id, [lesson.unitId, lesson.order, lesson.title, lesson.status === "published" ? lesson.key : null]]));

test("السجل الحالي: 8 وحدات و33 درسًا، درس واحد منشور فقط", () => {
  assert.equal(LESSON_REGISTRY.units.length, 8);
  assert.equal(LESSON_REGISTRY.lessons.length, 33);
  assert.deepEqual(LESSON_REGISTRY.lessons.map(lesson => lesson.id), Array.from({ length: 33 }, (_, i) => i + 1));
  assert.deepEqual(publishedLessons(LESSON_REGISTRY).map(lesson => lesson.id), [1]);
  const published = publishedLessons(LESSON_REGISTRY)[0];
  assert.equal(published.key, "natural-numbers");
  assert.equal(published.contentRef, "lesson-1.json");
  assert.equal(published.assessmentRef, "assessments/natural-numbers.json");
  assert.equal(published.practiceRef, "practice/natural-numbers.json");
  assert.equal(findLesson(LESSON_REGISTRY, 1)?.title, "الأعداد الطبيعية");
});

test("معرّفات الدروس الحالية وروابطها ثابتة ومطابقة لحزمها", () => {
  const packages = validateLessonPackages(LESSON_REGISTRY, indexes());
  assert.equal(packages.length, 1);
  const [first] = packages;
  assert.equal(first.entry.id, 1);
  assert.equal(first.content.lessonId, 1);
  assert.equal(first.assessment.lessonId, 1);
  assert.equal(first.practice?.lessonId, 1);
  assert.equal(first.content.title, "الأعداد الطبيعية");
  assert.equal(first.assessment.questions.length, 8);
  assert.equal(first.practice?.exercises.length, 6);
  assert.equal(first.content.notebook.length, 4);
  assert.equal(new Set(first.content.notebook.map(section => section.id)).size, 4);
  // الروابط المنشورة هي أرقام المعرّفات نفسها، لا مواضع في قائمة.
  assert.equal(`/lessons/${first.entry.id}`, "/lessons/1");
  assert.deepEqual(lessonsOfUnit(LESSON_REGISTRY, 1).map(lesson => lesson.id), [1, 2, 3, 4, 5, 6]);
});

test("إضافة درس تجريبي اصطناعي لا تغيّر معرّفات الدروس الموجودة", () => {
  const before = registry();
  const after = registry();
  after.lessons.push({ id: 34, unitId: 2, order: 3, title: "درس اختباري اصطناعي", sourcePage: 999, status: "pending" });
  assert.doesNotThrow(() => validateLessonRegistry(after));
  // كل درس قائم يحتفظ بمعرّفه ووحدته وموضعه وعنوانه ومفتاحه تمامًا.
  for (const [id, value] of Object.entries(byId(before))) assert.deepEqual(byId(after)[id], value);
  assert.equal(findLesson(after, 1)?.title, "الأعداد الطبيعية");
  assert.equal(findLesson(after, 34)?.status, "pending");
  // الصفحات المنشورة لا تتغير من وجود درس إضافي.
  assert.deepEqual(publishedLessons(after).map(lesson => lesson.id), [1]);
});

test("تغيير ترتيب الدروس أو قائمتها لا يغيّر هوية أي درس", () => {
  const before = registry();
  const shuffled = registry();
  shuffled.lessons.reverse();
  assert.doesNotThrow(() => validateLessonRegistry(shuffled));
  assert.deepEqual(byId(shuffled), byId(before));
  assert.deepEqual(publishedLessons(shuffled).map(lesson => lesson.id), [1]);

  const swapped = registry();
  const first = swapped.lessons.find(lesson => lesson.id === 2)!;
  const second = swapped.lessons.find(lesson => lesson.id === 3)!;
  [first.order, second.order] = [second.order, first.order];
  assert.doesNotThrow(() => validateLessonRegistry(swapped));
  assert.deepEqual(lessonsOfUnit(swapped, 1).map(lesson => lesson.id), [1, 3, 2, 4, 5, 6]);
  assert.equal(findLesson(swapped, 2)?.title, "الأعداد الصحيحة (الجمع والطرح)");

  const duplicated = registry();
  const duplicateOrder = duplicated.lessons.find(lesson => lesson.id === 2)!;
  duplicateOrder.order = 1;
  assert.throws(() => validateLessonRegistry(duplicated), /lesson-registry\.json.*lessons\[1\]\.order.*مكرر/);
});

test("ربط اختبار أو تمرين بدرس خاطئ يوقف المدقق", () => {
  const reg = registry();
  reg.lessons.push({ id: 34, unitId: 1, order: 7, title: "درس تجريبي", sourcePage: 5, status: "published", key: "synthetic-two", contentRef: "lesson-34.json", assessmentRef: "assessments/lesson-34.json" });
  const wrongBank = indexes();
  wrongBank.lessons["lesson-34.json"] = { ...structuredClone(lessonOne), lessonId: 34, practiceRef: undefined, assessmentRef: "assessments/lesson-34.json" };
  wrongBank.assessments["assessments/lesson-34.json"] = structuredClone(assessmentOne);
  assert.throws(() => validateLessonPackages(reg, wrongBank), /بنك الاختبار مربوط بالدرس 1 لا بالدرس 34/);

  // مرجع اختبار معلن يخالف ما يعلنه المحتوى نفسه.
  const mismatched = registry();
  const firstEntry = mismatched.lessons.find(lesson => lesson.id === 1)! as { assessmentRef: string };
  firstEntry.assessmentRef = "assessments/other.json";
  const otherBank = indexes();
  otherBank.assessments["assessments/other.json"] = structuredClone(assessmentOne);
  assert.throws(() => validateLessonPackages(mismatched, otherBank), /المحتوى يشير إلى "assessments\/natural-numbers\.json"/);
});

test("مرجع سؤال أو حل أو ملف مفقود يوقف المدقق برسالة تحدد المصدر", () => {
  const missingFile = indexes();
  delete missingFile.assessments["assessments/natural-numbers.json"];
  assert.throws(() => validateLessonPackages(LESSON_REGISTRY, missingFile), /assessments\/natural-numbers\.json.*غير موجود في الفهرس/);

  const missingPractice = indexes();
  const contentWithMissingTask = missingPractice.lessons["lesson-1.json"] as LessonDraft & { content: Record<string, { practiceId?: string }[]> };
  const exerciseBlock = Object.values(contentWithMissingTask.content).flat().find(block => block.practiceId);
  assert.ok(exerciseBlock, "الدرس الأول يجب أن يربط تمارينه بمهام تفاعلية");
  exerciseBlock.practiceId = "no-such-task";
  assert.throws(() => validateLessonPackages(LESSON_REGISTRY, missingPractice), /يشير إلى مهمة غير موجودة في بنك التمارين: "no-such-task"/);

  const missingSolution = indexes();
  const content = missingSolution.lessons["lesson-1.json"] as LessonDraft;
  content.solutions = content.solutions.slice(1);
  assert.throws(() => validateLessonPackages(LESSON_REGISTRY, missingSolution), /النشاط لا يرتبط بسؤال موثّق من المصدر/);

  const missingHint = indexes();
  const hintless = missingHint.practices["practice/natural-numbers.json"] as PracticeBank;
  hintless.exercises[0].hints = [];
  assert.throws(() => validateLessonPackages(LESSON_REGISTRY, missingHint), /hints: كل مهمة تحتاج إلى تلميح واحد على الأقل/);

  const orphan = indexes();
  orphan.assessments["assessments/orphan.json"] = structuredClone(assessmentOne);
  assert.throws(() => validateLessonPackages(LESSON_REGISTRY, orphan), /assessments\/orphan\.json.*لا درس منشورًا يعلنه/);
});

test("نوع كتلة أو قيمة تعداد مجهولة تُرفض ولا تُتجاهل", () => {
  assert.throws(() => validateBlockKinds([{ kind: "mystery", origin: "book", text: "نص" }], "x.json", "content.explain"), /نوع كتلة غير معروف: "mystery"/);
  assert.throws(() => validateBlockKinds([{ kind: "bookFigure", origin: "book", figure: "pie" }], "x.json", "content.discover"), /رسم غير معروف/);
  assert.throws(() => validateBlockKinds([{ kind: "labtool", origin: "supplement", tool: "laser" }], "x.json", "content.lab"), /أداة مختبر غير معروفة/);
  assert.throws(() => validateBlockKinds([{ kind: "naturalStudio", origin: "supplement", mode: "planets" }], "x.json", "content.lab"), /وضع مختبر غير معروف/);
  assert.throws(() => validateBlockKinds([{ kind: "explain", origin: "book", text: "نص", extra: 1 }], "x.json", "content.explain"), /حقل غير معروف/);
  assert.throws(() => validateBlockKinds([{ kind: "check", origin: "book", question: "س؟", answer: "ج", options: ["أ", "ب"], correctOption: 5 }], "x.json", "content.check"), /مفتاح السؤال/);
  assert.throws(() => validateBlockKinds([{ kind: "guide", origin: "book", title: "د", sections: [{ title: "ق", blocks: [{ kind: "ghost", origin: "book" }] }] }], "x.json", "content.explain"), /نوع كتلة غير معروف: "ghost"/);
  // المحتوى الحقيقي يمر بكامل أنواعه.
  const stages = (lessonOne as unknown as { content: Record<string, unknown[]> }).content;
  for (const [key, blocks] of Object.entries(stages)) assert.doesNotThrow(() => validateBlockKinds(blocks, "lesson-1.json", `content.${key}`));
  assert.doesNotThrow(() => validateBlockKinds(structuredClone((lessonOne as unknown as { notebook: { blocks: unknown[] }[] }).notebook)[0].blocks, "lesson-1.json", "notebook[0].blocks"));
});

test("درس ناقص أو غير مكتمل لا يُنشر ولا يُفهرس", () => {
  // درس يحمل مراجع محتوى لكن حالته «قيد الإعداد» يُرفض في السجل نفسه.
  const premature = registry();
  const pending = premature.lessons.find(lesson => lesson.id === 2)! as unknown as Record<string, unknown>;
  pending.key = "half-built";
  pending.contentRef = "lesson-1.json";
  pending.assessmentRef = "assessments/natural-numbers.json";
  assert.throws(() => validateLessonRegistry(premature), /الدرس غير المنشور لا يحمل مفتاحًا أو مراجع محتوى/);

  // درس منشور بمرحلة تعليمية فارغة يفشل قبل التصدير.
  const incomplete = registry();
  const entry = incomplete.lessons.find(lesson => lesson.id === 1)!;
  assert.equal(entry.status, "published");
  const brokenIndexes = indexes();
  (brokenIndexes.lessons["lesson-1.json"] as LessonDraft).content.explain = [];
  assert.throws(() => validateLessonPackages(incomplete, brokenIndexes), /الشرح التفصيلي/);

  // الصفحات المتوقعة في التصدير تُشتق من المنشور فقط.
  const expected = publishedLessons(LESSON_REGISTRY).flatMap(lesson => [`lessons/${lesson.id}/index.html`, `quizzes/lesson/${lesson.id}/index.html`]);
  assert.deepEqual(expected, ["lessons/1/index.html", "quizzes/lesson/1/index.html"]);
  const unpublished = LESSON_REGISTRY.lessons.filter(lesson => lesson.status !== "published");
  assert.equal(unpublished.length, 32);
  for (const lesson of unpublished) {
    assert.equal("key" in lesson, false);
    assert.equal("assessmentRef" in lesson, false);
  }
});

test("لا توجد افتراضات غير مبررة تربط النظام بالدرس الأول", () => {
  const offenders: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) { walk(path); continue; }
      if (!/\.(ts|tsx)$/.test(path)) continue;
      const source = readFileSync(path, "utf8");
      if (/lessonId\s*[!=]==\s*1|id\s*[!=]==\s*1\b|\blessons\[0\]/.test(source)) offenders.push(`${path}: ثابت مربوط بالدرس الأول`);
      if (/from "@\/content\/lesson-1\.json"/.test(source) && !path.endsWith(join("src", "content", "lesson-index.ts"))) {
        offenders.push(`${path}: استيراد مباشر لملف الدرس الأول`);
      }
      if (/from "@\/content\/(assessments|practice)\/natural-numbers\.json"/.test(source) && !path.includes(join("src", "content"))) {
        offenders.push(`${path}: استيراد مباشر لبنك الدرس الأول`);
      }
    }
  };
  walk("src");
  assert.deepEqual(offenders, []);
});

test("الدرس الأول يعمل عبر حزمته، والمعرّف المجهول لا يسقط إلى درس آخر", () => {
  const pkg = validateLessonPackages(LESSON_REGISTRY, indexes())[0];
  assert.equal(pkg.entry.id, 1);
  assert.deepEqual(Object.keys(pkg.content.content).sort(), ["apply", "check", "discover", "explain", "intro", "lab", "summary"].sort());
  assert.equal(assessmentForLesson(1)?.questions.length, 8);
  assert.equal(practiceForLesson(1)?.exercises.length, 6);
  assert.equal(assessmentForLesson(2), null);
  assert.equal(practiceForLesson(2), null);
  assert.equal(assessmentForLesson(999), null);
  assert.equal(practiceForLesson(999), null);
  assert.equal(findLesson(LESSON_REGISTRY, 999), undefined);
  assert.equal(findLesson(LESSON_REGISTRY, Number.NaN), undefined);
});

test("F1: حقل زائد في أي كائن حزمة يُرفض برسالة تحدد الملف والمسار", () => {
  expectValidatorFailure(i => { asAssessment(i).questions[0].zzz = 1; }, rx("questions[0].zzz"), /حقل غير معروف في سؤال اختبار/);
  expectValidatorFailure(i => { asContent(i).solutions[0].zzz = 1; }, rx("solutions[0].zzz"), /حقل غير معروف في حل مصدر/);
  expectValidatorFailure(i => { asContent(i).notebook[0].zzz = 1; }, rx("notebook[0].zzz"), /حقل غير معروف في ورقة دفتر/);
  expectValidatorFailure(i => { asBank(i).exercises[0].zzz = 1; }, rx("exercises[0] («count-five»).zzz"), /حقل غير معروف في مهمة تفاعلية/);
  expectValidatorFailure(i => { asBank(i).exercises[0].view.zzz = 1; }, rx("»).view.zzz"), /حقل غير معروف في طريقة تفاعل/);
  expectValidatorFailure(i => { asBank(i).exercises[0].view.fields[0].zzz = 1; }, rx("»).view.fields[0].zzz"), /حقل غير معروف في حقل مهمة/);
  expectValidatorFailure(i => { asBank(i).exercises[0].solution.zzz = 1; }, rx("»).solution.zzz"), /حقل غير معروف في حل مهمة تفاعلية/);
  expectValidatorFailure(i => { asBank(i).exercises[0].solution.steps[0].zzz = 1; }, rx("»).solution.steps[0].zzz"), /حقل غير معروف في خطوة حل/);
  expectValidatorFailure(i => { asBank(i).exercises[0].view.fields[0].choices = ["A", 5]; }, rx("»).view.fields[0].choices[1]"));
});

test("F2: حقل أعلى غير معروف في ملفات الحزم الثلاثة يُرفض بموضعه", () => {
  expectValidatorFailure(i => { asContent(i).zzzUnknown = true; }, /← zzzUnknown:/, /حقل غير معروف في ملف الدرس/);
  expectValidatorFailure(i => { asAssessment(i).zzzUnknown = true; }, /← zzzUnknown:/, /حقل غير معروف في ملف بنك الاختبار/);
  expectValidatorFailure(i => { asBank(i).zzzUnknown = true; }, /← zzzUnknown:/, /حقل غير معروف في ملف بنك التمارين/);
});

test("F3: تلميح فارغ أو مسافات فقط يُرفض بعدد التلميح والمهمة", () => {
  expectValidatorFailure(i => { asBank(i).exercises[0].hints[0] = "   "; }, rx("exercises[0] («count-five»).hints[0]: التلميح 1"), /نصًا غير فارغ/);
  expectValidatorFailure(i => { asBank(i).exercises[0].hints[1] = ""; }, rx("exercises[0] («count-five»).hints[1]: التلميح 2"), /نصًا غير فارغ/);
  expectValidatorFailure(i => { asBank(i).exercises[2].hints[1] = " \t "; }, rx("exercises[2] («twin-fives»).hints[1]: التلميح 2"), /نصًا غير فارغ/);
  expectValidatorFailure(i => { asBank(i).exercises[5].hints = []; }, rx("exercises[5] («neptune-code»).hints"), /تلميح واحد على الأقل/);
  expectValidatorFailure(i => { asBank(i).exercises[0].hints = "تلميح"; }, rx("exercises[0] («count-five»).hints:"), /يجب أن تكون قائمة/);
});

test("F4: بنى الحزم غير الصالحة تُرفض برسائل عربية لا بأخطاء JavaScript خام", () => {
  expectValidatorFailure(i => { asBank(i).exercises = {}; }, /← exercises:/, /قائمة "exercises"/);
  expectValidatorFailure(i => { asBank(i).exercises[0] = "مهمة"; }, rx("exercises[0]:"), /مهمة تفاعلية يجب أن يكون كائن JSON/);
  expectValidatorFailure(i => { delete asBank(i).exercises[0].view; }, rx("exercises[0] («count-five»).view:"), /حقل مطلوب مفقود/);
  expectValidatorFailure(i => { asBank(i).exercises[0].view.fields = "حقول"; }, rx("»).view.fields:"), /حقول المهمة يجب أن تكون قائمة/);
  expectValidatorFailure(i => { asBank(i).exercises[0].view.fields[0].choices = "A"; }, rx("»).view.fields[0].choices:"), /خيار يجب أن تكون قائمة/);
  expectValidatorFailure(i => { asBank(i).exercises[0].mistakes = []; }, rx("»).mistakes:"), /أخطاء المهمة المتوقعة يجب أن يكون كائنًا/);
  expectValidatorFailure(i => { asBank(i).exercises[0].solution.steps = "خطوات"; }, rx("»).solution.steps:"), /خطوات الحل يجب أن تكون قائمة/);
  expectValidatorFailure(i => { asBank(i).exercises[0].solution.steps[0] = { title: "خطوة" }; }, rx("»).solution.steps[0].text:"), /حقل مطلوب مفقود/);
  expectValidatorFailure(i => { asBank(i).exercises[0].solution.final = ""; }, rx("»).solution.final:"), /الجواب النهائي يجب أن يكون نصًا غير فارغ/);
  expectValidatorFailure(i => { asAssessment(i).questions = "أسئلة"; }, /← questions:/, /أسئلة الاختبار يجب أن تكون قائمة/);
  expectValidatorFailure(i => { asAssessment(i).questions[0] = null; }, rx("questions[0]:"), /سؤال اختبار يجب أن يكون كائن JSON/);
  expectValidatorFailure(i => { asAssessment(i).questions[0].options = "خيار"; }, rx("questions[0].options:"), /خيارات السؤال يجب أن تكون قائمة/);
  expectValidatorFailure(i => { asAssessment(i).skills = []; }, /← skills:/, /مهارات الاختبار يجب أن يكون كائنًا/);
  expectValidatorFailure(i => { asContent(i).solutions = "حلول"; }, /← solutions:/, /حلول المصدر يجب أن تكون قائمة/);
  expectValidatorFailure(i => { asContent(i).solutions[0].steps = [1, 2]; }, rx("solutions[0].steps[0]:"), /الخطوة 1 يجب أن يكون نصًا غير فارغ/);
  expectValidatorFailure(i => { asContent(i).notebook = "دفتر"; }, /← notebook:/, /دفتر الطالب يجب أن يكون قائمة أوراق/);
  expectValidatorFailure(i => { asContent(i).notebook[0].blocks = "كتل"; }, rx("notebook[0].blocks:"), /كتل الورقة يجب أن تكون قائمة/);
});

test("F1–F4: الحقول الاختيارية الصحيحة المستخدمة حاليًا لا تُرفض", () => {
  assert.doesNotThrow(() => validateLessonPackages(LESSON_REGISTRY, indexes()));
  const content = asContent(indexes());
  const bank = asBank(indexes());
  const assessment = asAssessment(indexes());
  // حقول اختيارية موجودة فعلًا في المحتوى الحالي وتُقبل كما هي.
  assert.ok(content.solutions.some((solution: any) => typeof solution.law === "string"), "قاعدة اختيارية في حل مصدر");
  assert.ok(content.solutions.some((solution: any) => typeof solution.notes === "string"), "ملاحظات اختيارية في حل مصدر");
  assert.ok(content.solutions.some((solution: any) => Array.isArray(solution.commonMistakes)), "أخطاء شائعة اختيارية");
  assert.ok(bank.exercises.some((exercise: any) => exercise.view.number !== undefined && exercise.view.focusDigit !== undefined), "رقم ورقم مطلوب اختياريان");
  assert.ok(bank.exercises.some((exercise: any) => exercise.view.fields.some((field: any) => Array.isArray(field.choices))), "خيارات حقل اختيارية");
  assert.ok(bank.exercises.some((exercise: any) => exercise.view.fields.some((field: any) => typeof field.max === "number")), "أقصى قيمة اختيارية");
  assert.ok(bank.exercises.some((exercise: any) => typeof exercise.solution.point === "number"), "موضع حل اختياري");
  assert.ok(assessment.questions.some((question: any) => Array.isArray(question.options)), "خيارات سؤال اختيارية");

  // حذف الحقول الاختيارية البحتة يبقى مقبولًا (لا فرض زائد).
  const lean = indexes();
  for (const solution of asContent(lean).solutions) delete solution.law, delete solution.notes, delete solution.commonMistakes;
  for (const exercise of asBank(lean).exercises) delete exercise.solution.point;
  assert.doesNotThrow(() => validateLessonPackages(LESSON_REGISTRY, lean));
});
