"use client";

import { useId, useState, type MouseEvent } from "react";
import { Crosshair, Grid2x2, Move, Sparkles } from "lucide-react";
import TeX from "@/components/TeX";
import { GridPlane, planeFromPixel } from "@/components/figures/CoordinatePlaneFigures";
import {
  QUADRANT_SIGN_RULES,
  axisRelation,
  inGrid,
  relationLabel,
  type Point,
} from "@/lib/coordinate-plane";

export type CoordinateStudioTab = "explore" | "plot" | "quadrants";
const TABS: { id: CoordinateStudioTab; label: string }[] = [
  { id: "explore", label: "حرّك النقطة" },
  { id: "plot", label: "عيّن النقطة" },
  { id: "quadrants", label: "الأرباع والإشارات" },
];

const SIZE = 380;
const DOMAIN = 5;

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="block rounded-xl border border-slate-200 bg-white p-3">
    <span className="mb-1.5 flex items-center justify-between text-xs font-extrabold text-slate-600"><span>{label}</span><bdi dir="ltr" className="rounded-md bg-violet-50 px-2 py-0.5 text-violet-700">{value}</bdi></span>
    <input type="range" min={-DOMAIN} max={DOMAIN} step={1} value={value} onChange={event => onChange(Number(event.target.value))} className="w-full accent-violet-600" dir="ltr" aria-label={label} />
  </label>;
}

function ExploreTab() {
  const [point, setPoint] = useState<Point>({ x: 3, y: 2 });
  const relation = axisRelation(point);
  return <div className="space-y-5" data-studio-explore="true">
    <div className="grid gap-4 sm:grid-cols-2">
      <Slider label="الفاصلة x (أفقيًا)" value={point.x} onChange={value => setPoint({ ...point, x: value })} />
      <Slider label="الترتيب y (عموديًا)" value={point.y} onChange={value => setPoint({ ...point, y: value })} />
    </div>
    <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <div className="justify-self-center rounded-2xl border border-slate-200 bg-white p-2"><GridPlane points={[{ label: "P", point, color: "#7c3aed" }]} guides={point} size={SIZE} domain={DOMAIN} label={`النقطة P عند (${point.x},${point.y})`} /></div>
      <div role="status" data-coordinate-result="true" className="space-y-3 rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
        <div className="text-center text-xl font-black text-violet-950" dir="ltr"><TeX tex={`P\\left(${point.x},${point.y}\\right)`} /></div>
        <ul className="space-y-1.5 text-xs font-bold leading-7 text-slate-700">
          <li>الفاصلة (على محور الفواصل): <bdi dir="ltr" className="font-black text-violet-700">{point.x}</bdi></li>
          <li>الترتيب (على محور الترتيب): <bdi dir="ltr" className="font-black text-violet-700">{point.y}</bdi></li>
          <li>الموضع: <b className="text-violet-800">{relationLabel(point)}</b></li>
          <li>الإشارات: <bdi dir="ltr" className="font-black">{`(${point.x > 0 ? "+" : point.x < 0 ? "-" : "0"},${point.y > 0 ? "+" : point.y < 0 ? "-" : "0"})`}</bdi></li>
        </ul>
        <p className="rounded-xl bg-white p-3 text-[11px] font-bold leading-6 text-slate-600">
          {relation === "origin" ? "عندما تكون الفاصلة والترتيب صفرًا نكون في المبدأ O، وهو نقطة تقاطع المحورين."
            : relation === "abscissa-axis" ? "الترتيب صفر، فالنقطة تقع على محور الفواصل نفسه، لا في أي ربع."
              : relation === "ordinate-axis" ? "الفاصلة صفر، فالنقطة تقع على محور الترتيب نفسه، لا في أي ربع."
                : "داخل الربع يكون الإحداثيان غير معدومين، وتحدّد إشارتاهما الربع وحده."}
        </p>
      </div>
    </div>
    <div className="flex flex-wrap gap-2">
      {[{ label: "M(−2,3)", p: { x: -2, y: 3 } }, { label: "F(3,1)", p: { x: 3, y: 1 } }, { label: "N(4,0)", p: { x: 4, y: 0 } }, { label: "E(0,−3)", p: { x: 0, y: -3 } }, { label: "O(0,0)", p: { x: 0, y: 0 } }].map(item => <button key={item.label} type="button" onClick={() => setPoint(item.p)} className="rounded-lg border border-violet-200 bg-white px-2.5 py-1 text-xs font-extrabold text-violet-800" dir="ltr">{item.label}</button>)}
    </div>
  </div>;
}

