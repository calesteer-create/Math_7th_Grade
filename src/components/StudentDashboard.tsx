"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { STAGES } from "@/lib/site";
import {
  attemptDateText, parseAttempts, parsePracticeSolved, parseStage, parseVisited,
  practiceKey, quizKey, readLocal, stageKey, visitedKey, type QuizAttempt,
} from "@/lib/local-progress";
import { achievements, dashboardStats, lessonStatus, statusLabel, type LessonStatus } from "@/lib/lesson-progress";
import { skillCards, skillsSummary, trendLabel, type SkillDefinition, type SkillStatusKey } from "@/lib/skill-mastery";

// خمس حالات مستقلة تُعرض منفصلة، لا شريحة واحدة تدمجها. الألوان من اللوحة القائمة نفسها.
const PROGRESS_MARKERS = [
  { key: "visited", label: "الزيارة", tone: "bg-violet-100 text-violet-700", earned: (status: LessonStatus) => status.visited },
  { key: "training", label: "إنجاز التدريب", tone: "bg-sky-100 text-sky-700", earned: (status: LessonStatus) => status.trainingComplete },
  { key: "quiz", label: "اجتياز الاختبار", tone: "bg-blue-100 text-blue-700", earned: (status: LessonStatus) => status.passed },
  { key: "completion", label: "إتمام الدرس", tone: "bg-emerald-100 text-emerald-700", earned: (status: LessonStatus) => status.completed },
  { key: "mastery", label: "إتقان الدرس", tone: "bg-amber-100 text-amber-800", earned: (status: LessonStatus) => status.mastered },
] as const;

// أعداد المهام ومفاتيحها تأتي من الخادم بحسب بنك كل درس؛ لا افتراض بستّ مهام.
export type DashboardLesson = { id: number; title: string; revision: string; missionKeys: string[] };

// ألوان من اللوحة القائمة نفسها: خمس حالات مهارة بخمسة أنماط مختلفة.
const SKILL_TONES: Record<SkillStatusKey, string> = {
  "no-evidence": "bg-slate-100 text-slate-600",
  insufficient: "bg-sky-100 text-sky-700",
  mastered: "bg-emerald-100 text-emerald-700",
  developing: "bg-amber-100 text-amber-800",
  "needs-review": "bg-rose-100 text-rose-800",
};

