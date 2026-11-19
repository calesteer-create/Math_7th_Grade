// خريطة المهارات: قياس تعليمي من أدلة حقيقية، لا لوحة أرقام.
// المصدر الوحيد للدليل هو آخر محاولة **مفصّلة** لكل درس؛ لا يُجمع عبر المحاولات
// ولا تُستخدم «أفضل محاولة»، فلا تتضخم النتيجة بالتكرار ولا بالانتقاء.
import type { AttemptItem, QuizAttempt } from "@/lib/local-progress";

export const MIN_EVIDENCE = 2;
export const MASTERY_NUMERATOR = 8;
export const MASTERY_DENOMINATOR = 10;

export type SkillDefinition = { key: string; label: string; lessonId: number; questions: number };
export type SkillStatusKey = "no-evidence" | "insufficient" | "mastered" | "developing" | "needs-review";

export type SkillCard = {
  key: string;
  label: string;
  lessonId: number;
  status: SkillStatusKey;
  statusLabel: string;
  correct: number;
  total: number;
  attempts: number;
  trend: "up" | "down" | "same" | null;
  note: string;
  guidance: { text: string; href: string };
};

/** تصنيف المهارة بمقارنات صحيحة (بلا كسور عشرية): 80٪ و50٪ بالضبط. */
export function classifySkill(correct: number, total: number): SkillStatusKey {
  if (!Number.isInteger(correct) || !Number.isInteger(total) || total <= 0 || correct < 0 || correct > total) return "no-evidence";
  // سؤال واحد لا يكفي للحكم؛ وقلة الأدلة ليست ضعفًا.
  if (total < MIN_EVIDENCE) return "insufficient";
  if (correct * MASTERY_DENOMINATOR >= total * MASTERY_NUMERATOR) return "mastered";
  if (correct * 2 >= total) return "developing";
  return "needs-review";
}

const statusText: Record<SkillStatusKey, string> = {
  "no-evidence": "لا دليل بعد",
  insufficient: "دليل غير كافٍ",
  mastered: "متقنة",
  developing: "قيد التثبيت",
  "needs-review": "تحتاج مراجعة",
};

export function statusLabelOf(status: SkillStatusKey): string {
  return statusText[status];
}

function orderedItemized(attempts: readonly QuizAttempt[], lessonId: number): QuizAttempt[] {
  return attempts
    .map((attempt, index) => ({ attempt, index, time: Date.parse(attempt.date) }))
    // التفصيل يُعتمد فقط إذا كان مطابقًا لعدد أسئلة المحاولة، وإلا فهو غير مكتمل.
    .filter(item => item.attempt.lessonId === lessonId
      && Array.isArray(item.attempt.items)
      && item.attempt.items.length > 0
      && item.attempt.items.length === item.attempt.total)
    .sort((left, right) => ((Number.isFinite(right.time) ? right.time : 0) - (Number.isFinite(left.time) ? left.time : 0)) || (left.index - right.index))
    .map(item => item.attempt);
}

function itemsOf(attempt: QuizAttempt | undefined, skill: string): AttemptItem[] {
  return attempt?.items?.filter(item => item.skill === skill) ?? [];
}

function compareRatio(correct: number, total: number, previousCorrect: number, previousTotal: number): "up" | "down" | "same" {
  const left = correct * previousTotal;
  const right = previousCorrect * total;
  return left > right ? "up" : left < right ? "down" : "same";
}

