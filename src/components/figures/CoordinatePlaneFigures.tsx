"use client";

import DiagramMath from "@/components/DiagramMath";
import FigureFrame from "@/components/figures/FigureFrame";
import {
  COORDINATE_FIGURE_SOURCES,
  COORDINATE_PLANE_ILLUSTRATION,
  COORDINATE_EXAMPLES,
  LAB_GRID_POINTS,
  READING_GRID_POINTS,
  type CoordinateFigureKind,
  type Point,
} from "@/lib/coordinate-plane";

const PAD = 34;

export function planeScale(domain: number, size: number) {
  return (size - PAD * 2) / (2 * domain);
}
export function planeProject(point: Point, domain: number, size: number) {
  const scale = planeScale(domain, size);
  return { x: size / 2 + point.x * scale, y: size / 2 - point.y * scale };
}
export function planeFromPixel(px: number, py: number, domain: number, size: number): Point {
  const scale = planeScale(domain, size);
  return { x: Math.round((px - size / 2) / scale), y: Math.round((size / 2 - py) / scale) };
}

export type PlanePoint = { label: string; point: Point; color?: string; muted?: boolean };

/** شبكة إحداثية مرسومة من الصفر: خطوط متقطعة، محاور متجهة، وأسماء النقط. */
export function GridPlane({ points = [], domain = 5, size = 380, guides, label = "معلم إحداثي متعامد" }: {
  points?: readonly PlanePoint[];
  domain?: number;
  size?: number;
  guides?: Point;
  label?: string;
}) {
  const scale = planeScale(domain, size);
  const ticks = Array.from({ length: domain * 2 + 1 }, (_, i) => i - domain);
  const origin = size / 2;
  const guide = guides ? planeProject(guides, domain, size) : null;
  return <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: size }} className="block" role="img" aria-label={label} direction="ltr" data-grid-plane="true" data-domain={domain}>
    <rect x={0} y={0} width={size} height={size} fill="#fff" />
    {ticks.map(tick => <g key={`grid-${tick}`}>
      {tick !== 0 && <line x1={planeProject({ x: tick, y: -domain }, domain, size).x} y1={PAD} x2={planeProject({ x: tick, y: -domain }, domain, size).x} y2={size - PAD} stroke="#dbe3f1" strokeWidth="1" strokeDasharray="3 4" />}
      {tick !== 0 && <line x1={PAD} y1={planeProject({ x: -domain, y: tick }, domain, size).y} x2={size - PAD} y2={planeProject({ x: -domain, y: tick }, domain, size).y} stroke="#dbe3f1" strokeWidth="1" strokeDasharray="3 4" />}
    </g>)}
    <line x1={PAD - 12} y1={origin} x2={size - PAD + 12} y2={origin} stroke="#334155" strokeWidth="2" markerEnd="url(#plane-arrow-x)" />
    <line x1={origin} y1={size - PAD + 12} x2={origin} y2={PAD - 12} stroke="#334155" strokeWidth="2" markerEnd="url(#plane-arrow-y)" />
    <defs>
      <marker id="plane-arrow-x" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0 L8 4.5 L0 9 Z" fill="#334155" /></marker>
      <marker id="plane-arrow-y" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0 L8 4.5 L0 9 Z" fill="#334155" /></marker>
    </defs>
    {ticks.filter(tick => tick !== 0).map(tick => <g key={`tick-${tick}`}>
      <line x1={planeProject({ x: tick, y: 0 }, domain, size).x} y1={origin - 4} x2={planeProject({ x: tick, y: 0 }, domain, size).x} y2={origin + 4} stroke="#64748b" strokeWidth="1.6" />
      <line x1={origin - 4} y1={planeProject({ x: 0, y: tick }, domain, size).y} x2={origin + 4} y2={planeProject({ x: 0, y: tick }, domain, size).y} stroke="#64748b" strokeWidth="1.6" />
      <DiagramMath tex={String(tick)} x={planeProject({ x: tick, y: 0 }, domain, size).x - 15} y={origin + 7} width={30} height={20} fontSize={11} color="#64748b" />
      <DiagramMath tex={String(tick)} x={origin - 30} y={planeProject({ x: 0, y: tick }, domain, size).y - 10} width={24} height={20} fontSize={11} color="#64748b" />
    </g>)}
    <DiagramMath tex="x" x={size - PAD + 8} y={origin - 22} width={22} height={20} fontSize={15} color="#334155" />
    <DiagramMath tex="y" x={origin + 8} y={PAD - 26} width={22} height={20} fontSize={15} color="#334155" />
    <DiagramMath tex="O" x={origin - 24} y={origin + 7} width={20} height={20} fontSize={13} color="#334155" />
    {guide && <>
      <line x1={guide.x} y1={guide.y} x2={guide.x} y2={origin} stroke="#f59e0b" strokeWidth="1.4" strokeDasharray="4 3" />
      <line x1={guide.x} y1={guide.y} x2={origin} y2={guide.y} stroke="#f59e0b" strokeWidth="1.4" strokeDasharray="4 3" />
    </>}
    {points.map(item => {
      const projected = planeProject(item.point, domain, size);
      const color = item.color ?? "#7c3aed";
      return <g key={item.label} data-plane-point={`${item.label}:${item.point.x},${item.point.y}`}>
        <circle cx={projected.x} cy={projected.y} r="5" fill={color} stroke="#fff" strokeWidth="1.6" />
        <text x={projected.x + 9} y={projected.y - 7} fontSize="13" fontWeight="800" fill={color} direction="ltr">{item.label}</text>
        {item.muted !== false && <text x={projected.x + 9} y={projected.y + 14} fontSize="10" fontWeight="700" fill="#64748b" direction="ltr">{`(${item.point.x},${item.point.y})`}</text>}
      </g>;
    })}
  </svg>;
}

