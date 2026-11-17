import StudentDashboard from "@/components/StudentDashboard";

export const dynamic = "force-dynamic";

export const metadata = { title: "منطقة الطالب" };

export default function StudentPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <StudentDashboard />
    </div>
  );
}
