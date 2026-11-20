import NaturalBookFigure from "@/components/figures/NaturalNumberFigures";
import IntegerBookFigure from "@/components/figures/IntegerFigures";
import type { NaturalFigureKind } from "@/lib/natural-numbers";
import { INTEGER_FIGURE_KINDS, type IntegerFigureKind } from "@/lib/integers";

export type BookFigureKind = NaturalFigureKind | IntegerFigureKind;

export default function BookFigure({ figure }: { figure: BookFigureKind }) {
  if ((INTEGER_FIGURE_KINDS as readonly string[]).includes(figure)) {
    return <IntegerBookFigure figure={figure as IntegerFigureKind} />;
  }
  return <NaturalBookFigure figure={figure as NaturalFigureKind} />;
}
