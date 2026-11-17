import TeX from "@/components/TeX";
import { splitLtrTokens, splitMathText, standaloneSymbolTeX } from "@/lib/math-text";

/** نفس معالجة العبارات والرموز في الشرح والأسئلة والتغذية الراجعة والدفتر والحلول. */
export default function MathText({ text }: { text: string }) {
  return <>{splitMathText(text).map((segment, i) => segment.kind === "math"
    ? <TeX key={i} tex={segment.value} />
    : <span key={i}>{splitLtrTokens(segment.value).map((part, j) => {
      if (j % 2 === 0) return <span key={j}>{part}</span>;
      const symbol = standaloneSymbolTeX(part);
      return symbol ? <TeX key={j} tex={symbol} /> : <bdi key={j} dir="ltr" className="numeric-token">{part}</bdi>;
    })}</span>)}</>;
}
