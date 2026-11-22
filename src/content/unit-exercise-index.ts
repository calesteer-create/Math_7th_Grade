import unitOneExercises from "@/content/unit-exercises/unit-1.json";

// فهرس تمرينات الوحدات: لكل وحدة ملف مستقل، ولا يُصدَّر قسم تمرينات إلا لوحدة
// لها ملف مصرّح به هنا. تمرينات الوحدة نشاط مراجعة، لا حزمة درس.
export const UNIT_EXERCISES_INDEX: Record<number, unknown> = {
  1: unitOneExercises,
};

export function hasUnitExercises(unitId: number): boolean {
  return Number.isSafeInteger(unitId) && Object.hasOwn(UNIT_EXERCISES_INDEX, unitId);
}

export function unitExercisesRef(unitId: number): unknown | null {
  return hasUnitExercises(unitId) ? UNIT_EXERCISES_INDEX[unitId] : null;
}