function AxesDiagram() {
  const point = COORDINATE_PLANE_ILLUSTRATION.point;
  return <div data-figure-art="coordinateAxes" className="flex flex-col items-center gap-4">
    <GridPlane points={[{ label: "M", point }]} guides={point} label="محور الفواصل ومحور الترتيب والنقطة M" />
    <p className="rounded-xl bg-slate-50 px-4 py-2 text-center text-xs font-bold leading-7 text-slate-700">النقطة M لها فاصلة <bdi dir="ltr" className="font-black text-violet-700">{point.x}</bdi> على محور الفواصل، وترتيب <bdi dir="ltr" className="font-black text-violet-700">{point.y}</bdi> على محور الترتيب، ونكتبها <bdi dir="ltr" className="font-black">M({point.x},{point.y})</bdi>.</p>
  </div>;
}

function QuadrantsDiagram() {
  const size = 380;
  const half = (size - PAD * 2) / 2;
  const o = PAD;
  const cells = [
    { key: "second", title: "الربع الثاني", signs: "(-،+)", x: o, y: o, fill: "#eef2ff" },
    { key: "first", title: "الربع الأول", signs: "(+،+)", x: o + half, y: o, fill: "#ecfdf5" },
    { key: "third", title: "الربع الثالث", signs: "(-،-)", x: o, y: o + half, fill: "#fff7ed" },
    { key: "fourth", title: "الربع الرابع", signs: "(+،-)", x: o + half, y: o + half, fill: "#fdf2f8" },
  ];
  return <div data-figure-art="quadrantsMap" className="space-y-4">
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: size }} className="mx-auto block" role="img" aria-label="الربع الأول والثاني والثالث والرابع" direction="ltr">
      {cells.map(cell => <g key={cell.key}>
        <rect x={cell.x} y={cell.y} width={half} height={half} fill={cell.fill} stroke="#cbd5e1" strokeWidth="1" />
        <text x={cell.x + half / 2} y={cell.y + half / 2 - 4} textAnchor="middle" fontSize="14" fontWeight="800" fill="#334155">{cell.title}</text>
        <text x={cell.x + half / 2} y={cell.y + half / 2 + 18} textAnchor="middle" fontSize="12" fontWeight="700" fill="#64748b" direction="ltr">{cell.signs}</text>
      </g>)}
      <line x1={PAD - 14} y1={size / 2} x2={size - PAD + 14} y2={size / 2} stroke="#334155" strokeWidth="2" />
      <line x1={size / 2} y1={size - PAD + 14} x2={size / 2} y2={PAD - 14} stroke="#334155" strokeWidth="2" />
      <text x={size - PAD} y={size / 2 - 10} fontSize="14" fontWeight="800" fill="#334155" direction="ltr">x</text>
      <text x={size / 2 + 8} y={PAD - 4} fontSize="14" fontWeight="800" fill="#334155" direction="ltr">y</text>
      <text x={size / 2 - 16} y={size / 2 + 16} fontSize="12" fontWeight="800" fill="#334155" direction="ltr">O</text>
    </svg>
    <p className="rounded-xl bg-slate-50 px-4 py-2 text-center text-xs font-bold leading-7 text-slate-700">ترتيب الإشارات في الكتابة هو (الفاصلة، الترتيب): النقطة في الربع الثاني فاصلتها سالبة وترتيبها موجب.</p>
  </div>;
}

