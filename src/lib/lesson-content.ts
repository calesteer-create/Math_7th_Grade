import type { NaturalFigureKind } from "@/lib/natural-numbers";
import { INTEGER_FIGURE_KINDS, type IntegerFigureKind } from "@/lib/integers";
import { INTEGER_MUL_DIV_FIGURE_KINDS, type IntegersMulDivFigureKind } from "@/lib/integers-mul-div";
import { RATIONAL_FIGURE_KINDS, type RationalFigureKind } from "@/lib/rational-numbers";
import { OPERATIONS_FIGURE_KINDS, type OperationsFigureKind } from "@/lib/operations-rational";
import { COORDINATE_FIGURE_KINDS, type CoordinateFigureKind } from "@/lib/coordinate-plane";
import { ALGEBRA_FIGURE_KINDS, ALGEBRA_STUDIO_MODES, type AlgebraFigureKind, type AlgebraStudioMode } from "@/lib/algebraic-expressions";
import { EQUATIONS_FIGURE_KINDS, EQUATIONS_STUDIO_MODES, type EquationsFigureKind, type EquationsStudioMode } from "@/lib/solving-equations";

export type FigureKind = NaturalFigureKind | IntegerFigureKind | IntegersMulDivFigureKind | RationalFigureKind | OperationsFigureKind | CoordinateFigureKind | AlgebraFigureKind | EquationsFigureKind;
export type ContentOrigin = "book" | "supplement";
export const EXTRA_EXPLANATION_LABEL = "شرح إضافي للكتاب";

// يبقى المصدر محفوظًا للمراجعة؛ عرضه مسموح في exercise فقط.
type Provenance = { origin: ContentOrigin; source?: string };
export type Block = Provenance & (
  | { kind: "lead"; title?: string; text: string }
  | { kind: "book"; title?: string; text: string }
  | { kind: "explain"; title?: string; text: string }
  | { kind: "def"; term: string; text: string }
  | { kind: "law"; title?: string; formula?: string; text?: string; note?: string }
  | { kind: "example"; title?: string; steps: string[]; result?: string }
  | { kind: "steps"; title?: string; steps: string[] }
  | { kind: "mistake"; title?: string; text: string }
  | { kind: "note"; title?: string; text: string }
  | { kind: "math"; tex: string; caption?: string }
  | { kind: "check"; question: string; answer: string; hint?: string; options?: string[]; correctOption?: number }
  | { kind: "summary"; title?: string; items: string[] }
  | { kind: "activity"; title?: string; text: string }
  | { kind: "exercise"; title: string; text: string; source: string; figure?: FigureKind; practiceId?: string }
  | { kind: "guide"; title: string; intro?: string; sections: { title: string; blocks: Block[] }[] }
  | { kind: "labtool"; tool: "fraction" | "numberline" | "equation" | "triangle" | "percent" }
  | { kind: "naturalStudio"; mode?: "full" | "dots" | "line" | "places" }
  | { kind: "integersStudio"; mode?: "full" | "explorer" | "addsub" | "game" | "simplify" }
  | { kind: "integersMulDivStudio"; mode?: "full" | "pattern" | "signcount" | "shorthand" | "division" }
  | { kind: "rationalStudio"; mode?: "full" | "builder" | "line" | "compare" | "order" | "decimal" }
  | { kind: "operationsStudio"; mode?: "full" | "sci" | "frac" | "decimal" | "power" }
  | { kind: "coordinateStudio"; mode?: "full" | "explore" | "plot" | "quadrants" }
  | { kind: "algebraStudio"; mode?: AlgebraStudioMode }
  | { kind: "equationsStudio"; mode?: EquationsStudioMode }
  | { kind: "bookFigure"; figure: FigureKind }
);
export type NotebookSection = { id: string; title: string; writingTask: string; blocks: Block[] };

// أنواع قابلة للفحص في وقت التشغيل: أي نوع كتلة أو رسم أو أداة غير مدرج هنا يُرفض
// أثناء التحقق من المحتوى بدل أن يُعرض فراغًا أو يُتجاهل بصمت.
export const CONTENT_BLOCK_KINDS = [
  "lead", "book", "explain", "def", "law", "example", "steps", "mistake", "note", "math",
  "check", "summary", "activity", "exercise", "guide", "labtool", "naturalStudio", "integersStudio", "integersMulDivStudio", "rationalStudio", "operationsStudio", "coordinateStudio", "algebraStudio", "equationsStudio", "bookFigure",
] as const;
export type ContentBlockKind = (typeof CONTENT_BLOCK_KINDS)[number];
export const FIGURE_KINDS = ["warmup", "counting", "numberLine", "placeValue", ...INTEGER_FIGURE_KINDS, ...INTEGER_MUL_DIV_FIGURE_KINDS, ...RATIONAL_FIGURE_KINDS, ...OPERATIONS_FIGURE_KINDS, ...COORDINATE_FIGURE_KINDS, ...ALGEBRA_FIGURE_KINDS, ...EQUATIONS_FIGURE_KINDS] as const;
export const LAB_TOOLS = ["fraction", "numberline", "equation", "triangle", "percent"] as const;
export const STUDIO_MODES = ["full", "dots", "line", "places"] as const;
export const INTEGER_STUDIO_MODES = ["full", "explorer", "addsub", "game", "simplify"] as const;
export const INTEGER_MUL_DIV_STUDIO_MODES = ["full", "pattern", "signcount", "shorthand", "division"] as const;
export const RATIONAL_STUDIO_MODES = ["full", "builder", "line", "compare", "order", "decimal"] as const;
export const OPERATIONS_STUDIO_MODES = ["full", "sci", "frac", "decimal", "power"] as const;
export const COORDINATE_STUDIO_MODES = ["full", "explore", "plot", "quadrants"] as const;
export { ALGEBRA_STUDIO_MODES, EQUATIONS_STUDIO_MODES };