function noteFor(status: SkillStatusKey, correct: number, total: number): string {
  if (status === "no-evidence") return "لم تُختبر هذه المهارة في أي محاولة مفصّلة بعد. غياب الدليل ليس ضعفًا؛ ابدأ بالاختبار لتحصل على أول صورة عن مستواك.";
  if (status === "insufficient") return `أجبت صحيحًا عن ${correct} من ${total}. العدد قليل للحكم، ونحتاج ${MIN_EVIDENCE} أسئلة على الأقل للمهارة الواحدة؛ قلة الأدلة لا تعني ضعفًا ولا إخفاقًا.`;
  if (status === "mastered") return `أجبت صحيحًا عن ${correct} من ${total} — إتقان واضح، وهذا ما نبحث عنه.`;
  if (status === "developing") return `أجبت صحيحًا عن ${correct} من ${total} — الأساس موجود ويحتاج تثبيتًا بمراجعة قصيرة ثم محاولة جديدة.`;
  return `أجبت صحيحًا عن ${correct} من ${total} — هذه المهارة تحتاج مراجعة للمفهوم قبل إعادة الاختبار.`;
}

function guidanceFor(status: SkillStatusKey, lessonId: number) {
  const check = `/lessons/${lessonId}?stage=check`;
  const quiz = `/lessons/${lessonId}?stage=quiz`;
  if (status === "no-evidence") return { text: "اختبر نفسك لتحصل على أول دليل", href: quiz };
  if (status === "insufficient") return { text: "أعد الاختبار بتأنٍّ لتزداد الأدلة", href: quiz };
  if (status === "mastered") return { text: "ثبّت الإتقان بمراجعة المفهوم", href: check };
  return { text: "راجع المفهوم ثم أعد الاختبار", href: check };
}

export function trendLabel(trend: SkillCard["trend"]): string | null {
  if (trend === "up") return "↑ تحسّنت منذ المحاولة المفصّلة السابقة";
  if (trend === "down") return "↓ تراجعت منذ المحاولة المفصّلة السابقة";
  if (trend === "same") return "→ لا تغيير منذ المحاولة المفصّلة السابقة";
  return null;
}

/**
 * يبني بطاقة لكل مهارة معلنة في كتالوج الدروس.
 * المهارة نفسها في أكثر من درس تُجمع من آخر محاولة مفصّلة في كل درس (بسط ومقام)،
 * والمهارات غير الموجودة في الكتالوج تُهمَل ولا تُنشئ صفوفًا وهمية.
 */
export function skillCards(definitions: readonly SkillDefinition[], attempts: readonly QuizAttempt[]): SkillCard[] {
  const groups = new Map<string, SkillDefinition[]>();
  for (const definition of definitions) {
    const group = groups.get(definition.key) ?? [];
    group.push(definition);
    groups.set(definition.key, group);
  }
  return [...groups.values()].map(group => {
    const primary = group[0];
    let correct = 0;
    let total = 0;
    let previousCorrect = 0;
    let previousTotal = 0;
    let attemptCount = 0;
    for (const definition of group) {
      const ordered = orderedItemized(attempts, definition.lessonId);
      const latest = itemsOf(ordered[0], definition.key);
      const previous = itemsOf(ordered[1], definition.key);
      correct += latest.filter(item => item.correct).length;
      total += latest.length;
      previousCorrect += previous.filter(item => item.correct).length;
      previousTotal += previous.length;
      attemptCount += ordered.length;
    }
    const status = classifySkill(correct, total);
    const trend = total > 0 && previousTotal > 0 ? compareRatio(correct, total, previousCorrect, previousTotal) : null;
    return {
      key: primary.key,
      label: primary.label,
      lessonId: primary.lessonId,
      status,
      statusLabel: statusText[status],
      correct,
      total,
      attempts: attemptCount,
      trend,
      note: noteFor(status, correct, total),
      guidance: guidanceFor(status, primary.lessonId),
    };
  });
}

/** ملخص للعرض: «كم مهارة أتقنت، وكم تحتاج خطوة تالية». */
export function skillsSummary(cards: readonly SkillCard[]) {
  return {
    mastered: cards.filter(card => card.status === "mastered").length,
    needsWork: cards.filter(card => card.status === "needs-review").length,
    developing: cards.filter(card => card.status === "developing").length,
    withoutEvidence: cards.filter(card => card.status === "no-evidence" || card.status === "insufficient").length,
    total: cards.length,
  };
}
