// بيانات الرسوم التعليمية: مأخوذة من صور الكتاب المرسلة، ص 3–4.
// إحداثيات نسبية داخل القطع الناقص؛ ترتيب المجموعات الفيزيائي A ثم B ثم C من اليسار.
export const BOOK_GROUPS = [
  { label: "A", count: 5, option: 400, dots: [[61, 28], [34, 39], [51, 55], [38, 71], [61, 73]] },
  { label: "B", count: 3, option: 4000, dots: [[36, 39], [62, 38], [52, 63]] },
  { label: "C", count: 4, option: 4, dots: [[62, 28], [34, 40], [61, 58], [39, 73]] },
] as const;

export const COUNTING_GROUPS = [
  [], [[50, 54]], [[50, 38], [50, 69]],
  [[34, 40], [65, 40], [50, 67]],
  [[34, 42], [63, 30], [64, 59], [39, 73]],
] as const;
export const BOOK_NUMBER = "83000050002";
export const BOOK_LINE_POINT = 5;
export const BOOK_LINE_MAX = 12;
export const LINE = { start: 48, spacing: 60, y: 144, width: 840, height: 230 } as const;
export const lineX = (point: number) => LINE.start + LINE.spacing * point;

export const FIGURE_SOURCES = {
  warmup: { title: "انطلاقة نشطة", page: 3, label: "جدول المجموعات والخيارات", detail: "حُفظ ترتيب A وB وC، وعدد النقاط في كل مجموعة، وقيم الخيارات كما في المصدر." },
  counting: { title: "من المجموعة الفارغة إلى العدد", page: 3, label: "مجموعات العدّ من 0 إلى 4", detail: "مجموعات تحتوي 0 ثم 1 ثم 2 ثم 3 ثم 4 عناصر، مع نقاط الاستمرار كما في الشكل الأصلي." },
  numberLine: { title: "كل عدد، نقطة على المستقيم", page: 3, label: "مستقيم الأعداد والنقطة M", detail: "تدريجات متساوية من 0 إلى 12؛ النقطة M عند 5، وسهم من الصفر نحوها، والاتجاه الموجب إلى اليمين." },
  placeValue: { title: "خريطة منازل العدد", page: 4, label: "جدول منازل العدد 83000050002", detail: "المليارات ثم الملايين ثم الآلاف ثم الوحدات من اليسار؛ في كل مجموعة مئات وعشرات وآحاد. حُفظت جميع الأصفار." },
} as const;
export type NaturalFigureKind = keyof typeof FIGURE_SOURCES;

export function placeColumns(raw: string, full = false) {
  if (!/^\d{1,12}$/.test(raw)) return [];
  const width = full ? 12 : Math.max(3, Math.ceil(raw.length / 3) * 3);
  return raw.padStart(width, "0").split("").map((digit, index) => {
    const exponent = width - 1 - index;
    const group = ["الوحدات", "الآلاف", "الملايين", "المليارات (البلايين)"][Math.floor(exponent / 3)];
    const place = ["آحاد", "عشرات", "مئات"][exponent % 3];
    return { digit: Number(digit), exponent, group, place, value: Number(digit) * 10 ** exponent };
  });
}
