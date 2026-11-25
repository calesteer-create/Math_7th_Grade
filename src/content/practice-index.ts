import naturalNumbersPractice from "@/content/practice/natural-numbers.json";
import integersAddSubPractice from "@/content/practice/integers-add-sub.json";
import integersMulDivPractice from "@/content/practice/integers-mul-div.json";
import rationalNumbersPractice from "@/content/practice/rational-numbers.json";
import operationsRationalPractice from "@/content/practice/operations-rational.json";
import coordinatePlanePractice from "@/content/practice/coordinate-plane.json";
import algebraicExpressionsPractice from "@/content/practice/algebraic-expressions.json";
import solvingEquationsPractice from "@/content/practice/solving-equations.json";
import parallelogramSymmetryPractice from "@/content/practice/parallelogram-symmetry.json";
import parallelogramAreaPractice from "@/content/practice/parallelogram-area.json";
import parallelLinesTransversalPractice from "@/content/practice/parallel-lines-transversal.json";

// فهرس بنوك التمارين مفهرسة بمسار الـRef المعلن في السجل.
export const PRACTICE_INDEX: Record<string, unknown> = {
  "practice/natural-numbers.json": naturalNumbersPractice,
  "practice/integers-add-sub.json": integersAddSubPractice,
  "practice/integers-mul-div.json": integersMulDivPractice,
  "practice/rational-numbers.json": rationalNumbersPractice,
  "practice/operations-rational.json": operationsRationalPractice,
  "practice/coordinate-plane.json": coordinatePlanePractice,
  "practice/algebraic-expressions.json": algebraicExpressionsPractice,
  "practice/solving-equations.json": solvingEquationsPractice,
  "practice/parallelogram-symmetry.json": parallelogramSymmetryPractice,
  "practice/parallelogram-area.json": parallelogramAreaPractice,
  "practice/parallel-lines-transversal.json": parallelLinesTransversalPractice,
};
