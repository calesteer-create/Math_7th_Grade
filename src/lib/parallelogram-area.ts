// مكتبة الدرس العاشر: مساحة متوازي الأضلاع (الوحدة الثالثة — الصفحات 46–48)
// تحتوي النماذج الإقليدية الدقيقة لجميع رسوم المساحة والارتفاعات ونسب المناطق المظلّلة.
import {
  arePerpendicular,
  dist,
  footOfPerpendicular,
  isParallelogram,
  lerp,
  polygonArea,
  pt,
  type Pt,
} from "@/lib/geometry-core";

export const AREA_FIGURE_KINDS = [
  "areaCutPaste",
  "areaUnitMismatch",
  "areaTwoHeights",
  "areaWorkedExample",
  "areaShadedRatios",
  "areaTrainFour",
] as const;

export type AreaFigureKind = (typeof AREA_FIGURE_KINDS)[number];

export const AREA_STUDIO_MODES = ["full", "cutpaste", "twoheights", "solve", "ratios"] as const;
export type AreaStudioMode = (typeof AREA_STUDIO_MODES)[number];

export const AREA_FIGURE_SOURCES: Record<AreaFigureKind, { page: number; title: string }> = {
  areaCutPaste: { page: 46, title: "انطلاقة نشطة — قصّ ولصق متوازي الأضلاع إلى مستطيل (ريم)" },
  areaUnitMismatch: { page: 46, title: "ملاحظة توحيد الواحدات — قاعدة 300 cm وارتفاع 1 m" },
  areaTwoHeights: { page: 47, title: "تعلّم — القاعدة والارتفاعان وطريقتا حساب المساحة" },
  areaWorkedExample: { page: 48, title: "مثال محلول — BC = 5 cm و AH = 3 cm و AG = 3.75 cm" },
  areaShadedRatios: { page: 48, title: "تحقّق من فهمك — نسبة مساحة المنطقة المظلّلة في الحالات 1 و 2 و 3" },
  areaTrainFour: { page: 48, title: "تدريب — حساب مساحة متوازيات الأضلاع الأربعة (a, b, c, d)" },
};

/** ص 46 (انطلاقة نشطة): نموذج القص واللصق لريم (متوازي أضلاع ABCD قاعدته DC = 5 وارتفاعه 3). */
export const CUT_PASTE_MODEL = (() => {
  const D = pt(0, 0);
  const C = pt(5, 0);
  const A = pt(1.7, 3);
  const B = pt(6.7, 3);
  const H = footOfPerpendicular(A, D, C).foot; // (1.7, 0)
  const E = pt(B.x, 0); // (6.7, 0)
  return {
    A,
    B,
    C,
    D,
    H,
    E,
    base: dist(D, C),
    height: dist(A, H),
    areaParallelogram: polygonArea([A, B, C, D]),
    areaRectangle: polygonArea([H, E, B, A]),
    areaCutTriangle: polygonArea([A, H, D]),
    areaMovedTriangle: polygonArea([B, C, E]),
  };
})();

/** ص 46 (ملاحظة الهامش): CB = 300 cm = 3 m و DH = 1 m = 100 cm. */
export const UNIT_MISMATCH_MODEL = (() => {
  const C = pt(0, 0);
  const B = pt(3, 0);
  const D = pt(0.65, 1);
  const A = pt(3.65, 1);
  const H = footOfPerpendicular(D, C, B).foot;
  return {
    A,
    B,
    C,
    D,
    H,
    baseCm: 300,
    baseM: 3,
    heightM: 1,
    heightCm: 100,
    areaM2: 3,
    areaCm2: 30000,
  };
})();

/** ص 47 (الشكلان 1 و 2 وعلاقة طريقتَي المساحة): متوازي أضلاع ABCD بالارتفاعين AE ⊥ BC و AF ⊥ DC. */
export const TWO_HEIGHTS_MODEL = (() => {
  const B = pt(0, 0);
  const C = pt(5, 0);
  const A = pt(1.9, 3);
  const D = pt(6.9, 3);
  const projE = footOfPerpendicular(A, B, C);
  const projF = footOfPerpendicular(A, D, C);
  return {
    A,
    B,
    C,
    D,
    E: projE.foot,
    F: projF.foot,
    fParam: projF.t,
    bc: dist(B, C),
    ae: projE.distance,
    dc: dist(D, C),
    af: projF.distance,
    area1: dist(B, C) * projE.distance,
    area2: dist(D, C) * projF.distance,
  };
})();

