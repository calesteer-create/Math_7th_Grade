// أنواع البيانات العامة فقط؛ لا مفاتيح إجابة أو حلول مضمنة في مكونات العميل.
export type PracticeKind = "sets" | "digit-choice" | "twins" | "number-line" | "digit-value" | "planet";
export type PracticeField = { key: string; label: string; type: "choice" | "integer"; choices?: string[]; max?: number };
export type PracticeView = {
  title: string;
  instruction: string;
  kind: PracticeKind;
  fields: PracticeField[];
  number?: string;
  focusDigit?: string;
};
export type LearningSolution = {
  steps: { title: string; text: string; formula?: string }[];
  final: string;
  point?: number;
};
export type PracticeFeedback = {
  correct: boolean;
  fields: { key: string; label: string; correct: boolean; message: string }[];
};
export type PracticeEntry = {
  key: string;
  version: string;
  view: PracticeView;
  hintCount: number;
  state: {
    response: Record<string, string>;
    attempts: number;
    solved: boolean;
    hints: string[];
    solutionViewed: boolean;
    feedback: PracticeFeedback | null;
  };
  solution?: LearningSolution;
};

export function latinDigits(value: string) {
  return value.replace(/[\u0660-\u0669]/g, d => String(d.charCodeAt(0) - 0x660))
    .replace(/[\u06f0-\u06f9]/g, d => String(d.charCodeAt(0) - 0x6f0));
}
