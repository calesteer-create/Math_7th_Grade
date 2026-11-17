import katex from "katex";

export type MathSegment = { kind: "text" | "math"; value: string };

// صيغة واحدة معلنة للمؤلفين: \( ... \) داخل النص، وtex/formula للمعادلات المستقلة.
export function splitMathText(text: string): MathSegment[] {
  const segments: MathSegment[] = [];
  const expression = /\\\(([\s\S]*?)\\\)/g;
  let last = 0;
  for (const match of text.matchAll(expression)) {
    const index = match.index ?? 0;
    if (index > last) segments.push({ kind: "text", value: text.slice(last, index) });
    segments.push({ kind: "math", value: match[1] });
    last = index + match[0].length;
  }
  if (last < text.length) segments.push({ kind: "text", value: text.slice(last) });
  return segments.length ? segments : [{ kind: "text", value: text }];
}

export function assertValidTeX(tex: string) {
  if (!tex.trim()) throw new Error("العلاقة الرياضية فارغة.");
  // لا روابط ولا HTML ولا ملفات ضمن الصيغ الرياضية.
  if (/\\(?:href|url|includegraphics|html\w*|gdef|def|newcommand)\b/.test(tex)) {
    throw new Error("تتضمن الصيغة أمرًا غير مسموح في المحتوى الرياضي.");
  }
  katex.renderToString(tex, { throwOnError: true, strict: "error", trust: false, maxSize: 12, maxExpand: 200, output: "htmlAndMathml" });
}

export function assertMathText(text: string, label = "النص") {
  for (const part of splitMathText(text)) {
    if (part.kind === "math") { assertValidTeX(part.value); continue; }
    if (/\\[()[\]]/.test(part.value)) throw new Error(`${label}: محددات المعادلة غير مكتملة.`);
    // لا نعامل الوحدات القياسية المكتوبة بشرطة مائلة على أنها كسور حسابية.
    const prose = part.value.replace(/\b(?:m\/s|km\/h)\b/g, "");
    if (/[=×÷∈≠≤≥±+*^<>]/.test(prose)
      || /\b(?:\d+(?:\.\d+)?|[A-Za-z])\s*[-−/→←]\s*(?:\d+(?:\.\d+)?|[A-Za-z])\b/.test(prose)
      || /\d\s*\|\s*\d/.test(prose)) {
      throw new Error(`${label}: ضع العلاقات الرياضية داخل محددات KaTeX.`);
    }
  }
}

export function hasSourcePage(text: string) {
  return /(?:^|[\s(،:؛—-])(?:صفحة|الصفحة|الصفحتين|صفحتي|صفحات|ص)\s*\.?\s*\d/u.test(text);
}

// الرموز المفردة المعروفة تمر بالعارض نفسه؛ الكلمات والعلامات التجارية ليست متغيرات.
export const MATH_SYMBOL_TEX: Readonly<Record<string, string>> = {
  "π": "\\pi", "Π": "\\Pi", "Σ": "\\Sigma", "∑": "\\sum", "∞": "\\infty",
  "α": "\\alpha", "β": "\\beta", "γ": "\\gamma", "δ": "\\delta", "Δ": "\\Delta",
  "θ": "\\theta", "λ": "\\lambda", "μ": "\\mu", "σ": "\\sigma", "ω": "\\omega", "Ω": "\\Omega",
  "ℕ": "\\mathbb{N}", "ℤ": "\\mathbb{Z}", "ℚ": "\\mathbb{Q}", "ℝ": "\\mathbb{R}", "ℂ": "\\mathbb{C}",
};
export function standaloneSymbolTeX(token: string): string | null {
  return Object.hasOwn(MATH_SYMBOL_TEX, token) ? MATH_SYMBOL_TEX[token] : /^[A-Za-z]$/.test(token) ? token : null;
}

// الأعداد المفردة والوحدات ليست كسورًا: تعزل LTR دون تغيير النص أو القيمة.
export function splitLtrTokens(text: string) {
  return text.split(/([0-9]+(?:[.,][0-9]+)*(?:\s+(?:km|m\/s|kg|cm|mm|m|s)(?![A-Za-z]))?|[A-Za-z]+(?:\/[A-Za-z]+)?|[πΠΣ∑∞αβγδΔθλμσωΩℕℤℚℝℂ])/g);
}
