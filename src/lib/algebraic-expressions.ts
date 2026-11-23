// دوال رياضية دقيقة (بأعداد كسرية صحيحة عبر BigInt بلا تقريب عشري)
// وبيانات الرسوم والأنشطة للدرس السابع: العبارات الجبرية (ص 28–35).

export type ExactFrac = { num: bigint; den: bigint };

const ZERO = BigInt(0);
const ONE = BigInt(1);
const NEG_ONE = BigInt(-1);

function absBig(n: bigint): bigint {
  return n < ZERO ? -n : n;
}

function gcdBig(a: bigint, b: bigint): bigint {
  let x = absBig(a);
  let y = absBig(b);
  while (y !== ZERO) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x === ZERO ? ONE : x;
}

export function frac(num: number | bigint, den: number | bigint = 1): ExactFrac {
  const n = BigInt(num);
  const d = BigInt(den);
  if (d === ZERO) throw new Error("المقام لا يمكن أن يساوي صفرًا.");
  const sign = d < ZERO ? NEG_ONE : ONE;
  const g = gcdBig(n, d);
  return { num: (sign * n) / g, den: absBig(d) / g };
}

export function addFrac(a: ExactFrac, b: ExactFrac): ExactFrac {
  return frac(a.num * b.den + b.num * a.den, a.den * b.den);
}

export function subFrac(a: ExactFrac, b: ExactFrac): ExactFrac {
  return frac(a.num * b.den - b.num * a.den, a.den * b.den);
}

export function mulFrac(a: ExactFrac, b: ExactFrac): ExactFrac {
  return frac(a.num * b.num, a.den * b.den);
}

export function divFrac(a: ExactFrac, b: ExactFrac): ExactFrac {
  if (b.num === ZERO) throw new Error("القسمة على صفر غير معرّفة.");
  return frac(a.num * b.den, a.den * b.num);
}

export function eqFrac(a: ExactFrac, b: ExactFrac): boolean {
  return a.num * b.den === b.num * a.den;
}

export function fracToTeX(f: ExactFrac): string {
  const n = frac(f.num, f.den);
  if (n.den === ONE) return n.num.toString();
  const sign = n.num < ZERO ? "-" : "";
  return `${sign}\\frac{${absBig(n.num).toString()}}{${n.den.toString()}}`;
}

export function fracToPlain(f: ExactFrac): string {
  const n = frac(f.num, f.den);
  if (n.den === ONE) return n.num.toString();
  return `${n.num.toString()}/${n.den.toString()}`;
}

/** حساب قيمة العبارة الخطية ax + b عند قيمة دقيقة x. */
export function evaluateLinear(a: ExactFrac, b: ExactFrac, x: ExactFrac): ExactFrac {
  return addFrac(mulFrac(a, x), b);
}

/** هل الحدّان متشابهان؟ يكونان متشابهين إذا تطابق القسم الحرفي (أو كان كلاهما ثابتًا ""). */
export function areLikeTerms(varA: string, varB: string): boolean {
  return varA.trim() === varB.trim();
}

export type LinearTerm = { coef: ExactFrac; variable: string };

/** جمع الحدود المتشابهة بدقة تامة. */
export function combineLikeTerms(terms: LinearTerm[]): Record<string, ExactFrac> {
  const totals: Record<string, ExactFrac> = {};
  for (const term of terms) {
    const key = term.variable.trim();
    totals[key] = totals[key] ? addFrac(totals[key], term.coef) : frac(term.coef.num, term.coef.den);
  }
  return totals;
}

/** توزيع العدد k على العبارة (ax + b): يعطي (ka)x + (kb). */
export function distributeScalar(k: ExactFrac, a: ExactFrac, b: ExactFrac): { a: ExactFrac; b: ExactFrac } {
  return { a: mulFrac(k, a), b: mulFrac(k, b) };
}

/** تبسيط العبارة k(ax + b) + cx + d إلى الشكل Ax + B. */
export function simplifyDistributed(
  k: ExactFrac,
  a: ExactFrac,
  b: ExactFrac,
  c: ExactFrac = frac(0),
  d: ExactFrac = frac(0),
): { a: ExactFrac; b: ExactFrac } {
  const expanded = distributeScalar(k, a, b);
  return { a: addFrac(expanded.a, c), b: addFrac(expanded.b, d) };
}

