// منطق يستعمله الخادم والاستيراد والاختبارات. لا يُستورد في مكونات المتصفح.
import { normalizeAnswer } from "@/lib/assessment";
import { equalExactText, parseExactNumber } from "@/lib/numbers";
import { assertMathText, assertValidTeX } from "@/lib/math-text";
import type { Block } from "@/lib/lesson-content";
import type { LearningSolution, PracticeEntry, PracticeFeedback, PracticeView } from "@/lib/practice-types";

export type PracticeDefinition = {
  key: string;
  sourceOrder: number;
  view: PracticeView;
  expected: Record<string, string>;
  hints: string[];
  mistakes: Record<string, string>;
  solution: LearningSolution;
};
export type PracticeBank = { revision: string; exercises: PracticeDefinition[] };
export function canonicalPractice(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalPractice).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalPractice((value as Record<string, unknown>)[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
export type SavedPractice = { response: Record<string, string>; attempts: number; solved: boolean; hintsShown: number; solutionViewed: boolean };

export function exerciseBlocks(content: Record<string, Block[]>): Extract<Block, { kind: "exercise" }>[] {
  const result: Extract<Block, { kind: "exercise" }>[] = [];
  function visit(block: Block) {
    if (block.kind === "exercise") result.push(block);
    if (block.kind === "guide") block.sections.forEach(s => s.blocks.forEach(visit));
  }
  Object.values(content).forEach(blocks => blocks.forEach(visit));
  return result;
}

export function validatePracticeResponse(definition: PracticeDefinition, raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("أكمل جميع أجزاء المهمة أولًا.");
  const response = raw as Record<string, unknown>;
  const fields = definition.view.fields;
  if (Object.keys(response).length !== fields.length) throw new Error("أكمل جميع أجزاء المهمة أولًا.");
  const result: Record<string, string> = {};
  for (const field of fields) {
    const value = response[field.key];
    if (typeof value !== "string" || !value.trim() || value.length > 64) throw new Error(`أكمل: ${field.label}.`);
    const normalized = normalizeAnswer(value);
    if (field.type === "choice") {
      if (!field.choices?.includes(normalized)) throw new Error(`اختر قيمة صالحة لـ${field.label}.`);
    } else if (!/^\d+$/.test(normalized) || BigInt(normalized) > BigInt(field.max ?? 999999999999)) {
      throw new Error(`اكتب عددًا طبيعيًا صالحًا في ${field.label}.`);
    }
    result[field.key] = normalized;
  }
  return result;
}

export function gradePractice(definition: PracticeDefinition, response: Record<string, string>): PracticeFeedback {
  const fields = definition.view.fields.map(field => {
    const value = normalizeAnswer(response[field.key] ?? "");
    const expected = definition.expected[field.key];
    // الأعداد الصحيحة تُقارن نصًا دقيقًا بعد التطبيع؛ لا Number ولا تقريب.
    const correct = field.type === "integer"
      ? /^\d+$/.test(value) && !!parseExactNumber(value) && equalExactText(value, expected)
      : value === expected;
    return { key: field.key, label: field.label, correct, message: correct ? "هذه الخطوة صحيحة." : definition.mistakes[field.key] ?? "راجع هذه الخطوة ثم جرّب مرة أخرى." };
  });
  return { correct: fields.every(field => field.correct), fields };
}

export function publicPractice(key: string, version: string, definition: PracticeDefinition, saved?: SavedPractice): PracticeEntry {
  const state = saved ?? { response: {}, attempts: 0, solved: false, hintsShown: 0, solutionViewed: false };
  // انتقاء صريح للحقول المسموح بها؛ لا نشر للكائن الخاص عبر spread.
  const view: PracticeView = {
    title: definition.view.title, instruction: definition.view.instruction, kind: definition.view.kind,
    fields: definition.view.fields.map(field => ({ key: field.key, label: field.label, type: field.type, choices: field.choices, max: field.max })),
    number: definition.view.number, focusDigit: definition.view.focusDigit,
  };
  const result: PracticeEntry = {
    key, version, view, hintCount: definition.hints.length,
    state: { response: state.response, attempts: state.attempts, solved: state.solved, hints: definition.hints.slice(0, state.hintsShown), solutionViewed: state.solutionViewed && state.attempts > 0, feedback: state.attempts > 0 ? gradePractice(definition, state.response) : null },
  };
  if (state.attempts > 0 && state.solutionViewed) result.solution = definition.solution;
  return result;
}

export function validatePracticeBank(lesson: { content: Record<string, Block[]>; solutions: { order: number }[] }, bank?: PracticeBank) {
  const blocks = exerciseBlocks(lesson.content);
  if (!blocks.length && !bank) return;
  if (!bank?.revision?.trim() || !Array.isArray(bank.exercises) || !bank.exercises.length) throw new Error("تمارين الكتاب تحتاج إلى أنشطة تفاعلية وحلول تعليمية ضمن عملية النشر.");
  const keys = new Set<string>();
  for (const definition of bank.exercises) {
    if (!/^[a-z][a-z0-9-]{1,63}$/.test(definition.key) || keys.has(definition.key)) throw new Error("معرّف مهمة مكرر أو غير صالح.");
    keys.add(definition.key);
    if (!lesson.solutions.some(s => s.order === definition.sourceOrder)) throw new Error("النشاط لا يرتبط بسؤال موثّق من المصدر.");
    if (!["sets", "digit-choice", "twins", "number-line", "digit-value", "planet"].includes(definition.view.kind)) throw new Error("طريقة تفاعل غير معروفة.");
    if (!definition.view.title?.trim() || !definition.view.instruction?.trim() || !definition.view.fields?.length) throw new Error("بيانات المهمة ناقصة.");
    if (definition.view.fields.some(field => !/^[a-z][a-zA-Z0-9]{0,39}$/.test(field.key) || ["constructor", "prototype"].includes(field.key) || !field.label.trim())) throw new Error("اسم حقل غير صالح.");
    const fieldKeys = definition.view.fields.map(f => f.key);
    if (new Set(fieldKeys).size !== fieldKeys.length || Object.keys(definition.expected).length !== fieldKeys.length) throw new Error("حقول التحقق لا تطابق المهمة.");
    const requiredFields: Record<string, string[]> = {
      sets: ["group"], "digit-choice": ["position", "value"], twins: ["leftValue", "rightValue"],
      "number-line": ["point"], "digit-value": ["position", "value"], planet: ["billions", "millions", "thousands", "units", "number"],
    };
    if (JSON.stringify(fieldKeys) !== JSON.stringify(requiredFields[definition.view.kind])) throw new Error("حقول المهمة لا تتوافق مع طريقة التفاعل.");
    if (definition.view.fields.some(field => !["choice", "integer"].includes(field.type))) throw new Error("نوع حقل غير صالح.");
    if (["digit-choice", "digit-value", "twins"].includes(definition.view.kind)) {
      if (!/^\d{1,12}$/.test(definition.view.number ?? "") || !/^\d$/.test(definition.view.focusDigit ?? "")) throw new Error("رقم النشاط أو الرقم المطلوب غير صالح.");
      if (definition.view.kind === "twins" && definition.view.number!.split("").filter(d => d === definition.view.focusDigit).length !== 2) throw new Error("نشاط المطابقة يحتاج إلى ظهورين للرقم نفسه.");
    }
    if (definition.view.kind === "number-line" && (definition.view.fields[0].max !== 12 || Number(definition.expected.point) > 12)) throw new Error("مدى مستقيم النشاط غير صالح.");
    validatePracticeResponse(definition, definition.expected);
    if (!definition.hints.length || definition.solution.steps.length < 3 || !definition.solution.final.trim()) throw new Error("كل مهمة تحتاج إلى تلميحات وحل تعليمي مفصّل.");
    [definition.view.title, definition.view.instruction, ...definition.hints, ...Object.values(definition.mistakes), definition.solution.final].forEach(text => assertMathText(text));
    definition.solution.steps.forEach(step => { if (!step.title.trim() || !step.text.trim()) throw new Error("خطوة حل ناقصة."); assertMathText(step.title); assertMathText(step.text); if (step.formula) assertValidTeX(step.formula); });
  }
  for (const block of blocks) if (!block.practiceId || !keys.has(block.practiceId)) throw new Error("لا يُنشر تمرين كتاب كبطاقة نصية فقط؛ اربطه بمهمة تفاعلية.");
  for (const key of keys) if (!blocks.some(block => block.practiceId === key)) throw new Error("مهمة تفاعلية غير مرتبطة بالدرس.");
}
