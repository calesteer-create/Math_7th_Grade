// مدقق حزم المحتوى: يربط كل درس منشور بحزمته (المحتوى + بنك الأسئلة + بنك التمارين)
// ويوقف البناء عند أي مرجع مفقود أو ربط خاطئ أو نوع كتلة مجهول.
import type { OriginalAssessment } from "@/lib/assessment";
import { CONTENT_BLOCK_KINDS, FIGURE_KINDS, INTEGER_MUL_DIV_STUDIO_MODES, INTEGER_STUDIO_MODES, LAB_TOOLS, STUDIO_MODES, type Block, type NotebookSection } from "@/lib/lesson-content";
import { validateLessonPublication, type LessonDraft } from "@/lib/lesson-publication";
import { validatePracticeBank, type PracticeBank } from "@/lib/practice-grading";
import { findUnit, publishedLessons, validateLessonRegistry, type LessonRegistry, type PublishedLessonRecord } from "@/lib/lesson-registry";
import { STAGES } from "@/lib/site";

export type ContentIndex = Record<string, unknown>;
export type LessonPackageIndexes = { lessons: ContentIndex; assessments: ContentIndex; practices: ContentIndex };
export type LessonContentFile = LessonDraft & { lessonId?: number; assessmentRef: string; practiceRef?: string };
export type AssessmentFile = OriginalAssessment & { lessonId?: number };
export type PracticeFile = PracticeBank & { lessonId?: number };
export type ResolvedLessonPackage = { entry: PublishedLessonRecord; content: LessonContentFile; assessment: AssessmentFile; practice: PracticeFile | null };

const REQUIRED: Record<string, string[]> = {
  lead: ["text"], book: ["text"], explain: ["text"], def: ["term", "text"], law: [], example: ["steps"], steps: ["steps"],
  mistake: ["text"], note: ["text"], math: ["tex"], check: ["question", "answer"], summary: ["items"], activity: ["text"],
  exercise: ["title", "text", "source"], guide: ["title", "sections"], labtool: ["tool"], naturalStudio: [], integersStudio: [], integersMulDivStudio: [], bookFigure: ["figure"],
};
const ALLOWED: Record<string, string[]> = {
  lead: ["title", "text"], book: ["title", "text"], explain: ["title", "text"], def: ["term", "text"],
  law: ["title", "formula", "text", "note"], example: ["title", "steps", "result"], steps: ["title", "steps"],
  mistake: ["title", "text"], note: ["title", "text"], math: ["tex", "caption"],
  check: ["question", "answer", "hint", "options", "correctOption"], summary: ["title", "items"], activity: ["title", "text"],
  exercise: ["title", "text", "source", "figure", "practiceId"], guide: ["title", "intro", "sections"],
  labtool: ["tool"], naturalStudio: ["mode"], integersStudio: ["mode"], integersMulDivStudio: ["mode"], bookFigure: ["figure"],
};
const STRING_FIELDS = ["title", "text", "term", "note", "caption", "question", "answer", "hint", "result", "intro", "source", "tex", "formula"];
const LIST_FIELDS = ["steps", "items", "options"];
const PROVENANCE_FIELDS = ["kind", "origin", "source"];
const STAGE_KEYS = new Set(STAGES.map(stage => stage.key));

function fail(source: string, path: string, problem: string): never {
  throw new Error(`حزمة المحتوى (${source}) ← ${path}: ${problem}`);
}

const isText = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const isTextList = (value: unknown): value is string[] => Array.isArray(value) && value.length > 0 && value.every(isText);

