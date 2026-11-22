// بيانات الدرس الخامس (العمليات على الأعداد العادية) وحساباته الدقيقة.
// كل العمليات تُجرى على أعداد صحيحة (BigInt) أو على كسور مُختزلة، فلا تقريب عشري
// يقلب الناتج، ولا تُعرض نتيجة غير معرّفة عند قسمة على صفر.
import { normalizeNumericText, reduceFraction } from "@/lib/numbers";
import { gcdNumber, lcmNumber, type Fraction } from "@/lib/rational-numbers";

export type RationalOperation = "add" | "sub" | "mul" | "div";
export const OPERATION_LABELS: Record<RationalOperation, string> = {
  add: "جمع",
  sub: "طرح",
  mul: "ضرب",
  div: "قسمة",
};

/** كسر صالح: مقام غير معدوم، وإشارة المقام موجبة دائماً في النتيجة. */
export function normalizeFraction(fraction: Fraction): Fraction {
  if (!Number.isSafeInteger(fraction.numerator) || !Number.isSafeInteger(fraction.denominator) || fraction.denominator === 0) {
    throw new Error("كسر غير صالح: المقام يجب ألا يكون صفرًا.");
  }
  if (fraction.denominator < 0) return reduceFraction(-fraction.numerator, -fraction.denominator);
  return reduceFraction(fraction.numerator, fraction.denominator);
}

export function reciprocal(fraction: Fraction): Fraction {
  if (fraction.numerator === 0) throw new Error("الصفر لا مقلوب له؛ لا يمكن القسمة على صفر.");
  return normalizeFraction({ numerator: fraction.denominator, denominator: fraction.numerator });
}

/** ناتج عملية واحدة على كسرين، بعد الاختزال وبمقام موجب. يرفض القسمة على صفر. */
export function applyOperation(left: Fraction, right: Fraction, operation: RationalOperation): Fraction {
  const a = normalizeFraction(left);
  const b = normalizeFraction(right);
  if (operation === "div" && b.numerator === 0) throw new Error("لا يمكن القسمة على صفر.");
  const raw: Fraction =
    operation === "add" ? { numerator: a.numerator * b.denominator + b.numerator * a.denominator, denominator: a.denominator * b.denominator }
      : operation === "sub" ? { numerator: a.numerator * b.denominator - b.numerator * a.denominator, denominator: a.denominator * b.denominator }
        : operation === "mul" ? { numerator: a.numerator * b.numerator, denominator: a.denominator * b.denominator }
          : { numerator: a.numerator * b.denominator, denominator: a.denominator * b.numerator };
  if (!Number.isSafeInteger(raw.numerator) || !Number.isSafeInteger(raw.denominator)) throw new Error("الناتج خارج المدى المدعوم.");
  return normalizeFraction(raw);
}

