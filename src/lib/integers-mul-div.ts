// بيانات ورسوم وحسابات الدرس الثالث: الأعداد الصحيحة (الضرب والقسمة) — الصفحات 10–12.

export type IntegersMulDivFigureKind =
  | "muldivWarmup"
  | "muldivSignMatrix"
  | "muldivPatternLadder"
  | "muldivShortTable"
  | "muldivDivisionExamples";

export const INTEGER_MUL_DIV_FIGURE_KINDS = [
  "muldivWarmup",
  "muldivSignMatrix",
  "muldivPatternLadder",
  "muldivShortTable",
  "muldivDivisionExamples",
] as const;

export const MULDIV_WARMUP_ROWS = [
  {
    id: "r1",
    prompt: "ناتج \\(7\\times 9\\)",
    options: [
      { key: "A", label: "63", tex: "63" },
      { key: "B", label: "16", tex: "16" },
      { key: "C", label: "36", tex: "36" },
    ],
    answer: "A",
  },
  {
    id: "r2",
    prompt: "ناتج \\(8\\div 4\\)",
    options: [
      { key: "A", label: "1/2", tex: "\\frac{1}{2}" },
      { key: "B", label: "12", tex: "12" },
      { key: "C", label: "2", tex: "2" },
    ],
    answer: "C",
  },
  {
    id: "r3",
    prompt: "ناتج \\(3\\times 0\\)",
    options: [
      { key: "A", label: "30", tex: "30" },
      { key: "B", label: "0", tex: "0" },
      { key: "C", label: "3", tex: "3" },
    ],
    answer: "B",
  },
  {
    id: "r4",
    prompt: "ناتج \\(0\\div 6\\)",
    options: [
      { key: "A", label: "0", tex: "0" },
      { key: "B", label: "1", tex: "1" },
      { key: "C", label: "6", tex: "6" },
    ],
    answer: "A",
  },
  {
    id: "r5",
    prompt: "ناتج \\(4\\div 0\\)",
    options: [
      { key: "A", label: "غير ممكنة", tex: null },
      { key: "B", label: "4", tex: "4" },
      { key: "C", label: "0", tex: "0" },
    ],
    answer: "A",
  },
] as const;

export const BOOK_MUL_EXAMPLES = [
  { tex: "(+6)\\times(+2)=+12", a: 6, b: 2, result: 12, sameSign: true },
  { tex: "(+5)\\times(-5)=-25", a: 5, b: -5, result: -25, sameSign: false },
  { tex: "(-4)\\times(-5)=+20", a: -4, b: -5, result: 20, sameSign: true },
  { tex: "(-7)\\times(+2)=-14", a: -7, b: 2, result: -14, sameSign: false },
] as const;

export const BOOK_MUL_SHORT_ROWS = [
  { full: "(-5)\\times(+8)", short: "(-5)(+8)", reason: "جاء بعد إشارة الضرب قوس" },
  { full: "-15\\times a", short: "-15a", reason: "جاء بعد إشارة الضرب حرف" },
  { full: "9\\times(x+2)", short: "9(x+2)", reason: "جاء بعد إشارة الضرب قوس" },
] as const;

export const BOOK_DIV_EXAMPLES = [
  { tex: "(+6)\\div(+2)=+3", a: 6, b: 2, result: 3, fraction: false },
  { tex: "(-24)\\div(-2)=+12", a: -24, b: -2, result: 12, fraction: false },
  { tex: "\\frac{-48}{-6}=+8", a: -48, b: -6, result: 8, fraction: true },
  { tex: "(+8)\\div(-8)=-1", a: 8, b: -8, result: -1, fraction: false },
  { tex: "(-15)\\div(+3)=-5", a: -15, b: 3, result: -5, fraction: false },
  { tex: "\\frac{-63}{7}=-9", a: -63, b: 7, result: -9, fraction: true },
] as const;

export const BOOK_SIGN_EXERCISES = [
  { key: "s1", tex: "(-5)\\times(+8)", sign: "-" as const, reason: "مختلفان في الإشارة (سالب في موجب)" },
  { key: "s2", tex: "9\\times(-48)", sign: "-" as const, reason: "مختلفان في الإشارة (موجب في سالب)" },
  { key: "s3", tex: "(-16)\\div(-8)", sign: "+" as const, reason: "لهما الإشارة نفسها (سالب على سالب)" },
  { key: "s4", tex: "145\\div(-5)", sign: "-" as const, reason: "مختلفان في الإشارة (موجب على سالب)" },
] as const;

export const BOOK_CALC_GROUP_A = [
  { key: "a1", index: 1, tex: "(+2)\\times(-6)", expected: -12 },
  { key: "a2", index: 2, tex: "(-36)\\div(+6)", expected: -6 },
  { key: "a3", index: 3, tex: "(-4)(-2)", expected: 8 },
] as const;

export const BOOK_CALC_GROUP_B = [
  { key: "b1", index: 1, tex: "(+9)\\div(-1)", expected: -9 },
  { key: "b2", index: 2, tex: "0\\div(-3)", expected: 0 },
  { key: "b3", index: 3, tex: "(-1)(-2)(-5)", expected: -10 },
] as const;

export const BOOK_CALC_GROUP_C = [
  { key: "c1", index: 1, tex: "(-2)(-3)(-4)(-5)", expected: 120 },
  { key: "c2", index: 2, tex: "(5-9)(10-12)", expected: 8 },
  { key: "c3", index: 3, tex: "(-3+6)(-25+50-18-7)", expected: 0 },
] as const;

