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
      result[field.key] = normalized;
    } else if (field.type === "signed-integer") {
      const signed = normalized.replace(/[\u2212\u2013\u2014]/g, "-");
      if (!/^[+-]?\d+$/.test(signed)) throw new Error(`اكتب عددًا صحيحًا صالحًا في ${field.label}.`);
      const magnitude = BigInt(signed.replace(/^[+-]/, ""));
      if (magnitude > BigInt(field.max ?? 999999999999)) throw new Error(`اكتب عددًا صحيحًا ضمن المدى المسموح في ${field.label}.`);
      const canonical = BigInt(signed.replace(/^\+/, "")).toString();
      result[field.key] = canonical;
    } else if (!/^\d+$/.test(normalized) || BigInt(normalized) > BigInt(field.max ?? 999999999999)) {
      throw new Error(`اكتب عددًا طبيعيًا صالحًا في ${field.label}.`);
    } else {
      result[field.key] = normalized;
    }
  }
  return result;
}

export function gradePractice(definition: PracticeDefinition, response: Record<string, string>): PracticeFeedback {
  // في مهمة ملء الفراغات للدرس 3 (تمرين 3.3)، أي زوج صحيح حاصل ضربه +2 يُعد صحيحًا.
  let fillPairCorrect: boolean | null = null;
  if (definition.view.kind === "muldiv-fill") {
    const rawA = normalizeAnswer(response.f3a ?? "").replace(/[\u2212\u2013\u2014]/g, "-");
    const rawB = normalizeAnswer(response.f3b ?? "").replace(/[\u2212\u2013\u2014]/g, "-");
    fillPairCorrect = /^[+-]?\d+$/.test(rawA) && /^[+-]?\d+$/.test(rawB)
      && BigInt(rawA.replace(/^\+/, "")) * BigInt(rawB.replace(/^\+/, "")) === BigInt(2);
  }
  const fields = definition.view.fields.map(field => {
    const value = normalizeAnswer(response[field.key] ?? "");
    const expected = definition.expected[field.key];
    // الأعداد الصحيحة تُقارن نصًا دقيقًا بعد التطبيع؛ لا Number ولا تقريب.
    const correct = definition.view.kind === "muldiv-fill" && (field.key === "f3a" || field.key === "f3b")
      ? Boolean(fillPairCorrect)
      : field.type === "integer"
        ? /^\d+$/.test(value) && !!parseExactNumber(value) && equalExactText(value, expected)
        : field.type === "signed-integer"
          ? /^[+-]?\d+$/.test(value.replace(/[\u2212\u2013\u2014]/g, "-")) && !!parseExactNumber(value.replace(/[\u2212\u2013\u2014]/g, "-")) && equalExactText(value.replace(/[\u2212\u2013\u2014]/g, "-"), expected)
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
    if (![
      "sets", "digit-choice", "twins", "number-line", "digit-value", "planet",
      "int-warmup", "int-game", "int-context", "int-calc-ab", "int-calc-c", "int-match", "int-lines", "int-reasoning",
      "muldiv-warmup", "muldiv-signs", "muldiv-calc-a", "muldiv-calc-b", "muldiv-calc-c", "muldiv-fill", "muldiv-understand",
      "rat-warmup", "rat-represent", "rat-decimal", "rat-line", "rat-compare", "rat-order-asc", "rat-order-desc",
      "op-sci-write", "op-sci-compare", "op-frac-addsub", "op-frac-muldiv", "op-choice", "op-sign",
      "cp-read", "cp-quadrant", "cp-signs", "cp-plot",
      "alg-warmup", "alg-envelopes", "alg-like-terms", "alg-simplify", "alg-word", "alg-coeffs", "alg-triangle", "alg-reducible",
      "eq-check", "eq-warmup", "eq-boxes-addsub", "eq-boxes-muldiv", "eq-mental", "eq-axc",
    ].includes(definition.view.kind)) throw new Error("طريقة تفاعل غير معروفة.");
    if (!definition.view.title?.trim() || !definition.view.instruction?.trim() || !definition.view.fields?.length) throw new Error("بيانات المهمة ناقصة.");
    if (definition.view.fields.some(field => !/^[a-z][a-zA-Z0-9]{0,39}$/.test(field.key) || ["constructor", "prototype"].includes(field.key) || !field.label.trim())) throw new Error("اسم حقل غير صالح.");
    const fieldKeys = definition.view.fields.map(f => f.key);
    if (new Set(fieldKeys).size !== fieldKeys.length || Object.keys(definition.expected).length !== fieldKeys.length) throw new Error("حقول التحقق لا تطابق المهمة.");
    const requiredFields: Record<string, string[]> = {
      sets: ["group"], "digit-choice": ["position", "value"], twins: ["leftValue", "rightValue"],
      "number-line": ["point"], "digit-value": ["position", "value"], planet: ["billions", "millions", "thousands", "units", "number"],
      "int-warmup": ["temp", "coordM", "distG"],
      "int-game": ["p1", "p2", "p3", "p4", "best"],
      "int-context": ["elevator", "submarine"],
      "int-calc-ab": ["a1", "a2", "a3", "b1", "b2", "b3"],
      "int-calc-c": ["c1", "c2", "c3"],
      "int-match": ["m1", "m2", "m3", "m4", "m5"],
      "int-lines": ["la", "lb", "lc"],
      "int-reasoning": ["counter", "whyComm", "whyAssoc"],
      "muldiv-warmup": ["r1", "r2", "r3", "r4", "r5"],
      "muldiv-signs": ["s1", "s2", "s3", "s4"],
      "muldiv-calc-a": ["a1", "a2", "a3"],
      "muldiv-calc-b": ["b1", "b2", "b3"],
      "muldiv-calc-c": ["c1", "c2", "c3"],
      "muldiv-fill": ["f1", "f2", "f3a", "f3b", "f4"],
      "muldiv-understand": ["q1", "q2", "q3"],
      "rat-warmup": ["r1", "r2", "r3", "r4"],
      "rat-represent": ["n1", "d1", "n2", "d2"],
      "rat-decimal": ["n1", "n2", "n3"],
      "rat-line": ["p1", "p2", "p3", "p4", "p5", "p6"],
      "rat-compare": ["c1", "c2", "c3", "c4", "c5"],
      "rat-order-asc": ["o1", "o2", "o3", "o4", "o5"],
      "rat-order-desc": ["o1", "o2", "o3", "o4"],
      "op-sci-write": ["coef", "exp"],
      "op-sci-compare": ["c1", "c2", "c3"],
      "op-frac-addsub": ["a1", "b1", "a2", "b2"],
      "op-frac-muldiv": ["a1", "b1", "a2", "b2"],
      "op-choice": ["c1", "c2", "c3"],
      "op-sign": ["s1", "s2", "s3", "s4"],
      "cp-read": ["x1", "y1", "x2", "y2"],
      "cp-quadrant": ["q1", "q2", "q3", "q4"],
      "cp-signs": ["g1", "g2", "g3", "g4"],
      "cp-plot": ["p1", "p2"],
      "alg-warmup": ["t1", "t2", "t3", "t4", "d1", "d2", "g1", "g2"],
      "alg-envelopes": ["s2", "s3", "s4", "c2", "c3", "c5", "e6"],
      "alg-like-terms": ["p1", "n1", "n2", "n3", "n4", "n5"],
      "alg-simplify": ["e1", "e2", "e3"],
      "alg-word": ["expr", "val"],
      "alg-coeffs": ["m1", "m2", "m3", "m4", "m5", "pairs"],
      "alg-triangle": ["expr", "perim"],
      "alg-reducible": ["r1", "r2", "r3", "r4"],
      "eq-check": ["lhs1", "isSol1", "lhs2", "isSol2"],
      "eq-warmup": ["r1", "r2", "r3", "r4", "r5"],
      "eq-boxes-addsub": ["b1", "b2", "b3", "b5"],
      "eq-boxes-muldiv": ["b4", "b6", "b7", "b8"],
      "eq-mental": ["m1", "m2", "m3", "m4"],
      "eq-axc": ["e1", "e2", "e3", "e4", "e5"],
    };
    if (JSON.stringify(fieldKeys) !== JSON.stringify(requiredFields[definition.view.kind])) throw new Error("حقول المهمة لا تتوافق مع طريقة التفاعل.");
    if (definition.view.fields.some(field => !["choice", "integer", "signed-integer"].includes(field.type))) throw new Error("نوع حقل غير صالح.");
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
