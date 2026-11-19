import naturalNumbersAssessment from "@/content/assessments/natural-numbers.json";

// فهرس بنوك الاختبارات مفهرسة بمسار الـRef المعلن في السجل. الوحدة صغيرة
// (بيانات فقط) ليستطيع مكوّن العميل إيجاد بنك الدرس دون سحب محتوى الدروس معه.
export const ASSESSMENT_INDEX: Record<string, unknown> = {
  "assessments/natural-numbers.json": naturalNumbersAssessment,
};