export const BOOK_FILL_EQUATIONS = [
  { key: "f1", order: 1, leftTeX: "(-3)(+5)(", rightTeX: ")=-15", expected: 1 },
  { key: "f2", order: 2, leftTeX: "(", rightTeX: ")(-2)(+14)=140", expected: -5 },
  { key: "f3", order: 3, leftTeX: ")(+9)(-2)=-36", expectedProduct: 2 },
  { key: "f4", order: 4, leftTeX: "(-123)(-47)(", rightTeX: ")=0", expected: 0 },
] as const;

/** تنسيق عدد صحيح بإشارته الصريحة عند اللزوم في KaTeX. */
export function signedIntTeX(n: number, explicitPlus = true): string {
  if (n > 0) return explicitPlus ? `+${n}` : `${n}`;
  return String(n);
}

/** وصف قاعدة ضرب عددين وتدرّج النمط لإقناع المتعلّم بقاعدة الإشارات. */
export function buildMulPattern(a: number, fromB = 3, toB = -5) {
  const rows: { b: number; product: number; stepDelta: number }[] = [];
  for (let b = fromB; b >= toB; b--) {
    const raw = a * b;
    rows.push({
      b,
      product: raw === 0 ? 0 : raw,
      stepDelta: -a === 0 ? 0 : -a,
    });
  }
  return rows;
}

/** حساب جداء قائمة عوامل صحيحة مع عدّ الإشارات السالبة وكشف الصفر. */
export function analyzeProduct(factors: readonly number[]) {
  const hasZero = factors.some(n => n === 0);
  const negativeCount = factors.filter(n => n < 0).length;
  const product = factors.reduce((acc, n) => acc * n, 1);
  const signParity: "zero" | "even" | "odd" = hasZero
    ? "zero"
    : negativeCount % 2 === 0
      ? "even"
      : "odd";
  const signSymbol = hasZero ? "0" : negativeCount % 2 === 0 ? "+" : "-";
  return {
    factors: [...factors],
    hasZero,
    negativeCount,
    product: hasZero ? 0 : product,
    signParity,
    signSymbol,
    sameSign: factors.length === 2 && !hasZero && ((factors[0] > 0 && factors[1] > 0) || (factors[0] < 0 && factors[1] < 0)),
  };
}

/** تحليل قسمة عددين صحيحين والتحقق من شرط المقسوم عليه والعلاقة بالضرب. */
export function analyzeDivision(dividend: number, divisor: number) {
  if (divisor === 0) {
    return {
      dividend,
      divisor,
      possible: false as const,
      exactInteger: false,
      quotientText: "غير ممكنة",
      sameSign: false,
      checkTeX: "0\\times ? = " + signedIntTeX(dividend, false),
    };
  }
  const exactInteger = dividend % divisor === 0;
  const q = dividend / divisor;
  const sameSign = dividend !== 0 && ((dividend > 0 && divisor > 0) || (dividend < 0 && divisor < 0));
  const normalizedQ = q === 0 ? 0 : q;
  return {
    dividend,
    divisor,
    possible: true as const,
    exactInteger,
    quotient: normalizedQ,
    quotientText: exactInteger ? signedIntTeX(normalizedQ, normalizedQ !== 0) : `${signedIntTeX(dividend, false)}/${signedIntTeX(divisor, false)}`,
    sameSign,
    checkTeX: `(${signedIntTeX(divisor)})\\times(${exactInteger ? signedIntTeX(normalizedQ, normalizedQ !== 0) : "?"})=${dividend === 0 ? "0" : signedIntTeX(dividend)}`,
  };
}

export const INTEGER_MUL_DIV_FIGURE_SOURCES: Record<
  IntegersMulDivFigureKind,
  { page: number; title: string; detail: string }
> = {
  muldivWarmup: {
    page: 10,
    title: "جدول انطلاقة نشطة: الضرب والقسمة وحالات الصفر",
    detail: "خمسة أسطر تذكّر بالضرب والقسمة في \\(\\mathbb{N}\\) وتميّز بين \\(0\\div 6=0\\) و\\(4\\div 0\\) غير الممكنة.",
  },
  muldivSignMatrix: {
    page: 10,
    title: "قاعدة الإشارات في ضرب عددين صحيحين",
    detail: "تتشابه الإشارتان فيكون الناتج موجبًا، وتختلفان فيكون الناتج سالبًا، مع أمثلة الضرب الأربعة في الدرس.",
  },
  muldivPatternLadder: {
    page: 11,
    title: "سُلّم النمط: لماذا ناتج \\((-4)\\times(-5)=+20\\)؟",
    detail: "كلّما نقص العامل الثاني بمقدار \\(1\\) زاد ناتج الضرب بمقدار \\(+4\\)، فيستمر النمط طبيعيًا إلى الموجب بعد الصفر.",
  },
  muldivShortTable: {
    page: 11,
    title: "جدول الكتابة المختزلة لعملية الضرب",
    detail: "تُحذف إشارة \\(\\times\\) إذا تبعها حرف أو قوس مثل \\((-5)(+8)\\) و\\(-15a\\) و\\(9(x+2)\\).",
  },
  muldivDivisionExamples: {
    page: 12,
    title: "أمثلة قسمة عددين صحيحين بصيغتي القسمة والكسر",
    detail: "ستة أمثلة تعرض القسمة بالرمز \\(\\div\\) وبخط الكسر \\(\\frac{a}{b}\\) بشرط أن يكون المقسوم عليه غير معدوم.",
  },
};
