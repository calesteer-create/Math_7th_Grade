"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ClipboardCheck,
  KeyRound,
  Loader2,
  LogOut,
  NotebookPen,
  ShieldCheck,
  Users,
} from "lucide-react";
import MathText from "@/components/MathText";
import { fmtNum } from "@/lib/site";

type Overview = {
  stats: {
    lessons: number;
    published: number;
    solutions: number;
    quizQuestions: number;
    attempts: number;
  };
  units: {
    id: number;
    title: string;
    lessons: { id: number; title: string; status: string }[];
  }[];
  solutions: {
    id: number;
    unitTitle: string;
    lessonTitle: string | null;
    title: string;
    source: string | null;
    question: string | null;
    answer: string;
    steps: string[] | null;
    law: string | null;
    notes: string | null;
    commonMistakes: string[] | null;
    status: string;
  }[];
  quizKeys: {
    id: string;
    scope: string;
    title: string;
    questions: { id: number; type: string; question: string; answer: string; explanation: string | null; source: string | null }[];
  }[];
  attempts: {
    id: number;
    studentName: string;
    title: string | null;
    scope: string;
    score: number;
    total: number;
    createdAt: string;
  }[];
};

const TABS = [
  { id: "solutions", label: "الحلول التفصيلية", icon: <BookOpen className="h-4 w-4" /> },
  { id: "keys", label: "مفاتيح الإجابات", icon: <KeyRound className="h-4 w-4" /> },
  { id: "students", label: "نشاط الطلاب", icon: <Users className="h-4 w-4" /> },
  { id: "password", label: "كلمة المرور", icon: <ShieldCheck className="h-4 w-4" /> },
] as const;

