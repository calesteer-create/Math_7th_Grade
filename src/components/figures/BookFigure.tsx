import NaturalBookFigure from "@/components/figures/NaturalNumberFigures";
import IntegerBookFigure from "@/components/figures/IntegerFigures";
import IntegersMulDivBookFigure from "@/components/figures/IntegersMulDivFigures";
import RationalBookFigure from "@/components/figures/RationalNumberFigures";
import OperationsBookFigure from "@/components/figures/OperationsFigures";
import CoordinateBookFigure from "@/components/figures/CoordinatePlaneFigures";
import AlgebraBookFigure from "@/components/figures/AlgebraFigures";
import EquationsBookFigure from "@/components/figures/EquationsFigures";
import type { NaturalFigureKind } from "@/lib/natural-numbers";
import { INTEGER_FIGURE_KINDS, type IntegerFigureKind } from "@/lib/integers";
import { INTEGER_MUL_DIV_FIGURE_KINDS, type IntegersMulDivFigureKind } from "@/lib/integers-mul-div";
import { RATIONAL_FIGURE_KINDS, type RationalFigureKind } from "@/lib/rational-numbers";
import { OPERATIONS_FIGURE_KINDS, type OperationsFigureKind } from "@/lib/operations-rational";
import { COORDINATE_FIGURE_KINDS, type CoordinateFigureKind } from "@/lib/coordinate-plane";
import { ALGEBRA_FIGURE_KINDS, type AlgebraFigureKind } from "@/lib/algebraic-expressions";
import { EQUATIONS_FIGURE_KINDS, type EquationsFigureKind } from "@/lib/solving-equations";

export type BookFigureKind = NaturalFigureKind | IntegerFigureKind | IntegersMulDivFigureKind | RationalFigureKind | OperationsFigureKind | CoordinateFigureKind | AlgebraFigureKind | EquationsFigureKind;

export default function BookFigure({ figure }: { figure: BookFigureKind }) {
  if ((ALGEBRA_FIGURE_KINDS as readonly string[]).includes(figure)) {
    return <AlgebraBookFigure figure={figure as AlgebraFigureKind} />;
  }
  if ((EQUATIONS_FIGURE_KINDS as readonly string[]).includes(figure)) {
    return <EquationsBookFigure figure={figure as EquationsFigureKind} />;
  }
  if ((OPERATIONS_FIGURE_KINDS as readonly string[]).includes(figure)) {
    return <OperationsBookFigure figure={figure as OperationsFigureKind} />;
  }
  if ((COORDINATE_FIGURE_KINDS as readonly string[]).includes(figure)) {
    return <CoordinateBookFigure figure={figure as CoordinateFigureKind} />;
  }
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
