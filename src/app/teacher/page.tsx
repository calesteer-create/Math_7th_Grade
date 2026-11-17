import { isTeacher } from "@/lib/teacher-auth";
import TeacherLogin from "@/components/TeacherLogin";
import TeacherDashboard from "@/components/TeacherDashboard";

export const dynamic = "force-dynamic";

export const metadata = { title: "منطقة المعلم" };

export default async function TeacherPage() {
  const authed = await isTeacher();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {authed ? <TeacherDashboard /> : <TeacherLogin />}
    </div>
  );
}