const TARGETS: { label: string; point: Point }[] = [
  { label: "A", point: { x: 3, y: 3 } },
  { label: "B", point: { x: -2, y: 1 } },
  { label: "C", point: { x: 0, y: -4 } },
  { label: "D", point: { x: 4, y: 0 } },
  { label: "E", point: { x: -3, y: -2 } },
  { label: "F", point: { x: 2, y: -3 } },
];

function PlotTab() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Point | null>(null);
  const target = TARGETS[index];
  const correct = picked !== null && picked.x === target.point.x && picked.y === target.point.y;
  function pick(event: MouseEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * SIZE;
    const py = ((event.clientY - rect.top) / rect.height) * SIZE;
    const point = planeFromPixel(px, py, DOMAIN, SIZE);
    if (inGrid(point, DOMAIN)) setPicked(point);
  }
  function next() { setIndex((index + 1) % TARGETS.length); setPicked(null); }
  return <div className="space-y-4" data-studio-plot="true">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3">
      <p className="text-xs font-extrabold text-amber-900">عيّن النقطة <bdi dir="ltr" className="text-sm font-black">{target.label}({target.point.x},{target.point.y})</bdi> بالضغط على الخانة الصحيحة في الشبكة.</p>
      <button type="button" onClick={next} className="btn btn-ghost text-xs">نقطة أخرى</button>
    </div>
    <div className="flex justify-center rounded-2xl border border-slate-200 bg-white p-2">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" style={{ maxWidth: SIZE, cursor: "crosshair" }} onClick={pick} role="application" aria-label="شبكة لتعيين النقطة" data-plot-grid="true">
        <g pointerEvents="none"><GridPlane points={picked ? [{ label: "؟", point: picked, color: correct ? "#059669" : "#dc2626" }] : []} size={SIZE} domain={DOMAIN} label="شبكة التعيين" /></g>
      </svg>
    </div>
    {picked && <div role="status" data-plot-feedback={correct ? "correct" : "wrong"} className={`rounded-xl border p-3 text-xs font-bold leading-7 ${correct ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900"}`}>
      {correct ? <>أحسنت! النقطة ({picked.x},{picked.y}) في موضعها الصحيح، وهي في {relationLabel(target.point)}.</> : <>اخترت ({picked.x},{picked.y}). المطلوب ({target.point.x},{target.point.y}): ابدأ من الصفر، ثم حرّك {target.point.x >= 0 ? "يمينًا" : "يسارًا"} <bdi dir="ltr">{Math.abs(target.point.x)}</bdi> و{target.point.y >= 0 ? "أعلى" : "أسفل"} <bdi dir="ltr">{Math.abs(target.point.y)}</bdi>.</>}
    </div>}
    {!picked && <p className="rounded-xl bg-slate-50 p-3 text-[11px] font-bold leading-6 text-slate-600">تلميح: إذا كانت الفاصلة صفرًا فالنقطة على محور الترتيب، وإذا كان الترتيب صفرًا فالنقطة على محور الفواصل.</p>}
  </div>;
}

