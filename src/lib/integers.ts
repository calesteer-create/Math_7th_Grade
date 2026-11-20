// بيانات ورسوم وحسابات الدرس الثاني: الأعداد الصحيحة (الجمع والطرح) — الصفحات 5–9.

export type IntegerFigureKind =
  | "intSetsLine"
  | "intWarmup"
  | "intGamePaths"
  | "intOpposites"
  | "intAddLine"
  | "intSubLine"
  | "intShortTable";

export const INTEGER_FIGURE_KINDS = [
  "intSetsLine",
  "intWarmup",
  "intGamePaths",
  "intOpposites",
  "intAddLine",
  "intSubLine",
  "intShortTable",
] as const;

export const INT_LINE = {
  min: -6,
  max: 6,
  width: 840,
  height: 158,
  start: 56,
  spacing: 60,
  y: 96,
} as const;

/** إحداثي X لتدريجة صحيحة على مستقيم [-6، 6] بتدريجات متساوية من اليسار إلى اليمين. */
export function intLineX(value: number, line: { min: number; start: number; spacing: number } = INT_LINE): number {
  return line.start + (value - line.min) * line.spacing;
}

export const INT_WARMUP_ROWS = [
  {
    id: "temp",
    prompt: "أخفض درجة حرارة مُسجلة بين الإجابات هي:",
    options: [
      { key: "A", label: "-5°", tex: "-5^\\circ" },
      { key: "B", label: "10°", tex: "10^\\circ" },
      { key: "C", label: "صفر", tex: null },
    ],
    answer: "A",
  },
  {
    id: "coordM",
    prompt: "على المستقيم المدرّج الآتي فاصِلة M هي:",
    pointLabel: "M",
    pointValue: -2,
    options: [
      { key: "A", label: "+4", tex: "+4" },
      { key: "B", label: "+2", tex: "+2" },
      { key: "C", label: "-2", tex: "-2" },
    ],
    answer: "C",
  },
  {
    id: "distG",
    prompt: "على المستقيم المدرّج الآتي بُعد G عن المَبدأ O هو:",
    pointLabel: "G",
    pointValue: -3,
    options: [
      { key: "A", label: "0", tex: "0" },
      { key: "B", label: "-3", tex: "-3" },
      { key: "C", label: "3", tex: "3" },
    ],
    answer: "C",
  },
] as const;

export type GamePath = {
  id: 1 | 2 | 3 | 4;
  stage1: number;
  stage2: number;
  stage3: number;
  stage2Slot: "top" | "bottom";
  stage3Slot: "top" | "middle" | "bottom";
  total: number;
};

export const GAME_PATHS: readonly GamePath[] = [
  { id: 1, stage1: 2, stage2: -6, stage3: 2, stage2Slot: "top", stage3Slot: "top", total: -2 },
  { id: 2, stage1: 2, stage2: -6, stage3: 5, stage2Slot: "top", stage3Slot: "middle", total: 1 },
  { id: 3, stage1: 2, stage2: -4, stage3: 5, stage2Slot: "bottom", stage3Slot: "middle", total: 3 },
  { id: 4, stage1: 2, stage2: -4, stage3: 2, stage2Slot: "bottom", stage3Slot: "bottom", total: 0 },
] as const;

export const BOOK_SHORT_EXAMPLES = [
  { full: "(-5)+(+8)", short: "-5+8", result: "+3" },
  { full: "(-15)+(-3)", short: "-15-3", result: "-18" },
  { full: "(+9)+(-11)", short: "9-11", result: "-2" },
] as const;

export const BOOK_MATCH_PAIRS = [
  { key: "m1", expression: "(+9)-(+3)", short: "9-3", displayShort: "9 - 3" },
  { key: "m2", expression: "(-4)-(-7)", short: "-4+7", displayShort: "-4 + 7" },
  { key: "m3", expression: "(-6)-(+2)", short: "-6-2", displayShort: "-6 - 2" },
  { key: "m4", expression: "(+9)-(-3)", short: "9+3", displayShort: "9 + 3" },
  { key: "m5", expression: "(+6)-(-2)", short: "6+2", displayShort: "6 + 2" },
] as const;

/** الترتيب الحرفي لعمود الصيغ المختزلة في يسار تمرين 4 في الكتاب. */
export const BOOK_MATCH_LEFT_ORDER = ["-6 - 2", "-4 + 7", "9 - 3", "6 + 2", "9 + 3"] as const;

export const BOOK_LINE_OPS = [
  { key: "la", label: "a", tex: "(-5)+(+2)", a: -5, op: "+" as const, b: 2, delta: 2, result: -3 },
  { key: "lb", label: "b", tex: "(-2)+(+2)", a: -2, op: "+" as const, b: 2, delta: 2, result: 0 },
  { key: "lc", label: "c", tex: "-2-(-5)", a: -2, op: "-" as const, b: -5, delta: 5, result: 3 },
] as const;

