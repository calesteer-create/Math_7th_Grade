// تمرينات الوحدة: بنية مستقلة عن حزم الدروس، وتصحيح فوري بلا أي أثر على النقاط
// أو خريطة المهارات أو تقدّم الدروس. لا تُكتب أي حالة في localStorage من هذا الملف.
import { normalizeDigits, parseExactNumber } from "@/lib/numbers";
import { assertMathText, assertValidTeX } from "@/lib/math-text";

export type UnitFieldType = "integer" | "signed-integer" | "choice" | "range";
export type UnitField = { key: string; label: string; type: UnitFieldType; choices?: string[]; min?: number; max?: number };
export type UnitSolution = { steps: { title: string; text: string; formula?: string }[]; final: string };
export type UnitExercise = {
  key: string;
  number: number;
  group: string;
  lessonId?: number;
  lessonTitle?: string;
  skill: string;
  difficulty: "easy" | "medium" | "hard";
  prompt: string;
  source: string;
  figure?: string;
  fields: UnitField[];
  expected: Record<string, string>;
  hints: string[];
  commonMistakes?: Record<string, string>;
  solution: UnitSolution;
};
export type UnitGroup = { id: string; title: string; description: string; lessonIds: number[] };
export type UnitExercisesFile = {
  unitId: number;
  revision: string;
  title: string;
  intro: string;
  groups: UnitGroup[];
  exercises: UnitExercise[];
};

const hasText = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const SLUG = /^[a-z][a-z0-9-]{1,63}$/;

function fail(source: string, path: string, problem: string): never {
  throw new Error(`تمرينات الوحدة (${source}) ← ${path}: ${problem}`);
}
function record(value: unknown, source: string, path: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(source, path, "يجب أن يكون كائنًا.");
  return value as Record<string, unknown>;
}
function text(value: unknown, source: string, path: string): string {
  if (!hasText(value)) fail(source, path, "نص غير فارغ مطلوب.");
  return value;
}
function list(value: unknown, source: string, path: string): unknown[] {
  if (!Array.isArray(value) || !value.length) fail(source, path, "قائمة غير فارغة مطلوبة.");
  return value;
}
function int(value: unknown, source: string, path: string, min = 1): number {
  if (!Number.isSafeInteger(value) || (value as number) < min) fail(source, path, "عدد صحيح موجب مطلوب.");
  return value as number;
}
function onlyKeys(object: Record<string, unknown>, allowed: string[], source: string, path: string) {
  for (const key of Object.keys(object)) if (!allowed.includes(key)) fail(source, `${path}.${key}`, "حقل غير معروف.");
}
function requiredKeys(object: Record<string, unknown>, required: string[], source: string, path: string) {
  for (const key of required) if (!(key in object)) fail(source, `${path}.${key}`, "حقل مطلوب مفقود.");
}

