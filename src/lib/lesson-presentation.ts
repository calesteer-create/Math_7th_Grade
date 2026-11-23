import type { Block, NotebookSection } from "@/lib/lesson-content";
import type { OriginalAssessment } from "@/lib/assessment";
import { assertMathText, assertValidTeX, hasSourcePage } from "@/lib/math-text";

const VISIBLE_KEYS = ["title", "text", "term", "note", "caption", "question", "answer", "hint", "result", "intro"] as const;

export function validateBlockPresentation(block: Block, depth = 0): void {
  if (depth > 4) throw new Error("الشرح متداخل أكثر من اللازم؛ قسّمه إلى أفكار أوضح.");
  if (!block || !["book", "supplement"].includes(block.origin)) throw new Error("يجب تحديد أصل كل كتلة: محتوى الكتاب أم شرح إضافي للكتاب.");
  const record = block as unknown as Record<string, unknown>;
  for (const key of VISIBLE_KEYS) {
    const value = record[key];
    if (typeof value !== "string") continue;
    assertMathText(value, key);
    if (block.kind !== "exercise" && hasSourcePage(value)) throw new Error("صفحة المصدر تُعرض في التمارين فقط؛ احفظ إحالة الشرح في source الداخلي.");
  }
  for (const key of ["steps", "items", "options"]) {
    const values = record[key];
    if (!Array.isArray(values)) continue;
    for (const value of values) if (typeof value === "string") {
      assertMathText(value, key);
      if (block.kind !== "exercise" && hasSourcePage(value)) throw new Error("صفحة المصدر تُعرض في التمارين فقط.");
    }
  }
  if (block.kind === "math") assertValidTeX(block.tex);
  if (block.kind === "law" && block.formula) assertValidTeX(block.formula);
  if (block.kind === "exercise" && !block.source?.trim()) throw new Error("تمرين الكتاب يحتاج إلى إحالة مصدره.");
  if (block.kind === "check" && block.options) {
    if (block.options.length < 2 || !Number.isInteger(block.correctOption) || !block.options[block.correctOption!]) throw new Error("سؤال التحقق التفاعلي يحتاج إلى خيارات ومفتاح صحيح.");
  }
  if (block.kind === "guide") {
    if (!block.sections?.length) throw new Error("مسار الشرح فارغ.");
    for (const section of block.sections) {
      assertMathText(section.title);
      if (hasSourcePage(section.title)) throw new Error("صفحة المصدر تُعرض في التمارين فقط.");
      if (!section.blocks.length) throw new Error("فكرة الشرح بلا محتوى.");
      section.blocks.forEach(child => validateBlockPresentation(child, depth + 1));
    }
  }
}

export function validateLessonPresentation(lesson: {
  title?: string;
  goals?: string;
  content: Record<string, Block[]>;
  notebook: NotebookSection[];
  solutions: { question: string; answer: string; steps: string[]; law?: string; notes?: string; commonMistakes?: string[] }[];
}) {
  for (const text of [lesson.title, lesson.goals]) if (text) {
    assertMathText(text);
    if (hasSourcePage(text)) throw new Error("لا تظهر صفحة المصدر في عنوان الدرس أو أهدافه.");
  }
  for (const blocks of Object.values(lesson.content)) blocks.forEach(block => validateBlockPresentation(block));
  for (const section of lesson.notebook) {
    assertMathText(section.title);
    assertMathText(section.writingTask);
    if (section.blocks.some(b => ["summary", "exercise", "guide", "check", "labtool", "naturalStudio", "integersStudio", "integersMulDivStudio", "rationalStudio", "operationsStudio", "coordinateStudio", "algebraStudio", "equationsStudio"].includes(b.kind))) throw new Error("دفتر الطالب أوراق كتابة وقواعد وأمثلة، لا ملخصًا أو اختبارًا آخر.");
    if (hasSourcePage(section.writingTask)) throw new Error("لا تظهر صفحة المصدر في دفتر الطالب.");
    if (hasSourcePage(section.title)) throw new Error("لا تظهر صفحة المصدر في دفتر الطالب.");
    section.blocks.forEach(block => validateBlockPresentation(block));
  }
  for (const solution of lesson.solutions) {
    [solution.question, solution.answer, ...solution.steps, solution.law, solution.notes, ...(solution.commonMistakes ?? [])].forEach(text => { if (text) assertMathText(text); });
  }
}

export function validateAssessmentPresentation(assessment: OriginalAssessment) {
  for (const question of assessment.questions) {
    [question.question, question.explanation, ...(question.options ?? [])].forEach(text => assertMathText(text));
  }
}