/** يرفض أي نوع كتلة غير معروف، وأي حقل زائد أو ناقص، وأي قيمة تعداد خارج القائمة المعروفة. */
export function validateBlockKinds(blocks: unknown, source: string, path: string, depth = 0): asserts blocks is Block[] {
  if (depth > 4) fail(source, path, "الشرح متداخل أكثر من اللازم.");
  if (!Array.isArray(blocks)) fail(source, path, "يجب أن تكون الكتل قائمة.");
  for (const [index, value] of blocks.entries()) {
    const at = `${path}[${index}]`;
    if (!value || typeof value !== "object" || Array.isArray(value)) fail(source, at, "كتلة غير صالحة.");
    const block = value as Record<string, unknown>;
    const kind = block.kind;
    if (typeof kind !== "string" || !(CONTENT_BLOCK_KINDS as readonly string[]).includes(kind)) {
      fail(source, `${at}.kind`, `نوع كتلة غير معروف: ${JSON.stringify(kind)}؛ الأنواع المعروفة: ${CONTENT_BLOCK_KINDS.join(", ")}.`);
    }
    if (!(kind in ALLOWED)) fail(source, `${at}.kind`, `النوع "${kind}" غير مدعوم في المدقق.`);
    const allowed = new Set([...PROVENANCE_FIELDS, ...ALLOWED[kind]]);
    for (const key of Object.keys(block)) {
      if (!allowed.has(key)) fail(source, `${at}.${key}`, `حقل غير معروف في كتلة "${kind}".`);
    }
    for (const key of REQUIRED[kind]) {
      if (!(key in block)) fail(source, `${at}.${key}`, `حقل مطلوب مفقود في كتلة "${kind}".`);
    }
    if (!["book", "supplement"].includes(block.origin as string)) fail(source, `${at}.origin`, "أصل الكتلة يجب أن يكون book أو supplement.");
    if (block.source !== undefined && !isText(block.source)) fail(source, `${at}.source`, "إحالة المصدر يجب أن تكون نصًا غير فارغ.");
    for (const key of STRING_FIELDS) {
      if (block[key] !== undefined && block[key] !== "" && typeof block[key] !== "string") fail(source, `${at}.${key}`, "يجب أن يكون نصًا.");
    }
    for (const key of LIST_FIELDS) {
      if (block[key] !== undefined && !isTextList(block[key])) fail(source, `${at}.${key}`, "يجب أن تكون قائمة نصية غير فارغة.");
    }
    if (kind === "law" && !isText(block.formula) && !isText(block.text)) fail(source, `${at}`, "كتلة القانون تحتاج صيغة أو نصًا.");
    if (kind === "exercise" && block.practiceId !== undefined && !isText(block.practiceId)) fail(source, `${at}.practiceId`, "معرّف المهمة يجب أن يكون نصًا.");
    if (kind === "exercise" && block.figure !== undefined && !(FIGURE_KINDS as readonly unknown[]).includes(block.figure)) {
      fail(source, `${at}.figure`, `رسم غير معروف: ${JSON.stringify(block.figure)}.`);
    }
    if (kind === "bookFigure" && !(FIGURE_KINDS as readonly unknown[]).includes(block.figure)) {
      fail(source, `${at}.figure`, `رسم غير معروف: ${JSON.stringify(block.figure)}.`);
    }
    if (kind === "labtool" && !(LAB_TOOLS as readonly unknown[]).includes(block.tool)) fail(source, `${at}.tool`, `أداة مختبر غير معروفة: ${JSON.stringify(block.tool)}.`);
    if (kind === "naturalStudio" && block.mode !== undefined && !(STUDIO_MODES as readonly unknown[]).includes(block.mode)) {
      fail(source, `${at}.mode`, `وضع مختبر غير معروف: ${JSON.stringify(block.mode)}.`);
    }
    if (kind === "integersStudio" && block.mode !== undefined && !(INTEGER_STUDIO_MODES as readonly unknown[]).includes(block.mode)) {
      fail(source, `${at}.mode`, `وضع مختبر غير معروف: ${JSON.stringify(block.mode)}.`);
    }
    if (kind === "integersMulDivStudio" && block.mode !== undefined && !(INTEGER_MUL_DIV_STUDIO_MODES as readonly unknown[]).includes(block.mode)) {
      fail(source, `${at}.mode`, `وضع مختبر غير معروف: ${JSON.stringify(block.mode)}.`);
    }
    if (kind === "check") {
      if (block.options !== undefined) {
        if (!isTextList(block.options) || block.options.length < 2) fail(source, `${at}.options`, "سؤال التحقق يحتاج خيارين صالحين على الأقل.");
        if (!Number.isInteger(block.correctOption) || (block.correctOption as number) < 0 || (block.correctOption as number) >= block.options.length) {
          fail(source, `${at}.correctOption`, "مفتاح السؤال يجب أن يشير إلى خيار موجود.");
        }
      } else if (block.correctOption !== undefined) {
        fail(source, `${at}.correctOption`, "مفتاح بلا خيارات غير صالح.");
      }
    }
    if (kind === "guide") {
      if (!Array.isArray(block.sections) || !block.sections.length) fail(source, `${at}.sections`, "مسار الشرح يحتاج أقسامًا.");
      for (const [sectionIndex, section] of (block.sections as unknown[]).entries()) {
        const sectionPath = `${at}.sections[${sectionIndex}]`;
        if (!section || typeof section !== "object" || Array.isArray(section)) fail(source, sectionPath, "قسم غير صالح.");
        const record = section as Record<string, unknown>;
        for (const key of Object.keys(record)) if (!["title", "blocks"].includes(key)) fail(source, `${sectionPath}.${key}`, "حقل غير معروف في قسم الشرح.");
        if (!isText(record.title)) fail(source, `${sectionPath}.title`, "عنوان القسم مطلوب.");
        validateBlockKinds(record.blocks, source, `${sectionPath}.blocks`, depth + 1);
      }
    }
  }
}


