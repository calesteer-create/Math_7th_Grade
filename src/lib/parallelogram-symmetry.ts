// مكتبة الدرس التاسع: متوازي الأضلاع ومركز التناظر (الوحدة الثالثة — الصفحات 41–45)
// تحتوي نماذج الإحداثيات الديكارتية الدقيقة لجميع أشكال الكتاب ودوال الحساب الهندسي للمختبر.
import {
  angleDeg,
  areCollinear,
  areParallel,
  dist,
  isMidpoint,
  isParallelogram,
  midpoint,
  pt,
  reflectPoint,
  type Pt,
} from "@/lib/geometry-core";

export const PARALLELOGRAM_FIGURE_KINDS = [
  "pgramUnitLaunchQuad",
  "pgramUnitLaunchAngles",
  "pgramUnitLaunchZ",
  "pgramIdentifyFive",
  "pgramSymmetryProof",
  "pgramFourProperties",
  "pgramDoubleMidpoint",
  "pgramCheckAbcd",
  "pgramCompleteCenter",
  "pgramCoordGrid",
] as const;

export type ParallelogramFigureKind = (typeof PARALLELOGRAM_FIGURE_KINDS)[number];

export const PARALLELOGRAM_STUDIO_MODES = ["full", "explore", "strips", "complete", "coord"] as const;
export type ParallelogramStudioMode = (typeof PARALLELOGRAM_STUDIO_MODES)[number];

export const PARALLELOGRAM_FIGURE_SOURCES: Record<ParallelogramFigureKind, { page: number; title: string }> = {
  pgramUnitLaunchQuad: { page: 41, title: "انطلاقة نشطة للوحدة — الرباعي MTCB" },
  pgramUnitLaunchAngles: { page: 41, title: "انطلاقة نشطة للوحدة — الزاويتان المشتركتان بالرأس" },
  pgramUnitLaunchZ: { page: 41, title: "انطلاقة نشطة للوحدة — الحرف Z على الشبكة" },
  pgramIdentifyFive: { page: 42, title: "انطلاقة نشطة — تمييز متوازي الأضلاع وتقاطع شريطين" },
  pgramSymmetryProof: { page: 42, title: "انطلاقة نشطة ثالثاً — إثبات مركز التناظر M في BCDH" },
  pgramFourProperties: { page: 43, title: "تعلّم والخواص الأربع لمتوازي الأضلاع ABCD" },
  pgramDoubleMidpoint: { page: 44, title: "مثال محلول — متوازيا الأضلاع BCDH و BCTD ومنتصف [HT]" },
  pgramCheckAbcd: { page: 45, title: "تحقّق من فهمك — استخراج خواص متوازي الأضلاع ABCD" },
  pgramCompleteCenter: { page: 45, title: "تدريب 1 — تعيين C و D علمًا أن G مركز متوازي الأضلاع ABCD" },
  pgramCoordGrid: { page: 45, title: "تدريب 2 — متوازي الأضلاع OBCD في المعلم المتعامد" },
};

/** ص 41 (1 و2): الرباعي العام MTCB بالترتيب الدوري M→B→C→T (عكس عقارب الساعة M→T→C→B). */
export const UNIT_LAUNCH_QUAD = {
  M: pt(0.85, 2.55),
  B: pt(3.2, 1.95),
  C: pt(3.2, 0),
  T: pt(0, 0),
} as const;

/** ص 41 (3): الأشكال الثلاثة لاختبار الاشتراك بالرأس (الشكل 2 فقط يشترك بالرأس). */
export const UNIT_LAUNCH_ANGLES = {
  fig1: {
    v1: pt(0, 0),
    rayTop: pt(2.6, 1.35),
    rayMid: pt(3.2, 0),
    v2: pt(1.5, 0),
    rayDown: pt(2.75, -0.95),
  },
  fig2: {
    v: pt(0, 0),
    rayL1: pt(-2.6, 0.55),
    rayL2: pt(-1.85, 1.85),
    rayR1: pt(1.45, 2.25),
    rayR2: pt(2.7, 0.65),
  },
  fig3: {
    vTop: pt(1.5, 1.35),
    vBot: pt(-0.35, 0.35),
    topLeft: pt(-1.7, 1.35),
    diagUp: pt(2.65, 1.97),
    diagDown: pt(-1.25, -0.14),
    botRight: pt(2.25, -0.05),
  },
} as const;