function PointsDiagram() {
  return <div data-figure-art="pointsExamples" className="space-y-4">
    <GridPlane
      points={COORDINATE_EXAMPLES.map(item => ({
        label: item.label,
        point: item.point,
        color: item.label === "M" ? "#b91c1c" : item.label === "F" ? "#0f766e" : item.label === "N" ? "#1d4ed8" : item.label === "E" ? "#7c3aed" : "#334155",
      }))}
      label="أمثلة الكتاب M وF وO وN وE"
    />
    <ul className="grid gap-2 sm:grid-cols-2">
      {COORDINATE_EXAMPLES.map(item => <li key={item.label} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold leading-6 text-slate-600"><bdi dir="ltr" className="font-black text-slate-800">{item.label}({item.point.x},{item.point.y})</bdi> — {item.note}</li>)}
    </ul>
  </div>;
}

function GridArt({ kind }: { kind: "trainingGrid" | "readingGrid" }) {
  const points = kind === "trainingGrid" ? LAB_GRID_POINTS : READING_GRID_POINTS;
  return <div data-figure-art={kind} className="space-y-3">
    <GridPlane points={points.map(item => ({ label: item.label, point: item.point, color: "color" in item ? String(item.color) : "#7c3aed", muted: kind !== "readingGrid" }))} label="شبكة إحداثية عليها نقاط مسماة" />
    <p className="rounded-xl bg-amber-50 px-4 py-2 text-center text-[11px] font-bold leading-6 text-amber-900">الشكل مُعاد رسمه على المنصة بالشبكة نفسها من −5 إلى 5، وإحداثياته معلنة داخل الشيفرة حتى لا ننسب إلى الكتاب قيمة مخمّنة.</p>
  </div>;
}

export function CoordinateFigureArt({ kind }: { kind: CoordinateFigureKind }) {
  switch (kind) {
    case "coordinateAxes": return <AxesDiagram />;
    case "quadrantsMap": return <QuadrantsDiagram />;
    case "pointsExamples": return <PointsDiagram />;
    case "trainingGrid": return <GridArt kind="trainingGrid" />;
    case "readingGrid": return <GridArt kind="readingGrid" />;
  }
}

export default function CoordinateBookFigure({ figure }: { figure: CoordinateFigureKind }) {
  const source = COORDINATE_FIGURE_SOURCES[figure];
  return <FigureFrame kind={figure} title={source.title} detail={source.detail}><CoordinateFigureArt kind={figure} /></FigureFrame>;
}