/** خطوات تعليمية للعملية: توحيد المقامات في الجمع والطرح، والمقلوب في القسمة. */
export function operationSteps(left: Fraction, right: Fraction, operation: RationalOperation): { title: string; text: string; formula?: string }[] {
  const a = normalizeFraction(left);
  const b = normalizeFraction(right);
  const result = applyOperation(a, b, operation);
  const steps: { title: string; text: string; formula?: string }[] = [];
  if (operation === "add" || operation === "sub") {
    if (a.denominator !== b.denominator) {
      const common = lcmNumber(a.denominator, b.denominator);
      steps.push({
        title: "نوحّد المقامين",
        text: `المضاعف المشترك الأصغر للمقامين ${a.denominator} و${b.denominator} هو ${common}؛ نضرب بسط كل كسر ومقامه في العامل المناسب.`,
        formula: `\\frac{${a.numerator}}{${a.denominator}}=\\frac{${a.numerator * (common / a.denominator)}}{${common}},\\quad \\frac{${b.numerator}}{${b.denominator}}=\\frac{${b.numerator * (common / b.denominator)}}{${common}}`,
      });
      const leftScaled = a.numerator * (common / a.denominator);
      const rightScaled = b.numerator * (common / b.denominator);
      steps.push({
        title: operation === "add" ? "نجمع البسطين على المقام المشترك" : "نطرح البسطين على المقام المشترك",
        text: "المقام لا يُجمع ولا يُطرح؛ يبقى المقام المشترك، ونعمل على البسطين فقط.",
        formula: `\\frac{${leftScaled}${operation === "add" ? "+" : "-"}${rightScaled < 0 ? `(${rightScaled})` : rightScaled}}{${common}}=\\frac{${operation === "add" ? leftScaled + rightScaled : leftScaled - rightScaled}}{${common}}`,
      });
    } else {
      steps.push({
        title: "المقامان متساويان",
        text: "نضع المقام نفسه مرة واحدة، ونجري العملية على البسطين مباشرة.",
        formula: `\\frac{${a.numerator}${operation === "add" ? "+" : "-"}${b.numerator < 0 ? `(${b.numerator})` : b.numerator}}{${a.denominator}}`,
      });
    }
  } else if (operation === "mul") {
    const g1 = gcdNumber(a.numerator, b.denominator);
    const g2 = gcdNumber(b.numerator, a.denominator);
    steps.push({
      title: "نضرب البسط في البسط والمقام في المقام",
      text: "الضرب لا يحتاج توحيد مقامات؛ ويمكن الاختزال قبل الضرب لتسهيل الحساب.",
      formula: `\\frac{${a.numerator}\\times${b.numerator < 0 ? `(${b.numerator})` : b.numerator}}{${a.denominator}\\times${b.denominator}}`,
    });
    if (g1 > 1 || g2 > 1) {
      steps.push({
        title: "نختزل قبل الضرب",
        text: `نقسم بسط الكسر الأول ومقام الثاني على ${g1}، وبسط الثاني ومقام الأول على ${g2}.`,
      });
    }
  } else {
    steps.push({
      title: "نحوّل القسمة إلى ضرب بالمقلوب",
      text: "قسمة كسر على كسر هي ضربه في مقلوب الكسر الثاني؛ مقلوب الكسر يبدّل البسط والمقام.",
      formula: `\\frac{${a.numerator}}{${a.denominator}}\\div\\frac{${b.numerator}}{${b.denominator}}=\\frac{${a.numerator}}{${a.denominator}}\\times\\frac{${b.denominator}}{${b.numerator < 0 ? `(${b.numerator})` : b.numerator}}`,
    });
  }
  steps.push({
    title: "نختزل الناتج ونتحقق من الإشارة",
    text: result.denominator === 1 ? "المقام اختزل إلى 1، فالناتج عدد صحيح." : "نقسم البسط والمقام على قاسمهما المشترك الأكبر، ونبقي إشارة المقام موجبة.",
    formula: `\\frac{${result.numerator}}{${result.denominator}}`,
  });
  steps.push({
    title: "نتحقق من الإشارة",
    text: result.numerator === 0
      ? "البسط صفر، فالناتج يساوي صفرًا مهما كان المقام غير معدوم."
      : result.numerator > 0
        ? "البسط والمقام موجبان، فإشارة الناتج موجبة."
        : "البسط سالب والمقام موجب، فإشارة الناتج سالبة.",
  });
  return steps;
}

/** إشارة الكسر كما في قاعدة الدرس: إشارة البسط مقسومة على إشارة المقام. */
export function fractionSign(fraction: Fraction): "positive" | "negative" | "zero" {
  if (fraction.numerator === 0) return "zero";
  return fraction.numerator * fraction.denominator > 0 ? "positive" : "negative";
}

