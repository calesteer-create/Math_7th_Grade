// تطبيع الأرقام والمقارنة العددية الدقيقة.
// المقارنة هنا لا تمرّ عبر Number: تُقارن القيم ككسور صحيحة (BigInt) حتى لا يتساوى
// 70000 مع 70000.000000000001، ولا يتساوى عددان كبيران يفقدان التمييز في الفاصلة العائمة.

export type ExactNumber = { numerator: bigint; denominator: bigint };

const ZERO = BigInt(0);
const ONE = BigInt(1);
const TEN = BigInt(10);

const ARABIC_INDIC_DIGITS = /[\u0660-\u0669]/g;
const EXTENDED_INDIC_DIGITS = /[\u06f0-\u06f9]/g;
const TATWEEL_AND_BIDI = /[\u0640\u064b-\u065f\u0670\u200e\u200f\u2066-\u2069]/g;
const SPACES = /[ \t\u00a0\u202f]/g;

/** يحوّل الأرقام العربية والهندية إلى أرقام غربية دون المساس ببقية المحارف. */
export function normalizeDigits(input: string): string {
  return input
    .replace(ARABIC_INDIC_DIGITS, digit => String(digit.charCodeAt(0) - 0x0660))
    .replace(EXTENDED_INDIC_DIGITS, digit => String(digit.charCodeAt(0) - 0x06f0));
}

/** يطبّع نصًا عدديًا: أرقام موحّدة، فاصل عشري موحّد، وإزالة محارف الاتجاه. */
export function normalizeNumericText(input: string): string {
  return normalizeDigits(input.normalize("NFKC"))
    .replace(TATWEEL_AND_BIDI, "")
    .replace(/\u066b/g, ".")
    .replace(/\u066c/g, ",")
    .replace(SPACES, " ")
    .trim();
}

function pow10(exponent: number): bigint {
  let result = ONE;
  for (let i = 0; i < exponent; i++) result *= TEN;
  return result;
}

function gcdBig(a: bigint, b: bigint): bigint {
  let x = a < ZERO ? -a : a;
  let y = b < ZERO ? -b : b;
  while (y !== ZERO) [x, y] = [y, x % y];
  return x;
}

/** يقرأ عددًا عشريًا (بالفاصلة الإنجليزية)؛ يقبل فاصل الآلاف الصحيح فقط. */
function parseDecimal(text: string): ExactNumber | null {
  let body = text;
  let sign = ONE;
  if (body.startsWith("+")) body = body.slice(1);
  else if (body.startsWith("-")) { sign = -ONE; body = body.slice(1); }
  if (!body) return null;
  if (body.includes(",")) {
    // فاصلة الآلاف مسموحة فقط بمجموعات ثلاثية صحيحة، ولا تُخلط بالفاصلة العشرية.
    if (!/^\d{1,3}(?:,\d{3})+(?:\.\d*)?$/.test(body)) return null;
    body = body.replace(/,/g, "");
  }
  const match = /^(\d*)(?:\.(\d*))?$/.exec(body);
  if (!match) return null;
  const integerPart = match[1] ?? "";
  const fractionPart = match[2] ?? "";
  if (!integerPart && !fractionPart) return null;
  const digits = `${integerPart || "0"}${fractionPart}`;
  return { numerator: sign * BigInt(digits), denominator: pow10(fractionPart.length) };
}

/**
 * يقرأ قيمة عددية دقيقة: صحيحة أو عشرية أو كسرًا بصيغة a/b.
 * يُرجع null لأي إدخال غير صالح بدل تحويله إلى صفر أو NaN.
 */
export function parseExactNumber(input: string): ExactNumber | null {
  const text = normalizeNumericText(input);
  if (!text || /\s/.test(text)) return null;
  if (text.includes("/")) {
    const parts = text.split("/");
    if (parts.length !== 2) return null;
    const numerator = parseDecimal(parts[0]);
    const denominatorText = parts[1];
    if (!numerator || !/^\+?\d+$/.test(denominatorText)) return null;
    const denominator = BigInt(denominatorText.replace("+", ""));
    if (denominator === ZERO) return null;
    return { numerator: numerator.numerator, denominator: numerator.denominator * denominator };
  }
  return parseDecimal(text);
}

/**
 * نص «يبدو عدديًا» (أرقام ورموز عددية فقط) لكنه لا يُقرأ قيمةً صالحة،
 * مثل الكسر ذي المقام صفر `1/0` و`0/0`، أو الفاصلة في غير موضعها `70,00`.
 * يُستعمل لمنع تمرير هذه المدخلات عبر المطابقة النصية.
 */