/** ص 41 (5): الحرف Z على شبكة 5×5 يقبل مركز تناظر (2.5, 2.5) ولا يقبل محور تناظر. */
export const UNIT_LAUNCH_Z = {
  gridSize: 5,
  vertices: [pt(1, 4), pt(4, 4), pt(1, 1), pt(4, 1)] as readonly Pt[],
  center: pt(2.5, 2.5),
} as const;

/** ص 42 (أولاً): الأشكال الخمسة لتحديد متوازيات الأضلاع (الشكل 3 المستطيل و4 متوازي الأضلاع). */
export type ClassifyShape = {
  readonly id: number;
  readonly label: string;
  readonly vertices: readonly Pt[];
  readonly isParallelogram: boolean;
  readonly note: string;
};

export const IDENTIFY_FIVE_SHAPES: readonly ClassifyShape[] = [
  {
    id: 1,
    label: "الشكل 1",
    vertices: [pt(0, 0), pt(2.5, 0), pt(2.5, 1.65), pt(0.95, 2.35)],
    isParallelogram: false,
    note: "رباعي عام؛ لا يوجد فيه زوجا أضلاع متقابلة متوازية.",
  },
  {
    id: 2,
    label: "الشكل 2",
    vertices: [pt(0, 0), pt(2.5, 0), pt(2.5, 1.7), pt(1.05, 1.7)],
    isParallelogram: false,
    note: "شبه منحرف قائم؛ فيه ضلعان فقط متوازيان والضلعان الآخران غير متوازيين.",
  },
  {
    id: 3,
    label: "الشكل 3",
    vertices: [pt(0, 0), pt(2.55, 0), pt(2.55, 1.55), pt(0, 1.55)],
    isParallelogram: true,
    note: "مستطيل، وهو حالة خاصة من متوازي الأضلاع لأن كل ضلعين متقابلين فيه متوازيان.",
  },
  {
    id: 4,
    label: "الشكل 4",
    vertices: [pt(0, 0), pt(2.55, 0), pt(3.35, 1.55), pt(0.8, 1.55)],
    isParallelogram: true,
    note: "متوازي أضلاع: كل ضلعين متقابلين متوازيان ومتساويان في الطول.",
  },
  {
    id: 5,
    label: "الشكل 5",
    vertices: [pt(0, 0), pt(1.35, 0), pt(0, 1.55), pt(2.05, 1.55)],
    isParallelogram: false,
    note: "شكل متقاطع ذاتيًا (ليس مضلّعًا رباعيًا بسيطًا).",
  },
];

/** ص 42 (ثالثاً): متوازي الأضلاع BCDH مع المستقيمين \Delta و \Delta' ومنتصف القطر [BD]. */
export const SYMMETRY_PROOF_BCDH = (() => {
  const H = pt(0, 0);
  const D = pt(3.6, 0);
  const C = pt(5.0, 2.2);
  const B = pt(1.4, 2.2);
  const M = midpoint(B, D);
  return { B, C, D, H, M };
})();

/** ص 43–45: متوازي الأضلاع ABCD بترتيب الرؤوس A (أعلى يمين)، B (أعلى يسار)، C (أسفل يسار)، D (أسفل يمين). */
export const BOOK_PARALLELOGRAM_ABCD = (() => {
  const C = pt(0, 0);
  const D = pt(3.6, 0);
  const A = pt(5.1, 2.05);
  const B = pt(1.5, 2.05);
  const M = midpoint(A, C);
  return { A, B, C, D, M };
})();