/** فحص صارم لملف تمرينات الوحدة قبل العرض أو التصدير. */
export function validateUnitExercises(raw: unknown, source = "unit-1.json"): UnitExercisesFile {
  const file = record(raw, source, "الملف");
  onlyKeys(file, ["unitId", "revision", "title", "intro", "groups", "exercises"], source, "الملف");
  requiredKeys(file, ["unitId", "revision", "title", "intro", "groups", "exercises"], source, "الملف");
  int(file.unitId, source, "unitId");
  text(file.revision, source, "revision");
  text(file.title, source, "title");
  text(file.intro, source, "intro");
  assertMathText(file.title as string);
  assertMathText(file.intro as string);

  const groupIds = new Set<string>();
  const groups = list(file.groups, source, "groups").map((value, index) => {
    const path = `groups[${index}]`;
    const group = record(value, source, path);
    onlyKeys(group, ["id", "title", "description", "lessonIds"], source, path);
    requiredKeys(group, ["id", "title", "description", "lessonIds"], source, path);
    const id = text(group.id, source, `${path}.id`);
    if (!SLUG.test(id) || groupIds.has(id)) fail(source, `${path}.id`, "معرّف مجموعة مكرر أو غير صالح.");
    groupIds.add(id);
    text(group.title, source, `${path}.title`);
    text(group.description, source, `${path}.description`);
    const lessonIds = list(group.lessonIds, source, `${path}.lessonIds`).map((item, lessonIndex) => int(item, source, `${path}.lessonIds[${lessonIndex}]`));
    if (new Set(lessonIds).size !== lessonIds.length) fail(source, `${path}.lessonIds`, "معرّف درس مكرر في المجموعة.");
    return { id, title: group.title as string, description: group.description as string, lessonIds };
  });

  const keys = new Set<string>();
  const exercises = list(file.exercises, source, "exercises").map((value, index) => {
    const path = `exercises[${index}]`;
    const exercise = record(value, source, path);
    const key = text(exercise.key, source, `${path}.key`);
    const named = `${path} («${key}»)`;
    if (!SLUG.test(key) || keys.has(key)) fail(source, `${named}.key`, "معرّف تمرين مكرر أو غير صالح.");
    keys.add(key);
    onlyKeys(exercise, ["key", "number", "group", "lessonId", "lessonTitle", "skill", "difficulty", "prompt", "source", "figure", "fields", "expected", "hints", "commonMistakes", "solution"], source, named);
    requiredKeys(exercise, ["key", "number", "group", "skill", "difficulty", "prompt", "source", "fields", "expected", "hints", "solution"], source, named);
    int(exercise.number, source, `${named}.number`);
    const group = text(exercise.group, source, `${named}.group`);
    if (!groupIds.has(group)) fail(source, `${named}.group`, "المجموعة غير معروفة.");
    const lessonId = exercise.lessonId === undefined ? undefined : int(exercise.lessonId, source, `${named}.lessonId`);
    const groupRecord = groups.find(item => item.id === group)!;
    if (lessonId !== undefined && !groupRecord.lessonIds.includes(lessonId)) {
      fail(source, `${named}.lessonId`, `الدرس ${lessonId} غير معلن في مجموعة «${group}».`);
    }
    if (lessonId !== undefined) text(exercise.lessonTitle, source, `${named}.lessonTitle`);
    text(exercise.skill, source, `${named}.skill`);
    if (!["easy", "medium", "hard"].includes(exercise.difficulty as string)) fail(source, `${named}.difficulty`, "مستوى صعوبة غير صالح.");
    text(exercise.prompt, source, `${named}.prompt`);
    text(exercise.source, source, `${named}.source`);
    if (!hasText(exercise.source as string) || !/(?:ص|صفحة)\s*\d/u.test(exercise.source as string)) fail(source, `${named}.source`, "إحالة الصفحة مطلوبة في المصدر.");
    if (exercise.figure !== undefined && !hasText(exercise.figure)) fail(source, `${named}.figure`, "اسم الشكل يجب أن يكون نصًا.");
    assertMathText(exercise.prompt as string);
    assertMathText(exercise.skill as string);

    const fieldKeys = new Set<string>();
    const fields = list(exercise.fields, source, `${named}.fields`).map((fieldValue, fieldIndex) => {
      const fieldPath = `${named}.fields[${fieldIndex}]`;
      const field = record(fieldValue, source, fieldPath);
      onlyKeys(field, ["key", "label", "type", "choices", "min", "max"], source, fieldPath);
      requiredKeys(field, ["key", "label", "type"], source, fieldPath);
      const fieldKey = text(field.key, source, `${fieldPath}.key`);
      if (!/^[a-zA-Z][a-zA-Z0-9]{0,39}$/.test(fieldKey) || fieldKeys.has(fieldKey)) fail(source, `${fieldPath}.key`, "اسم حقل مكرر أو غير صالح.");
      fieldKeys.add(fieldKey);
      text(field.label, source, `${fieldPath}.label`);
      const type = field.type;
      if (!["integer", "signed-integer", "choice", "range"].includes(type as string)) fail(source, `${fieldPath}.type`, "نوع حقل غير معروف.");
      if (type === "choice") {
        const choices = list(field.choices, source, `${fieldPath}.choices`).map((choice, choiceIndex) => text(choice, source, `${fieldPath}.choices[${choiceIndex}]`));
        if (choices.length < 2 || new Set(choices).size !== choices.length) fail(source, `${fieldPath}.choices`, "الخيارات يجب أن تكون فريدة واثنين على الأقل.");
        return { key: fieldKey, label: field.label as string, type: type as UnitFieldType, choices };
      }
      if (type === "range") {
        if (typeof field.min !== "number" || typeof field.max !== "number" || !Number.isFinite(field.min) || !Number.isFinite(field.max) || field.min >= field.max) {
          fail(source, `${fieldPath}`, "المجال يحتاج حدين عدديين مع min أصغر من max.");
        }
        return { key: fieldKey, label: field.label as string, type: type as UnitFieldType, min: field.min, max: field.max };
      }
      return { key: fieldKey, label: field.label as string, type: type as UnitFieldType };
    });

    const expectedRecord = record(exercise.expected, source, `${named}.expected`);
    const expected: Record<string, string> = {};
    for (const [keyName, value] of Object.entries(expectedRecord)) {
      if (!fieldKeys.has(keyName)) fail(source, `${named}.expected.${keyName}`, "قيمة تحقق لحقل غير موجود.");
      expected[keyName] = text(value, source, `${named}.expected.${keyName}`);
    }
    for (const field of fields) {
      if (field.type === "range") continue;
      if (!(field.key in expected)) fail(source, `${named}.expected.${field.key}`, "قيمة التحقق مطلوبة لكل حقل.");
      if (field.type === "choice" && !field.choices?.includes(expected[field.key])) fail(source, `${named}.expected.${field.key}`, "القيمة المتوقعة ليست من خيارات الحقل.");
      if (field.type === "integer" && !/^\d+$/.test(expected[field.key])) fail(source, `${named}.expected.${field.key}`, "العدد المتوقع يجب أن يكون طبيعيًا.");
      if (field.type === "signed-integer" && !/^[+-]?\d+$/.test(expected[field.key])) fail(source, `${named}.expected.${field.key}`, "العدد المتوقع يجب أن يكون صحيحًا بإشارة.");
    }

    const hints = list(exercise.hints, source, `${named}.hints`).map((hint, hintIndex) => text(hint, source, `${named}.hints[${hintIndex}]`));
    if (hints.length < 2) fail(source, `${named}.hints`, "كل تمرين يحتاج تلميحين متدرجين على الأقل.");

    const mistakes: Record<string, string> = {};
    if (exercise.commonMistakes !== undefined) {
      const mistakesRecord = record(exercise.commonMistakes, source, `${named}.commonMistakes`);
      for (const [keyName, value] of Object.entries(mistakesRecord)) {
        if (!fieldKeys.has(keyName)) fail(source, `${named}.commonMistakes.${keyName}`, "تفسير خطأ لحقل غير موجود.");
        mistakes[keyName] = text(value, source, `${named}.commonMistakes.${keyName}`);
      }
    }

    const solutionRecord = record(exercise.solution, source, `${named}.solution`);
    onlyKeys(solutionRecord, ["steps", "final"], source, `${named}.solution`);
    requiredKeys(solutionRecord, ["steps", "final"], source, `${named}.solution`);
    const steps = list(solutionRecord.steps, source, `${named}.solution.steps`).map((stepValue, stepIndex) => {
      const stepPath = `${named}.solution.steps[${stepIndex}]`;
      const step = record(stepValue, source, stepPath);
      onlyKeys(step, ["title", "text", "formula"], source, stepPath);
      requiredKeys(step, ["title", "text"], source, stepPath);
      const title = text(step.title, source, `${stepPath}.title`);
      const stepText = text(step.text, source, `${stepPath}.text`);
      if (step.formula !== undefined) { text(step.formula, source, `${stepPath}.formula`); assertValidTeX(step.formula as string); }
      return { title, text: stepText, ...(step.formula !== undefined ? { formula: step.formula as string } : {}) };
    });
    if (steps.length < 3) fail(source, `${named}.solution.steps`, "الحل المرجعي يحتاج ثلاث خطوات على الأقل.");
    const final = text(solutionRecord.final, source, `${named}.solution.final`);

    for (const value of [exercise.prompt as string, ...hints, ...Object.values(mistakes), final, ...steps.flatMap(step => [step.title, step.text])]) assertMathText(value);

    return {
      key, number: exercise.number as number, group, ...(lessonId !== undefined ? { lessonId, lessonTitle: exercise.lessonTitle as string } : {}),
      skill: exercise.skill as string, difficulty: exercise.difficulty as "easy" | "medium" | "hard",
      prompt: exercise.prompt as string, source: exercise.source as string, ...(exercise.figure !== undefined ? { figure: exercise.figure as string } : {}),
      fields, expected, hints, ...(Object.keys(mistakes).length ? { commonMistakes: mistakes } : {}), solution: { steps, final },
    };
  });

  for (const key of keys) {
    const exercise = exercises.find(item => item.key === key)!;
    if (!groups.some(group => group.id === exercise.group)) fail(source, `exercises («${key}»)`, "تمرين بلا مجموعة معروفة.");
  }
  return { unitId: file.unitId as number, revision: file.revision as string, title: file.title as string, intro: file.intro as string, groups, exercises };
}

