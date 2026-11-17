"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, Sparkles } from "lucide-react";
import { ENGINEER, SITE, WHATSAPP_URL } from "@/lib/site";
import { EngineerMonogram, PlatformLogo, WhatsAppIcon } from "@/components/Identity";

const NAV = [{ href:"/", label:"الرئيسية" },{ href:"/units", label:"الوحدات الدراسية" },{ href:"/quizzes", label:"الاختبارات" },{ href:"/lab", label:"المختبر التفاعلي" },{ href:"/student", label:"منطقة الطالب" }];
export default function Header() {
  const pathname = usePathname();
  const active = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href) || (href === "/units" && pathname.startsWith("/lessons"));
  return <header className="no-print sticky top-0 z-40">
    <div className="engineer-topbar"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2"><div className="flex items-center gap-2"><EngineerMonogram size="h-5 w-5"/><span className="text-[10px] text-white/85"><b className="text-white">{ENGINEER.name}</b></span></div><span className="hidden items-center gap-1.5 text-[10px] font-semibold text-violet-100 md:flex"><Sparkles size={12}/> نتعلّم بفهم… ونكبر بالفضول</span><a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-100 hover:text-white" title="التواصل عبر WhatsApp"><WhatsAppIcon className="h-3.5 w-3.5"/><bdi dir="ltr">{ENGINEER.phoneDisplay}</bdi></a></div></div>
    <div className="border-b border-violet-100/80 bg-white/95 backdrop-blur-md"><div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-4 py-4"><Link href="/" aria-label={SITE.name}><PlatformLogo/></Link><nav aria-label="التنقل الرئيسي" className="hidden items-center gap-1 lg:flex">{NAV.map(item => <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined} className={`main-nav-link ${active(item.href) ? "is-active" : ""}`}>{item.label}</Link>)}</nav><Link href="/teacher" className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50/60 px-3.5 py-2.5 text-xs font-bold text-violet-700 transition hover:bg-violet-100"><Lock size={14}/> منطقة المعلم</Link></div><nav aria-label="تنقل إضافي" className="flex gap-1 overflow-x-auto border-t border-violet-50 px-3 py-2 lg:hidden">{NAV.map(item => <Link key={item.href} href={item.href} className={`main-nav-link shrink-0 ${active(item.href) ? "is-active" : ""}`}>{item.label}</Link>)}</nav></div>
  </header>;
}
