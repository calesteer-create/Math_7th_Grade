// بيانات الدرس الرابع (الأعداد العادية) وحساباته الدقيقة.
// كل المقارنات تتم بالضرب التبادلي على أعداد صحيحة (BigInt) أو عبر parseExactNumber،
// فلا يقلب تقريب الفاصلة العائمة ترتيب عددين، ولا يُعرض موضع كاذب على مستقيم الأعداد.
import { displayRational, normalizeNumericText, parseExactNumber, reduceFraction } from "@/lib/numbers";

export type Fraction = { numerator: number; denominator: number };

export type RationalFigureKind = "rationalWarmup" | "rationalSetNesting" | "rationalNumberLine" | "rationalCheckLine";

export const RATIONAL_FIGURE_KINDS = [
  "rationalWarmup",
  "rationalSetNesting",
  "rationalNumberLine",
  "rationalCheckLine",
] as const satisfies readonly RationalFigureKind[];

export const RATIONAL_FIGURE_SOURCES: Record<RationalFigureKind, { page: number; title: string; detail: string }> = {
  rationalWarmup: {
    page: 13,
    title: "انطلاقة نشطة: العدد الواحد بصور كثيرة",
    detail: "جدول من أربعة أسطر، في كل سطر ثلاث كتابات مرتّبة في أعمدة، وكتابة واحدة فقط صحيحة للعدد المطلوب. الأعداد والكسور محفوظة كما في المصدر دون كشف الإجابة.",
  },
  rationalSetNesting: {
    page: 13,
    title: "مجموعات الأعداد: الطبيعية داخل الصحيحة داخل العادية",
    detail: "ثلاث مجموعات متداخلة: الأعداد الطبيعية في الداخل، ثم الأعداد الصحيحة، ثم الأعداد العادية في الخارج؛ لأن كل عدد طبيعي عدد صحيح، وكل عدد صحيح عدد عادي.",
  },
  rationalNumberLine: {
    page: 14,
    title: "عددان عاديان على مستقيم الأعداد",
    detail: "مستقيم أعداد من \(-3\) إلى \(+3\)، عليه النقطتان \(-\frac{1}{2}\) و\(\frac{5}{4}\) في موضعيهما الحقيقيين، والقيمة تزداد كلما انتقلنا إلى اليمين.",
  },
  rationalCheckLine: {
    page: 14,
    title: "تحقق من فهمك: تمثيل وسيم للنقطتين",
    detail: "مستقيم أعداد من \(-6\) إلى \(+6\)، بدأ وسيم بتمثيل \(A=\frac{7}{2}\) و\(B=-\frac{14}{3}\)، والمطلوب إكمال تمثيل بقية النقط.",
  },
};

/** يبني صيغة KaTeX لكسر؛ مع normalize=false تُحفظ إشارة المقام كما في المصدر. */
export function fractionTeX(fraction: Fraction, normalize = true): string {
  if (normalize && fraction.denominator < 0) {
    return `\\frac{${-fraction.numerator}}{${-fraction.denominator}}`;
  }
  return `\\frac{${fraction.numerator}}{${fraction.denominator}}`;
}

export function fractionText(fraction: Fraction): string {
  return `${fraction.numerator}/${fraction.denominator}`;
}

/** قيمة عشرية للعرض، مع ≈ عندما يكون النص العشري تقريبًا لا مطابقًا. */
export function fractionDecimalText(fraction: Fraction): string {
  return displayRational(fraction.numerator, fraction.denominator, 4);
}

/** مقارنة كسرين بدقة تامة: -1 أصغر، 0 يساوي، 1 أكبر. */
export function compareFractions(left: Fraction, right: Fraction): -1 | 0 | 1 {
  const a = BigInt(left.numerator) * BigInt(right.denominator);
  const b = BigInt(right.numerator) * BigInt(left.denominator);
  return a < b ? -1 : a > b ? 1 : 0;
}

