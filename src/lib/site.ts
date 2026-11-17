// ثوابت المنصة وهوية المهندس — مصدر واحد للحقيقة في كل المكونات

export const SITE = {
  name: "الرياضيات للسابع",
  subject: "الرياضيات",
  grade: "الصف السابع",
  country: "سوريا",
  tagline: "منصة تعليمية تفاعلية — شرح موسّع، اختبارات، ودفتر طالب لكل درس",
  description:
    "منصة الرياضيات للصف السابع (منهاج سوريا): شرح تعليمي موسّع مستند إلى الكتاب المدرسي، وأنشطة تفاعلية، واختبارات، ودفتر طالب لكل درس، ومنطقة خاصة بالمعلم.",
};

export const ENGINEER = {
  name: "المهندس سومر شاهين",
  nameOnly: "سومر شاهين",
  phoneDisplay: "0930215022",
  phoneIntl: "963930210222",
  whatsappMessage: "مرحبًا مهندس سومر، أرغب بالاستفسار عن المنصة التعليمية",
};

// رابط WhatsApp الرسمي — الرقم بصيغة دولية (رمز سوريا 963 بدون الصفر الأول)
export const WHATSAPP_URL = `https://wa.me/${ENGINEER.phoneIntl}?text=${encodeURIComponent(
  ENGINEER.whatsappMessage
)}`;

// مراحل قالب الدرس — دفتر الطالب دائمًا المرحلة الأخيرة
export type StageKey =
  | "intro"
  | "discover"
  | "explain"
  | "lab"
  | "check"
  | "apply"
  | "quiz"
  | "summary"
  | "notebook";

export const STAGES: { key: StageKey; title: string; hint: string }[] = [
  { key: "intro", title: "التهيئة والاستكشاف", hint: "موقف من الحياة اليومية يثير الفضول" },
  { key: "discover", title: "اكتشف المفهوم", hint: "المفهوم الجديد ومحتوى الكتاب" },
  { key: "explain", title: "الشرح التفصيلي", hint: "شرح موسّع خطوة بخطوة" },
  { key: "lab", title: "المختبر التفاعلي", hint: "نشاط ومحاكاة تفاعلية" },
  { key: "check", title: "افهم وتحقق", hint: "أسئلة قصيرة بتغذية راجعة فورية" },
  { key: "apply", title: "طبّق", hint: "تمارين متدرجة وتطبيقات" },
  { key: "quiz", title: "اختبر نفسك", hint: "اختبار الدرس مع النتيجة والتغذية الراجعة" },
  { key: "summary", title: "الملخص", hint: "أهم المفاهيم والقوانين" },
  { key: "notebook", title: "دفتر الطالب", hint: "تعريفات وقواعد ورسوم وأمثلة أكتبها في دفتري" },
];

// الأرقام في المنصة تُعرض بالإنجليزية (0-9) في كل المواضع
export function fmtNum(n: number | string): string {
  return String(n);
}