export const BOOK_CALC_AB = [
  { key: "a1", group: "A", index: 1, tex: "(+2)+(-6)", expected: -4 },
  { key: "a2", group: "A", index: 2, tex: "(-3)-(+5)", expected: -8 },
  { key: "a3", group: "A", index: 3, tex: "(-4)+(-2)", expected: -6 },
  { key: "b1", group: "B", index: 1, tex: "(+9)-(-1)", expected: 10 },
  { key: "b2", group: "B", index: 2, tex: "(-8)+(5)-(11)", expected: -14 },
  { key: "b3", group: "B", index: 3, tex: "(-7)-((-9)-(-22))", expected: -20 },
] as const;

export const BOOK_CALC_C = [
  { key: "c1", index: 1, tex: "-3+5-2-1", expected: -1 },
  { key: "c2", index: 2, tex: "2-6+1-5+8", expected: 0 },
  { key: "c3", index: 3, tex: "-22+10-32", expected: -44 },
] as const;

/** تنسيق عدد صحيح بإشارته للعرض الرياضي في KaTeX. */
export function signedTeX(n: number, explicitPlus = true): string {
  if (n > 0) return explicitPlus ? `+${n}` : `${n}`;
  return String(n);
}

/** صيغة جمع أو طرح عددين صحيحين كاملةً ومختزلةً مع الناتج وخطوة التحويل. */
export function describeIntegerOp(a: number, op: "+" | "-", b: number) {
  const effectiveB = op === "+" ? b : -b;
  const result = a + effectiveB;
  const fullTeX = `(${signedTeX(a)}) ${op} (${signedTeX(b)})`;
  const asAddTeX = `(${signedTeX(a)}) + (${signedTeX(effectiveB)})`;
  const firstShort = a >= 0 ? String(a) : String(a);
  const secondShort = effectiveB >= 0 ? `+ ${effectiveB}` : `- ${Math.abs(effectiveB)}`;
  const shortTeX = `${firstShort} ${secondShort}`;
  const sameSign = (a > 0 && effectiveB > 0) || (a < 0 && effectiveB < 0);
  const oppositePair = a !== 0 && a === -effectiveB;
  const direction: "right" | "left" | "stay" = effectiveB > 0 ? "right" : effectiveB < 0 ? "left" : "stay";
  return {
    a,
    op,
    b,
    effectiveB,
    result,
    fullTeX,
    asAddTeX,
    shortTeX,
    sameSign,
    oppositePair,
    direction,
    distA: Math.abs(a),
    distB: Math.abs(effectiveB),
  };
}

export const INTEGER_FIGURE_SOURCES: Record<IntegerFigureKind, { page: number; title: string; detail: string }> = {
  intSetsLine: {
    page: 5,
    title: "مجموعة الأعداد الصحيحة ومستقيم الأعداد",
    detail: "تضم مجموعة الأعداد الصحيحة \\(\\mathbb{Z}\\) جميع الأعداد الطبيعية \\(\\mathbb{N}\\) مضافًا إليها الأعداد السالبة، وتزداد قيمة الأعداد كلما انتقلنا من اليسار إلى اليمين.",
  },
  intWarmup: {
    page: 5,
    title: "جدول انطلاقة نشطة",
    detail: "ثلاثة أسطر للمقارنة وقراءة فاصلة نقطة وبُعد نقطة عن المبدأ \\(O\\) على مستقيم مدرّج.",
  },
  intGamePaths: {
    page: 6,
    title: "مخطّط مراحل لعبة الحاسوب",
    detail: "أربعة مسارات تنطلق من \\(+2\\) في المرحلة الأولى مرورًا بالثانية حتى الثالثة؛ \\(+\\) للربح و\\(-\\) للخسارة.",
  },
  intOpposites: {
    page: 6,
    title: "العددان المتعاكسان على مستقيم الأعداد",
    detail: "يقع الصفر في منتصف القطعة الواصلة بين \\(-3\\) و\\(+3\\)، ويبعد كل منهما عن الصفر \\(3\\) وحدات.",
  },
  intAddLine: {
    page: 7,
    title: "تمثيل جمع عددين صحيحين على مستقيم الأعداد",
    detail: "نحدّد العدد الأول ثم ننتقل إلى اليمين لجمع عدد موجب كما في \\((-5)+(+3)=-2\\)، وإلى اليسار لجمع عدد سالب كما في \\((-2)+(-3)=-5\\).",
  },
  intSubLine: {
    page: 8,
    title: "تمثيل طرح عددين صحيحين على مستقيم الأعداد",
    detail: "نحدّد العدد الأول ثم ننتقل إلى اليسار لطرح عدد موجب كما في \\((-4)-(+2)=-6\\)، وإلى اليمين لطرح عدد سالب كما في \\((-2)-(-7)=+5\\).",
  },
  intShortTable: {
    page: 7,
    title: "أمثلة القاعدة وجدول الكتابة المختزلة للجمع",
    detail: "نجمع البُعدين عند توافق الإشارة ونطرحهما عند اختلافها، ويمكن الاستغناء عن الأقواس وإشارة الجمع في الكتابة المختزلة.",
  },
};
