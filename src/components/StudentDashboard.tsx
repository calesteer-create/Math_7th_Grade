"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { STAGES } from "@/lib/site";
import { lessons } from "@/lib/curriculum";
import { quizKey, readLocal, stageKey, visitedKey, type QuizAttempt } from "@/lib/local-progress";

export default function StudentDashboard() {
  const [stage, setStage] = useState<number | null>(null);
  const [visited, setVisited] = useState<number[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  useEffect(() => {
    const timer = window.setTimeout(() => { setStage(readLocal<number | null>(stageKey(1), null)); setVisited(readLocal<number[]>(visitedKey(1), [])); setAttempts(readLocal<QuizAttempt[]>(quizKey, [])); }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const completed = visited.includes(STAGES.length - 1) ? 1 : 0;
  const average = attempts.length ? Math.round(attempts.reduce((sum, attempt) => sum + (attempt.total ? attempt.score / attempt.total * 100 : 0), 0) / attempts.length * 10) / 10 : 0;
  const points = completed * 50 + attempts.reduce((sum, attempt) => sum + attempt.score * 10, 0);
  const badges = [
    { title: "الخطوة الأولى", desc: "أكملت أول درس", earned: completed >= 1 },
    { title: "مثابر", desc: "أكملت 5 دروس", earned: false },
    { title: "علامة كاملة", desc: "نتيجة كاملة في اختبار", earned: attempts.some(item => item.total > 0 && item.score === item.total) },
    { title: "مجتهد", desc: "5 محاولات اختبار أو أكثر", earned: attempts.length >= 5 },
  ];
  return <div className="space-y-6"><header><h1 className="text-3xl font-black text-ink">رحلتك في التعلّم</h1><p className="mt-2 text-sm leading-7 text-slate-600">لا تحتاج إلى حساب. يُحفظ التقدم والمحاولات ودفترك على هذا المتصفح فقط، وقد تُحذف عند مسح بياناته أو تغيير الجهاز.</p></header>
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[{ label: "نقطة إنجاز", value: points }, { label: "دروس مكتملة", value: completed }, { label: "متوسط النتائج", value: `${average}٪` }, { label: "محاولة اختبار", value: attempts.length }].map(item => <div key={item.label} className="card p-4"><b className="text-xl text-violet-700" dir="ltr">{item.value}</b><p className="mt-1 text-xs text-slate-500">{item.label}</p></div>)}</div>
    <section className="card p-6"><h2 className="text-xl font-black">شاراتك وإنجازاتك</h2><div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">{badges.map(badge => <div key={badge.title} className={`rounded-2xl border p-4 text-center ${badge.earned ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50 opacity-60"}`}><b>{badge.title}</b><p className="mt-1 text-xs text-slate-500">{badge.desc}</p></div>)}</div></section>
    <section className="card p-6"><h2 className="text-xl font-black">تقدم الدرس</h2>{stage !== null && STAGES[stage] ? <p className="mt-3">{lessons[0].title} — {STAGES[stage].title}</p> : <p className="mt-3 text-slate-500">لم تبدأ رحلة الدرس بعد.</p>}<Link href="/lessons/1" className="btn btn-primary mt-4">متابعة الدرس</Link></section>
    <section className="card p-6"><h2 className="text-xl font-black">محاولات الاختبار</h2>{attempts.length ? <ul className="mt-4 space-y-3">{attempts.map((item,i) => <li key={i} className="rounded-xl bg-slate-50 p-3">{item.title} — <bdi dir="ltr">{item.score} / {item.total}</bdi> <span className="text-xs text-slate-500">{new Date(item.date).toLocaleDateString("ar")}</span></li>)}</ul> : <p className="mt-3 text-slate-500">لا توجد محاولات بعد.</p>}<Link href="/quizzes" className="btn btn-ghost mt-4">الاختبارات</Link></section>
  </div>;
}
