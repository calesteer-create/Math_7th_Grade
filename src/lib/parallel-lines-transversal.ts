// مكتبة الدرس الحادي عشر: مستقيمان متوازيان وثالث قاطع (الوحدة الثالثة — الصفحات 49–54)
// تحتوي النماذج الإقليدية الدقيقة لجميع زوايا التوازي والقاطع والمستقيم المساعد والتدريبات.
import {
  add,
  angleDeg,
  areCollinear,
  areParallel,
  arePerpendicular,
  isMidpoint,
  isParallelogram,
  lineIntersection,
  midpoint,
  pt,
  reflectPoint,
  scale,
  type Pt,
} from "@/lib/geometry-core";

export const PARALLEL_FIGURE_KINDS = [
  "plWarmupAngles",
  "plVerticalAdjacent",
  "plSymmetryTransversal",
  "plTransversalPositions",
  "plProveParallel",
  "plConsecutiveProof",
  "plCheckAngleA",
  "plTrainOne",
  "plTrainTwoM",
  "plTrainTableX",
] as const;

export type ParallelFigureKind = (typeof PARALLEL_FIGURE_KINDS)[number];

export const PARALLEL_STUDIO_MODES = ["full", "pairs", "transversal", "converse", "auxiliary"] as const;
export type ParallelStudioMode = (typeof PARALLEL_STUDIO_MODES)[number];

export const PARALLEL_FIGURE_SOURCES: Record<ParallelFigureKind, { page: number; title: string }> = {
  plWarmupAngles: { page: 49, title: "انطلاقة نشطة — الزاوية المستقيمة (شكل 1) والقائمة (شكل 2)" },
  plVerticalAdjacent: { page: 50, title: "تعلّم — الزاويتان المتقابلتان بالرأس والمتجاورتان" },
  plSymmetryTransversal: { page: 51, title: "انطلاقة نشطة — مستقيمان متوازيان وقاطع ومركز التناظر M" },
  plTransversalPositions: { page: 51, title: "تعلّم وخواص — الزوايا المتبادلة داخلاً وخارجاً والمتناظرة" },
  plProveParallel: { page: 52, title: "تعلّم — قواعد إثبات توازي مستقيمين الثلاث" },
  plConsecutiveProof: { page: 53, title: "مثال محلول — برهان تكامل زاويتين متتاليتين في BCDH" },
  plCheckAngleA: { page: 53, title: "تحقّق من فهمك — حساب قياس الزاوية A بالمستقيم المساعد" },
  plTrainOne: { page: 54, title: "تدريب 1 — إثبات توازي (AB) و (DC) ونوع الرباعي ABCD" },
  plTrainTwoM: { page: 54, title: "تدريب 2 — حساب قياس الزاوية M في الشكلين" },
  plTrainTableX: { page: 54, title: "تدريب 3 — الطاولة القابلة للطي وحساب الزاوية x°" },
};

const dir = (deg: number): Pt => pt(Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180));

/** ص 49 (انطلاقة نشطة): شكل (1) بزاويتين 132° و 48°، وشكل (2) بزاويتين 52° و 38°. */
export const WARMUP_FIG1 = (() => {
  const M = pt(0, 0);
  const A = pt(2.9, 0);
  const C = pt(-2.9, 0);
  const B = scale(dir(48), 2.7);
  return { A, M, C, B, angleBMA: angleDeg(B, M, A), angleCMB: angleDeg(C, M, B) };
})();

export const WARMUP_FIG2 = (() => {
  const G = pt(0, 0);
  const E = pt(2.9, 0);
  const F = pt(0, 2.9);
  const H = scale(dir(38), 2.8);
  return { G, E, F, H, angleHGE: angleDeg(H, G, E), angleFGH: angleDeg(F, G, H) };
})();

/** ص 50: الزاويتان المتقابلتان بالرأس (AMB و EMF) والمتجاورتان (AMB و BMC). */
export const VERTICAL_MODEL = (() => {
  const M = pt(0, 0);
  const B = pt(3.0, 0);
  const E = pt(-3.0, 0);
  const A = scale(dir(32), 2.8);
  const F = reflectPoint(A, M);
  return { A, B, E, F, M, angleAMB: angleDeg(A, M, B), angleEMF: angleDeg(E, M, F) };
})();

