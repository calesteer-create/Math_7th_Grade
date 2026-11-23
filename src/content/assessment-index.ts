import naturalNumbersAssessment from "@/content/assessments/natural-numbers.json";
import integersAddSubAssessment from "@/content/assessments/integers-add-sub.json";
import integersMulDivAssessment from "@/content/assessments/integers-mul-div.json";
import rationalNumbersAssessment from "@/content/assessments/rational-numbers.json";
import operationsRationalAssessment from "@/content/assessments/operations-rational.json";
import coordinatePlaneAssessment from "@/content/assessments/coordinate-plane.json";
import algebraicExpressionsAssessment from "@/content/assessments/algebraic-expressions.json";
import solvingEquationsAssessment from "@/content/assessments/solving-equations.json";

// فهرس بنوك الاختبارات مفهرسة بمسار الـRef المعلن في السجل. الوحدة صغيرة
// (بيانات فقط) ليستطيع مكوّن العميل إيجاد بنك الدرس دون سحب محتوى الدروس معه.
export const ASSESSMENT_INDEX: Record<string, unknown> = {
  "assessments/natural-numbers.json": naturalNumbersAssessment,
  "assessments/integers-add-sub.json": integersAddSubAssessment,
  "assessments/integers-mul-div.json": integersMulDivAssessment,
  "assessments/rational-numbers.json": rationalNumbersAssessment,
  "assessments/operations-rational.json": operationsRationalAssessment,
  "assessments/coordinate-plane.json": coordinatePlaneAssessment,
  "assessments/algebraic-expressions.json": algebraicExpressionsAssessment,
  "assessments/solving-equations.json": solvingEquationsAssessment,
};
