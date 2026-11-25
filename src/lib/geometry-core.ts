// محرك هندسي إقليدي دقيق ثنائي الأبعاد: إحداثيات ديكارتية حقيقية (محور y للأعلى)
// مع دوال تحقق رياضي (التوازي، التعامد، التساوي، الاستقامة، المنتصف، الزوايا، المساحة)
// ومحوّل دقيق إلى إحداثيات SVG لترسم جميع الأشكال من النموذج الرياضي نفسه.

export type Pt = { readonly x: number; readonly y: number };

export const EPS = 1e-6;

export const pt = (x: number, y: number): Pt => ({ x, y });
export const vec = (a: Pt, b: Pt): Pt => ({ x: b.x - a.x, y: b.y - a.y });
export const add = (a: Pt, b: Pt): Pt => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y });
export const scale = (v: Pt, s: number): Pt => ({ x: v.x * s, y: v.y * s });
export const dot = (u: Pt, v: Pt): number => u.x * v.x + u.y * v.y;
export const cross = (u: Pt, v: Pt): number => u.x * v.y - u.y * v.x;
export const normSq = (v: Pt): number => v.x * v.x + v.y * v.y;
export const norm = (v: Pt): number => Math.hypot(v.x, v.y);
export const dist = (a: Pt, b: Pt): number => Math.hypot(b.x - a.x, b.y - a.y);

export function unit(v: Pt): Pt {
  const len = norm(v);
  if (len < 1e-12) throw new Error("متجه صفري لا يمكن تطبيعه.");
  return { x: v.x / len, y: v.y / len };
}