function QuadrantsTab() {
  const [selected, setSelected] = useState<string>("first");
  const rule = QUADRANT_SIGN_RULES.find(item => item.relation === selected) ?? QUADRANT_SIGN_RULES[0];
  return <div className="space-y-4" data-studio-quadrants="true">
    <div className="grid gap-2 sm:grid-cols-4">
      {QUADRANT_SIGN_RULES.map(item => <button key={item.relation} type="button" aria-pressed={selected === item.relation} onClick={() => setSelected(item.relation)} className={`rounded-xl border p-3 text-center text-xs font-extrabold transition ${selected === item.relation ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"}`}>{item.label}<span className="mt-1 block text-[10px] font-bold opacity-80" dir="ltr">{item.example}</span></button>)}
    </div>
    <div role="status" className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4 text-xs font-bold leading-7 text-slate-700">
      <p className="text-sm font-black text-violet-900">{rule.label}</p>
      <p className="mt-1">الفاصلة {rule.abscissa}، والترتيب {rule.ordinate}. فكل نقطة في هذا الربع إشارتاها <bdi dir="ltr" className="font-black">{rule.example}</bdi>.</p>
      <p className="mt-1 text-slate-500">النقط على المحورين ليست في أي ربع: (0,0) هي المبدأ، و(x,0) على محور الفواصل، و(0,y) على محور الترتيب.</p>
    </div>
    <ul className="grid gap-2 sm:grid-cols-2">
      {[{ label: "M(−2,3)", p: { x: -2, y: 3 } }, { label: "F(3,1)", p: { x: 3, y: 1 } }, { label: "G(−1,−4)", p: { x: -1, y: -4 } }, { label: "H(5,−2)", p: { x: 5, y: -2 } }].map(item => <li key={item.label} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600"><bdi dir="ltr" className="font-black">{item.label}</bdi><span className="chip bg-violet-50 text-violet-800">{relationLabel(item.p)}</span></li>)}
    </ul>
  </div>;
}

export default function CoordinateStudio({ mode = "full" }: { mode?: "full" | CoordinateStudioTab }) {
  const [tab, setTab] = useState<CoordinateStudioTab>(mode === "full" ? "explore" : mode);
  const uid = useId();
  const iconFor = (value: CoordinateStudioTab) => value === "explore" ? <Move size={15} /> : value === "plot" ? <Crosshair size={15} /> : <Grid2x2 size={15} />;
  return <section data-coordinate-studio="true" className="overflow-hidden rounded-[26px] border border-sky-200 bg-white shadow-[0_14px_40px_-28px_rgba(24,59,104,.28)]">
    <header className="border-b border-sky-100 bg-gradient-to-l from-sky-50/80 via-white to-violet-50/50 px-6 py-5">
      <span className="text-[11px] font-extrabold text-sky-700">مختبر معلم المستوي</span>
      <h3 className="mt-1 text-lg font-black text-ink">حرّك النقطة، عيّنها على الشبكة، واكتشف الأرباع</h3>
      <p className="mt-1 text-xs leading-6 text-slate-500">الإحداثيان هما العنوان الدقيق للنقطة؛ الشبكة لا تخمّن، والإشارتان تحدّدان الربع.</p>
      {mode === "full" && <div role="tablist" aria-label="أدوات مختبر معلم المستوي" className="mt-4 flex flex-wrap gap-2">
        {TABS.map(item => {
          const active = item.id === tab;
          return <button key={item.id} id={`${uid}-tab-${item.id}`} type="button" role="tab" aria-selected={active} aria-controls={`${uid}-panel`} onClick={() => setTab(item.id)} className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-extrabold transition ${active ? "border-sky-600 bg-sky-600 text-white" : "border-sky-200 bg-white text-slate-600 hover:border-sky-400 hover:text-sky-900"}`}>{iconFor(item.id)}<span>{item.label}</span></button>;
        })}
      </div>}
    </header>
    <div id={`${uid}-panel`} role="tabpanel" className="p-6">
      {tab === "explore" && <ExploreTab />}
      {tab === "plot" && <PlotTab />}
      {tab === "quadrants" && <QuadrantsTab />}
    </div>
  </section>;
}
