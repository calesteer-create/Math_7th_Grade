// أنواع البيانات العامة فقط؛ لا مفاتيح إجابة أو حلول مضمنة في مكونات العميل.
import { normalizeDigits } from "@/lib/numbers";
export type PracticeKind =
  | "sets" | "digit-choice" | "twins" | "number-line" | "digit-value" | "planet"
  | "int-warmup" | "int-game" | "int-context" | "int-calc-ab" | "int-calc-c" | "int-match" | "int-lines" | "int-reasoning";
export type PracticeField = { key: string; label: string; type: "choice" | "integer" | "signed-integer"; choices?: string[]; max?: number };
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
  return normalizeDigits(value);
}
