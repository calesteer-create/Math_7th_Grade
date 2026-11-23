"use client";

import { useId, useState } from "react";
import { Combine, Layers, MessageSquareText, Package } from "lucide-react";
import TeX from "@/components/TeX";
import { CoinIcon, EnvelopeIcon } from "@/components/figures/AlgebraFigures";
import {
  addFrac,
  distributeScalar,
  evaluateLinear,
  frac,
  fracToTeX,
  linearToTeX,
  simplifyDistributed,
  TRANSLATION_PRESETS,
  type AlgebraStudioMode,
} from "@/lib/algebraic-expressions";

export type AlgebraStudioTab = Exclude<AlgebraStudioMode, "full">;

const TABS: { id: AlgebraStudioTab; label: string }[] = [
  { id: "envelopes", label: "المغلّفات والتعويض" },
  { id: "combine", label: "الحدود المتشابهة" },
  { id: "distribute", label: "خاصّة التوزيع" },
  { id: "translate", label: "من النص إلى العبارة" },
];

function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return <label className="block rounded-xl border border-slate-200 bg-white p-3">
    <span className="mb-1.5 flex items-center justify-between text-xs font-extrabold text-slate-600">
      <span>{label}</span>
      <bdi dir="ltr" className="rounded-md bg-violet-50 px-2 py-0.5 text-violet-700">{value}</bdi>
    </span>
    <input type="range" min={min} max={max} step={1} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full accent-violet-600" dir="ltr" aria-label={label} />
  </label>;
}

function EnvelopesTab() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(3);
  const [x, setX] = useState(50);

  const exprTeX = linearToTeX(frac(a), frac(b));
  const value = evaluateLinear(frac(a), frac(b), frac(x));
  const prod = a * x;

  return <div className="space-y-5" data-algebra-envelopes="true">
    <div className="grid gap-3 sm:grid-cols-3">
      <Slider label="المعامل a (عدد المغلّفات)" value={a} min={-4} max={6} onChange={setA} />
      <Slider label="الحدّ الثابت b (النقود)" value={b} min={-8} max={8} onChange={setB} />
      <Slider label="قيمة المتغيّر x" value={x} min={-10} max={50} onChange={setX} />
    </div>

    <div className="grid items-center gap-5 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
      <div className="rounded-2xl border border-slate-200 bg-white p-3">
        {a >= 0 && b >= 0 ? (
          <svg viewBox="0 0 300 130" className="block w-full" role="img" aria-label={`نموذج ${a} مغلّفات و${b} قطع نقدية`} direction="ltr">
            <rect x={8} y={8} width={284} height={114} rx={12} fill="#f7a897" fillOpacity={0.5} stroke="#ea580c" strokeOpacity={0.35} strokeWidth={1.5} />
            {Array.from({ length: a }, (_, i) => <EnvelopeIcon key={i} x={18 + i * 45} y={20} w={38} h={26} />)}
            {Array.from({ length: b }, (_, i) => <CoinIcon key={i} cx={32 + i * 32} cy={88} r={12} />)}
            {a === 0 && b === 0 && <text x={150} y={70} textAnchor="middle" fontSize="13" fontWeight="800" fill="#64748b">0 (لا مغلّفات ولا نقود)</text>}
          </svg>
        ) : (
          <div className="rounded-xl bg-violet-50/60 p-4 text-center text-xs font-bold leading-7 text-violet-900">
            عندما يكون المعامل أو الثابت سالبًا نعتمد على الصيغة الجبرية مباشرةً لحساب القيمة بدقة.
            <div className="mt-2 text-lg"><TeX tex={exprTeX} /></div>
          </div>
        )}
      </div>

      <div role="status" data-algebra-eval-result="true" className="space-y-3 rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-extrabold text-violet-700">العبارة الجبرية</span>
          <span className="rounded-lg bg-white px-3 py-1 text-lg font-black text-violet-950" dir="ltr"><TeX tex={exprTeX} /></span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
          <div className="rounded-xl bg-white p-2"><span className="block text-[10px] text-slate-400">معامل x</span><bdi dir="ltr" className="text-sm font-black text-blue-700">{a}</bdi></div>
          <div className="rounded-xl bg-white p-2"><span className="block text-[10px] text-slate-400">المتغيّر</span><bdi dir="ltr" className="text-sm font-black text-emerald-700">x</bdi></div>
          <div className="rounded-xl bg-white p-2"><span className="block text-[10px] text-slate-400">الحدّ الثابت</span><bdi dir="ltr" className="text-sm font-black text-rose-700">{b}</bdi></div>
        </div>
        <div className="rounded-xl bg-white p-3 text-center" dir="ltr">
          <TeX tex={`${a}(${x}) ${b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`} = ${prod} ${b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`} = ${fracToTeX(value)}`} block />
        </div>
      </div>
    </div>

    <div className="flex flex-wrap gap-2">
      {[
        { label: "2x + 3 عند x = 50", a: 2, b: 3, x: 50 },
        { label: "3x + 1 عند x = 4", a: 3, b: 1, x: 4 },
        { label: "4x عند x = 7", a: 4, b: 0, x: 7 },
        { label: "-4x عند x = 3", a: -4, b: 0, x: 3 },
      ].map(p => <button key={p.label} type="button" onClick={() => { setA(p.a); setB(p.b); setX(p.x); }} className="rounded-lg border border-violet-200 bg-white px-2.5 py-1 text-xs font-extrabold text-violet-800 hover:bg-violet-50">{p.label}</button>)}
    </div>
  </div>;
}

