"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, ShieldCheck } from "lucide-react";
import { EngineerMonogram } from "@/components/Identity";
import { ENGINEER } from "@/lib/site";

export default function TeacherLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/teacher/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        router.refresh();
      } else {
        setError(data.error ?? "تعذر تسجيل الدخول.");
      }
    } catch {
      setError("حدث خطأ في الاتصال. أعد المحاولة.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-700 text-white shadow-lg">
            <ShieldCheck className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-2xl font-black text-ink">منطقة المعلم</h1>
          <p className="mt-1 text-sm font-bold text-slate-500">
            منطقة محمية — مخصصة للمعلم فقط. الحلول ومفاتيح الإجابة لا تظهر للطلاب.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-black text-slate-500">كلمة المرور</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="أدخل كلمة المرور"
              autoFocus
              dir="ltr"
            />
          </label>
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700">{error}</p>
          )}
          <button type="submit" disabled={loading || !password} className="btn btn-primary w-full disabled:opacity-40">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            دخول منطقة المعلم
          </button>
        </form>
        <p className="mt-5 flex items-center justify-center gap-2 text-center text-[11px] font-bold text-slate-400">
          <EngineerMonogram size="h-5 w-5" />
          {ENGINEER.name}
        </p>
      </div>
    </div>
  );
}
