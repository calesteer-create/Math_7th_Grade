// سجل الدروس: أنواع + فحص صارم. لا يعرف هذا الملف شيئًا عن الدرس الأول أو ترتيبه؛
// الهوية من `id` الثابت المكتوب صراحة، والربط من `key` والمراجع المعلنة.
export type LessonStatus = "published" | "pending";

export type UnitRecord = {
  id: number;
  key: string;
  order: number;
  title: string;
  description: string;
  icon: string;
  color: string;
};

type LessonBase = { id: number; unitId: number; order: number; title: string; sourcePage: number };
export type PendingLessonRecord = LessonBase & { status: "pending" };
export type PublishedLessonRecord = LessonBase & {
  status: "published";
  key: string;
  contentRef: string;
  assessmentRef: string;
  practiceRef?: string;
};
export type LessonRecord = PendingLessonRecord | PublishedLessonRecord;
export type LessonRegistry = { version: number; units: UnitRecord[]; lessons: LessonRecord[] };

const SLUG = /^[a-z][a-z0-9-]{1,63}$/;
const RESERVED = new Set(["constructor", "prototype", "__proto__"]);
const REF = /^[a-z0-9][a-z0-9/-]*\.json$/;
const hasText = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const isId = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) > 0;

function fail(source: string, path: string, problem: string): never {
  throw new Error(`سجل الدروس (${source}) ← ${path}: ${problem}`);
}

function record(value: unknown, source: string, path: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(source, path, "يجب أن يكون كائنًا.");
  return value as Record<string, unknown>;
}

