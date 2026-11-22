import lessonOne from "@/content/lesson-1.json";
import lessonTwo from "@/content/lesson-2.json";
import lessonThree from "@/content/lesson-3.json";
import lessonFour from "@/content/lesson-4.json";
import lessonFive from "@/content/lesson-5.json";
import lessonSix from "@/content/lesson-6.json";

// فهرس ملفات المحتوى كما هي في مواقعها المعتمدة. لا يُنقل محتوى قائم ولا يُعاد كتابته؛
// السجل يعلن اسم الملف، وهذا الفهرس يثبت وجوده فعلًا وقت التصدير.
export const LESSON_CONTENT_INDEX: Record<string, unknown> = {
  "lesson-1.json": lessonOne,
  "lesson-2.json": lessonTwo,
  "lesson-3.json": lessonThree,
  "lesson-4.json": lessonFour,
  "lesson-5.json": lessonFive,
  "lesson-6.json": lessonSix,
};
