import Link from "next/link";
import { ENGINEER, SITE } from "@/lib/site";
import { EngineerCard, PlatformLogo } from "@/components/Identity";

const LINKS = [
  { href: "/units", label: "الوحدات الدراسية" },
  { href: "/quizzes", label: "منطقة الاختبارات" },
  { href: "/lab", label: "المختبر التفاعلي" },
  { href: "/student", label: "منطقة الطالب" },
  { href: "/teacher", label: "منطقة المعلم" },
];

export default function Footer() {
  return (
    <footer className="no-print mt-20 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <PlatformLogo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
            {SITE.description}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-400">
            روابط سريعة
          </h3>
          <ul className="mt-4 space-y-2.5">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm font-bold text-slate-600 transition hover:text-brand-700"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-400">
            هوية المنصة
          </h3>
          <div className="mt-4">
            <EngineerCard compact />
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs font-semibold text-slate-500">
        © {new Date().getFullYear()} {SITE.name} — جميع الحقوق محفوظة —{" "}
        <b className="text-ink">{ENGINEER.name}</b>
      </div>
    </footer>
  );
}
