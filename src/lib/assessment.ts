// لا يحتوي هذا الملف أي مفتاح إجابة. يستعمله المصحّح وفحوص المحتوى فقط.
export const LESSON_ASSESSMENT_NOTICE = "أسئلة جديدة من خارج أمثلة الدرس وتمارين الكتاب، بأعداد ومواقف مختلفة، وتقيس المهارات نفسها التي تعلمتها.";

export type AssessmentQuestion = {
  origin: string;
  skill: string;
  type: string;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  difficulty: string;
};
export type OriginalAssessment = {
  revision: string;
  source: string;
  skills: Record<string, string>;
  questions: AssessmentQuestion[];
};

export function normalizeAnswer(input: string): string {
  let value = input.normalize("NFKC")
    .replace(/[\u0660-\u0669]/g, digit => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[\u06f0-\u06f9]/g, digit => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[\u064b-\u065f\u0670]/g, "")
    .replace(/٫/g, ".").replace(/٬/g, ",")
    .replace(/[\u200e\u200f\u2066-\u2069]/g, "")
    .trim().replace(/\s+/g, " ");
  // قبول فصل الآلاف الصحيح فقط، لا حذف فاصلة عشرية أو فاصل في مكان عشوائي.
  if (/^\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(value)) value = value.replace(/,/g, "");
  return value;
}

export function isCorrect(expected: string, given: string, type: string): boolean {
  const a = normalizeAnswer(expected);
  const b = normalizeAnswer(given);
  if (!b) return false;
  if (type === "mcq" || type === "truefalse") return a === b;
  if (/^-?\d+(?:\.\d+)?$/.test(a) && /^-?\d+(?:\.\d+)?$/.test(b)) {
    return Number(a) === Number(b);
  }
  return a.toLowerCase() === b.toLowerCase();
}

export function displayAnswer(question: { type: string; answer: string; options?: unknown }): string {
  if (question.type === "mcq" && Array.isArray(question.options)) {
    return String(question.options[Number(question.answer)] ?? question.answer);
  }
  if (question.type === "truefalse") return question.answer === "true" ? "صح" : "خطأ";
  return question.answer;
}

function stringsIn(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(stringsIn);
  if (value && typeof value === "object") return Object.values(value).flatMap(stringsIn);
  return [];
}

// حاجز آلي ضد تكرار الأمثلة، وليس بديلًا عن المراجعة التربوية للتشابه في السياق.
export function validateOriginalAssessment(
  lesson: { content: unknown; notebook: unknown; solutions: unknown },
  assessment: OriginalAssessment,
): void {
  if (!assessment || typeof assessment.revision !== "string" || !assessment.revision.trim()
    || typeof assessment.source !== "string" || !assessment.source.trim()
    || !Array.isArray(assessment.questions) || !assessment.questions.length
    || !assessment.skills || typeof assessment.skills !== "object" || Array.isArray(assessment.skills)) {
    throw new Error("يجب تعريف إصدار الاختبار ومصدره وأسئلته ومهاراته.");
  }
  const sourceTexts = stringsIn([lesson.content, lesson.notebook, lesson.solutions]);
  const sourceNumbers = new Set(sourceTexts.flatMap(s => s.match(/\b\d{4,}\b/g) ?? []));
  const sourceQuestions = new Set(sourceTexts.map(s => normalizeAnswer(s)));
  const seen = new Set<string>();
  for (const [index, question] of assessment.questions.entries()) {
    const tag = `السؤال ${index + 1}`;
    if (!question || typeof question.question !== "string" || !question.question.trim()
      || typeof question.answer !== "string" || !question.answer.trim()
      || typeof question.explanation !== "string" || !question.explanation.trim()) {
      throw new Error(`${tag}: نص السؤال والإجابة والتفسير مطلوبة.`);
    }
    if (question.origin !== "original" || !Object.hasOwn(assessment.skills, question.skill)
      || typeof assessment.skills[question.skill] !== "string" || !assessment.skills[question.skill].trim()) {
      throw new Error(`${tag}: يجب أن يكون جديدًا ومرتبطًا بمهارة من الدرس.`);
    }
    const normalized = normalizeAnswer(question.question);
    if (sourceQuestions.has(normalized) || seen.has(normalized)) throw new Error(`${tag}: تكرار سؤال من المصدر أو الاختبار.`);
    seen.add(normalized);
    const examples = [question.question, ...(question.options ?? [])].join(" ").match(/\b\d{4,}\b/g) ?? [];
    if (examples.some(n => sourceNumbers.has(n))) throw new Error(`${tag}: أعداد الحالة مكررة من الدرس؛ استخدم موقفًا جديدًا.`);
    if (/[\u0660-\u0669\u06f0-\u06f9]/.test(JSON.stringify(question))) throw new Error(`${tag}: يجب عرض الأرقام الإنجليزية فقط.`);
    if (!["easy", "medium", "hard"].includes(question.difficulty)) throw new Error(`${tag}: مستوى غير صالح.`);
    if (!["mcq", "truefalse", "fill", "problem"].includes(question.type)) throw new Error(`${tag}: نوع غير صالح.`);
    if (question.type === "mcq" && (!Array.isArray(question.options) || question.options.length < 2
      || question.options.some(option => typeof option !== "string" || !option.trim())
      || new Set(question.options.map(option => normalizeAnswer(option))).size !== question.options.length
      || !/^(0|[1-9]\d*)$/.test(question.answer) || !question.options[Number(question.answer)])) {
      throw new Error(`${tag}: خيارات الاختيار المتعدد أو مفتاحها غير صالحة.`);
    }
    if (question.type === "truefalse" && !["true", "false"].includes(question.answer)) throw new Error(`${tag}: مفتاح صح/خطأ غير صالح.`);
  }
}