/** يقرأ عددًا عشريًا أو كسرًا نصيًا ككسر عادي مبسّط، أو null إن كان النص غير صالح. */
export function fractionFromText(text: string): Fraction | null {
  const normalized = normalizeNumericText(text);
  const match = /^([+-]?)(\d*)(?:\.(\d*))?$/.exec(normalized);
  if (!match) {
    const exact = parseExactNumber(normalized);
    if (!exact || exact.denominator > BigInt(Number.MAX_SAFE_INTEGER) || exact.numerator > BigInt(Number.MAX_SAFE_INTEGER)) return null;
    return reduceFraction(Number(exact.numerator), Number(exact.denominator));
  }
  const integerPart = match[2] ?? "";
  const fractionPart = match[3] ?? "";
  if (!integerPart && !fractionPart) return null;
  const sign = match[1] === "-" ? -1 : 1;
  const numerator = sign * Number(`${integerPart || "0"}${fractionPart}`);
  const denominator = 10 ** fractionPart.length;
  if (!Number.isSafeInteger(numerator)) return null;
  return reduceFraction(numerator, denominator);
}

/** مقارنة عددين مكتوبين كنص (كسر أو عشري) دون أي تقريب. */
export function compareRationalText(left: string, right: string): -1 | 0 | 1 {
  const a = parseExactNumber(left);
  const b = parseExactNumber(right);
  if (!a || !b) throw new Error(`قيمة عددية غير صالحة في المقارنة: ${left} / ${right}`);
  const first = a.numerator * b.denominator;
  const second = b.numerator * a.denominator;
  return first < second ? -1 : first > second ? 1 : 0;
}

/** يرتب نصوصًا عددية تصاعديًا أو تنازليًا بمقارنة دقيقة. */
export function sortRationalTexts(values: readonly string[], direction: "asc" | "desc" = "asc"): string[] {
  const sorted = [...values].sort(compareRationalText);
  return direction === "asc" ? sorted : sorted.reverse();
}

