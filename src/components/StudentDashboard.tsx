"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Loader2,
  Medal,
  NotebookPen,
  RotateCcw,
  Save,
  Star,
  Target,
  TrendingUp,
} from "lucide-react";
import { STAGES, fmtNum } from "@/lib/site";

type Overview = {
  student: { id: number; name: string } | null;
  points: number;
  badges: { id: string; title: string; desc: string; earned: boolean }[];
  progress: {
    lessonId: number;
    title: string;
    unitTitle: string;
    stage: number;
    completed: boolean;
  }[];
  attempts: {
    id: number;
    scope: string;
    title: string | null;
    score: number;
    total: number;
    createdAt: string;
  }[];
  units: { id: number; title: string; total: number; published: number; completed: number }[];
};

const BADGE_ICONS: Record<string, React.ReactNode> = {
  first: <Star className="h-5 w-5" />,
  five: <Medal className="h-5 w-5" />,
  perfect: <Target className="h-5 w-5" />,
  persistent: <RotateCcw className="h-5 w-5" />,
};

export default function StudentDashboard() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/student", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        });
        const json = await res.json();
        setData(json);
        if (json?.student?.name) setName(json.student.name);
      } catch {
        setError("تعذر تحميل بياناتك. أعد تحديث الصفحة.");
      }
    })();
  }, []);

  async function saveName() {
    if (!name.trim() || savingName) return;
    setSavingName(true);
    try {
      const res = await fetch("/api/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (json?.student) setData((d) => (d ? { ...d, student: json.student } : d));
    } catch {
      /* تجاهل */
    } finally {
      setSavingName(false);
    }
  }

  if (error) {
    return <div className="card mx-auto max-w-xl p-10 text-center font-bold text-red-600">{error}</div>;
  }
  if (!data) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="font-bold">جارٍ تحميل تقدمك…</span>
      </div>
    );
  }

  const completedLessons = data.progress.filter((p) => p.completed).length;
  const avgScore =
    data.attempts.length > 0
      ? Math.round(
          (data.attempts.reduce((s, a) => s + (a.total > 0 ? (a.score / a.total) * 100 : 0), 0) /
            data.attempts.length) * 10
        ) / 10
      : 0;
  const resume = data.progress.find((p) => !p.completed) ?? data.progress[0];

  return (
    <div className="space-y-8">
      {/* الترحيب والاسم */}
      <div className="card relative overflow-hidden p-6 md:p-8">
        <div className="bg-grid absolute inset-0 opacity-50" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-700 to-brand-500 text-white shadow-lg">
              <GraduationCap className="h-7 w-7" />
            </span>
            <div>
              <div className="text-xs font-bold text-slate-500">أهلًا بك في منطقة الطالب</div>
              <h1 className="text-2xl font-black text-ink">{data.student?.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input max-w-[180px]"
              placeholder="اسمك"
            />
            <button onClick={saveName} disabled={savingName} className="btn btn-ghost text-xs">
              <Save className="h-3.5 w-3.5" />
              {savingName ? "…" : "حفظ الاسم"}
            </button>
          </div>
        </div>
      </div>

      {/* الإحصاءات */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: <Award className="h-5 w-5" />, v: fmtNum(data.points), l: "نقطة إنجاز", tone: "bg-amber-50 text-amber-600" },
          { icon: <BookOpen className="h-5 w-5" />, v: fmtNum(completedLessons), l: "دروس مكتملة", tone: "bg-emerald-50 text-emerald-600" },
          { icon: <TrendingUp className="h-5 w-5" />, v: `${fmtNum(avgScore)}٪`, l: "متوسط النتائج", tone: "bg-sky-50 text-sky-600" },
          { icon: <ClipboardCheck className="h-5 w-5" />, v: fmtNum(data.attempts.length), l: "محاولة اختبار", tone: "bg-violet-50 text-violet-600" },
        ].map((s, i) => (
          <div key={i} className="card flex items-center gap-3 p-4">
            <span className={`grid h-11 w-11 place-items-center rounded-xl ${s.tone}`}>{s.icon}</span>
            <div>
              <div className="text-xl font-black text-ink" dir="ltr">{s.v}</div>
              <div className="text-[11px] font-bold text-slate-500">{s.l}</div>
            </div>
          </div>
        ))}
      </div>

      {/* الشارات */}
      <div className="card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-black text-ink">
          <Medal className="h-5 w-5 text-amber-500" />
          شاراتك وإنجازاتك
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {data.badges.map((b) => (
            <div
              key={b.id}
              className={`rounded-2xl border p-4 text-center transition ${
                b.earned
                  ? "border-amber-200 bg-amber-50"
                  : "border-slate-200 bg-slate-50 opacity-60 grayscale"
              }`}
              title={b.desc}
            >
              <span
                className={`mx-auto grid h-10 w-10 place-items-center rounded-full ${
                  b.earned ? "bg-amber-400 text-white" : "bg-slate-300 text-white"
                }`}
              >
                {BADGE_ICONS[b.id] ?? <Star className="h-5 w-5" />}
              </span>
              <div className="mt-2 text-sm font-black text-ink">{b.title}</div>
              <div className="mt-0.5 text-[11px] font-bold text-slate-500">{b.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* الاستئناف + تقدم الوحدات */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-black text-ink">
            <RotateCcw className="h-5 w-5 text-brand-600" />
            تابع من حيث توقفت
          </h2>
          {resume ? (
            <div>
              <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
                <div className="text-xs font-bold text-brand-600">{resume.unitTitle}</div>
                <div className="mt-1 font-black text-ink">{resume.title}</div>
                <div className="mt-2 text-xs font-bold text-slate-500">
                  {resume.completed
                    ? "وصلت إلى نهاية الدرس — يمكنك متابعة الكتابة في دفتر الطالب."
                    : `آخر مرحلة: ${STAGES[resume.stage]?.title ?? "—"}`}
                </div>
              </div>
              <Link href={`/lessons/${resume.lessonId}`} className="btn btn-primary mt-4">
                {resume.completed ? "مراجعة الدرس" : "استئناف الدرس"}
              </Link>
            </div>
          ) : (
            <p className="text-sm font-bold text-slate-500">
              لم تبدأ أي درس بعد —{" "}
              <Link href="/units" className="font-black text-brand-700 hover:underline">
                ابدأ من الوحدة الأولى
              </Link>
              .
            </p>
          )}

          <h2 className="mb-4 mt-8 flex items-center gap-2 font-black text-ink">
            <NotebookPen className="h-5 w-5 text-brand-600" />
            أوراق الكتابة في دفترك
          </h2>
          {data.progress.filter((p) => p.completed).length > 0 ? (
            <ul className="space-y-2">
              {data.progress
                .filter((p) => p.completed)
                .map((p) => (
                  <li key={p.lessonId}>
                    <Link
                      href={`/lessons/${p.lessonId}?stage=notebook`}
                      className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
                    >
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        {p.title}
                      </span>
                      <span className="text-xs text-slate-400">دفتر الطالب ←</span>
                    </Link>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-sm font-bold text-slate-500">
              ستظهر هنا دفاتر الدروس التي تُكمِلها.
            </p>
          )}
        </div>

        {/* تقدم الوحدات */}
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-black text-ink">
            <Target className="h-5 w-5 text-brand-600" />
            تقدمك في الوحدات
          </h2>
          <div className="space-y-4">
            {data.units.map((u) => {
              const pct = u.total > 0 ? Math.round((u.completed / u.total) * 100) : 0;
              return (
                <Link key={u.id} href={`/units/${u.id}`} className="group block">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-black text-ink group-hover:text-brand-700">{u.title}</span>
                    <span className="text-xs font-bold text-slate-500">
                      {fmtNum(u.completed)} / {fmtNum(u.total)}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-brand-500 to-emerald-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* سجل المحاولات */}
      <div className="card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-black text-ink">
          <ClipboardCheck className="h-5 w-5 text-brand-600" />
          سجل محاولات الاختبارات
        </h2>
        {data.attempts.length === 0 ? (
          <p className="text-sm font-bold text-slate-500">
            لا محاولات بعد — اختبار كل درس متاح من{" "}
            <Link href="/quizzes" className="font-black text-brand-700 hover:underline">
              منطقة الاختبارات
            </Link>
            .
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-right text-xs font-black text-slate-400">
                  <th className="pb-3 pr-2">الاختبار</th>
                  <th className="pb-3">النوع</th>
                  <th className="pb-3">النتيجة</th>
                  <th className="pb-3">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {data.attempts.map((a) => {
                  const pct = a.total > 0 ? Math.round((a.score / a.total) * 100) : 0;
                  return (
                    <tr key={a.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-2 font-bold text-ink">{a.title ?? "اختبار"}</td>
                      <td className="py-3">
                        <span className={`chip ${a.scope === "unit" ? "bg-violet-100 text-violet-700" : "bg-sky-100 text-sky-700"}`}>
                          {a.scope === "unit" ? "وحدة" : "درس"}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`font-black ${pct >= 70 ? "text-emerald-600" : pct >= 40 ? "text-amber-600" : "text-red-500"}`} dir="ltr">
                          {a.score}/{a.total}
                        </span>
                      </td>
                      <td className="py-3 text-xs font-bold text-slate-500">
                        {new Date(a.createdAt).toLocaleDateString("ar-SY-u-nu-latn")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