export function isInvalidNumericText(input: string): boolean {
  const text = normalizeNumericText(input);
  if (!text || !/[0-9]/.test(text)) return false;
  if (parseExactNumber(text)) return false;
  return /^[0-9+\-.,/ ]+$/.test(text);
}

/** هل النص قيمة عددية صالحة (صحيحة أو عشرية أو كسر)؟ */
export function isNumericAnswer(input: string): boolean {
  return parseExactNumber(input) !== null;
}

/** مقارنة دقيقة بين قيمتين؛ تعمل على الكسور المتكافئة مثل 1/2 و0.5. */
export function sameExactNumber(left: ExactNumber, right: ExactNumber): boolean {
  return left.numerator * right.denominator === right.numerator * left.denominator;
}

/** مقارنة نصين عدديين بدقة رياضية كاملة (بدون أي تقريب). */
export function equalExactText(left: string, right: string): boolean {
  const a = parseExactNumber(left);
  const b = parseExactNumber(right);
  return !!a && !!b && sameExactNumber(a, b);
}

/** يبسّط كسرًا صحيحًا ويُبقي الإشارة على البسط. */
export function reduceFraction(numerator: number, denominator: number): { numerator: number; denominator: number } {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return { numerator, denominator };
  }
  const sign = (numerator < 0 ? -1 : 1) * (denominator < 0 ? -1 : 1);
  const n = Math.abs(numerator);
  const d = Math.abs(denominator);
  const divisor = gcdNumber(n, d) || 1;
  return { numerator: (n / divisor) * sign, denominator: d / divisor };
}

function gcdNumber(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x;
}

/**
 * يمثّل قيمة ناتجة عن قسمة عددين صحيحين لغةً صادقة:
 * `exact` يعني أن النص العشري مطابق للقيمة تمامًا، و`approximate` يعني أنه تقريب للعرض.
 */
export function rationalText(
  numerator: number,
  denominator: number,
  options: { maxFractionDigits?: number; maxDenominatorDigits?: number } = {},
): { text: string; approximate: boolean; undefined: boolean } {
  const maxFractionDigits = options.maxFractionDigits ?? 3;
  const maxDenominatorDigits = options.maxDenominatorDigits ?? 12;
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return { text: "غير معرّف", approximate: false, undefined: true };
  }
  if (!Number.isSafeInteger(numerator) || !Number.isSafeInteger(denominator)
    || Math.abs(numerator) > 10 ** maxDenominatorDigits || Math.abs(denominator) > 10 ** maxDenominatorDigits) {
    return { text: numerator / denominator + "…", approximate: true, undefined: false };
  }
  const reduced = reduceFraction(numerator, denominator);
  if (reduced.numerator === 0) return { text: "0", approximate: false, undefined: false };
  let rest = reduced.denominator;
  let twos = 0;
  let fives = 0;
  while (rest % 2 === 0) { rest /= 2; twos++; }
  while (rest % 5 === 0) { rest /= 5; fives++; }
  if (rest !== 1) {
    const approx = reduced.numerator / reduced.denominator;
    let text = approx.toFixed(maxFractionDigits);
    if (text.includes(".")) text = text.replace(/0+$/, "").replace(/\.$/, "");
    return { text, approximate: true, undefined: false };
  }
  const scale = Math.max(twos, fives);
  // حساب النص العشري الدقيق بالكسور الصحيحة، لا بـ Number.
  const digits = (BigInt(Math.abs(reduced.numerator)) * pow10(scale) / BigInt(reduced.denominator)).toString();
  const padded = digits.padStart(scale + 1, "0");
  const integerPart = padded.slice(0, padded.length - scale);
  const fractionPart = scale > 0 ? padded.slice(padded.length - scale).replace(/0+$/, "") : "";
  const sign = reduced.numerator < 0 ? "-" : "";
  const text = fractionPart ? `${sign}${integerPart}.${fractionPart}` : `${sign}${integerPart}`;
  return { text, approximate: false, undefined: false };
}

/** نص القيمة العشرية للعرض، مع علامة ≈ فقط عندما يكون النص تقريبًا. */
export function displayRational(numerator: number, denominator: number, maxFractionDigits = 3): string {
  const value = rationalText(numerator, denominator, { maxFractionDigits });
  if (value.undefined) return value.text;
  return value.approximate ? `≈ ${value.text}` : value.text;
}
