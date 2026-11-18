import lessonOne from "@/content/lesson-1.json";

// فهرس الصفحة الثانية كما ورد في البذرة الأصلية؛ المعرّفات ثابتة حسب ترتيب الفهرس.
const curriculum: {title: string; description: string; icon: string; color: string; lessons: [string, number][]}[] = [
  { title: "الأعداد والعمليات", description: "الأعداد الطبيعية والصحيحة والعادية والعمليات عليها.", icon: "divide", color: "brand", lessons: [
    ["الأعداد الطبيعية", 3], ["الأعداد الصحيحة (الجمع والطرح)", 5], ["الأعداد الصحيحة (الضرب والقسمة)", 10], ["الأعداد العادية", 13], ["العمليات على الأعداد العادية", 15], ["الأعداد العادية ومعلّم المستوي", 20]
  ] },
  { title: "العبارات الجبرية والمعادلات", description: "العبارات الجبرية وحل المعادلات.", icon: "variable", color: "violet", lessons: [
    ["العبارات الجبرية", 25], ["حل المعادلات", 28]
  ] },
  { title: "متوازيات الأضلاع", description: "متوازي الأضلاع، المساحة، والتوازي في الأشكال الرباعية.", icon: "shapes", color: "sky", lessons: [
    ["متوازي الأضلاع ومركز التناظر", 36], ["مساحة متوازي الأضلاع", 42], ["مستقيمات متوازية والقاطع", 46], ["الانتقال من الشكل الرباعي إلى متوازي الأضلاع", 49], ["حالات خاصة: مستطيل، معين، مربع", 55]
  ] },
  { title: "التناظر", description: "التناظر المركزي، نظيم النقطة، ومراكز ومحاور التناظر.", icon: "triangle", color: "emerald", lessons: [
    ["التناظر المركزي", 59], ["إيجاد النظيم بالنسبة إلى نقطة", 68], ["مركز ومحور التناظر", 71]
  ] },
  { title: "النسبة والتناسب", description: "التناسب والنسبة المئوية والقياس ومقياس الرسم والحركة المنتظمة.", icon: "scale", color: "amber", lessons: [
    ["التناسب", 75], ["النسبة المئوية", 84], ["عنوان الدرس غير واضح في الفهرس", 90], ["وحدات القياس", 94], ["مقياس الرسم", 98], ["الطول والحركة المنتظمة", 101]
  ] },
  { title: "المثلث والدائرة", description: "تصنيف المثلث وزواياه ورسمه، ومساحة المثلث والدائرة.", icon: "triangle", color: "rose", lessons: [
    ["تصنيف المثلث", 109], ["مجموع قياسات زوايا المثلث", 113], ["رسم المثلث", 118], ["رسم الدائرة المارة برؤوس المثلث", 124], ["مساحة المثلث", 127], ["مساحة الدائرة", 130]
  ] },
  { title: "المجسمات", description: "المنشور القائم والأسطوانة الدورانية.", icon: "box", color: "cyan", lessons: [
    ["المنشور القائم", 137], ["الأسطوانة الدورانية", 143]
  ] },
  { title: "الإحصاء والاحتمالات", description: "التمثيلات البيانية والانتشار والارتباط والأحداث واحتمالاتها.", icon: "chart", color: "fuchsia", lessons: [
    ["التمثيلات البيانية", 149], ["الانتشار والارتباط", 155], ["الأحداث واحتمالاتها", 157]
  ] },
];

export const units = curriculum.map((unit, i) => ({...unit, id: i + 1, order: i + 1}));
let nextLessonId = 0;
export const lessons = units.flatMap(unit => unit.lessons.map(([title, sourcePage], i) => {
  const id = ++nextLessonId;
  return { id, unitId: unit.id, title, sourcePage, order: i + 1, status: id === 1 ? "published" : "pending", goals: id === 1 ? lessonOne.goals : null, content: id === 1 ? lessonOne.content : null, notebook: id === 1 ? lessonOne.notebook : null };
}));
