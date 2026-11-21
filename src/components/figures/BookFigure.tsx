import NaturalBookFigure from "@/components/figures/NaturalNumberFigures";
import IntegerBookFigure from "@/components/figures/IntegerFigures";
import IntegersMulDivBookFigure from "@/components/figures/IntegersMulDivFigures";
import RationalBookFigure from "@/components/figures/RationalNumberFigures";
import type { NaturalFigureKind } from "@/lib/natural-numbers";
import { INTEGER_FIGURE_KINDS, type IntegerFigureKind } from "@/lib/integers";
import { INTEGER_MUL_DIV_FIGURE_KINDS, type IntegersMulDivFigureKind } from "@/lib/integers-mul-div";
import { RATIONAL_FIGURE_KINDS, type RationalFigureKind } from "@/lib/rational-numbers";

export type BookFigureKind = NaturalFigureKind | IntegerFigureKind | IntegersMulDivFigureKind | RationalFigureKind;

export default function BookFigure({ figure }: { figure: BookFigureKind }) {
  if ((RATIONAL_FIGURE_KINDS as readonly string[]).includes(figure)) {
    return <RationalBookFigure figure={figure as RationalFigureKind} />;
  }
  if ((INTEGER_MUL_DIV_FIGURE_KINDS as readonly string[]).includes(figure)) {
    return <IntegersMulDivBookFigure figure={figure as IntegersMulDivFigureKind} />;
  }
  if ((INTEGER_FIGURE_KINDS as readonly string[]).includes(figure)) {
    return <IntegerBookFigure figure={figure as IntegerFigureKind} />;
  }
  return <NaturalBookFigure figure={figure as NaturalFigureKind} />;
}
