import naturalNumbersPractice from "@/content/practice/natural-numbers.json";
import integersAddSubPractice from "@/content/practice/integers-add-sub.json";
import integersMulDivPractice from "@/content/practice/integers-mul-div.json";
import rationalNumbersPractice from "@/content/practice/rational-numbers.json";
import operationsRationalPractice from "@/content/practice/operations-rational.json";
import coordinatePlanePractice from "@/content/practice/coordinate-plane.json";

// فهرس بنوك التمارين مفهرسة بمسار الـRef المعلن في السجل.
export const PRACTICE_INDEX: Record<string, unknown> = {
  "practice/natural-numbers.json": naturalNumbersPractice,
  "practice/integers-add-sub.json": integersAddSubPractice,
  "practice/integers-mul-div.json": integersMulDivPractice,
  "practice/rational-numbers.json": rationalNumbersPractice,
  "practice/operations-rational.json": operationsRationalPractice,
  "practice/coordinate-plane.json": coordinatePlanePractice,
};
