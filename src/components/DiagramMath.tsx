import TeX from "@/components/TeX";

/** تسميات رياضية داخل SVG، بنفس KaTeX المستخدم في الشرح، دون تغيير إحداثيات الرسم. */
export default function DiagramMath({ tex, x, y, width = 40, height = 30, fontSize = 18, color = "#536078" }: {
  tex: string; x: number; y: number; width?: number; height?: number; fontSize?: number; color?: string;
}) {
  return <foreignObject x={x} y={y} width={width} height={height} pointerEvents="none" data-diagram-math="true">
    <div dir="ltr" className="diagram-math-label" style={{ fontSize, color }}>
      <TeX tex={tex} className="diagram-math" />
    </div>
  </foreignObject>;
}