export default function TeacherDashboard() {
  const router = useRouter();
  const [data, setData] = useState<Overview | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("solutions");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/teacher/overview", { cache: "no-store" });
        if (res.status === 401) {
          router.refresh();
          return;
        }
        const json = await res.json();
        setData(json);
      } catch {
        setError("تعذر تحميل بيانات منطقة المعلم.");
      }
    })();
  }, [router]);

  async function logout() {
    await fetch("/api/teacher/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push("/");
    router.refresh();
  }

  if (error) {
    return <div className="card mx-auto max-w-xl p-10 text-center font-bold text-red-600">{error}</div>;
  }
  if (!data) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="font-bold">جارٍ تحميل منطقة المعلم…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* الترويسة */}
      <div className="card flex flex-wrap items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-700 text-white shadow-lg">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-black text-ink">منطقة المعلم</h1>
            <p className="text-xs font-bold text-slate-500">
              الحلول والمفاتيح مرتبة حسب الوحدة والدرس — لا تظهر هذه الصفحة للطلاب
            </p>
          </div>
        </div>
        <button onClick={logout} className="btn btn-ghost text-xs">
          <LogOut className="h-3.5 w-3.5" />
          تسجيل الخروج
        </button>
      </div>

      {/* إحصاءات */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { v: data.stats.lessons, l: "دروس في الهيكل" },
          { v: data.stats.published, l: "دروس مُعتمدة" },
          { v: data.stats.solutions, l: "حلول مضافة" },
          { v: data.stats.quizQuestions, l: "سؤال اختبار" },
          { v: data.stats.attempts, l: "محاولة طالب" },
        ].map((s, i) => (
          <div key={i} className="card p-4 text-center">
            <div className="text-2xl font-black text-brand-700" dir="ltr">{fmtNum(s.v)}</div>
            <div className="mt-1 text-[11px] font-bold text-slate-500">{s.l}</div>
          </div>
        ))}
      </div>

      {/* التبويبات */}
      <div className="no-print flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition ${
              tab === t.id
                ? "bg-brand-700 text-white shadow-md shadow-brand-700/30"
                : "border border-slate-200 bg-white text-slate-600 hover:border-brand-300"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* الحلول التفصيلية */}
      {tab === "solutions" && (
        <div className="space-y-8">
          {data.solutions.length === 0 && (
            <div className="card p-10 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 font-black text-ink">لا توجد حلول مضافة بعد</p>
              <p className="mt-1 text-sm text-slate-500">
                تُضاف الحلول التفصيلية لكل درس عند اعتماد محتواه من صور الكتاب، مع الإشارة
                إلى الصفحة ورقم السؤال.
              </p>
            </div>
          )}
          {data.units.map((unit) => {
            const unitSolutions = data.solutions.filter(
              (s) => s.unitTitle === unit.title
            );
            if (unitSolutions.length === 0) return null;
            return (
              <section key={unit.id}>
                <h2 className="mb-3 text-lg font-black text-ink">{unit.title}</h2>
                <div className="space-y-4">
                  {unitSolutions.map((s) => (
                    <article key={s.id} className="card p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-ink">{s.title}</h3>
                        {s.lessonTitle && (
                          <span className="chip bg-brand-50 text-brand-700">{s.lessonTitle}</span>
                        )}
                        {s.source && (
                          <span className="chip bg-slate-100 text-slate-500">{s.source}</span>
                        )}
                        {s.status === "review" ? (
                          <span className="chip bg-amber-100 text-amber-700">بحاجة إلى مراجعة</span>
                        ) : (
                          <span className="chip bg-emerald-100 text-emerald-700">معتمد</span>
                        )}
                      </div>
                      {s.question && (
                        <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold leading-relaxed text-slate-700">
                          <MathText text={s.question}/>
                        </p>
                      )}
                      {s.steps && s.steps.length > 0 && (
                        <ol className="mt-3 space-y-1.5">
                          {s.steps.map((st, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-slate-700">
                              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-100 text-[10px] font-black text-brand-700">
                                {fmtNum(i + 1)}
                              </span>
                              <span dir="auto"><MathText text={st}/></span>
                            </li>
                          ))}
                        </ol>
                      )}
                      <div className="mt-3 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-black text-emerald-800">
                        الإجابة: <span dir="auto"><MathText text={s.answer}/></span>
                      </div>
                      {s.law && (
                        <p className="mt-2 text-xs font-bold text-slate-500">
                          القاعدة المستخدمة: <MathText text={s.law}/>
                        </p>
                      )}
                      {s.commonMistakes && s.commonMistakes.length > 0 && (
                        <div className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold leading-relaxed text-red-800">
                          <b>أخطاء شائعة متوقعة:</b> <MathText text={s.commonMistakes.join(" • ")}/>
                        </div>
                      )}
                      {s.notes && <p className="mt-2 text-xs font-bold text-slate-500"><MathText text={s.notes}/></p>}
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* مفاتيح الإجابات */}
      {tab === "keys" && (
        <div className="space-y-6">
          {data.quizKeys.length === 0 && (
            <div className="card p-10 text-center">
              <KeyRound className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 font-black text-ink">لا توجد مفاتيح بعد</p>
              <p className="mt-1 text-sm text-slate-500">
                تُنشأ مفاتيح الإجابات تلقائيًا مع كل اختبار درس يُعتمد.
              </p>
            </div>
          )}
          {data.quizKeys.map((quiz) => (
            <section key={quiz.id} className="card p-5">
              <h3 className="flex items-center gap-2 font-black text-ink">
                <ClipboardCheck className="h-4.5 w-4.5 text-brand-600" />
                {quiz.title}
                <span className={`chip ${quiz.scope === "unit" ? "bg-violet-100 text-violet-700" : "bg-sky-100 text-sky-700"}`}>
                  {quiz.scope === "unit" ? "اختبار وحدة" : "اختبار درس"}
                </span>
              </h3>
              <ol className="mt-3 space-y-2">
                {quiz.questions.map((q, i) => (
                  <li key={q.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-2.5 text-sm">
                    <span className="font-black text-brand-600">{fmtNum(i + 1)}.</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold leading-7 text-slate-700"><MathText text={q.question}/></p>
                      <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900">الإجابة: <bdi dir="auto"><MathText text={q.answer}/></bdi></p>
                      {q.explanation && <p className="mt-2 text-xs leading-7 text-slate-600"><MathText text={q.explanation}/></p>}
                      {q.source && <p className="mt-2 text-[10px] leading-5 text-slate-400">{q.source}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}

      {/* نشاط الطلاب */}
      {tab === "students" && (
        <div className="card p-6">
          {data.attempts.length === 0 ? (
            <p className="py-8 text-center text-sm font-bold text-slate-500">
              لا محاولات طلاب مسجلة بعد.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-right text-xs font-black text-slate-400">
                    <th className="pb-3 pr-2">الطالب</th>
                    <th className="pb-3">الاختبار</th>
                    <th className="pb-3">النوع</th>
                    <th className="pb-3">النتيجة</th>
                    <th className="pb-3">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {data.attempts.map((a) => (
                    <tr key={a.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-2 font-bold text-ink">{a.studentName}</td>
                      <td className="py-3 font-bold text-slate-700">{a.title ?? "—"}</td>
                      <td className="py-3">
                        <span className={`chip ${a.scope === "unit" ? "bg-violet-100 text-violet-700" : "bg-sky-100 text-sky-700"}`}>
                          {a.scope === "unit" ? "وحدة" : "درس"}
                        </span>
                      </td>
                      <td className="py-3 font-black text-brand-700" dir="ltr">
                        {a.score}/{a.total}
                      </td>
                      <td className="py-3 text-xs font-bold text-slate-500">
                        {new Date(a.createdAt).toLocaleDateString("ar-SY-u-nu-latn")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* تغيير كلمة المرور */}
      {tab === "password" && <PasswordTab />}

      <p className="flex items-center justify-center gap-2 pt-2 text-center text-[11px] font-bold text-slate-400">
        <NotebookPen className="h-3.5 w-3.5" />
        كل محتويات هذه الصفحة تُقدَّم عبر استعلامات محمية في الخادم — لا تُرسَل أي حلول إلى المتصفح قبل تسجيل الدخول.
      </p>
    </div>
  );
}

function PasswordTab() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (next.length < 6) {
      setMsg({ ok: false, text: "كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف." });
      return;
    }
    if (next !== confirm) {
      setMsg({ ok: false, text: "تأكيد كلمة المرور غير متطابق." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "password", current, next }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setMsg({ ok: true, text: "تم تغيير كلمة المرور بنجاح — ستظل جلساتك الحالية فعالة." });
        setCurrent(""); setNext(""); setConfirm("");
      } else {
        setMsg({ ok: false, text: data.error ?? "تعذر تغيير كلمة المرور." });
      }
    } catch {
      setMsg({ ok: false, text: "حدث خطأ في الاتصال." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card max-w-md p-6">
      <h2 className="flex items-center gap-2 font-black text-ink">
        <ShieldCheck className="h-5 w-5 text-brand-600" />
        تغيير كلمة مرور منطقة المعلم
      </h2>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className="input" placeholder="كلمة المرور الحالية" dir="ltr" />
        <input type="password" value={next} onChange={(e) => setNext(e.target.value)} className="input" placeholder="كلمة المرور الجديدة (6 أحرف فأكثر)" dir="ltr" />
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input" placeholder="تأكيد كلمة المرور الجديدة" dir="ltr" />
        {msg && (
          <p className={`rounded-xl px-4 py-2.5 text-sm font-bold ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
            {msg.text}
          </p>
        )}
        <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-40">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          تحديث كلمة المرور
        </button>
      </form>
    </div>
  );
}