export const ADJACENT_MODEL = (() => {
  const M = pt(0, 0);
  const A = pt(3.0, 0);
  const B = scale(dir(36), 2.8);
  const C = scale(dir(138), 2.6);
  return { A, B, C, M, angleAMB: angleDeg(A, M, B), angleBMC: angleDeg(B, M, C) };
})();

/** ص 51 (انطلاقة نشطة): (XX') || (YY') وقاطع (ZZ') في B و C، و M منتصف [BC]. */
export const SYMMETRY_TRANSVERSAL_MODEL = (() => {
  const X = pt(-3.2, 2.4);
  const Xp = pt(3.6, 2.4);
  const Y = pt(-3.2, 0);
  const Yp = pt(3.6, 0);
  const B = pt(0.8, 2.4);
  const C = pt(-0.4, 0);
  const M = midpoint(B, C);
  const Z = pt(1.4, 3.6);
  const Zp = pt(-1.0, -1.2);
  return {
    X,
    Xp,
    Y,
    Yp,
    Z,
    Zp,
    B,
    C,
    M,
    angleXBZp: angleDeg(X, B, Zp),
    angleYpCZ: angleDeg(Yp, C, Z),
    angleXpBZp: angleDeg(Xp, B, Zp),
    angleYCZ: angleDeg(Y, C, Z),
  };
})();

/** ص 51–52: مستقيمان غير متوازيين (للتعريف) ثم متوازيان (للخواص) يقطعهما قاطع \Delta. */
export function buildTransversalModel(tiltTopDeg: number, transversalDeg: number) {
  const d2L = pt(-3.5, 0);
  const d2R = pt(3.5, 0);
  const topPivot = pt(0.3, 2.3);
  const topDir = dir(tiltTopDeg);
  const d1L = add(topPivot, scale(topDir, -3.8));
  const d1R = add(topPivot, scale(topDir, 3.4));
  const B = pt(-0.55, 0);
  const tDir = dir(transversalDeg);
  const tBot = add(B, scale(tDir, -1.45));
  const tTop = add(B, scale(tDir, 4.1));
  const A = lineIntersection(d1L, d1R, tBot, tTop)!;

  // الزوايا الثماني بالترتيب نفسه المطبوع في الكتاب (ص 51–52):
  // A1 أعلى يمين، A2 أعلى يسار، A3 أسفل يسار، A4 أسفل يمين (ونفس الترتيب عند B).
  const aTop = add(A, tDir);
  const aBot = add(A, scale(tDir, -1));
  const aRight = add(A, topDir);
  const aLeft = add(A, scale(topDir, -1));
  const bTop = add(B, tDir);
  const bBot = add(B, scale(tDir, -1));
  const bRight = pt(B.x + 1, B.y);
  const bLeft = pt(B.x - 1, B.y);

  return {
    d1L,
    d1R,
    d2L,
    d2R,
    tBot,
    tTop,
    A,
    B,
    parallel: areParallel(d1L, d1R, d2L, d2R),
    angles: {
      A1: angleDeg(aRight, A, aTop),
      A2: angleDeg(aLeft, A, aTop),
      A3: angleDeg(aLeft, A, aBot),
      A4: angleDeg(aRight, A, aBot),
      B1: angleDeg(bRight, B, bTop),
      B2: angleDeg(bLeft, B, bTop),
      B3: angleDeg(bLeft, B, bBot),
      B4: angleDeg(bRight, B, bBot),
    },
  };
}

export const TRANSVERSAL_NON_PARALLEL = buildTransversalModel(-11, 58);
export const TRANSVERSAL_PARALLEL = buildTransversalModel(0, 58);

/** ص 53 (المثال المحلول): متوازي الأضلاع BCDH وامتداد [DC] إلى A لإثبات تكامل الزاويتين المتتاليتين. */
export const CONSECUTIVE_PROOF_BCDH = (() => {
  const D = pt(0, 0);
  const H = pt(4.0, 0);
  const C = pt(1.25, 2.25);
  const B = pt(5.25, 2.25);
  const A = add(C, scale(pt(C.x - D.x, C.y - D.y), 0.45));
  return {
    A,
    B,
    C,
    D,
    H,
    angleACB: angleDeg(A, C, B),
    angleCDH: angleDeg(C, D, H),
    angleBCD: angleDeg(B, C, D),
  };
})();