/** يقرأ عدداً صحيحاً أو عشرياً أو كسراً نصياً ويعيد كسراً مُختزلاً، أو null إن كان غير صالح. */
export function decimalToFraction(text: string): Fraction | null {
  const normalized = normalizeNumericText(text).replace(/[−–—]/g, "-").replace(/\s/g, "");
  const match = /^([+-]?)(\d*)(?:\.(\d*))?$/.exec(normalized);
  if (!match) return null;
  const [, sign, integerPart = "", fractionPart = ""] = match;
  if (!integerPart && !fractionPart) return null;
  const digits = `${integerPart || "0"}${fractionPart}`;
  const numerator = Number(digits) * (sign === "-" ? -1 : 1);
  const denominator = 10 ** fractionPart.length;
  if (!Number.isSafeInteger(numerator) || !Number.isSafeInteger(denominator)) return null;
  return reduceFraction(numerator, denominator);
}

/** نص عشري دقيق فقط إذا كان المقام من قوى العدد 10 بعد الاختزال؛ وإلا null. */
export function exactDecimalText(fraction: Fraction): string | null {
  const { numerator, denominator } = normalizeFraction(fraction);
  let d = denominator;
  let twos = 0;
  let fives = 0;
  while (d % 2 === 0) { d /= 2; twos++; }
  while (d % 5 === 0) { d /= 5; fives++; }
  if (d !== 1) return null;
  const places = Math.max(twos, fives);
  if (places === 0) return String(numerator);
  const scaled = numerator * (10 ** places / denominator);
  const sign = scaled < 0 ? "-" : "";
  const digits = String(Math.abs(scaled)).padStart(places + 1, "0");
  const integerPart = digits.slice(0, digits.length - places);
  const fractionPart = digits.slice(digits.length - places).replace(/0+$/, "");
  return `${sign}${integerPart}${fractionPart ? `.${fractionPart}` : ""}`;
}

/** ناتج جمع أو طرح عددين عشريين بنص دقيق، أو null إن لم يكن الناتج عشرياً منتهياً. */
export function decimalOperationText(left: string, right: string, operation: "add" | "sub"): { text: string; fraction: Fraction } | null {
  const a = decimalToFraction(left);
  const b = decimalToFraction(right);
  if (!a || !b) return null;
  const fraction = applyOperation(a, b, operation);
  const text = exactDecimalText(fraction);
  return text === null ? null : { text, fraction };
}

// ————— الترميز العلمي: a × 10^n، حيث 1 ≤ |a| < 10 —————
export type ScientificForm = { coefficient: string; exponent: number; tex: string; shifted: number };

/**
 * يحوّل عدداً عشرياً موجباً إلى الترميز العلمي بتحريك الفاصلة، ويعيد عدد المنازل
 * التي أُزيحت حتى صار العامل بين 1 و10. الأعداد الصفرية تُعامل صراحةً (0 = 0 × 10^0).
 */
export function toScientific(value: string): ScientificForm | null {
  const normalized = normalizeNumericText(value).replace(/[−–—]/g, "-").replace(/,/g, "").replace(/\s/g, "");
  const match = /^([+-]?)(\d*)(?:\.(\d*))?$/.exec(normalized);
  if (!match) return null;
  const [, sign, integerPart = "", fractionPart = ""] = match;
  if (!integerPart && !fractionPart) return null;
  const intPart = integerPart || "0";
  const digits = `${intPart}${fractionPart}`;
  const firstNonZero = digits.search(/[1-9]/);
  if (firstNonZero === -1) return { coefficient: "0", exponent: 0, tex: "0", shifted: 0 };
  const significant = digits.slice(firstNonZero).replace(/0+$/, "") || "0";
  const exponent = intPart.length - 1 - firstNonZero;
  const coefficientDigits = significant.length > 1 ? `${significant[0]}.${significant.slice(1)}` : significant;
  const coefficient = `${sign === "-" ? "-" : ""}${coefficientDigits}`;
  return {
    coefficient,
    exponent,
    tex: `${coefficient}\\times 10^{${exponent}}`,
    shifted: Math.abs(exponent),
  };
}

