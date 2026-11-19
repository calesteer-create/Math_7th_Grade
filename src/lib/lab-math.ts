// حسابات المختبرات: القيمة الرياضية أولًا، ثم تحويلها إلى موضع مرئي.
// لا تُقص القيمة ولا تُقرَّب للرسم؛ وإذا خرجت عن المجال المرسوم يُعلن ذلك صراحة.

export type LineDomain = { min: number; max: number; start: number; width: number };

export type LineProjection = {
  /** هل القيمة داخل المجال المرسوم؟ */
  inRange: boolean;
  /** إحداثي النقطة عندما تكون القيمة داخل المجال، وإلا null (لا موضع كاذب). */
  x: number | null;
  /** إحداثي حدّ الرسم من جهة القيمة الخارجة، لإظهار مؤشر «خارج المجال». */
  edgeX: number | null;
  direction: "left" | "right" | null;
};

/** يحوّل قيمة رياضية إلى إحداثي على الخط دون تقريب، ولا يرسم قيمة خارج المجال كأنها داخله. */
export function projectOnLine(value: number, domain: LineDomain): LineProjection {
  const { min, max, start, width } = domain;
  if (!Number.isFinite(value)) return { inRange: false, x: null, edgeX: null, direction: null };
  const span = max - min;
  if (!(span > 0)) return { inRange: false, x: null, edgeX: null, direction: null };
  if (value < min) return { inRange: false, x: null, edgeX: start, direction: "left" };
  if (value > max) return { inRange: false, x: null, edgeX: start + width, direction: "right" };
  return { inRange: true, x: start + ((value - min) / span) * width, edgeX: null, direction: null };
}

/** معدل الوحدة = الكل ÷ الجزء. القسمة على صفر غير معرّفة وتُعلن كذلك. */
export function unitRate(total: number, count: number): number | null {
  if (!Number.isFinite(total) || !Number.isFinite(count) || count === 0) return null;
  return total / count;
}

/** النسبة المئوية = الجزء ÷ الكل × 100. الكل صفر يجعلها غير معرّفة. */
export function percentOf(part: number, whole: number): number | null {
  if (!Number.isFinite(part) || !Number.isFinite(whole) || whole === 0) return null;
  return (part / whole) * 100;
}

/** يصف موضع القيمة على خط الأعداد بلغة صادقة بدل عرض موضع مقصوص. */
export function lineStatusText(value: number, domain: Pick<LineDomain, "min" | "max">): string {
  if (!Number.isFinite(value)) return "القيمة غير معرّفة، لذا لا يمكن رسمها.";
  if (value < domain.min) return `القيمة ${value} أصغر من ${domain.min}، وهي خارج المجال المرسوم [${domain.min}، ${domain.max}]؛ لا تُرسم في موضعها الحقيقي.`;
  if (value > domain.max) return `القيمة ${value} أكبر من ${domain.max}، وهي خارج المجال المرسوم [${domain.min}، ${domain.max}]؛ لا تُرسم في موضعها الحقيقي.`;
  return `القيمة ${value} داخل المجال المرسوم، ونقطتها في موضعها الحقيقي على الخط.`;
}