export function gcdNumber(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

export function lcmNumber(a: number, b: number): number {
  return Math.abs(a * b) / gcdNumber(a, b);
}

/** الصورة المختلطة: 9/4 = 2 و1/4، و-9/4 = -(2 و1/4). */
export function mixedNumberText(fraction: Fraction): string {
  const reduced = reduceFraction(fraction.numerator, fraction.denominator);
  const sign = reduced.numerator < 0 ? "-" : "";
  const numerator = Math.abs(reduced.numerator);
  const whole = Math.floor(numerator / reduced.denominator);
  const remainder = numerator % reduced.denominator;
  if (!remainder) return `${sign}${whole}`;
  if (!whole) return `${sign}\\frac{${remainder}}{${reduced.denominator}}`;
  return `${sign}${whole}\\frac{${remainder}}{${reduced.denominator}}`;
}

/** أقرب عددين صحيحين متتاليين يقع بينهما العدد. */
export function betweenIntegers(value: number): { lower: number; upper: number } {
  const lower = Math.floor(value);
  const upper = Math.ceil(value);
  return { lower, upper };
}

/** تصنيف الكتابة: عدد صحيح، أو كسر أصغر من 1، أو كسر أكبر من 1. */
export function fractionClass(fraction: Fraction): "integer" | "proper" | "improper" {
  const reduced = reduceFraction(fraction.numerator, fraction.denominator);
  if (reduced.denominator === 1) return "integer";
  return Math.abs(reduced.numerator) < reduced.denominator ? "proper" : "improper";
}

// ————— انطلاقة نشطة: الجدول كما في المصدر، والكتابة الصحيحة محسوبة لا مخمّنة —————
export type WarmupOption = "A" | "B" | "C";
export type WarmupRow = { value: string; valueTeX: string; options: Record<WarmupOption, Fraction>; answer: WarmupOption; reason: string };

export const RATIONAL_WARMUP_ROWS: readonly WarmupRow[] = [
  {
    value: "7",
    valueTeX: "7",
    options: { A: { numerator: 0, denominator: 7 }, B: { numerator: 1, denominator: 7 }, C: { numerator: -14, denominator: -2 } },
    answer: "C",
    reason: "لأن \\((-14)\\div(-2)=7\\)؛ فالبسط والمقام سالبان والناتج موجب.",
  },
  {
    value: "-4",
    valueTeX: "-4",
    options: { A: { numerator: -1, denominator: 4 }, B: { numerator: -24, denominator: 6 }, C: { numerator: -6, denominator: 24 } },
    answer: "B",
    reason: "لأن \\((-24)\\div 6=-4\\)؛ الإشارتان مختلفتان والناتج سالب.",
  },
  {
    value: "3.5",
    valueTeX: "3.5",
    options: { A: { numerator: 7, denominator: 2 }, B: { numerator: 5, denominator: 3 }, C: { numerator: 3, denominator: 5 } },
    answer: "A",
    reason: "لأن \\(7\\div 2=3.5\\)؛ والعدد 3.5 يساوي ثلاثة أعداد صحيحة ونصفًا.",
  },
  {
    value: "4.25",
    valueTeX: "4.25",
    options: { A: { numerator: 425, denominator: 10 }, B: { numerator: 425, denominator: 100 }, C: { numerator: 425, denominator: 1000 } },
    answer: "B",
    reason: "لأن \\(425\\div 100=4.25\\)؛ فالفاصلة العشرية تفصل منزلتين، لذا المقام 100.",
  },
];

// ————— تمثيل على مستقيم الأعداد كما في المصدر —————
export const RATIONAL_TOP_LINE = {
  min: -3,
  max: 3,
  points: [
    { tex: "-\\frac{1}{2}", fraction: { numerator: -1, denominator: 2 }, color: "#1d4ed8" },
    { tex: "\\frac{5}{4}", fraction: { numerator: 5, denominator: 4 }, color: "#be123c" },
  ],
} as const;

export const RATIONAL_CHECK_LINE = {
  min: -6,
  max: 6,
  given: [
    { label: "A", fraction: { numerator: 7, denominator: 2 }, tex: "\\frac{7}{2}", color: "#be123c" },
    { label: "B", fraction: { numerator: -14, denominator: 3 }, tex: "-\\frac{14}{3}", color: "#1d4ed8" },
  ],
  tasks: [
    { label: "C", fraction: { numerator: 0, denominator: 1 }, tex: "0" },
    { label: "D", fraction: { numerator: -3, denominator: 1 }, tex: "-3" },
    { label: "E", fraction: { numerator: 4, denominator: 1 }, tex: "+4" },
    { label: "F", fraction: { numerator: 3, denominator: 2 }, tex: "\\frac{3}{2}" },
    { label: "G", fraction: { numerator: -9, denominator: 4 }, tex: "-\\frac{9}{4}" },
    { label: "H", fraction: { numerator: 9, denominator: 4 }, tex: "2\\frac{1}{4}" },
  ],
} as const;

/** المواضع الست مرتّبة من اليسار إلى اليمين؛ تلميحات التمرين تُسند الحرف إلى موضعه. */
export const RATIONAL_CHECK_SLOTS = [...RATIONAL_CHECK_LINE.tasks]
  .map(task => ({ ...task, value: task.fraction.numerator / task.fraction.denominator }))
  .sort((left, right) => left.value - right.value);

// ————— مثال توحيد المقامين كما في المصدر —————
export const COMMON_DENOMINATOR_EXAMPLE = {
  first: { numerator: -13, denominator: 15 },
  second: { numerator: -19, denominator: 21 },
  commonDenominator: lcmNumber(15, 21),
  firstFactor: lcmNumber(15, 21) / 15,
  secondFactor: lcmNumber(15, 21) / 21,
  firstScaled: { numerator: -13 * (lcmNumber(15, 21) / 15), denominator: lcmNumber(15, 21) },
  secondScaled: { numerator: -19 * (lcmNumber(15, 21) / 21), denominator: lcmNumber(15, 21) },
} as const;

// ————— أمثلة الترتيب في تدريبات المصدر —————
export const RATIONAL_ASCENDING_EXAMPLE = ["-200", "+78", "-6.25", "+10", "+25.14"] as const;
export const RATIONAL_DESCENDING_EXAMPLE = ["12/32", "-125/225", "-4/8", "2"] as const;

export const RATIONAL_ASCENDING_ORDER = sortRationalTexts(RATIONAL_ASCENDING_EXAMPLE, "asc");
export const RATIONAL_DESCENDING_ORDER = sortRationalTexts(RATIONAL_DESCENDING_EXAMPLE, "desc");

/** الصيغ المكافئة التي يعرضها المختبر والشرح للعدد نفسه. */
export const EQUIVALENT_EXAMPLES = [
  { tex: "5/4", fraction: { numerator: 5, denominator: 4 }, mixed: "1\\frac{1}{4}", decimal: "1.25" },
  { tex: "3/100", fraction: { numerator: 3, denominator: 100 }, mixed: null, decimal: "0.03" },
  { tex: "-14/3", fraction: { numerator: -14, denominator: 3 }, mixed: "-4\\frac{2}{3}", decimal: null },
] as const;