export type UnitFeedback = { correct: boolean; fields: { key: string; label: string; correct: boolean; message: string }[] };

/** تصحيح صرف في الذاكرة: لا حفظ، ولا نقاط، ولا تحديث لخريطة المهارات. */
const choiceText = (value: string) => normalizeDigits(value).replace(/[−–—]/g, "-").replace(/\s+/g, " ").trim();

export function gradeUnitExercise(exercise: UnitExercise, response: Record<string, string>): UnitFeedback {
  const fields = exercise.fields.map(field => {
    const raw = normalizeDigits(String(response[field.key] ?? "")).replace(/[−–—]/g, "-").trim();
    const compact = raw.replace(/\s+/g, "");
    let correct = false;
    if (field.type === "choice") correct = choiceText(raw) === choiceText(exercise.expected[field.key]);
    else if (field.type === "integer") correct = /^\d+$/.test(compact) && Boolean(exercise.expected[field.key]) && BigInt(compact) === BigInt(exercise.expected[field.key].replace(/^\+/, ""));
    else if (field.type === "signed-integer") {
      const value = compact.replace(/^\+/, "");
      correct = /^-?\d+$/.test(value) && BigInt(value) === BigInt(exercise.expected[field.key].replace(/^\+/, ""));
    } else {
      const parsed = parseExactNumber(compact);
      const min = parseExactNumber(String(field.min));
      const max = parseExactNumber(String(field.max));
      if (parsed && min && max) {
        const aboveMin = parsed.numerator * min.denominator > min.numerator * parsed.denominator;
        const belowMax = parsed.numerator * max.denominator < max.numerator * parsed.denominator;
        correct = aboveMin && belowMax;
      }
    }
    return {
      key: field.key,
      label: field.label,
      correct,
      message: correct
        ? "إجابة صحيحة."
        : exercise.commonMistakes?.[field.key] ?? (field.type === "range" ? "اكتب عددًا يقع بين الحدين، دون أن يساويهما." : "راجع هذه الخطوة ثم جرّب مرة أخرى."),
    };
  });
  return { correct: fields.every(field => field.correct), fields };
}

export const UNIT_EXERCISE_NOTICE = "تمرينات الوحدة نشاط مراجعة مستقل: لا تُضاف نقاطها إلى الدرس، ولا تُحدّث خريطة المهارات، ولا تُحفظ إجاباتها بعد إغلاق الصفحة.";
