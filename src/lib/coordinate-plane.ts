// بيانات الدرس السادس (الأعداد العادية ومعلم المستوي) وحساباته.
// الربع أو المحور يُحسب من إشارتي الإحداثيين، لا يُخمَّن من موضع الرسم.
export type Point = { x: number; y: number };
export type AxisRelation = "first" | "second" | "third" | "fourth" | "abscissa-axis" | "ordinate-axis" | "origin";

export const QUADRANT_LABELS: Record<Exclude<AxisRelation, "abscissa-axis" | "ordinate-axis" | "origin">, string> = {
  first: "الربع الأول",
  second: "الربع الثاني",
  third: "الربع الثالث",
  fourth: "الربع الرابع",
};

export const RELATION_LABELS: Record<AxisRelation, string> = {
  ...QUADRANT_LABELS,
  "abscissa-axis": "محور الفواصل",
  "ordinate-axis": "محور الترتيب",
  origin: "المبدأ",
};

/** كل نقطة لها موضع واحد فقط: ربع، أو محور، أو المبدأ. */
export function axisRelation(point: Point): AxisRelation {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) throw new Error("إحداثيان غير صالحين.");
  if (point.x === 0 && point.y === 0) return "origin";
  if (point.y === 0) return "abscissa-axis";
  if (point.x === 0) return "ordinate-axis";
  if (point.x > 0 && point.y > 0) return "first";
  if (point.x < 0 && point.y > 0) return "second";
  if (point.x < 0 && point.y < 0) return "third";
  return "fourth";
}

export function relationLabel(point: Point): string {
  return RELATION_LABELS[axisRelation(point)];
}

/** قاعدة الإشارات في كل ربع، كما يُستنتج من موقع النقطة. */
export const QUADRANT_SIGN_RULES: { relation: AxisRelation; label: string; abscissa: string; ordinate: string; example: string }[] = [
  { relation: "first", label: "الربع الأول", abscissa: "موجبة", ordinate: "موجبة", example: "(+,+)" },
  { relation: "second", label: "الربع الثاني", abscissa: "سالبة", ordinate: "موجبة", example: "(-,+)" },
  { relation: "third", label: "الربع الثالث", abscissa: "سالبة", ordinate: "سالبة", example: "(-,-)" },
  { relation: "fourth", label: "الربع الرابع", abscissa: "موجبة", ordinate: "سالبة", example: "(+,-)" },
];

export function coordinatesText(point: Point): string {
  return `(${point.x},${point.y})`;
}

/** صيغة كسر عشري مقروءة للفاصلة/الترتيب في النص العربي. */
export function coordinateTeX(point: Point): string {
  return `\\left(${point.x},${point.y}\\right)`;
}

// ————— ص20: الشكل التوضيحي للمحورين والنقطة M —————
export const COORDINATE_PLANE_ILLUSTRATION = {
  domain: 5,
  point: { x: 3, y: 2 } as Point,
  label: "M",
} as const;

// ————— ص21: أمثلة الكتاب كما هي —————
export const COORDINATE_EXAMPLES: readonly { label: string; point: Point; relation: AxisRelation; note: string }[] = [
  { label: "M", point: { x: -2, y: 3 }, relation: "second", note: "الفاصلة سالبة والترتيب موجب، فتقع في الربع الثاني." },
  { label: "F", point: { x: 3, y: 1 }, relation: "first", note: "الإحداثيان موجبان، فتقع في الربع الأول." },
  { label: "O", point: { x: 0, y: 0 }, relation: "origin", note: "مبدأ الإحداثيات؛ نقطة تقاطع المحورين." },
  { label: "N", point: { x: 4, y: 0 }, relation: "abscissa-axis", note: "الترتيب صفر، فتقع على محور الفواصل." },
  { label: "E", point: { x: 0, y: -3 }, relation: "ordinate-axis", note: "الفاصلة صفر، فتقع على محور الترتيب." },
];

// ————— ص22: تدريب 2 و3، إحداثيات معلنة في الكتاب —————
export const TRAINING_POINTS_2: readonly { label: string; point: Point; relation: AxisRelation }[] = [
  { label: "a", point: { x: 5, y: 3 }, relation: "first" },
  { label: "b", point: { x: -8, y: 2 }, relation: "second" },
  { label: "c", point: { x: 1, y: -4 }, relation: "fourth" },
  { label: "d", point: { x: -2, y: -3 }, relation: "third" },
  { label: "h", point: { x: 0, y: 5 }, relation: "ordinate-axis" },
  { label: "e", point: { x: 3, y: 0 }, relation: "abscissa-axis" },
  { label: "f", point: { x: -4, y: 0 }, relation: "abscissa-axis" },
  { label: "g", point: { x: 0, y: -1 }, relation: "ordinate-axis" },
];

export const TRAINING_TABLE_3: readonly { label: string; point: Point }[] = [
  { label: "a", point: { x: 2, y: 3 } },
  { label: "b", point: { x: -2, y: 3 } },
  { label: "c", point: { x: 0, y: -3 } },
  { label: "d", point: { x: -1, y: -2 } },
  { label: "e", point: { x: -2, y: -1 } },
];

/**
 * رسم شبكة للتدريب 1 و«حاول أن تحل»: أُعيد رسمه لإحداثيات معلنة في الشيفرة،
 * حتى لا تُنسب إحداثيات مخمّنة إلى الكتاب. النقط كلها داخل المجال [-5,5].
 */
