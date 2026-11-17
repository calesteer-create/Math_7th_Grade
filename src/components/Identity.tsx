import { SITE, WHATSAPP_URL, ENGINEER } from "@/lib/site";
import TeX from "@/components/TeX";

// أيقونة WhatsApp الرسمية (مسار SVG معتمد)
export function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

// شعار المنصة: رمز π ضمن هوية هندسية
export function PlatformLogo() {
  return (
    <div className="flex items-center gap-3">
      <div role="img" aria-label="رمز باي" data-platform-mark="pi" className="relative grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-800 to-brand-600 text-white shadow-lg shadow-brand-700/30">
        <TeX tex={String.raw`\pi`} className="platform-mark-math" />
        <span className="absolute -bottom-1 -left-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
      </div>
      <div className="leading-tight">
        <div className="text-lg font-black text-ink">{SITE.name}</div>
        <div className="text-[11px] font-semibold text-slate-500">
          {SITE.subject} • {SITE.grade} • منهاج {SITE.country}
        </div>
      </div>
    </div>
  );
}

// علامة هندسية متجهية: الحرفان S وR متصلان بصريًا، تقرأ SR من اليسار.
export function EngineerMonogram({ size = "h-9 w-9" }: { size?: string }) {
  return (
    <span
      role="img"
      aria-label={`علامة SR — ${ENGINEER.name}`}
      data-engineer-mark="SR"
      dir="ltr"
      style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
      className={`relative inline-grid ${size} shrink-0 place-items-center overflow-hidden rounded-[27%] bg-gradient-to-br from-violet-400 via-brand-600 to-brand-900 shadow-sm ring-1 ring-white/25`}
    >
      <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true" focusable="false">
        <path d="M0 0H64V18C39 10 26 32 0 25Z" fill="white" opacity="0.09" />
        <path d="M11 22V11H22M53 42V53H42" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="1.4" strokeLinecap="round" />
        <text x="31" y="44" textAnchor="middle" direction="ltr" fontFamily="Georgia, 'Times New Roman', serif" fontSize="34" fontWeight="700" fontStyle="italic" letterSpacing="-2" fill="white"><tspan>S</tspan><tspan fill="#b8ffe8">R</tspan></text>
        <path d="M15 50Q31 54 49 46" fill="none" stroke="#b8ffe8" strokeOpacity="0.8" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M49 10L52 13L49 16L46 13Z" fill="#b8ffe8" />
      </svg>
    </span>
  );
}

// شريط تعريف مصغّر بالمهندس — يُستخدم في أعلى المنصة
export function EngineerChip() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-2.5 rounded-full border border-brand-100 bg-white py-1.5 pe-4 ps-2 shadow-sm transition hover:border-emerald-300 hover:shadow"
      title="للتواصل مع المهندس سومر شاهين عبر WhatsApp"
    >
      <EngineerMonogram size="h-8 w-8" />
      <div className="leading-tight">
        <div className="text-xs font-extrabold text-ink">{ENGINEER.name}</div>
      </div>
      <WhatsAppIcon className="h-4 w-4 text-emerald-600 transition group-hover:scale-110" />
    </a>
  );
}

// زر WhatsApp أنيق مع الرقم
export function WhatsAppButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      className={`btn btn-whatsapp ${className}`}
      title="فتح محادثة WhatsApp مع المهندس سومر شاهين"
    >
      <WhatsAppIcon className="h-4.5 w-4.5" />
      <span dir="ltr" className="font-black tracking-wide">
        {ENGINEER.phoneDisplay}
      </span>
    </a>
  );
}

// بطاقة تعريف كاملة بالمهندس — تُستخدم في التذييل ونهاية الدروس
export function EngineerCard({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-l from-brand-50 via-white to-emerald-50 shadow-sm ${
        compact ? "p-5" : "p-6"
      }`}
    >
      <div className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-brand-100/50 blur-2xl" />
      <div className="relative flex items-start gap-4">
        <EngineerMonogram size="h-14 w-14" />
        <div className="min-w-0 flex-1">
          <div className="text-xl font-black text-ink">{ENGINEER.name}</div>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            يسعدني تواصلك لأي استفسار أو ملاحظة حول المنصة — «للتواصل والاستفسار».
          </p>
        </div>
      </div>
      <div className="relative mt-4 flex flex-wrap items-center gap-3">
        <WhatsAppButton />
        <span className="text-xs font-semibold text-slate-500">
          يعمل الرابط على المتصفح والحاسوب ويفتح محادثة WhatsApp مباشرة.
        </span>
      </div>
    </div>
  );
}

// توقيع بصري صغير داخل الدروس — غير مزعج ولا يقاطع التعلم
export function EngineerSignature() {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-dashed border-brand-200 bg-brand-50/60 px-4 py-3">
      <EngineerMonogram size="h-8 w-8" />
      <div className="text-sm">
        <span className="font-black text-ink">{ENGINEER.name}</span>
      </div>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700"
      >
        <WhatsAppIcon className="h-3.5 w-3.5" />
        تواصل
      </a>
    </div>
  );
}