/**
 * ص 48 (المثال المحلول): متوازي أضلاع إقليدي حقيقي بمقياس دقيق!
 * BC = 5 cm، CD = 4 cm، AH = 3 cm، AG = 3.75 cm، والمساحة S = 15 cm².
 * بما أن sin(B) = AH / AB = 3/4، يكون cos(B) = sqrt(7)/4، فيقع H داخل [BC] و G داخل [CD] تمامًا!
 */
export const WORKED_EXAMPLE_MODEL = (() => {
  const sx = Math.sqrt(7); // 4 * sqrt(1 - (3/4)^2) = sqrt(7) ≈ 2.645751
  const B = pt(0, 0);
  const C = pt(5, 0);
  const A = pt(sx, 3);
  const D = pt(5 + sx, 3);
  const projH = footOfPerpendicular(A, B, C);
  const projG = footOfPerpendicular(A, C, D);
  return {
    A,
    B,
    C,
    D,
    H: projH.foot,
    G: projG.foot,
    hParam: projH.t,
    gParam: projG.t,
    bc: dist(B, C),
    cd: dist(C, D),
    ah: projH.distance,
    ag: projG.distance,
    area1: dist(B, C) * projH.distance,
    area2: dist(C, D) * projG.distance,
  };
})();

/** ص 48 (تحقّق من فهمك): الحالات الثلاث لنسبة مساحة المنطقة المظلّلة (1/2، 1/3، 1/4). */
export type ShadedCase = {
  readonly id: 1 | 2 | 3;
  readonly divisions: number;
  readonly ratioNum: number;
  readonly ratioDen: number;
  readonly ratioText: string;
  readonly outer: readonly [Pt, Pt, Pt, Pt]; // C, B, A, D
  readonly shaded: readonly [Pt, Pt, Pt, Pt];
  readonly bottomTicks: readonly [Pt, Pt][];
  readonly topTick: readonly [Pt, Pt];
  readonly dots: readonly Pt[];
};

export const SHADED_RATIO_MODELS: readonly ShadedCase[] = (() => {
  const C = pt(0, 0);
  const B = pt(6, 0);
  const A = pt(7.8, 2.8);
  const D = pt(1.8, 2.8);
  const outer: readonly [Pt, Pt, Pt, Pt] = [C, B, A, D];

  // الحالة 1: تقسيم إلى نصفين، المظلّل من منتصف [CB] إلى B ومن D إلى منتصف [DA]
  const c1P = lerp(C, B, 0.5);
  const c1Q = lerp(D, A, 0.5);
  const case1: ShadedCase = {
    id: 1,
    divisions: 2,
    ratioNum: 1,
    ratioDen: 2,
    ratioText: "1/2",
    outer,
    shaded: [c1P, B, c1Q, D],
    bottomTicks: [[C, c1P], [c1P, B]],
    topTick: [D, c1Q],
    dots: [],
  };

  // الحالة 2: تقسيم [CB] إلى 3 أثلاث متساوية، المظلّل الثلث الأوسط أسفل والثلث الأيمن أعلى
  const c2P1 = lerp(C, B, 1 / 3);
  const c2P2 = lerp(C, B, 2 / 3);
  const c2Q = lerp(D, A, 2 / 3);
  const case2: ShadedCase = {
    id: 2,
    divisions: 3,
    ratioNum: 1,
    ratioDen: 3,
    ratioText: "1/3",
    outer,
    shaded: [c2P1, c2P2, A, c2Q],
    bottomTicks: [[C, c2P1], [c2P1, c2P2], [c2P2, B]],
    topTick: [c2Q, A],
    dots: [],
  };

  // الحالة 3: 3 نقاط سوداء تقسّم [CB] إلى 4 أرباع متساوية، المظلّل الربع الثالث أسفل والربع الأيمن أعلى
  const c3P1 = lerp(C, B, 1 / 4);
  const c3P2 = lerp(C, B, 2 / 4);
  const c3P3 = lerp(C, B, 3 / 4);
  const c3Q = lerp(D, A, 3 / 4);
  const case3: ShadedCase = {
    id: 3,
    divisions: 4,
    ratioNum: 1,
    ratioDen: 4,
    ratioText: "1/4",
    outer,
    shaded: [c3P2, c3P3, A, c3Q],
    bottomTicks: [[C, c3P1], [c3P1, c3P2], [c3P2, c3P3], [c3P3, B]],
    topTick: [c3Q, A],
    dots: [c3P1, c3P2, c3P3],
  };

  return [case1, case2, case3];
})();