// ————— مخططات الحزم: ترفض أي حقل مجهول وأي بنية غير صالحة قبل أي عملية على مصفوفة —————
type Schema = { allowed: readonly string[]; required: readonly string[]; label: string };

const SCHEMAS = {
  lessonFile: {
    label: "ملف الدرس",
    allowed: ["lessonId", "title", "goals", "source", "sourcePage", "content", "notebook", "solutions", "assessmentRef", "practiceRef"],
    required: ["title", "goals", "source", "content", "notebook", "solutions", "assessmentRef"],
  },
  sourceSolution: {
    label: "حل مصدر",
    allowed: ["order", "title", "source", "question", "answer", "law", "notes", "commonMistakes", "steps"],
    required: ["order", "title", "source", "question", "answer", "steps"],
  },
  notebookSheet: {
    label: "ورقة دفتر",
    allowed: ["id", "title", "writingTask", "blocks"],
    required: ["id", "title", "writingTask", "blocks"],
  },
  assessmentFile: {
    label: "ملف بنك الاختبار",
    allowed: ["lessonId", "revision", "source", "skills", "questions"],
    required: ["revision", "source", "skills", "questions"],
  },
  question: {
    label: "سؤال اختبار",
    allowed: ["origin", "skill", "type", "question", "options", "answer", "explanation", "difficulty"],
    required: ["origin", "skill", "type", "question", "answer", "explanation", "difficulty"],
  },
  practiceFile: {
    label: "ملف بنك التمارين",
    allowed: ["lessonId", "revision", "exercises"],
    required: ["revision", "exercises"],
  },
  exercise: {
    label: "مهمة تفاعلية",
    allowed: ["key", "sourceOrder", "view", "expected", "hints", "mistakes", "solution"],
    required: ["key", "sourceOrder", "view", "expected", "hints", "mistakes", "solution"],
  },
  view: {
    label: "طريقة تفاعل",
    allowed: ["kind", "title", "instruction", "fields", "number", "focusDigit"],
    required: ["kind", "title", "instruction", "fields"],
  },
  viewField: {
    label: "حقل مهمة",
    allowed: ["key", "label", "type", "choices", "max"],
    required: ["key", "label", "type"],
  },
  practiceSolution: {
    label: "حل مهمة تفاعلية",
    allowed: ["steps", "final", "point"],
    required: ["steps", "final"],
  },
  solutionStep: {
    label: "خطوة حل",
    allowed: ["title", "text", "formula"],
    required: ["title", "text"],
  },
} satisfies Record<string, Schema>;

