import { Sparkles } from "lucide-react";
import { EXTRA_EXPLANATION_LABEL } from "@/lib/lesson-content";

export default function ExtraExplanationLabel() {
  return <span data-extra-explanation="true" className="extra-explanation-label"><Sparkles size={12} aria-hidden="true" />{EXTRA_EXPLANATION_LABEL}</span>;
}