/** ص 48 (تدريب): متوازيات الأضلاع الأربعة a و b و c و d مع أبعادها ووحداتها الأصلية. */
export type TrainParallelogram = {
  readonly id: "a" | "b" | "c" | "d";
  readonly base: number;
  readonly height: number;
  readonly unit: "cm" | "m" | "mm";
  readonly area: number;
  readonly orientation: "horizontal-base" | "vertical-base";
  readonly vertices: readonly [Pt, Pt, Pt, Pt];
  readonly heightSeg: readonly [Pt, Pt];
};

export const TRAIN_FOUR_MODELS: readonly TrainParallelogram[] = [
  {
    id: "a",
    base: 12,
    height: 8,
    unit: "cm",
    area: 96,
    orientation: "horizontal-base",
    vertices: [pt(0, 0), pt(12, 0), pt(16, 8), pt(4, 8)],
    heightSeg: [pt(8, 0), pt(8, 8)],
  },
  {
    id: "b",
    base: 2.5,
    height: 3,
    unit: "m",
    area: 7.5,
    orientation: "horizontal-base",
    vertices: [pt(0.7, 0), pt(3.2, 0), pt(2.5, 3), pt(0, 3)],
    heightSeg: [pt(1.9, 0), pt(1.9, 3)],
  },
  {
    id: "c",
    base: 15,
    height: 8,
    unit: "cm",
    area: 120,
    orientation: "vertical-base",
    vertices: [pt(0, 0), pt(8, 4.5), pt(8, 19.5), pt(0, 15)],
    heightSeg: [pt(0, 10), pt(8, 10)],
  },
  {
    id: "d",
    base: 18,
    height: 6,
    unit: "mm",
    area: 108,
    orientation: "horizontal-base",
    vertices: [pt(0, 0), pt(18, 0), pt(24, 6), pt(6, 6)],
    heightSeg: [pt(11, 0), pt(11, 6)],
  },
];

/** يحسب المساحة والارتفاعين الدقيقين لمتوازي أضلاع ضلعاه b1 و b2 وزاويته thetaDeg. */
export function twoHeightsCalculation(b1: number, b2: number, thetaDeg: number) {
  const rad = (Math.max(25, Math.min(155, thetaDeg)) * Math.PI) / 180;
  const B = pt(0, 0);
  const C = pt(b1, 0);
  const A = pt(b2 * Math.cos(rad), b2 * Math.sin(rad));
  const D = pt(b1 + A.x, A.y);
  const proj1 = footOfPerpendicular(A, B, C);
  const proj2 = footOfPerpendicular(A, C, D);
  const h1 = proj1.distance;
  const h2 = proj2.distance;
  return {
    A,
    B,
    C,
    D,
    H1: proj1.foot,
    H2: proj2.foot,
    b1,
    b2,
    h1,
    h2,
    area1: b1 * h1,
    area2: b2 * h2,
    valid: isParallelogram(A, B, C, D) && arePerpendicular(A, proj1.foot, B, C) && arePerpendicular(A, proj2.foot, C, D),
  };
}

/** يحل العلاقة B * h = B' * h' لإيجاد الطول الرابع بدقة (يرفض القيم غير الموجبة). */
export function solveFourthLength(knownPairA: number, knownPairB: number, knownSingle: number): number {
  if (!(knownPairA > 0 && knownPairB > 0 && knownSingle > 0)) {
    throw new Error("الأطوال يجب أن تكون موجبة تمامًا.");
  }
  return (knownPairA * knownPairB) / knownSingle;
}

/** تحويل واحدات الطول (mm، cm، m) إلى الواحدة المستهدفة بدقة. */
export type LengthUnit = "mm" | "cm" | "m";
const UNIT_TO_MM: Record<LengthUnit, number> = { mm: 1, cm: 10, m: 1000 };

export function convertLength(value: number, from: LengthUnit, to: LengthUnit): number {
  return (value * UNIT_TO_MM[from]) / UNIT_TO_MM[to];
}

export function areaWithUnits(
  baseVal: number,
  baseUnit: LengthUnit,
  heightVal: number,
  heightUnit: LengthUnit,
  targetUnit: LengthUnit,
) {
  const b = convertLength(baseVal, baseUnit, targetUnit);
  const h = convertLength(heightVal, heightUnit, targetUnit);
  return { base: b, height: h, area: b * h, unit: targetUnit };
}