/** 10^n كنص عشري (n يمكن أن يكون سالباً)، للعرض والتحقق. */
export function powerOfTenText(exponent: number): string {
  if (!Number.isInteger(exponent) || Math.abs(exponent) > 12) throw new Error("قوة عشرة خارج المدى المدعوم.");
  if (exponent >= 0) return `1${"0".repeat(exponent)}`;
  return `0.${"0".repeat(-exponent - 1)}1`;
}

export type ScientificRow = { value: string; coefficient: string; exponent: number };

/** جدول ص15: الأعداد الثلاثة المكتوبة بشكلها العشري وبالترميز العلمي. */
export const SCIENTIFIC_EXAMPLES: readonly ScientificRow[] = [
  { value: "150000000", coefficient: "1.5", exponent: 8 },
  { value: "31500000", coefficient: "3.15", exponent: 7 },
  { value: "78000000", coefficient: "7.8", exponent: 7 },
];

/** تحقق من صحة كتابة علمية من جزأين: العامل 1 ≤ |a| < 10 والعدد هو نفسه. */
export function isScientificWrite(num: string, coefficient: string, exponent: string): boolean {
  const target = toScientific(String(num));
  if (!target) return false;
  if (!/^[1-9](?:\.\d+)?$|^-(?:[1-9](?:\.\d+)?)$/.test(coefficient.trim())) return false;
  if (!/^[+-]?\d+$/.test(exponent.trim())) return false;
  const trimmedCoefficient = coefficient.trim().replace(/^\+/, "").replace(/\.0+$/, "");
  const expectedCoefficient = target.coefficient.replace(/\.0+$/, "");
  return trimmedCoefficient === expectedCoefficient && Number(exponent) === target.exponent;
}

// ————— بيانات الأمثلة المصدرية، لحساب الحلول في الاختبارات وللعرض —————
export const LESSON5_WARMUP = {
  /** في كل صف من صفوف ص15 إجابة واحدة صحيحة والبقية كتابات خاطئة. */
  rows: [
    { prompt: "العدد 3.60 هو نفسه العدد", options: { A: "3.6", B: "36", C: "0.36" }, answer: "A" },
    { prompt: "العدد 3.6 أقرب إلى", options: { A: "3", B: "4", C: "0" }, answer: "B" },
    { prompt: "10×10×10 يكتب بالأس", options: { A: "10^2", B: "10^3", C: "3^10" }, answer: "B" },
  ],
  /** من ص15: الشمس تبعد عن الأرض 150000000 km. */
  sunDistance: { value: "150000000", coefficient: "1.5", exponent: 8 },
} as const;

export const LESSON5_SOURCE_SOLUTIONS = {
  check: [
    { value: "78000000", coefficient: "7.8", exponent: 7 },
    { value: "22491000000", coefficient: "2.2491", exponent: 10 },
    { value: "45180000000", coefficient: "4.518", exponent: 10 },
  ],
  exerciseOne: [
    { wording: "ثلاثة مليارات وخمسمئة مليون", value: "3500000000", coefficient: "3.5", exponent: 9 },
    { wording: "12 مليارًا و5 ملايين", value: "12005000000", coefficient: "1.2005", exponent: 10 },
    { wording: "10100000000", value: "10100000000", coefficient: "1.01", exponent: 10 },
  ],
  venus: { value: "22800000", coefficient: "2.28", exponent: 7 },
  jupiter: {
    total: "629500000000",
    travelled: "50000000",
    remaining: "629450000000",
    coefficient: "6.2945",
    exponent: 11,
  },
  warmupDecimal: [
    { expression: "-15/11 + 16/11", result: { numerator: 1, denominator: 11 } },
    { expression: "-4/9 + 7/18 - 7/18", result: { numerator: -4, denominator: 9 } },
    { expression: "12.3 - 15.7", result: "-3.4" },
    { expression: "-124.45 + 200.796", result: "76.346" },
    { expression: "-0.0045 - 12.039", result: "-12.0435" },
  ],
  mixedSubtraction: { expression: "2 1/5 - (+3 5/6)", result: { numerator: -49, denominator: 30 } },
} as const;