const pathOf = (path: string, key: string) => (path ? `${path}.${key}` : key);

function checkSchema(value: unknown, source: string, path: string, schema: Schema): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(source, path || "الملف", `${schema.label} يجب أن يكون كائن JSON.`);
  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (!schema.allowed.includes(key)) fail(source, pathOf(path, key), `حقل غير معروف في ${schema.label}.`);
  }
  for (const key of schema.required) {
    if (!(key in record)) fail(source, pathOf(path, key), `حقل مطلوب مفقود في ${schema.label}.`);
  }
  return record;
}

function requireList(value: unknown, source: string, path: string, label: string): unknown[] {
  if (!Array.isArray(value)) fail(source, path, `${label} يجب أن تكون قائمة.`);
  return value;
}

function requireText(value: unknown, source: string, path: string, label: string): string {
  if (!isText(value)) fail(source, path, `${label} يجب أن يكون نصًا غير فارغ.`);
  return value;
}

function optionalText(value: unknown, source: string, path: string, label: string) {
  if (value !== undefined && !isText(value)) fail(source, path, `${label} يجب أن يكون نصًا غير فارغ.`);
}

function optionalTextList(value: unknown, source: string, path: string, label: string) {
  if (value === undefined) return;
  for (const [index, item] of requireList(value, source, path, label).entries()) {
    requireText(item, source, `${path}[${index}]`, `${label} ${index + 1}`);
  }
}

function requireOptionalRecord(value: unknown, source: string, path: string, label: string): Record<string, unknown> | undefined {
  if (value === undefined) return undefined;
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(source, path, `${label} يجب أن يكون كائنًا.`);
  return value as Record<string, unknown>;
}

/** يفحص بنية ملف الدرس وحلوله ودفتره قبل أي فحص دلالي. */
function validateLessonFileSchema(content: Record<string, unknown>, source: string) {
  const file = checkSchema(content, source, "", SCHEMAS.lessonFile);
  requireText(file.title, source, "title", "عنوان الدرس");
  requireText(file.goals, source, "goals", "أهداف الدرس");
  requireText(file.source, source, "source", "إحالة المصدر");
  optionalText(file.assessmentRef, source, "assessmentRef", "مرجع بنك الاختبار");
  optionalText(file.practiceRef, source, "practiceRef", "مرجع بنك التمارين");
  if (file.lessonId !== undefined && !Number.isSafeInteger(file.lessonId)) fail(source, "lessonId", "معرّف الدرس يجب أن يكون عددًا صحيحًا.");
  if (file.sourcePage !== undefined && !Number.isSafeInteger(file.sourcePage)) fail(source, "sourcePage", "صفحة المصدر يجب أن تكون عددًا صحيحًا.");
  requireOptionalRecord(file.content, source, "content", "مراحل الدرس") ?? fail(source, "content", "مراحل الدرس مطلوبة.");

  if (!Array.isArray(file.notebook)) fail(source, "notebook", "دفتر الطالب يجب أن يكون قائمة أوراق.");
  for (const [index, value] of file.notebook.entries()) {
    const path = `notebook[${index}]`;
    const sheet = checkSchema(value, source, path, SCHEMAS.notebookSheet);
    requireText(sheet.id, source, `${path}.id`, "معرّف الورقة");
    requireText(sheet.title, source, `${path}.title`, "عنوان الورقة");
    requireText(sheet.writingTask, source, `${path}.writingTask`, "مهمة التدوين");
    requireList(sheet.blocks, source, `${path}.blocks`, "كتل الورقة");
  }

  for (const [index, value] of requireList(file.solutions, source, "solutions", "حلول المصدر").entries()) {
    const path = `solutions[${index}]`;
    const solution = checkSchema(value, source, path, SCHEMAS.sourceSolution);
    requireText(solution.title, source, `${path}.title`, "عنوان الحل");
    requireText(solution.source, source, `${path}.source`, "إحالة الحل");
    requireText(solution.question, source, `${path}.question`, "نص السؤال");
    requireText(solution.answer, source, `${path}.answer`, "نص الجواب");
    if (!Number.isSafeInteger(solution.order) || (solution.order as number) < 1) fail(source, `${path}.order`, "ترتيب الحل يجب أن يكون عددًا صحيحًا موجبًا.");
    optionalText(solution.law, source, `${path}.law`, "القاعدة");
    optionalText(solution.notes, source, `${path}.notes`, "ملاحظات الحل");
    optionalTextList(solution.commonMistakes, source, `${path}.commonMistakes`, "خطأ شائع");
    const steps = requireList(solution.steps, source, `${path}.steps`, "خطوات الحل");
    if (!steps.length) fail(source, `${path}.steps`, "خطوات الحل مطلوبة.");
    for (const [stepIndex, step] of steps.entries()) requireText(step, source, `${path}.steps[${stepIndex}]`, `الخطوة ${stepIndex + 1}`);
  }
}