export default function StudentDashboard({ lessons, skills }: { lessons: DashboardLesson[]; skills: SkillDefinition[] }) {
  const [ready, setReady] = useState(false);
  const [statuses, setStatuses] = useState<LessonStatus[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [invalid, setInvalid] = useState(0);
  const [current, setCurrent] = useState<{ id: number; title: string; stage: number | null } | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      // القراءة لا تكتب شيئًا: البيانات القديمة تبقى كما هي، والتالفة تُستبعد في الذاكرة فقط.
      const parsed = parseAttempts(readLocal<unknown>(quizKey, []));
      const next = lessons.map(lesson => {
        const visited = parseVisited(readLocal<unknown>(visitedKey(lesson.id), []), STAGES.length).length > 0;
        const solved = lesson.missionKeys.filter(key =>
          parsePracticeSolved(readLocal<unknown>(practiceKey(lesson.id, lesson.revision, key), null)));
        return lessonStatus({ lessonId: lesson.id, missionKeys: lesson.missionKeys, solvedMissionKeys: solved, attempts: parsed.attempts, visited });
      });
      const saved = lessons
        .map(lesson => ({ lesson, stage: parseStage(readLocal<unknown>(stageKey(lesson.id), null), STAGES.length) }))
        .filter(item => item.stage !== null);
      const active = saved.length ? saved[saved.length - 1] : null;
      setStatuses(next);
      setAttempts(parsed.attempts);
      setInvalid(parsed.invalid);
      setCurrent(active ? { id: active.lesson.id, title: active.lesson.title, stage: active.stage } : null);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [lessons]);

  const stats = dashboardStats(statuses);
  const badges = achievements(statuses);
  const cards = skillCards(skills, attempts);
  const skillStats = skillsSummary(cards);
  const attributed = attempts.filter(attempt => attempt.lessonId !== undefined);
  const legacy = attempts.filter(attempt => attempt.lessonId === undefined);
  const titles = new Map(lessons.map(lesson => [lesson.id, lesson.title]));

  return <div className="space-y-6">
    <header>
      <h1 className="text-3xl font-black text-ink">رحلتك في التعلّم</h1>
      <p className="mt-2 text-sm leading-7 text-slate-600">لا تحتاج إلى حساب. يُحفظ التقدم والمحاولات ودفترك على هذا المتصفح فقط، وقد تُحذف عند مسح بياناته أو تغيير الجهاز.</p>
      <p className="mt-2 text-xs leading-7 text-slate-500">يُعدّ الدرس مكتملًا عند إنجاز كل مهامه التدريبية واجتياز اختباره بنسبة 70٪ على الأقل؛ وفتح المراحل وحده لا يُحتسب إنجازًا.</p>
    </header>

    {invalid > 0 && <div role="status" data-storage-notice="invalid" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-7 text-amber-900">تعذّر قراءة جزء من بياناتك المحفوظة؛ ما يظهر هنا مبني على البيانات الصحيحة فقط، ولم يُحذف أي سجل من متصفحك.</div>}

    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {[
        { label: "نقطة إنجاز", value: stats.points, stat: "points" },
        { label: "دروس مكتملة", value: stats.completed, stat: "completed" },
        { label: "متوسط أفضل النتائج", value: `${stats.average}٪`, stat: "average" },
        { label: "محاولة اختبار", value: stats.attempts, stat: "attempts" },
      ].map(item => <div key={item.label} className="card p-4" data-stat={item.stat}><b className="text-xl text-violet-700" dir="ltr">{item.value}</b><p className="mt-1 text-xs text-slate-500">{item.label}</p></div>)}
    </div>

    <section className="card p-6">
      <h2 className="text-xl font-black">حالة الدروس</h2>
      {ready && statuses.length === 0 && <p className="mt-3 text-slate-500">لا درس منشور بعد.</p>}
      <ul className="mt-4 space-y-3">
        {statuses.map(status => <li key={status.lessonId} data-lesson-status={status.lessonId} className="rounded-xl bg-slate-50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link href={`/lessons/${status.lessonId}`} className="font-black text-ink hover:text-violet-700">{titles.get(status.lessonId)}</Link>
            <span className={`chip ${status.completed ? "bg-emerald-100 text-emerald-700" : status.trainingComplete || status.passed ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-600"}`}>{statusLabel(status)}</span>
          </div>
          <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="علامات التقدم">
            {PROGRESS_MARKERS.map(marker => {
              const earned = marker.earned(status);
              return <li key={marker.key} data-progress-state={marker.key} data-earned={earned ? "true" : "false"}
                className={`chip ${earned ? marker.tone : "border border-slate-200 bg-white text-slate-400"}`}>
                {earned ? "✓ " : "◦ "}{marker.label}
              </li>;
            })}
          </ul>
          <p className="mt-1 text-xs leading-6 text-slate-500">
            التدريب: <bdi dir="ltr">{status.missionsDone}/{status.missionsTotal}</bdi> مهمة · أفضل نتيجة: <bdi dir="ltr">{status.best ? `${status.best.score}/${status.best.total}` : "—"}</bdi> · نقاط الدرس: <bdi dir="ltr">{status.points}/50</bdi>
          </p>
        </li>)}
      </ul>
    </section>

    <section className="card p-6" aria-labelledby="skills-heading">
      <h2 id="skills-heading" className="text-xl font-black">خريطة مهاراتك</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">تُحسب كل مهارة من <b>آخر محاولة مفصّلة</b> لكل درس، وتُعرض بالعدد لا بالوصف وحده: «أجبت صحيحًا عن كذا من كذا». قلة الأدلة ليست ضعفًا؛ نحتاج سؤاليْن على الأقل للمهارة قبل الحكم، ولهذا قد تظهر «دليل غير كافٍ» حتى مع إجابة صحيحة.</p>
      {cards.length > 0 && <p className="mt-2 text-xs font-bold text-slate-500" data-skills-summary="true">أتقنت <bdi dir="ltr">{skillStats.mastered}</bdi> من <bdi dir="ltr">{skillStats.total}</bdi> مهارة · قيد التثبيت <bdi dir="ltr">{skillStats.developing}</bdi> · تحتاج مراجعة <bdi dir="ltr">{skillStats.needsWork}</bdi> · بلا دليل كافٍ <bdi dir="ltr">{skillStats.withoutEvidence}</bdi></p>}
      {ready && cards.length === 0 && <p className="mt-3 text-slate-500">لا توجد مهارات معلنة لهذا الدرس بعد.</p>}
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {cards.map(card => <li key={`${card.lessonId}-${card.key}`} data-skill={card.key} data-lesson={card.lessonId} data-status={card.status} data-evidence={`${card.correct}/${card.total}`} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <b className="text-sm text-ink">{card.label}</b>
            <span className={`chip ${SKILL_TONES[card.status]}`}>{card.statusLabel}</span>
          </div>
          <p className="mt-1 text-xs font-bold text-slate-600" dir="rtl">
            {card.total > 0 ? <>أجبت صحيحًا عن <bdi dir="ltr">{card.correct}</bdi> من <bdi dir="ltr">{card.total}</bdi></> : "لا إجابات بعد"}
          </p>
          <p className="mt-1 text-xs leading-6 text-slate-500">{card.note}</p>
          {trendLabel(card.trend) && <p className="mt-1 text-[11px] font-bold text-slate-500" data-skill-trend={card.trend}>{trendLabel(card.trend)}</p>}
          <Link href={card.guidance.href} className="btn btn-ghost mt-3 text-xs">{card.guidance.text}</Link>
        </li>)}
      </ul>
    </section>

    <section className="card p-6">
      <h2 className="text-xl font-black">شاراتك وإنجازاتك</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {badges.map(badge => <div key={badge.title} data-badge={badge.earned ? "earned" : "locked"} className={`rounded-2xl border p-4 text-center ${badge.earned ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50 opacity-60"}`}><b>{badge.title}</b><p className="mt-1 text-xs text-slate-500">{badge.desc}</p></div>)}
      </div>
    </section>

    <section className="card p-6">
      <h2 className="text-xl font-black">تقدم الدرس</h2>
      {current && current.stage !== null && STAGES[current.stage]
        ? <p className="mt-3">{current.title} — {STAGES[current.stage].title}</p>
        : <p className="mt-3 text-slate-500">لم تبدأ رحلة الدرس بعد.</p>}
      {current ? <Link href={`/lessons/${current.id}`} className="btn btn-primary mt-4">متابعة الدرس</Link> : <Link href="/units" className="btn btn-primary mt-4">استكشف الوحدات</Link>}
    </section>

    <section className="card p-6">
      <h2 className="text-xl font-black">محاولات الاختبار</h2>
      {attributed.length ? <ul className="mt-4 space-y-3">{attributed.map((item, i) => <li key={i} className="rounded-xl bg-slate-50 p-3">{titles.get(item.lessonId!) ?? item.title} — <bdi dir="ltr">{item.score} / {item.total}</bdi> <span className="text-xs text-slate-500">{attemptDateText(item.date)}</span></li>)}</ul> : <p className="mt-3 text-slate-500">لا توجد محاولات بعد.</p>}
      {legacy.length > 0 && <div data-legacy-attempts="true" className="mt-5 rounded-xl border border-slate-200 p-3">
        <h3 className="text-sm font-black text-ink">محاولات سابقة (قبل التحديث)</h3>
        <p className="mt-1 text-xs leading-6 text-slate-500">محفوظة كما هي ولا تُنسب إلى درس، لذلك لا تدخل في النقاط ولا في المتوسط.</p>
        <ul className="mt-2 space-y-2 text-xs">{legacy.map((item, i) => <li key={i}>{item.title} — <bdi dir="ltr">{item.score} / {item.total}</bdi> <span className="text-slate-500">{attemptDateText(item.date)}</span></li>)}</ul>
      </div>}
      <Link href="/quizzes" className="btn btn-ghost mt-4">الاختبارات</Link>
    </section>
  </div>;
}