/** تمرين «حاول أن تحل» ص19: النتائج الدقيقة كما حُسبت. */
export const LESSON5_TRY = [
  { key: "t1", expression: "36.12-73.11", answer: "-36.99" },
  { key: "t2", expression: "15.3\\times(-2)", answer: "-30.6" },
  { key: "t3", expression: "(-4.2)\\div 2", answer: "-2.1" },
  { key: "t4", expression: "7\\times(-\\frac{3}{2})", answer: "-21/2" },
  { key: "t5", expression: "(-\\frac{7}{3})+(-\\frac{1}{4})", answer: "-31/12" },
  { key: "t6", expression: "(\\frac{1}{3})-(-8)", answer: "25/3" },
  { key: "t7", expression: "\\frac{5}{2}\\times(-\\frac{2}{5})", answer: "-1" },
  { key: "t8", expression: "(-7)+(-\\frac{2}{4})", answer: "-15/2" },
] as const;

/** قيم مختارة من ص19 تصلح لأسئلة الاختيار من متعدد مع مشتّتات حقيقية. */
export const LESSON5_TRY_CHOICES = [
  { label: "36.12-73.11", choices: ["-36.99", "36.99", "-37.01"], answer: "-36.99" },
  { label: "15.3\\times(-2)", choices: ["-30.6", "30.6", "-3.06"], answer: "-30.6" },
  { label: "(-4.2)\\div 2", choices: ["-2.1", "2.1", "-21"], answer: "-2.1" },
  { label: "\\frac{5}{2}\\times(-\\frac{2}{5})", choices: ["-1", "1", "-\\frac{4}{25}"], answer: "-1" },
] as const;

// ————— أنواع الرسوم والمختبر، تُعلن هنا ليقرأها المدقق والعارض —————
export type OperationsFigureKind = "sciNotationScale" | "sciNotationShift" | "fractionOperationsMap" | "commonDenominatorBars";
export const OPERATIONS_FIGURE_KINDS = [
  "sciNotationScale",
  "sciNotationShift",
  "fractionOperationsMap",
  "commonDenominatorBars",
] as const satisfies readonly OperationsFigureKind[];

export const OPERATIONS_FIGURE_SOURCES: Record<OperationsFigureKind, { page: number; title: string; detail: string }> = {
  sciNotationScale: {
    page: 15,
    title: "من الكتابة العشرية إلى الترميز العلمي",
    detail: "مقارنة بين كتابة العدد 150000000 كاملًا وبين كتابته 1.5×10^8؛ نُزيح الفاصلة ثمانية منازل نحو اليسار فيصبح العامل بين 1 و10.",
  },
  sciNotationShift: {
    page: 16,
    title: "إزاحة الفاصلة في المثال 31500000",
    detail: "نُزيح الفاصلة سبع منازل نحو اليسار لنحصل على 3.15×10^7؛ عدد المنازل هو أس العشرة نفسه.",
  },
  fractionOperationsMap: {
    page: 18,
    title: "خريطة العمليات الأربع على الأعداد العادية",
    detail: "قاعدة إشارة الكسر، وتوحيد المقامات في الجمع والطرح، والضرب بسطًا بمقام، والقسمة بضرب المقلوب، مع الاحتفاظ بالقيم نفسها.",
  },
  commonDenominatorBars: {
    page: 17,
    title: "توحيد المقامين على شريطين",
    detail: "الكسران 4/9 و7/18 يُقسمان إلى أجزاء متساوية على الشريط نفسه؛ لأن 18 من مضاعفات 9 نحتاج تكبير أجزاء الكسر الأول فقط.",
  },
};

export const OPERATIONS_STUDIO_MODES = ["full", "sci", "frac", "decimal", "power"] as const;
export type OperationsStudioMode = (typeof OPERATIONS_STUDIO_MODES)[number];
