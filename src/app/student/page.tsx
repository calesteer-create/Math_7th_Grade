import StudentDashboard, { type DashboardLesson } from "@/components/StudentDashboard";
import { publishedLessons } from "@/lib/curriculum";
import { assessmentForLesson, practiceForLesson } from "@/lib/lesson-banks";
import type { SkillDefinition } from "@/lib/skill-mastery";

export const metadata = { title: "منطقة الطالب" };

// تُحسب أعداد المهام ومفاتيحها على الخادم من بنك كل درس، فلا يُفترض عدد ثابت
// ولا يُحمَّل بنك التمارين كاملًا في حزمة المتصفح.
export default function StudentPage() {
  const lessons: DashboardLesson[] = publishedLessons.map(lesson => {
    const bank = practiceForLesson(lesson.id);
    return {
      id: lesson.id,
      title: lesson.title,
      revision: bank?.revision ?? "",
      missionKeys: bank?.exercises.map(exercise => exercise.key) ?? [],
    };
  });
  // كتالوج المهارات يُبنى على الخادم من بنك كل درس (بلا تحميل البنك في حزمة المتصفح).
  const skills: SkillDefinition[] = [];
  for (const lesson of publishedLessons) {
    const bank = assessmentForLesson(lesson.id);
    if (!bank) continue;
    const counts = new Map<string, number>();
    for (const question of bank.questions) counts.set(question.skill, (counts.get(question.skill) ?? 0) + 1);
    for (const [key, label] of Object.entries(bank.skills)) {
      const questions = counts.get(key) ?? 0;
      if (questions > 0) skills.push({ key, label, lessonId: lesson.id, questions });
    }
  }

  return <div className="mx-auto max-w-6xl px-4 py-10"><StudentDashboard lessons={lessons} skills={skills} /></div>;
}
