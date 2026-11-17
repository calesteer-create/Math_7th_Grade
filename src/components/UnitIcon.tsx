import {
  BarChart3,
  Box,
  Divide,
  Scale,
  Shapes,
  Superscript,
  Triangle,
  Variable,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  divide: Divide,
  superscript: Superscript,
  variable: Variable,
  triangle: Triangle,
  scale: Scale,
  shapes: Shapes,
  box: Box,
  chart: BarChart3,
};

export const UNIT_COLORS: Record<
  string,
  { grad: string; soft: string; text: string; border: string }
> = {
  brand: { grad: "from-indigo-700 to-indigo-500", soft: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100" },
  violet: { grad: "from-violet-700 to-violet-500", soft: "bg-violet-50", text: "text-violet-700", border: "border-violet-100" },
  sky: { grad: "from-sky-700 to-sky-500", soft: "bg-sky-50", text: "text-sky-700", border: "border-sky-100" },
  emerald: { grad: "from-emerald-700 to-emerald-500", soft: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100" },
  amber: { grad: "from-amber-600 to-amber-400", soft: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" },
  rose: { grad: "from-rose-700 to-rose-500", soft: "bg-rose-50", text: "text-rose-700", border: "border-rose-100" },
  cyan: { grad: "from-cyan-700 to-cyan-500", soft: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-100" },
  fuchsia: { grad: "from-fuchsia-700 to-fuchsia-500", soft: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-100" },
};

export default function UnitIcon({
  icon,
  color,
  size = "h-12 w-12",
}: {
  icon: string;
  color: string;
  size?: string;
}) {
  const Icon = ICONS[icon] ?? Shapes;
  const c = UNIT_COLORS[color] ?? UNIT_COLORS.brand;
  return (
    <span
      className={`grid ${size} shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${c.grad}`}
    >
      <Icon className="h-6 w-6" />
    </span>
  );
}