/** يفحص بنية بنك الاختبار وأسئلته. */
function validateAssessmentFileSchema(assessment: Record<string, unknown>, source: string) {
  const file = checkSchema(assessment, source, "", SCHEMAS.assessmentFile);
  if (file.lessonId !== undefined && !Number.isSafeInteger(file.lessonId)) fail(source, "lessonId", "معرّف الدرس يجب أن يكون عددًا صحيحًا.");
  requireText(file.revision, source, "revision", "مراجعة بنك الاختبار");
  requireText(file.source, source, "source", "مصدر بنك الاختبار");
  const skills = requireOptionalRecord(file.skills, source, "skills", "مهارات الاختبار") ?? fail(source, "skills", "مهارات الاختبار مطلوبة.");
  for (const [key, value] of Object.entries(skills)) requireText(value, source, `skills.${key}`, "وصف المهارة");
  for (const [index, value] of requireList(file.questions, source, "questions", "أسئلة الاختبار").entries()) {
    const path = `questions[${index}]`;
    const question = checkSchema(value, source, path, SCHEMAS.question);
    requireText(question.origin, source, `${path}.origin`, "أصل السؤال");
    requireText(question.skill, source, `${path}.skill`, "مهارة السؤال");
    requireText(question.question, source, `${path}.question`, "نص السؤال");
    requireText(question.answer, source, `${path}.answer`, "نص الإجابة");
    requireText(question.explanation, source, `${path}.explanation`, "تفسير الإجابة");
    requireText(question.difficulty, source, `${path}.difficulty`, "مستوى السؤال");
    if (question.options !== undefined) {
      const options = requireList(question.options, source, `${path}.options`, "خيارات السؤال");
      if (!options.length) fail(source, `${path}.options`, "خيارات السؤال مطلوبة.");
      for (const [optionIndex, option] of options.entries()) requireText(option, source, `${path}.options[${optionIndex}]`, `الخيار ${optionIndex + 1}`);
    }
  }
}

