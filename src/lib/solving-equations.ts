// دوال رياضية دقيقة (عبر BigInt بلا تقريب عشري)
// وبيانات الرسوم والأنشطة للدرس الثامن: حلّ المعادلات (ص 36–37).
import { addFrac, divFrac, eqFrac, frac, fracToTeX, mulFrac, subFrac, type ExactFrac } from "@/lib/algebraic-expressions";

const ZERO = BigInt(0);
const ONE = BigInt(1);
const TWO = BigInt(2);
const FIVE = BigInt(5);

function powBig(base: bigint, exp: number): bigint {
  let result = ONE;
  for (let i = 0; i < exp; i++) result *= base;
  return result;
}

export type SolveResult =
  | { status: "unique"; value: ExactFrac }
  | { status: "none"; reason: string }
  | { status: "infinite"; reason: string };

/** حلّ المعادلة من الشكل x + b = c بدقة تامة. */
export function solveAdditive(b: ExactFrac, c: ExactFrac): ExactFrac {
  return subFrac(c, b);
}

/** حلّ المعادلة من الشكل ax = c مع معالجة صريحة للحالة الحدّية a = 0. */
export function solveMultiplicative(a: ExactFrac, c: ExactFrac): SolveResult {
  if (a.num === ZERO) {
    if (c.num === ZERO) {
      return { status: "infinite", reason: "لأن الطرفين متساويان دائمًا (0 = 0)، فكل عدد عادي يحقق المعادلة." };
    }
    return { status: "none", reason: "لا يوجد عدد نضربه في 0 فيعطي عددًا غير صفري؛ والقسمة على 0 غير معرّفة." };
  }
  return { status: "unique", value: divFrac(c, a) };
}

/** حلّ المعادلة من الشكل x / d = c حيث d != 0. */
export function solveDivisive(d: ExactFrac, c: ExactFrac): ExactFrac {
  if (d.num === ZERO) throw new Error("المقسوم عليه لا يمكن أن يساوي صفرًا.");
  return mulFrac(c, d);
}

/** حلّ المعادلة من الشكل ax + b = c بدقة تامة. */
export function solveLinearEquation(a: ExactFrac, b: ExactFrac, c: ExactFrac): SolveResult {
  return solveMultiplicative(a, subFrac(c, b));
}

/** التحقّق مما إذا كانت القيمة x حلًّا للمعادلة ax + b = c. */
export function checkLinearSolution(
  a: ExactFrac,
  b: ExactFrac,
  c: ExactFrac,
  candidate: ExactFrac,
): { lhs: ExactFrac; rhs: ExactFrac; isSolution: boolean } {
  const lhs = addFrac(mulFrac(a, candidate), b);
  const rhs = frac(c.num, c.den);
  return { lhs, rhs, isSolution: eqFrac(lhs, rhs) };
}

/** تنسيق كسر عشري منتهٍ إن أمكن (مقامه من قوى 2 و5 فقط)، وإلا null. */
export function exactTerminatingDecimal(f: ExactFrac): string | null {
  const n = frac(f.num, f.den);
  if (n.den === ONE) return n.num.toString();
  let d = n.den;
  let twos = 0;
  let fives = 0;
  while (d % TWO === ZERO) { d /= TWO; twos++; }
  while (d % FIVE === ZERO) { d /= FIVE; fives++; }
  if (d !== ONE) return null;
  const k = Math.max(twos, fives);
  const factor = powBig(TWO, k - twos) * powBig(FIVE, k - fives);
  const scaled = (n.num < ZERO ? -n.num : n.num) * factor;
  const sign = n.num < ZERO ? "-" : "";
  const digits = scaled.toString().padStart(k + 1, "0");
  const intPart = digits.slice(0, digits.length - k);
  const fracPart = digits.slice(digits.length - k).replace(/0+$/, "");
  return fracPart ? `${sign}${intPart}.${fracPart}` : `${sign}${intPart}`;
}

export function formatSolutionTeX(value: ExactFrac): string {
  const tex = fracToTeX(value);
  const dec = exactTerminatingDecimal(value);
  if (value.den !== ONE && dec !== null) return `${tex} = ${dec}`;
  return tex;
}

// ————— بيانات جدول الانطلاقة النشطة ص 36 —————
export const WARMUP_TABLE_ROWS = [
  { id: "r1", prompt: "إنّ \\(10 + 8 \\times 2\\) يساوي:", options: { A: "36", B: "26", C: "160" }, correct: "B" as const },
  { id: "r2", prompt: "إنّ \\(7 \\times 6 + 4 \\div 2\\) يساوي:", options: { A: "23", B: "56", C: "44" }, correct: "C" as const },
  { id: "r3", prompt: "إنّ \\(3(7 + 5) - 38\\) يساوي:", options: { A: "-2", B: "-12", C: "+2" }, correct: "A" as const },
  { id: "r4", prompt: "حلّ المعادلة \\(120 \\div x = 12\\) يساوي:", options: { A: "-10", B: "+10", C: "-1440" }, correct: "B" as const },
  { id: "r5", prompt: "مستطيل عرضه \\(x\\) وطوله يزيد على ضعفي عرضه بمقدار 7، فالعبارة الجبرية لطوله هي:", options: { A: "x + 7", B: "2x - 7", C: "2x + 7" }, correct: "C" as const },
] as const;

// ————— سجل مصادر رسوم الدرس الثامن —————
export const EQUATIONS_FIGURE_KINDS = [
  "equationBalance",
  "orderOfOpsTable",
  "divideCoefficientFlow",
] as const;
export type EquationsFigureKind = (typeof EQUATIONS_FIGURE_KINDS)[number];

export const EQUATIONS_STUDIO_MODES = ["full", "balance", "mental", "axc", "problems"] as const;
export type EquationsStudioMode = (typeof EQUATIONS_STUDIO_MODES)[number];

export const EQUATIONS_FIGURE_SOURCES: Record<EquationsFigureKind, { page: number; title: string; detail: string }> = {
  equationBalance: {
    page: 36,
    title: "ميزان المعادلة والتحقّق من الحلّ",
    detail: "تمثيل بصري لصلة الدرس والانطلاقة النشطة ص 36: تتساوى كفّتا المعادلة 2x - 5 = 1 عند x = 3 وتختلّ عند غيره.",
  },
  orderOfOpsTable: {
    page: 36,
    title: "جدول الانطلاقة النشطة (أولوية العمليات والمعادلات)",
    detail: "جدول الاختيار من متعدد الخماسي في ص 36 بأعمدته A وB وC قبل الشروع في حل المعادلات.",
  },
  divideCoefficientFlow: {
    page: 37,
    title: "خطوات حلّ المعادلة ax = c وشرط a ≠ 0",
    detail: "مخطط نشاط 2 وتعلّم ص 37: الانتقال من 3x = 24 إلى x = 24 ÷ 3 = 8 والقاعدة العامة x = c / a بشرط a ≠ 0.",
  },
};