/** ص 44–45 (المثال المحلول): متوازيا الأضلاع BCTD و BCDH المشتركان في [CB]، و D منتصف [HT]. */
export const DOUBLE_PARALLELOGRAM_EXAMPLE = {
  T: pt(0, 0),
  D: pt(2.6, 0),
  H: pt(5.2, 0),
  C: pt(1.25, 1.85),
  B: pt(3.85, 1.85),
} as const;

/** ص 45 (تدريب 1): النقاط المعطاة A و B والمركز G، وإكمال النقطتين C و D بالتناظر حول G. */
export const TRAIN_CENTER_G = (() => {
  const B = pt(0, 0);
  const G = pt(2.3, 1.45);
  const A = pt(3.5, 0.25);
  const C = reflectPoint(A, G);
  const D = reflectPoint(B, G);
  return { A, B, C, D, G };
})();

/** ص 45 (تدريب 2): متوازي الأضلاع OBCD في المعلم المتعامد مبدؤه O(0,0)، B(8,1)، D(2,3). */
export const TRAIN_COORD_OBCD = (() => {
  const O = pt(0, 0);
  const B = pt(8, 1);
  const D = pt(2, 3);
  const C = pt(B.x + D.x, B.y + D.y);
  const G = midpoint(O, C);
  return { O, B, C, D, G };
})();

/** يبني متوازي أضلاع مضمون الصلاحية للمختبر انطلاقًا من طولي الضلعين a و b وزاوية الميل deg. */
export function buildParallelogramFromSidesAngle(a: number, b: number, deg: number) {
  const clampedDeg = Math.max(30, Math.min(150, deg));
  const rad = (clampedDeg * Math.PI) / 180;
  const C = pt(0, 0);
  const D = pt(a, 0);
  const B = pt(b * Math.cos(rad), b * Math.sin(rad));
  const A = pt(D.x + B.x, D.y + B.y);
  const M = midpoint(A, C);
  return {
    A,
    B,
    C,
    D,
    M,
    ab: dist(A, B),
    dc: dist(D, C),
    bc: dist(B, C),
    ad: dist(A, D),
    ma: dist(M, A),
    mc: dist(M, C),
    mb: dist(M, B),
    md: dist(M, D),
    angleC: angleDeg(B, C, D),
    angleA: angleDeg(D, A, B),
    angleB: angleDeg(A, B, C),
    angleD: angleDeg(C, D, A),
    valid: isParallelogram(A, B, C, D),
  };
}

/** يحسب إحداثيات متوازي الأضلاع OBCD في المعلم المتعامد (O هو المبدأ، معطى B و D). */
export function coordinateParallelogram(B: Pt, D: Pt) {
  const O = pt(0, 0);
  const C = pt(B.x + D.x, B.y + D.y);
  const G = pt((B.x + D.x) / 2, (B.y + D.y) / 2);
  const nonCollinear = !areCollinear(O, B, D);
  return {
    O,
    B,
    C,
    D,
    G,
    valid: nonCollinear && isParallelogram(O, B, C, D),
    cIsDoubleG: Math.abs(C.x - 2 * G.x) < 1e-9 && Math.abs(C.y - 2 * G.y) < 1e-9,
    gIsMidpointBD: isMidpoint(G, B, D),
    gIsMidpointOC: isMidpoint(G, O, C),
    oppositeParallel: nonCollinear && areParallel(O, B, D, C) && areParallel(O, D, B, C),
  };
}

/** إكمال متوازي الأضلاع ABCD علمًا بـ A و B والمركز G (منتصف القطرين). */
export function completeParallelogramFromCenter(A: Pt, B: Pt, G: Pt) {
  const C = reflectPoint(A, G);
  const D = reflectPoint(B, G);
  return {
    A,
    B,
    C,
    D,
    G,
    valid: !areCollinear(A, B, G) && isParallelogram(A, B, C, D),
  };
}