export function midpoint(a: Pt, b: Pt): Pt {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/** التناظر المركزي لنقطة p بالنسبة إلى المركز center: p' = 2*center - p. */
export function reflectPoint(p: Pt, center: Pt): Pt {
  return { x: 2 * center.x - p.x, y: 2 * center.y - p.y };
}

/** تدوير نقطة p حول center بزاوية angleDeg (عكس عقارب الساعة في الإحداثيات الديكارتية). */
export function rotatePoint(p: Pt, center: Pt, angleDegValue: number): Pt {
  const rad = (angleDegValue * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const dx = p.x - center.x;
  const dy = p.y - center.y;
  return { x: center.x + dx * c - dy * s, y: center.y + dx * s + dy * c };
}

export function lerp(a: Pt, b: Pt, t: number): Pt {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

export function areParallel(a: Pt, b: Pt, c: Pt, d: Pt, eps = EPS): boolean {
  const u = vec(a, b);
  const v = vec(c, d);
  const lu = norm(u);
  const lv = norm(v);
  if (lu < eps || lv < eps) return false;
  return Math.abs(cross(u, v)) / (lu * lv) < eps;
}

export function arePerpendicular(a: Pt, b: Pt, c: Pt, d: Pt, eps = EPS): boolean {
  const u = vec(a, b);
  const v = vec(c, d);
  const lu = norm(u);
  const lv = norm(v);
  if (lu < eps || lv < eps) return false;
  return Math.abs(dot(u, v)) / (lu * lv) < eps;
}

export function areCollinear(a: Pt, b: Pt, c: Pt, eps = EPS): boolean {
  const ab = vec(a, b);
  const ac = vec(a, c);
  const scaleFactor = Math.max(1, norm(ab) * norm(ac));
  return Math.abs(cross(ab, ac)) / scaleFactor < eps;
}

export function isMidpoint(m: Pt, a: Pt, b: Pt, eps = EPS): boolean {
  return dist(m, midpoint(a, b)) < eps;
}

/** تقاطع مستقيمين (a, b) و (c, d)؛ يعيد null إذا كانا متوازيين. */
export function lineIntersection(a: Pt, b: Pt, c: Pt, d: Pt, eps = 1e-9): Pt | null {
  const r = vec(a, b);
  const s = vec(c, d);
  const denom = cross(r, s);
  if (Math.abs(denom) < eps) return null;
  const t = cross(vec(a, c), s) / denom;
  return { x: a.x + t * r.x, y: a.y + t * r.y };
}

/** المسقط العمودي للنقطة p على المستقيم (a, b) مع المعامل t على القطعة [ab]. */
export function footOfPerpendicular(p: Pt, a: Pt, b: Pt): { foot: Pt; t: number; distance: number } {
  const ab = vec(a, b);
  const denom = normSq(ab);
  if (denom < 1e-12) throw new Error("المستقيم غير معرّف بنقطتين متطابقتين.");
  const t = dot(vec(a, p), ab) / denom;
  const foot = { x: a.x + t * ab.x, y: a.y + t * ab.y };
  return { foot, t, distance: dist(p, foot) };
}

/** الزاوية غير الموجّهة \widehat{avb} بالدرجات ضمن [0, 180]. */
export function angleDeg(a: Pt, vertex: Pt, b: Pt): number {
  const u = vec(vertex, a);
  const v = vec(vertex, b);
  const lu = norm(u);
  const lv = norm(v);
  if (lu < 1e-12 || lv < 1e-12) throw new Error("ضلع زاوية صفري.");
  const cosVal = Math.max(-1, Math.min(1, dot(u, v) / (lu * lv)));
  return (Math.acos(cosVal) * 180) / Math.PI;
}

/** مساحة مضلّع بسيط بصيغة شو ليس (موجبة دائمًا). */
export function polygonArea(vertices: readonly Pt[]): number {
  let sum = 0;
  for (let i = 0; i < vertices.length; i++) {
    const a = vertices[i];
    const b = vertices[(i + 1) % vertices.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) / 2;
}

/**
 * يتحقق بدقة إقليدية من أن الرباعي ABCD (بالترتيب الدوري A→B→C→D) هو متوازي أضلاع غير منحلّ:
 * كل ضلعين متقابلين متوازيان ومتساويان، القطران متناصفان، والمساحة موجبة.
 */
export function isParallelogram(a: Pt, b: Pt, c: Pt, d: Pt, eps = EPS): boolean {
  const area = polygonArea([a, b, c, d]);
  if (area < eps) return false;
  if (!areParallel(a, b, d, c, eps) || !areParallel(b, c, a, d, eps)) return false;
  if (Math.abs(dist(a, b) - dist(d, c)) > eps) return false;
  if (Math.abs(dist(b, c) - dist(a, d)) > eps) return false;
  const midAC = midpoint(a, c);
  const midBD = midpoint(b, d);
  if (dist(midAC, midBD) > eps) return false;
  // التأكد من عدم التفاف الرباعي (يجب أن يكون القطران متقاطعين عند المنتصف المشترك).
  const inter = lineIntersection(a, c, b, d);
  return inter !== null && dist(inter, midAC) < eps;
}

/** يبني متوازي أضلاع مضمون الصلاحية من الرؤوس المتتالية A وB وD: C = B + D - A. */
export function parallelogramFromABD(a: Pt, b: Pt, d: Pt): { A: Pt; B: Pt; C: Pt; D: Pt; M: Pt } {
  const C = { x: b.x + d.x - a.x, y: b.y + d.y - a.y };
  return { A: a, B: b, C, D: d, M: midpoint(a, C) };
}

/** تحويل نقطة ديكارتية (y للأعلى) إلى إحداثيات SVG (y للأسفل). */
export type SvgViewport = { originX: number; originY: number; scale: number };

export function toSvg(p: Pt, vp: SvgViewport): Pt {
  return {
    x: Number((vp.originX + p.x * vp.scale).toFixed(2)),
    y: Number((vp.originY - p.y * vp.scale).toFixed(2)),
  };
}

/** سلسلة نقاط polygon/polyline في SVG. */
export function svgPoints(pts: readonly Pt[]): string {
  return pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
}

/** مسار قوس زاوية داخل SVG بين الشعاعين v→a و v→b (بالزاوية الصغرى <= 180°). */
export function svgAngleArc(aSvg: Pt, vSvg: Pt, bSvg: Pt, radius: number): string {
  const ua = unit(vec(vSvg, aSvg));
  const ub = unit(vec(vSvg, bSvg));
  const p1 = add(vSvg, scale(ua, radius));
  const p2 = add(vSvg, scale(ub, radius));
  // في إحداثيات SVG (y للأسفل)، cross > 0 يعني اتجاه عقارب الساعة (sweep=1).
  const sweep = cross(ua, ub) >= 0 ? 1 : 0;
  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${radius} ${radius} 0 0 ${sweep} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
}

/** مسار علامة الزاوية القائمة داخل SVG عند الرأس vSvg باتجاه الشعاعين aSvg و bSvg. */
export function svgRightAngleMark(aSvg: Pt, vSvg: Pt, bSvg: Pt, size = 10): string {
  const ua = unit(vec(vSvg, aSvg));
  const ub = unit(vec(vSvg, bSvg));
  const p1 = add(vSvg, scale(ua, size));
  const p2 = add(p1, scale(ub, size));
  const p3 = add(vSvg, scale(ub, size));
  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} L ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`;
}

/** شُرَط التساوي (1 أو 2) عمودية على القطعة [aSvg, bSvg] عند النسبة t. */
export function svgTickMarks(aSvg: Pt, bSvg: Pt, count: 1 | 2 = 1, t = 0.5, halfLen = 5.5, gap = 3.5): [Pt, Pt][] {
  const dir = unit(vec(aSvg, bSvg));
  const perp = { x: -dir.y, y: dir.x };
  const center = lerp(aSvg, bSvg, t);
  const offsets = count === 1 ? [0] : [-gap / 2, gap / 2];
  return offsets.map(off => {
    const c = add(center, scale(dir, off));
    return [add(c, scale(perp, halfLen)), add(c, scale(perp, -halfLen))];
  });
}

/** رأس سهم توازي (>) عند النسبة t على القطعة [aSvg, bSvg] متجهًا من aSvg إلى bSvg. */
export function svgParallelArrow(aSvg: Pt, bSvg: Pt, t = 0.5, size = 7): string {
  const dir = unit(vec(aSvg, bSvg));
  const perp = { x: -dir.y, y: dir.x };
  const tip = add(lerp(aSvg, bSvg, t), scale(dir, size * 0.45));
  const back = sub(tip, scale(dir, size));
  const left = add(back, scale(perp, size * 0.6));
  const right = sub(back, scale(perp, size * 0.6));
  return `M ${left.x.toFixed(2)} ${left.y.toFixed(2)} L ${tip.x.toFixed(2)} ${tip.y.toFixed(2)} L ${right.x.toFixed(2)} ${right.y.toFixed(2)}`;
}