/** ص 53 (تحقّق من فهمك): ثلاثة مستقيمات متوازية (الأوسط متقطّع يمر بـ A) وزاويتان 135° ← A = 90°. */
export const CHECK_ANGLE_A_MODEL = (() => {
  const u = dir(75); // اتجاه المستقيمات المتوازية الثلاثة نحو الأعلى يمينًا
  const A = pt(0, 0);
  const leftArmDir = dir(120); // 75° + 45°
  const rightArmDir = dir(30); // 75° - 45°
  const P = scale(leftArmDir, 2.35);
  const Pext = scale(leftArmDir, 3.65);
  const Q = scale(rightArmDir, 2.65);
  const Qext = scale(rightArmDir, 3.85);
  const d1Top = add(P, scale(u, 2.0));
  const d1Bot = add(P, scale(u, -1.9));
  const dMidTop = add(A, scale(u, 3.6));
  const dMidBot = add(A, scale(u, -0.85));
  const d2Top = add(Q, scale(u, 2.0));
  const d2Bot = add(Q, scale(u, -1.75));
  return {
    A,
    P,
    Pext,
    Q,
    Qext,
    d1Top,
    d1Bot,
    dMidTop,
    dMidBot,
    d2Top,
    d2Bot,
    leftGivenDeg: angleDeg(d1Bot, P, Pext),
    rightGivenDeg: angleDeg(d2Bot, Q, Qext),
    leftPartA: angleDeg(P, A, dMidTop),
    rightPartA: angleDeg(dMidTop, A, Q),
    totalA: angleDeg(P, A, Q),
  };
})();

/** ص 54 (تدريب 1): d1 || d2 والزاويتان المتناظرتان C1 = B1 ← (AB) || (DC) ← ABCD متوازي أضلاع. */
export const TRAIN_ONE_ABCD = (() => {
  const C = pt(0, 0);
  const D = pt(1.55, 1.9);
  const B = pt(3.55, 0);
  const A = pt(5.1, 1.9);
  return {
    A,
    B,
    C,
    D,
    d1L: pt(-0.9, 1.9),
    d1R: pt(6.1, 1.9),
    d2L: pt(-0.9, 0),
    d2R: pt(6.1, 0),
    angleC1: angleDeg(D, C, B),
    angleB1: angleDeg(A, B, pt(6.1, 0)),
  };
})();

/** ص 54 (تدريب 2 — الشكل الأيمن): زاوية عليا خارجية 110° وسفلى داخلية 37° ← M = 70° + 37° = 107°. */
export const TRAIN_TWO_RIGHT_M = (() => {
  const d1L = pt(-3.2, 2.5);
  const d1R = pt(4.4, 2.5);
  const d2L = pt(-3.2, 0);
  const d2R = pt(4.4, 0);
  const M = pt(1.0, 1.15);
  const upperDir = dir(110); // يصنع 110° مع محور +x (أي الزاوية العليا اليمنى 110° تمامًا!)
  const lowerDir = dir(217); // 180° + 37° (أي الشعاع الصاعد من d2 يصنع 37° مع d2!)
  const P = lineIntersection(M, add(M, upperDir), d1L, d1R)!;
  const Pext = add(P, scale(upperDir, 1.0));
  const Q = lineIntersection(M, add(M, lowerDir), d2L, d2R)!;
  const Qext = add(Q, scale(lowerDir, 0.85));
  return {
    d1L,
    d1R,
    d2L,
    d2R,
    M,
    P,
    Pext,
    Q,
    Qext,
    topGivenDeg: angleDeg(d1R, P, Pext),
    botGivenDeg: angleDeg(d2R, Q, M),
    angleM: angleDeg(P, M, Q),
  };
})();