function CombineTab() {
  const [a1, setA1] = useState(2);
  const [b1, setB1] = useState(3);
  const [a2, setA2] = useState(3);
  const [b2, setB2] = useState(1);

  const sumA = addFrac(frac(a1), frac(a2));
  const sumB = addFrac(frac(b1), frac(b2));
  const signedTerm = (coef: number, v: string, first: boolean) => {
    if (v === "x") {
      if (first) return coef === 1 ? "x" : coef === -1 ? "-x" : `${coef}x`;
      if (coef >= 0) return coef === 1 ? "+ x" : `+ ${coef}x`;
      return coef === -1 ? "- x" : `- ${Math.abs(coef)}x`;
    }
    return coef >= 0 ? `+ ${coef}` : `- ${Math.abs(coef)}`;
  };
  const original = `${signedTerm(a1, "x", true)} ${signedTerm(b1, "", false)} ${signedTerm(a2, "x", false)} ${signedTerm(b2, "", false)}`;
  const grouped = `(${a1} ${a2 >= 0 ? `+ ${a2}` : `- ${Math.abs(a2)}`})x + (${b1} ${b2 >= 0 ? `+ ${b2}` : `- ${Math.abs(b2)}`})`;
  const simplified = linearToTeX(sumA, sumB);

  return <div className="space-y-5" data-algebra-combine="true">
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Slider label="الحدّ الأول (معامل x)" value={a1} min={-9} max={9} onChange={setA1} />
      <Slider label="الثابت الأول" value={b1} min={-12} max={12} onChange={setB1} />
      <Slider label="الحدّ الثاني (معامل x)" value={a2} min={-9} max={9} onChange={setA2} />
      <Slider label="الثابت الثاني" value={b2} min={-12} max={12} onChange={setB2} />
    </div>

    <div role="status" data-algebra-combine-result="true" className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
      <div className="rounded-xl bg-white p-3">
        <p className="text-[11px] font-extrabold text-slate-500">1. العبارة قبل الاختزال</p>
        <div className="mt-1 text-center" dir="ltr"><TeX tex={original} block /></div>
      </div>
      <div className="rounded-xl bg-white p-3">
        <p className="text-[11px] font-extrabold text-violet-700">2. نجمع حدود x معًا والحدود الثابتة معًا</p>
        <div className="mt-1 text-center" dir="ltr"><TeX tex={grouped} block /></div>
      </div>
      <div className="rounded-xl border border-emerald-200 bg-white p-3">
        <p className="text-[11px] font-extrabold text-emerald-700">3. العبارة المختزلة</p>
        <div className="mt-1 text-center text-lg font-black" dir="ltr"><TeX tex={simplified} block /></div>
      </div>
    </div>

    <div className="flex flex-wrap gap-2">
      {[
        { label: "2x + 3 + 3x + 1", v: [2, 3, 3, 1] },
        { label: "7x - 8 - 2x - 1", v: [7, -8, -2, -1] },
        { label: "3x + 9 - 8x + 8", v: [3, 9, -8, 8] },
        { label: "4x - 5 - 4x + 5", v: [4, -5, -4, 5] },
      ].map(p => <button key={p.label} type="button" onClick={() => { setA1(p.v[0]); setB1(p.v[1]); setA2(p.v[2]); setB2(p.v[3]); }} className="rounded-lg border border-emerald-200 bg-white px-2.5 py-1 text-xs font-extrabold text-emerald-800 hover:bg-emerald-50" dir="ltr">{p.label}</button>)}
    </div>
  </div>;
}