/** يفحص بنية بنك التمارين ومهامه وتلميحاته وحلوله. */
function validatePracticeFileSchema(practice: Record<string, unknown>, source: string) {
  const file = checkSchema(practice, source, "", SCHEMAS.practiceFile);
  if (file.lessonId !== undefined && !Number.isSafeInteger(file.lessonId)) fail(source, "lessonId", "معرّف الدرس يجب أن يكون عددًا صحيحًا.");
  requireText(file.revision, source, "revision", "مراجعة بنك التمارين");
  if (!Array.isArray(file.exercises)) fail(source, "exercises", "بنك التمارين يجب أن يحتوي على قائمة \"exercises\".");
  for (const [index, value] of file.exercises.entries()) {
    const path = `exercises[${index}]`;
    if (!value || typeof value !== "object" || Array.isArray(value)) fail(source, path, "مهمة تفاعلية يجب أن يكون كائن JSON.");
    // المفتاح أولًا ليحمل كل خطأ لاحق اسم المهمة، ثم يُفحص الشكل كاملًا.
    const key = requireText((value as Record<string, unknown>).key, source, `${path}.key`, "معرّف المهمة");
    const named = `${path} («${key}»)`;
    const exercise = checkSchema(value, source, named, SCHEMAS.exercise);
    if (!Number.isSafeInteger(exercise.sourceOrder) || (exercise.sourceOrder as number) < 1) fail(source, `${named}.sourceOrder`, "ربط المهمة بسؤال المصدر يجب أن يكون عددًا صحيحًا موجبًا.");

    const view = checkSchema(exercise.view, source, `${named}.view`, SCHEMAS.view);
    requireText(view.kind, source, `${named}.view.kind`, "نوع التفاعل");
    requireText(view.title, source, `${named}.view.title`, "عنوان المهمة");
    requireText(view.instruction, source, `${named}.view.instruction`, "تعليمات المهمة");
    optionalText(view.number, source, `${named}.view.number`, "رقم المهمة");
    optionalText(view.focusDigit, source, `${named}.view.focusDigit`, "الرقم المطلوب");
    for (const [fieldIndex, fieldValue] of requireList(view.fields, source, `${named}.view.fields`, "حقول المهمة").entries()) {
      const fieldPath = `${named}.view.fields[${fieldIndex}]`;
      const field = checkSchema(fieldValue, source, fieldPath, SCHEMAS.viewField);
      requireText(field.key, source, `${fieldPath}.key`, "اسم الحقل");
      requireText(field.label, source, `${fieldPath}.label`, "عنوان الحقل");
      requireText(field.type, source, `${fieldPath}.type`, "نوع الحقل");
      optionalTextList(field.choices, source, `${fieldPath}.choices`, "خيار");
      if (field.max !== undefined && !Number.isSafeInteger(field.max)) fail(source, `${fieldPath}.max`, "أقصى قيمة للحقل يجب أن تكون عددًا صحيحًا.");
    }

    const expected = requireOptionalRecord(exercise.expected, source, `${named}.expected`, "قيم التحقق") ?? fail(source, `${named}.expected`, "قيم التحقق مطلوبة.");
    for (const [expectedKey, expectedValue] of Object.entries(expected)) requireText(expectedValue, source, `${named}.expected.${expectedKey}`, "قيمة التحقق");

    const hints = requireList(exercise.hints, source, `${named}.hints`, "تلميحات المهمة");
    if (!hints.length) fail(source, `${named}.hints`, "كل مهمة تحتاج إلى تلميح واحد على الأقل.");
    for (const [hintIndex, hint] of hints.entries()) requireText(hint, source, `${named}.hints[${hintIndex}]`, `التلميح ${hintIndex + 1}`);

    const mistakes = requireOptionalRecord(exercise.mistakes, source, `${named}.mistakes`, "أخطاء المهمة المتوقعة") ?? fail(source, `${named}.mistakes`, "أخطاء المهمة المتوقعة مطلوبة.");
    for (const [mistakeKey, mistakeValue] of Object.entries(mistakes)) requireText(mistakeValue, source, `${named}.mistakes.${mistakeKey}`, "تفسير الخطأ المتوقع");

    const solution = checkSchema(exercise.solution, source, `${named}.solution`, SCHEMAS.practiceSolution);
    const solutionSteps = requireList(solution.steps, source, `${named}.solution.steps`, "خطوات الحل");
    if (!solutionSteps.length) fail(source, `${named}.solution.steps`, "حل المهمة يحتاج خطوات.");
    for (const [stepIndex, stepValue] of solutionSteps.entries()) {
      const stepPath = `${named}.solution.steps[${stepIndex}]`;
      const step = checkSchema(stepValue, source, stepPath, SCHEMAS.solutionStep);
      requireText(step.title, source, `${stepPath}.title`, "عنوان الخطوة");
      requireText(step.text, source, `${stepPath}.text`, "نص الخطوة");
      optionalText(step.formula, source, `${stepPath}.formula`, "صيغة الخطوة");
    }
    requireText(solution.final, source, `${named}.solution.final`, "الجواب النهائي");
    if (solution.point !== undefined && !Number.isSafeInteger(solution.point)) fail(source, `${named}.solution.point`, "موضع الحل يجب أن يكون عددًا صحيحًا.");
  }
}

