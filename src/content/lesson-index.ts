import lessonOne from "@/content/lesson-1.json";

// فهرس ملفات المحتوى كما هي في مواقعها المعتمدة. لا يُنقل محتوى قائم ولا يُعاد كتابته؛
// السجل يعلن اسم الملف، وهذا الفهرس يثبت وجوده فعلًا وقت التصدير.
export const LESSON_CONTENT_INDEX: Record<string, unknown> = {
  "lesson-1.json": lessonOne,
};