/** ص 54 (تدريب 2 — الشكل الأيسر): متوازيان مائلان، زاوية 90° عند الركن و 157° على اليمين ← M = 113°. */
export const TRAIN_TWO_LEFT_M = (() => {
  const u = dir(55); // اتجاه المتوازيين (الأسهم تشير أسفل-يسار أي -u)
  const P = pt(0, 0); // ركن الزاوية القائمة 90°
  const rightArm = dir(32); // 55° - 23°
  const leftArm = dir(122); // 32° + 90°
  const Q = scale(rightArm, 3.0);
  const Qext = scale(rightArm, 4.4);
  const R = scale(leftArm, 2.55);
  const Rext = scale(leftArm, 3.65);
  const d1Top = add(R, scale(u, 1.35));
  const d1Bot = add(R, scale(u, -2.15));
  const d2Top = add(Q, scale(u, 1.75));
  const d2Bot = add(Q, scale(u, -1.65));
  return {
    P,
    Q,
    Qext,
    R,
    Rext,
    d1Top,
    d1Bot,
    d2Top,
    d2Bot,
    cornerDeg: angleDeg(R, P, Q),
    rightGivenDeg: angleDeg(d2Bot, Q, Qext),
    angleM: angleDeg(Rext, R, d1Bot),
  };
})();

/** ص 54 (تدريب 3): الطاولة القابلة للطي؛ رجل متوازي أضلاع بزاوية 40° ← الزاوية المتتالية x° = 140°. */
export const TRAIN_THREE_TABLE = (() => {
  const h = 2.8;
  const rad40 = (40 * Math.PI) / 180;
  const dx = h / Math.tan(rad40);
  const thickness = 0.72;
  // الرجل الأولى (متوازي أضلاع من أسفل اليسار إلى أعلى اليمين)
  const L1 = pt(0, 0);
  const L2 = pt(thickness, 0);
  const U2 = pt(dx + thickness, h);
  const U1 = pt(dx, h);
  const midX = (dx + thickness) / 2;
  // الرجل الثانية المتناظرة أفقيًا
  const mirror = (p: Pt): Pt => pt(2 * midX - p.x, p.y);
  const leg2: readonly [Pt, Pt, Pt, Pt] = [mirror(L1), mirror(L2), mirror(U2), mirror(U1)];
  return {
    L1,
    L2,
    U2,
    U1,
    leg2,
    pivot: pt(midX, h / 2),
    topWidth: dx + thickness + 0.9,
    height: h,
    givenDeg: angleDeg(U1, L1, L2),
    xDeg: angleDeg(L1, U1, U2),
    validLeg: isParallelogram(L1, L2, U2, U1),
  };
})();

/** حسابات المستقيم المساعد لزاوية كسر (chevron) بين مستقيمين متوازيين: \alpha_top (خارجية) و \beta_bot (داخلية). */
export function auxiliaryAngleCalc(topExteriorDeg: number, bottomInteriorDeg: number) {
  const topPart = 180 - topExteriorDeg;
  const botPart = bottomInteriorDeg;
  return {
    topPart,
    botPart,
    total: topPart + botPart,
    supplementaryCheck: topExteriorDeg + topPart === 180,
  };
}

/** دالة فحص سريعة لسلامة العلاقات في نماذج الدرس 11. */
export function verifyLesson11Models() {
  return {
    fig1Collinear: areCollinear(WARMUP_FIG1.C, WARMUP_FIG1.M, WARMUP_FIG1.A),
    fig2Perp: arePerpendicular(WARMUP_FIG2.G, WARMUP_FIG2.E, WARMUP_FIG2.G, WARMUP_FIG2.F),
    symMid: isMidpoint(SYMMETRY_TRANSVERSAL_MODEL.M, SYMMETRY_TRANSVERSAL_MODEL.B, SYMMETRY_TRANSVERSAL_MODEL.C),
    consecParallelogram: isParallelogram(
      CONSECUTIVE_PROOF_BCDH.B,
      CONSECUTIVE_PROOF_BCDH.C,
      CONSECUTIVE_PROOF_BCDH.D,
      CONSECUTIVE_PROOF_BCDH.H,
    ),
    train1Parallelogram: isParallelogram(TRAIN_ONE_ABCD.A, TRAIN_ONE_ABCD.B, TRAIN_ONE_ABCD.C, TRAIN_ONE_ABCD.D),
  };
}