/** يتحقق من البنية كاملة ويرفض أي حقل ناقص أو مكرر أو غير معروف. */
export function validateLessonRegistry(raw: unknown, source = "src/content/lesson-registry.json"): LessonRegistry {
  const root = record(raw, source, "الملف");
  for (const key of Object.keys(root)) if (!["version", "units", "lessons"].includes(key)) fail(source, key, "حقل غير معروف في السجل.");
  if (!isId(root.version)) fail(source, "version", "إصدار السجل يجب أن يكون عددًا صحيحًا موجبًا.");
  if (!Array.isArray(root.units) || !root.units.length) fail(source, "units", "يجب تعريف وحدة واحدة على الأقل.");
  if (!Array.isArray(root.lessons)) fail(source, "lessons", "قائمة الدروس مفقودة.");

  const unitIds = new Set<number>(), unitKeys = new Set<string>(), unitOrders = new Set<number>();
  const units: UnitRecord[] = root.units.map((value, index) => {
    const path = `units[${index}]`;
    const unit = record(value, source, path);
    for (const key of ["id", "key", "order", "title", "description", "icon", "color"]) {
      if (!(key in unit)) fail(source, `${path}.${key}`, "حقل مطلوب مفقود.");
    }
    for (const key of Object.keys(unit)) {
      if (!["id", "key", "order", "title", "description", "icon", "color"].includes(key)) fail(source, `${path}.${key}`, "حقل غير معروف في الوحدة.");
    }
    if (!isId(unit.id)) fail(source, `${path}.id`, "معرّف الوحدة يجب أن يكون عددًا صحيحًا موجبًا.");
    if (unitIds.has(unit.id as number)) fail(source, `${path}.id`, `معرّف الوحدة ${unit.id} مكرر.`);
    if (!hasText(unit.key) || !SLUG.test(unit.key) || RESERVED.has(unit.key)) fail(source, `${path}.key`, "مفتاح الوحدة يجب أن يكون معرّفًا نصيًا ثابتًا بصيغة kebab-case.");
    if (unitKeys.has(unit.key as string)) fail(source, `${path}.key`, `مفتاح الوحدة "${unit.key}" مكرر.`);
    if (!isId(unit.order)) fail(source, `${path}.order`, "ترتيب الوحدة يجب أن يكون عددًا صحيحًا موجبًا.");
    if (unitOrders.has(unit.order as number)) fail(source, `${path}.order`, `ترتيب الوحدة ${unit.order} مكرر.`);
    for (const key of ["title", "description", "icon", "color"]) if (!hasText(unit[key])) fail(source, `${path}.${key}`, "قيمة نصية مطلوبة.");
    unitIds.add(unit.id as number); unitKeys.add(unit.key as string); unitOrders.add(unit.order as number);
    return { id: unit.id, key: unit.key, order: unit.order, title: unit.title, description: unit.description, icon: unit.icon, color: unit.color } as UnitRecord;
  });

  const lessonIds = new Set<number>(), lessonKeys = new Set<string>(), ordersByUnit = new Map<number, Set<number>>();
  const lessons: LessonRecord[] = root.lessons.map((value, index) => {
    const path = `lessons[${index}]`;
    const lesson = record(value, source, path);
    if (!isId(lesson.id)) fail(source, `${path}.id`, "معرّف الدرس يجب أن يكون عددًا صحيحًا موجبًا وثابتًا.");
    if (lessonIds.has(lesson.id as number)) fail(source, `${path}.id`, `معرّف الدرس ${lesson.id} مكرر؛ المعرّفات ثابتة وفريدة.`);
    for (const key of ["id", "unitId", "order", "title", "sourcePage", "status"]) {
      if (!(key in lesson)) fail(source, `${path}.${key}`, "حقل مطلوب مفقود.");
    }
    if (!isId(lesson.unitId) || !unitIds.has(lesson.unitId as number)) fail(source, `${path}.unitId`, `الوحدة ${lesson.unitId} غير موجودة في السجل.`);
    if (!hasText(lesson.title)) fail(source, `${path}.title`, "عنوان الدرس مطلوب.");
    if (!isId(lesson.sourcePage)) fail(source, `${path}.sourcePage`, "صفحة المصدر يجب أن تكون عددًا صحيحًا موجبًا.");
    if (!isId(lesson.order)) fail(source, `${path}.order`, "ترتيب الدرس داخل وحدته يجب أن يكون عددًا صحيحًا موجبًا.");
    const orders = ordersByUnit.get(lesson.unitId as number) ?? new Set<number>();
    if (orders.has(lesson.order as number)) fail(source, `${path}.order`, `ترتيب الدرس ${lesson.order} مكرر داخل الوحدة ${lesson.unitId}.`);
    orders.add(lesson.order as number); ordersByUnit.set(lesson.unitId as number, orders);

    if (lesson.status === "pending") {
      const extra = Object.keys(lesson).filter(key => !["id", "unitId", "order", "title", "sourcePage", "status"].includes(key));
      if (extra.length) fail(source, `${path}.${extra[0]}`, "الدرس غير المنشور لا يحمل مفتاحًا أو مراجع محتوى.");
      lessonIds.add(lesson.id as number);
      return { id: lesson.id, unitId: lesson.unitId, order: lesson.order, title: lesson.title, sourcePage: lesson.sourcePage, status: "pending" } as PendingLessonRecord;
    }
    if (lesson.status !== "published") fail(source, `${path}.status`, `حالة نشر غير معروفة: ${String(lesson.status)}.`);

    for (const key of ["key", "contentRef", "assessmentRef"]) {
      if (!(key in lesson)) fail(source, `${path}.${key}`, "حزمة الدرس المنشور تحتاج هذا الحقل.");
    }
    for (const key of Object.keys(lesson)) {
      if (!["id", "unitId", "order", "title", "sourcePage", "status", "key", "contentRef", "assessmentRef", "practiceRef"].includes(key)) {
        fail(source, `${path}.${key}`, "حقل غير معروف في الدرس.");
      }
    }
    if (!hasText(lesson.key) || !SLUG.test(lesson.key) || RESERVED.has(lesson.key)) fail(source, `${path}.key`, "مفتاح الدرس يجب أن يكون معرّفًا نصيًا ثابتًا بصيغة kebab-case.");
    if (lessonKeys.has(lesson.key as string)) fail(source, `${path}.key`, `مفتاح الدرس "${lesson.key}" مكرر.`);
    lessonKeys.add(lesson.key as string);
    for (const key of ["contentRef", "assessmentRef", "practiceRef"]) {
      if (lesson[key] === undefined) continue;
      if (!hasText(lesson[key]) || !REF.test(lesson[key] as string)) fail(source, `${path}.${key}`, "مسار حزمة غير صالح؛ استخدم مسارًا نسبيًا ينتهي بـ .json.");
    }
    lessonIds.add(lesson.id as number);
    return {
      id: lesson.id, unitId: lesson.unitId, order: lesson.order, title: lesson.title, sourcePage: lesson.sourcePage,
      status: "published", key: lesson.key as string, contentRef: lesson.contentRef as string,
      assessmentRef: lesson.assessmentRef as string, ...(lesson.practiceRef ? { practiceRef: lesson.practiceRef as string } : {}),
    } as PublishedLessonRecord;
  });

  return { version: root.version as number, units, lessons };
}

export const isPublished = (lesson: LessonRecord): lesson is PublishedLessonRecord => lesson.status === "published";

export function publishedLessons(registry: LessonRegistry): PublishedLessonRecord[] {
  return registry.lessons.filter(isPublished);
}

export function findLesson(registry: LessonRegistry, id: number): LessonRecord | undefined {
  // لا سقوط إلى «الدرس الأول» ولا اعتماد على الترتيب عند غياب المعرّف.
  return Number.isSafeInteger(id) ? registry.lessons.find(lesson => lesson.id === id) : undefined;
}

export function findUnit(registry: LessonRegistry, id: number): UnitRecord | undefined {
  return registry.units.find(unit => unit.id === id);
}

export function lessonsOfUnit(registry: LessonRegistry, unitId: number): LessonRecord[] {
  return registry.lessons.filter(lesson => lesson.unitId === unitId).sort((a, b) => a.order - b.order);
}