export const LAB_GRID_POINTS: readonly { label: string; point: Point; color: string }[] = [
  { label: "a", point: { x: 3, y: 3 }, color: "#b91c1c" },
  { label: "b", point: { x: 4, y: 0 }, color: "#1d4ed8" },
  { label: "c", point: { x: -3, y: 2 }, color: "#047857" },
  { label: "d", point: { x: -1, y: -3 }, color: "#7c3aed" },
  { label: "e", point: { x: 0, y: -2 }, color: "#b45309" },
];

/** «حاول أن تحل» ص21: قراءة إحداثيات أربع نقاط في شكل معاد رسمه. */
export const READING_GRID_POINTS: readonly { label: string; point: Point }[] = [
  { label: "a", point: { x: 3, y: 3 } },
  { label: "b", point: { x: -2, y: 1 } },
  { label: "c", point: { x: 0, y: -2 } },
  { label: "d", point: { x: 4, y: -1 } },
];

/** نقاط تعيين ص21: e(3,−1) كما في الكتاب تصبح e(3,−1) وf(5,0) وg(−4,0). */
export const PLOT_POINTS: readonly { label: string; point: Point; relation: AxisRelation }[] = [
  { label: "e", point: { x: 3, y: -1 }, relation: "fourth" },
  { label: "f", point: { x: 5, y: 0 }, relation: "abscissa-axis" },
  { label: "g", point: { x: -4, y: 0 }, relation: "abscissa-axis" },
];

/** ص25 (تمرين 16): مثلث ومعين/مربع على معلم متعامد. */
export const SQUARE_CONSTRUCTION = {
  a: { x: 1, y: 1 },
  b: { x: 4, y: 1 },
  c: { x: 4, y: 4 },
  d: { x: 1, y: 4 },
} as const;

/** إحداثيات نقطة تُقرأ من الشبكة؛ null عند الخروج من المدال. */
export function inGrid(point: Point, domain = 5): boolean {
  return Number.isInteger(point.x) && Number.isInteger(point.y) && Math.abs(point.x) <= domain && Math.abs(point.y) <= domain;
}

/** يتحقق من إجابة (x,y) لنقطة معروضة؛ تُقبل الأعداد الصحيحة فقط. */
export function matchesPoint(givenX: string, givenY: string, point: Point): boolean {
  const x = Number(givenX);
  const y = Number(givenY);
  return Number.isInteger(x) && Number.isInteger(y) && x === point.x && y === point.y;
}

/** يبني سؤال اختيار من متعدد: النقطة المطلوبة مع ثلاث مشتتات لا تكرر الإجابة. */
export function choiceOptions(points: readonly { label: string; point: Point }[], target: number, count = 4): string[] {
  const correct = coordinatesText(points[target].point);
  const pool = points.filter((_, index) => index !== target).map(item => coordinatesText(item.point));
  const options = [correct, ...pool].slice(0, count);
  while (options.length < count) {
    options.push(`(${points[target].point.x + options.length},${points[target].point.y - options.length})`);
  }
  return options;
}

// ————— أنواع الرسوم والمختبر —————
export type CoordinateFigureKind = "coordinateAxes" | "quadrantsMap" | "pointsExamples" | "trainingGrid" | "readingGrid";
export const COORDINATE_FIGURE_KINDS = [
  "coordinateAxes",
  "quadrantsMap",
  "pointsExamples",
  "trainingGrid",
  "readingGrid",
] as const satisfies readonly CoordinateFigureKind[];

export const COORDINATE_FIGURE_SOURCES: Record<CoordinateFigureKind, { page: number; title: string; detail: string }> = {
  coordinateAxes: {
    page: 20,
    title: "المحوران الأفقي والعمودي ومبدأ الإحداثيات",
    detail: "محور الفواصل الأفقي Ox ومحور الترتيب العمودي Oy يتقاطعان في المبدأ O، ونقطة M لها فاصلة وترتيب.",
  },
  quadrantsMap: {
    page: 21,
    title: "أربعة أرباع في معلم المستوي",
    detail: "المحوران يقسمان المستوي إلى أربعة أرباع، ولكل ربع إشارة فاصلة وإشارة ترتيب ثابتتان.",
  },
  pointsExamples: {
    page: 21,
    title: "أمثلة الكتاب: M وF وN وE",
    detail: "النقطة M(−2,3) في الربع الثاني، وF(3,1) في الربع الأول، وN(4,0) على محور الفواصل، وE(0,−3) على محور الترتيب، والمبدأ O(0,0).",
  },
  trainingGrid: {
    page: 22,
    title: "شبكة تدريب 1 بنقاط معلنة",
    detail: "شبكة من −5 إلى 5 أُعيد رسمها بإحداثيات معلنة في الشيفرة، لتدريب قراءة الإشارات والموضع دون نسبة إحداثيات مخمّنة إلى الكتاب.",
  },
  readingGrid: {
    page: 21,
    title: "قراءة إحداثيات النقط من الشبكة",
    detail: "شبكة من −5 إلى 5 عليها أربع نقاط؛ يقرأ الطالب الفاصلة أفقياً والترتيب عمودياً، والشكل مُعاد رسمه بإحداثيات معلنة.",
  },
};

export const COORDINATE_STUDIO_MODES = ["full", "explore", "plot", "quadrants"] as const;
export type CoordinateStudioMode = (typeof COORDINATE_STUDIO_MODES)[number];
