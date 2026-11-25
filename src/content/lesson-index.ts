import lessonOne from "@/content/lesson-1.json";
import lessonTwo from "@/content/lesson-2.json";
import lessonThree from "@/content/lesson-3.json";
import lessonFour from "@/content/lesson-4.json";
import lessonFive from "@/content/lesson-5.json";
import lessonSix from "@/content/lesson-6.json";
import lessonSeven from "@/content/lesson-7.json";
import lessonEight from "@/content/lesson-8.json";
import lessonNine from "@/content/lesson-9.json";
import lessonTen from "@/content/lesson-10.json";
import lessonEleven from "@/content/lesson-11.json";

// فهرس ملفات المحتوى كما هي في مواقعها المعتمدة. لا يُنقل محتوى قائم ولا يُعاد كتابته؛
// السجل يعلن اسم الملف، وهذا الفهرس يثبت وجوده فعلًا وقت التصدير.
export const LESSON_CONTENT_INDEX: Record<string, unknown> = {
  "lesson-1.json": lessonOne,
  "lesson-2.json": lessonTwo,
  "lesson-3.json": lessonThree,
  "lesson-4.json": lessonFour,
  "lesson-5.json": lessonFive,
  "lesson-6.json": lessonSix,
  "lesson-7.json": lessonSeven,
  "lesson-8.json": lessonEight,
  "lesson-9.json": lessonNine,
  "lesson-10.json": lessonTen,
  "lesson-11.json": lessonEleven,
};
