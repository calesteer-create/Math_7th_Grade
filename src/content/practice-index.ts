import naturalNumbersPractice from "@/content/practice/natural-numbers.json";
import integersAddSubPractice from "@/content/practice/integers-add-sub.json";
import integersMulDivPractice from "@/content/practice/integers-mul-div.json";

// فهرس بنوك التمارين مفهرسة بمسار الـRef المعلن في السجل.
export const PRACTICE_INDEX: Record<string, unknown> = {
  "practice/natural-numbers.json": naturalNumbersPractice,
  "practice/integers-add-sub.json": integersAddSubPractice,
  "practice/integers-mul-div.json": integersMulDivPractice,
};
