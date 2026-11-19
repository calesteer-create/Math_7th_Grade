import type { NaturalFigureKind } from "@/lib/natural-numbers";

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
  | { kind: "exercise"; title: string; text: string; source: string; figure?: NaturalFigureKind; practiceId?: string }
  | { kind: "guide"; title: string; intro?: string; sections: { title: string; blocks: Block[] }[] }
  | { kind: "labtool"; tool: "fraction" | "numberline" | "equation" | "triangle" | "percent" }
  | { kind: "naturalStudio"; mode?: "full" | "dots" | "line" | "places" }
  | { kind: "bookFigure"; figure: NaturalFigureKind }
);
export type NotebookSection = { id: string; title: string; writingTask: string; blocks: Block[] };

// أنواع قابلة للفحص في وقت التشغيل: أي نوع كتلة أو رسم أو أداة غير مدرج هنا يُرفض
// أثناء التحقق من المحتوى بدل أن يُعرض فراغًا أو يُتجاهل بصمت.
export const CONTENT_BLOCK_KINDS = [
  "lead", "book", "explain", "def", "law", "example", "steps", "mistake", "note", "math",
  "check", "summary", "activity", "exercise", "guide", "labtool", "naturalStudio", "bookFigure",
] as const;
export type ContentBlockKind = (typeof CONTENT_BLOCK_KINDS)[number];
export const FIGURE_KINDS = ["warmup", "counting", "numberLine", "placeValue"] as const;
export const LAB_TOOLS = ["fraction", "numberline", "equation", "triangle", "percent"] as const;
export const STUDIO_MODES = ["full", "dots", "line", "places"] as const;