function indexEntry(index: ContentIndex, ref: string, source: string, path: string, kind: string): unknown {
  if (!Object.hasOwn(index, ref)) fail(source, path, `الملف المطلوب "${ref}" (${kind}) غير موجود في الفهرس.`);
  return index[ref];
}

function requireRecord(value: unknown, source: string, path: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(source, path, "يجب أن يكون كائن JSON.");
  return value as Record<string, unknown>;
}

/** يتحقق من السجل والحزم معًا، ويعيد الحزم الصالحة فقط للدروس المنشورة. */
export function validateLessonPackages(rawRegistry: unknown, indexes: LessonPackageIndexes, source = "src/content/lesson-registry.json"): ResolvedLessonPackage[] {
  const registry: LessonRegistry = validateLessonRegistry(rawRegistry, source);
  const packages: ResolvedLessonPackage[] = [];
  const usedRefs = { lessons: new Map<string, number>(), assessments: new Map<string, number>(), practices: new Map<string, number>() };

  for (const entry of publishedLessons(registry)) {
    const at = `lessons[id=${entry.id} «${entry.key}»]`;
    const unit = findUnit(registry, entry.unitId);
    if (!unit) fail(source, `${at}.unitId`, `الوحدة ${entry.unitId} غير موجودة.`);

    for (const [kind, ref, map] of [["المحتوى", entry.contentRef, usedRefs.lessons], ["بنك الاختبار", entry.assessmentRef, usedRefs.assessments], ["بنك التمارين", entry.practiceRef, usedRefs.practices]] as const) {
      if (!ref) continue;
      const owner = map.get(ref);
      if (owner !== undefined) fail(source, `${at}`, `${kind} "${ref}" مستخدم أيضًا في الدرس ${owner}؛ لكل درس حزمته الخاصة.`);
      map.set(ref, entry.id);
    }

    const content = requireRecord(indexEntry(indexes.lessons, entry.contentRef, source, `${at}.contentRef`, "محتوى الدرس"), source, `${at}.contentRef`);
    const assessment = requireRecord(indexEntry(indexes.assessments, entry.assessmentRef, source, `${at}.assessmentRef`, "بنك الاختبار"), source, `${at}.assessmentRef`);
    const practice = entry.practiceRef ? requireRecord(indexEntry(indexes.practices, entry.practiceRef, source, `${at}.practiceRef`, "بنك التمارين"), source, `${at}.practiceRef`) : null;

    // بنية صارمة أولًا: لا حقول مجهولة ولا عمليات مصفوفة قبل التحقق من الشكل.
    validateLessonFileSchema(content, entry.contentRef);
    validateAssessmentFileSchema(assessment, entry.assessmentRef);
    if (practice) validatePracticeFileSchema(practice, entry.practiceRef as string);

    if (content.lessonId !== entry.id) fail(source, `${at}.contentRef`, `محتوى الدرس يحمل lessonId = ${JSON.stringify(content.lessonId)} بدل ${entry.id}.`);
    if (content.assessmentRef !== entry.assessmentRef) fail(source, `${at}.assessmentRef`, `المحتوى يشير إلى "${String(content.assessmentRef)}" بينما السجل يعلن "${entry.assessmentRef}".`);
    if (entry.practiceRef && content.practiceRef !== entry.practiceRef) fail(source, `${at}.practiceRef`, `المحتوى يشير إلى "${String(content.practiceRef)}" بينما السجل يعلن "${entry.practiceRef}".`);
    if (assessment.lessonId !== entry.id) fail(source, `${at}.assessmentRef`, `بنك الاختبار مربوط بالدرس ${JSON.stringify(assessment.lessonId)} لا بالدرس ${entry.id}.`);
    if (practice && practice.lessonId !== entry.id) fail(source, `${at}.practiceRef`, `بنك التمارين مربوط بالدرس ${JSON.stringify(practice.lessonId)} لا بالدرس ${entry.id}.`);

    const contentStages = requireRecord(content.content, source, `${at}.contentRef.content`);
    for (const key of Object.keys(contentStages)) {
      if (!STAGE_KEYS.has(key as never)) fail(source, `${at}.contentRef.content.${key}`, "مرحلة غير معروفة في محتوى الدرس.");
    }
    for (const [key, blocks] of Object.entries(contentStages)) validateBlockKinds(blocks, `${entry.contentRef}`, `content.${key}`);
    const notebook = content.notebook;
    if (!Array.isArray(notebook)) fail(source, `${at}.contentRef.notebook`, "دفتر الطالب يجب أن يكون قائمة أوراق.");
    for (const [index, section] of (notebook as NotebookSection[]).entries()) {
      if (!section || typeof section !== "object") fail(source, `${entry.contentRef}`, `notebook[${index}] غير صالح.`);
      validateBlockKinds((section as NotebookSection).blocks, entry.contentRef, `notebook[${index}].blocks`);
    }

    // فحص مراجع التمارين أولًا ليحمل الخطأ اسم الملف والحقل، قبل الفحص التربوي العام.
    const bank = practice as PracticeBank | null;
    if (bank) {
      const keys = new Set(bank.exercises.map(exercise => exercise.key));
      for (const [key, blocks] of Object.entries(contentStages)) {
        for (const block of blocks as Block[]) {
          if (block.kind === "exercise" && block.practiceId && !keys.has(block.practiceId)) {
            fail(source, `${entry.contentRef}`, `content.${key} يشير إلى مهمة غير موجودة في بنك التمارين: "${block.practiceId}".`);
          }
        }
      }
    }

    // الفحصان التربويان القائمان يبقيان مصدر الحقيقة لشروط النشر والتمارين.
    validateLessonPublication(content as unknown as LessonDraft, assessment as unknown as OriginalAssessment);
    validatePracticeBank(content as unknown as LessonDraft, practice as PracticeBank | undefined);

    packages.push({ entry, content: content as unknown as LessonContentFile, assessment: assessment as unknown as AssessmentFile, practice: practice as unknown as PracticeFile | null });
  }

  for (const [kind, index, map] of [["المحتوى", indexes.lessons, usedRefs.lessons], ["بنك الاختبار", indexes.assessments, usedRefs.assessments], ["بنك التمارين", indexes.practices, usedRefs.practices]] as const) {
    for (const ref of Object.keys(index)) {
      if (!map.has(ref)) fail(source, `${kind}`, `الملف "${ref}" مسجل في الفهرس لكن لا درس منشورًا يعلنه؛ أزل اليتيم أو اربطه في السجل.`);
    }
  }
  return packages;
}

/** يحل حزمة درس منشور للعرض؛ لا سقوط إلى درس آخر عند غياب المعرّف. */
export function resolveLessonPackage(id: number, packages: ResolvedLessonPackage[]): ResolvedLessonPackage | undefined {
  return packages.find(item => item.entry.id === id);
}