/** تنسيق عبارة خطية Ax + B بصيغة KaTeX نظيفة (مع معالجة الأصفار و1 و-1). */
export function linearToTeX(a: ExactFrac, b: ExactFrac, variable = "x"): string {
  const ca = frac(a.num, a.den);
  const cb = frac(b.num, b.den);
  const parts: string[] = [];

  if (ca.num !== ZERO) {
    if (ca.den === ONE && ca.num === ONE) parts.push(variable);
    else if (ca.den === ONE && ca.num === NEG_ONE) parts.push(`-${variable}`);
    else parts.push(`${fracToTeX(ca)}${variable}`);
  }

  if (cb.num !== ZERO) {
    const absB = frac(absBig(cb.num), cb.den);
    if (parts.length === 0) {
      parts.push(fracToTeX(cb));
    } else if (cb.num > ZERO) {
      parts.push(`+ ${fracToTeX(absB)}`);
    } else {
      parts.push(`- ${fracToTeX(absB)}`);
    }
  }

  return parts.length ? parts.join(" ") : "0";
}

/** محيط المثلث من تدريب 3 ص 35 بأضلاع x و 8 و 2x + 1. */
export function trianglePerimeter(x: number): { sides: [number, number, number]; perimeter: number; validTriangle: boolean } {
  const s1 = x;
  const s2 = 8;
  const s3 = 2 * x + 1;
  const validTriangle = s1 > 0 && s2 > 0 && s3 > 0 && s1 + s2 > s3 && s1 + s3 > s2 && s2 + s3 > s1;
  return { sides: [s1, s2, s3], perimeter: 3 * x + 9, validTriangle };
}

// ————— سجل مصادر رسوم الدرس السابع —————
export const ALGEBRA_FIGURE_KINDS = [
  "envelopesModels",
  "expressionAnatomy",
  "envelopesAddition",
  "trianglePerimeter",
] as const;
export type AlgebraFigureKind = (typeof ALGEBRA_FIGURE_KINDS)[number];

export const ALGEBRA_STUDIO_MODES = ["full", "envelopes", "combine", "distribute", "translate"] as const;
export type AlgebraStudioMode = (typeof ALGEBRA_STUDIO_MODES)[number];

export const ALGEBRA_FIGURE_SOURCES: Record<AlgebraFigureKind, { page: number; title: string; detail: string }> = {
  envelopesModels: {
    page: 29,
    title: "نماذج المغلّفات والنقود (الأشكال 1–4)",
    detail: "أربعة أشكال من نشاط 1 ص 29: الشكل (1) مغلّفان و3 قطع 2x+3، الشكل (2) 3 مغلّفات وقطعة 3x+1، الشكل (3) 4 مغلّفات 4x، الشكل (4) 3 قطع 3.",
  },
  expressionAnatomy: {
    page: 29,
    title: "مكوّنات العبارة الجبرية ax + b",
    detail: "مخطط تعلّم ص 29 الذي يفصّل العبارة ax + b إلى مَثَل المتغيّر a، والمتغيّر x، والحدّ الثابت +b.",
  },
  envelopesAddition: {
    page: 30,
    title: "جمع عبارتين جبريتين بالمغلّفات والنقود",
    detail: "نشاط 4 ص 30: جمع (2x+3) مع (3x+1) يعطي 5 مغلّفات و4 قطع نقود، أي 5x+4.",
  },
  trianglePerimeter: {
    page: 35,
    title: "مثلث أطوال أضلاعه x و 8 و 2x + 1",
    detail: "شكل تدريب 3 ص 35 لحساب محيط المثلث كعبارة جبرية مختزلة 3x+9 ثم عند x=3.",
  },
};

export const ENVELOPE_SHAPES = [
  { id: 1, label: "الشكل (1)", envelopes: 2, coins: 3, tex: "2x + 3", shown: true },
  { id: 2, label: "الشكل (2)", envelopes: 3, coins: 1, tex: "3x + 1", shown: false },
  { id: 3, label: "الشكل (3)", envelopes: 4, coins: 0, tex: "4x", shown: false },
  { id: 4, label: "الشكل (4)", envelopes: 0, coins: 3, tex: "3", shown: false },
] as const;

export const TRANSLATION_PRESETS = [
  { id: "add", label: "يزيد على العدد بمقدار b", op: "add" as const, a: 1, b: 8, sampleContext: "طول رامي يزيد على طول فادي بمقدار 8" },
  { id: "sub", label: "ينقص عن العدد بمقدار b", op: "sub" as const, a: 1, b: 5, sampleContext: "عدد ينقص عن x بمقدار 5" },
  { id: "double-sub", label: "ينقص عن ضعفي العدد بمقدار b", op: "sub" as const, a: 2, b: 3, sampleContext: "عمر هبة ينقص عن ضعفي عمر رؤى بمقدار 3" },
  { id: "triple-add", label: "ثلاثة أضعاف العدد مضافًا إليه b", op: "add" as const, a: 3, b: 7, sampleContext: "ثلاثة أضعاف x مضافًا إليه 7" },
] as const;