function DistributeTab() {
  const [k, setK] = useState(3);
  const [a, setA] = useState(2);
  const [b, setB] = useState(-12);
  const [c, setC] = useState(8);

  const dist = distributeScalar(frac(k), frac(a), frac(b));
  const final = simplifyDistributed(frac(k), frac(a), frac(b), frac(c), frac(0));
  const inside = linearToTeX(frac(a), frac(b));
  const tail = c === 0 ? "" : c > 0 ? ` + ${c === 1 ? "x" : `${c}x`}` : ` - ${Math.abs(c) === 1 ? "x" : `${Math.abs(c)}x`}`;
  const fullExpr = `${k}(${inside})${tail}`;
  const expanded = `${linearToTeX(dist.a, dist.b)}${tail}`;
  const simplified = linearToTeX(final.a, final.b);

  return <div className="space-y-5" data-algebra-distribute="true">
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Slider label="العدد الموزَّع k" value={k} min={-6} max={6} onChange={setK} />
      <Slider label="معامل x داخل القوس (a)" value={a} min={-5} max={5} onChange={setA} />
      <Slider label="الثابت داخل القوس (b)" value={b} min={-12} max={12} onChange={setB} />
      <Slider label="حدّ x خارج القوس (c)" value={c} min={-8} max={8} onChange={setC} />
    </div>

    <div role="status" data-algebra-dist-result="true" className="space-y-3 rounded-2xl border border-sky-200 bg-sky-50/50 p-4">
      <div className="rounded-xl bg-white p-3 text-center" dir="ltr">
        <TeX tex={fullExpr} block />
      </div>
      <div className="rounded-xl bg-white p-3">
        <p className="text-[11px] font-extrabold text-sky-700">الخطوة 1: نوزّع <TeX tex={String(k)} /> على كلّ حدٍّ داخل القوسين</p>
        <div className="mt-1 text-center" dir="ltr">
          <TeX tex={`${k}(${a}x) + ${k}(${b})${tail} = ${expanded}`} block />
        </div>
      </div>
      <div className="rounded-xl border border-sky-200 bg-white p-3">
        <p className="text-[11px] font-extrabold text-emerald-700">الخطوة 2: نختزل الحدود المتشابهة</p>
        <div className="mt-1 text-center text-lg font-black" dir="ltr"><TeX tex={simplified} block /></div>
      </div>
      {k < 0 && <p className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs font-bold text-amber-900">انتبه للإشارة: ضرب عدد سالب (<TeX tex={String(k)} />) بكلّ حدّ داخل القوس يعكس إشارة كلّ حدّ!</p>}
    </div>

    <div className="flex flex-wrap gap-2">
      {[
        { label: "3(2x - 12) + 8x", v: [3, 2, -12, 8] },
        { label: "2(4x + 5)", v: [2, 4, 5, 0] },
        { label: "-3(2x - 4) + 5x", v: [-3, 2, -4, 5] },
      ].map(p => <button key={p.label} type="button" onClick={() => { setK(p.v[0]); setA(p.v[1]); setB(p.v[2]); setC(p.v[3]); }} className="rounded-lg border border-sky-200 bg-white px-2.5 py-1 text-xs font-extrabold text-sky-800 hover:bg-sky-50" dir="ltr">{p.label}</button>)}
    </div>
  </div>;
}

function TranslateTab() {
  const [presetId, setPresetId] = useState<string>(TRANSLATION_PRESETS[0].id);
  const [xVal, setXVal] = useState(10);
  const preset = TRANSLATION_PRESETS.find(item => item.id === presetId) ?? TRANSLATION_PRESETS[0];
  const signedB = preset.op === "add" ? preset.b : -preset.b;
  const expr = linearToTeX(frac(preset.a), frac(signedB));
  const result = evaluateLinear(frac(preset.a), frac(signedB), frac(xVal));

  return <div className="space-y-4" data-algebra-translate="true">
    <div className="grid gap-2 sm:grid-cols-2">
      {TRANSLATION_PRESETS.map(item => <button key={item.id} type="button" aria-pressed={presetId === item.id} onClick={() => setPresetId(item.id)} className={`rounded-xl border p-3 text-right text-xs font-extrabold transition ${presetId === item.id ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-violet-300"}`}>
        <span className="block">{item.sampleContext}</span>
      </button>)}
    </div>
    <Slider label="قيمة المتغيّر x للتجربة" value={xVal} min={1} max={50} onChange={setXVal} />
    <div role="status" data-algebra-translate-result="true" className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4 space-y-2">
      <p className="text-xs font-bold text-slate-700">الكلمات الدالة: <b className="text-violet-900">{preset.op === "add" ? "يزيد / مضافًا إليه (+)" : "ينقص عن (−)"}</b> {preset.a > 1 ? `· و«${preset.a === 2 ? "ضعفي" : "ثلاثة أضعاف"}» تعني الضرب بـ ${preset.a}` : ""}</p>
      <div className="rounded-xl bg-white p-3 text-center" dir="ltr">
        <TeX tex={`${expr} \\quad \\Longrightarrow \\quad \\text{عند } x = ${xVal}: \\ ${fracToTeX(result)}`} block />
      </div>
    </div>
  </div>;
}

export default function AlgebraStudio({ mode = "full" }: { mode?: AlgebraStudioMode }) {
  const [tab, setTab] = useState<AlgebraStudioTab>(mode === "full" ? "envelopes" : mode);
  const uid = useId();
  const iconFor = (value: AlgebraStudioTab) => value === "envelopes" ? <Package size={15} /> : value === "combine" ? <Combine size={15} /> : value === "distribute" ? <Layers size={15} /> : <MessageSquareText size={15} />;

  return <section data-algebra-studio="true" className="overflow-hidden rounded-[26px] border border-violet-200 bg-white shadow-[0_14px_40px_-28px_rgba(91,33,182,.28)]">
    <header className="border-b border-violet-100 bg-gradient-to-l from-violet-50/80 via-white to-sky-50/50 px-6 py-5">
      <span className="text-[11px] font-extrabold text-violet-700">مختبر العبارات الجبرية</span>
      <h3 className="mt-1 text-lg font-black text-ink">جرّب المغلّفات، اختزل الحدود المتشابهة، ووزّع على الأقواس</h3>
      <p className="mt-1 text-xs leading-6 text-slate-500">غيّر المعاملات والثوابت وقيمة المتغيّر ولاحظ كيف تتغيّر العبارة وقيمتها العددية خطوة بخطوة.</p>
      {mode === "full" && <div role="tablist" aria-label="أدوات مختبر العبارات الجبرية" className="mt-4 flex flex-wrap gap-2">
        {TABS.map(item => {
          const active = item.id === tab;
          return <button key={item.id} id={`${uid}-tab-${item.id}`} type="button" role="tab" aria-selected={active} aria-controls={`${uid}-panel`} onClick={() => setTab(item.id)} className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-extrabold transition ${active ? "border-violet-600 bg-violet-600 text-white" : "border-violet-200 bg-white text-slate-600 hover:border-violet-400 hover:text-violet-900"}`}>{iconFor(item.id)}<span>{item.label}</span></button>;
        })}
      </div>}
    </header>
    <div id={`${uid}-panel`} role="tabpanel" className="p-6">
      {tab === "envelopes" && <EnvelopesTab />}
      {tab === "combine" && <CombineTab />}
      {tab === "distribute" && <DistributeTab />}
      {tab === "translate" && <TranslateTab />}
    </div>
  </section>;
}
