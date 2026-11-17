"use client";

import { useMemo } from "react";
import katex from "katex";

/** غلاف واحد دائم الاتجاه LTR، لا يُورّث RTL من النص العربي المحيط. */
export default function TeX({ tex, block = false, className = "" }: { tex: string; block?: boolean; className?: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, {
        displayMode: block, throwOnError: true, strict: "error", trust: false,
        output: "htmlAndMathml", maxSize: 12, maxExpand: 200,
      });
    } catch { return null; }
  }, [tex, block]);
  // لا نحقن النص الخام كـ HTML عند فشل KaTeX. يمنع فحص النشر وصول هذه الحالة عادةً.
  if (html === null) return <span className="math-error text-sm text-rose-700" role="note">تحتاج هذه الصيغة إلى مراجعة.</span>;
  const props = { dir: "ltr" as const, "data-math": block ? "display" : "inline", className: `${block ? "math-display" : "math-inline"} ${className}`, style: { direction: "ltr" as const, unicodeBidi: "isolate" as const }, dangerouslySetInnerHTML: { __html: html } };
  return block ? <div {...props} /> : <span {...props} />;
}
