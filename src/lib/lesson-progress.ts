// حسابات التقدّم والإتقان: دوال نقية تعمل على بيانات مقروءة ومُتحقَّق منها فقط.
// النقاط تُشتق من أفضل حالة محفوظة، لا من عدّاد محاولات، فلا تتضاعف بالإعادة.
import type { QuizAttempt } from "@/lib/local-progress";

export const MISSION_POINTS = 5;
export const MAX_TRAINING_POINTS = 30;
export const MAX_QUIZ_POINTS = 20;
export const MAX_LESSON_POINTS = MAX_TRAINING_POINTS + MAX_QUIZ_POINTS;
/** نقاط الاختبار تُقرَّب للأرض لا لأقرب عدد: 1/8 من 20 = 2 لا 3، و99/100 = 19 لا 20. */
export const QUIZ_POINTS_ROUNDING = "floor" as const;

/** الاجتياز مقارنة صحيحة بلا كسور عشرية: score * 10 >= total * 7 (أي 70% بالضبط). */
export function isQuizPass(score: number, total: number): boolean {
  return Number.isInteger(score) && Number.isInteger(total)
    && total > 0 && score >= 0 && score <= total
    && score * 10 >= total * 7;
}

/** أفضل محاولة منسوبة للدرس؛ التعادل يُبقي الأقدم فلا تُمنح نقاط لإعادة مساوية. */
export function bestAttemptFor(attempts: readonly QuizAttempt[], lessonId: number): QuizAttempt | null {
  let best: QuizAttempt | null = null;
  for (const attempt of attempts) {
    if (attempt.lessonId !== lessonId) continue;
    if (!best || attempt.score * best.total > best.score * attempt.total) best = attempt;
  }
  return best;
}

/** هل حسّن الطالب نتيجته في محاولة لاحقة بعد أول محاولة؟ (تكرار بلا تحسّن لا يُحتسب) */
export function didImprove(attempts: readonly QuizAttempt[], lessonId: number): boolean {
  const ordered = attempts
    .map((attempt, index) => ({ attempt, index, time: Date.parse(attempt.date) }))
    .filter(item => item.attempt.lessonId === lessonId)
    .sort((left, right) => (left.time - right.time) || (right.index - left.index));
  let best: QuizAttempt | null = null;
  let improved = false;
  for (const { attempt } of ordered) {
    if (best && attempt.score * best.total > best.score * attempt.total) improved = true;
    if (!best || attempt.score * best.total >= best.score * attempt.total) best = attempt;
  }
  return improved;
}

export type LessonInput = {
  lessonId: number;
  /** مفاتيح مهام الدرس الفعلية كما في بنكه، لا عدد مفترض. */
  missionKeys: readonly string[];
  /** مفاتيح المهام التي أعلنت حالتها المحفوظة أنها منجزة. */
  solvedMissionKeys: readonly string[];
  attempts: readonly QuizAttempt[];
  visited?: boolean;
};

export type LessonStatus = {
  lessonId: number;
  visited: boolean;
  missionsDone: number;
  missionsTotal: number;
  trainingComplete: boolean;
  best: { score: number; total: number } | null;
  bestRatio: number;
  passed: boolean;
  completed: boolean;
  mastered: boolean;
  attempts: number;
  improved: boolean;
  points: number;
};

export function lessonStatus(input: LessonInput): LessonStatus {
  const done = new Set(input.solvedMissionKeys);
  const missionsDone = input.missionKeys.filter(key => done.has(key)).length;
  const missionsTotal = input.missionKeys.length;
  const trainingComplete = missionsTotal > 0 && missionsDone === missionsTotal;
  const best = bestAttemptFor(input.attempts, input.lessonId);
  const passed = best ? isQuizPass(best.score, best.total) : false;
  const completed = trainingComplete && passed;
  const attributed = input.attempts.filter(attempt => attempt.lessonId === input.lessonId).length;
  const trainingPoints = Math.min(MAX_TRAINING_POINTS, missionsDone * MISSION_POINTS);
  // سياسة النقاط: أرضية (floor) لا تقريب لأعلى — لا يُمنح الطالب أكثر من الناتج الدقيق،
  // وتبقى 99٪ أقل من 100٪، ويبقى كل درس بعدد صحيح واحد يُجمع بلا تقريب مزدوج.
  const quizPoints = best ? Math.min(MAX_QUIZ_POINTS, Math.floor((MAX_QUIZ_POINTS * best.score) / best.total)) : 0;
  return {
    lessonId: input.lessonId,
    visited: input.visited === true,
    missionsDone,
    missionsTotal,
    trainingComplete,
    best: best ? { score: best.score, total: best.total } : null,
    bestRatio: best ? best.score / best.total : 0,
    passed,
    completed,
    mastered: completed && !!best && best.score === best.total,
    attempts: attributed,
    improved: didImprove(input.attempts, input.lessonId),
    points: Math.min(MAX_LESSON_POINTS, trainingPoints + quizPoints),
  };
}

export type DashboardStats = { completed: number; average: number; points: number; attempts: number };

/** الإحصاءات من الدروس المنشورة فقط؛ المحاولات غير المنسوبة لا تدخلها. */
export function dashboardStats(statuses: readonly LessonStatus[]): DashboardStats {
  const tested = statuses.filter(status => status.best);
  const average = tested.length
    ? Math.round((tested.reduce((sum, status) => sum + status.bestRatio, 0) / tested.length) * 1000) / 10
    : 0;
  return {
    completed: statuses.filter(status => status.completed).length,
    average,
    points: statuses.reduce((sum, status) => sum + status.points, 0),
    attempts: statuses.reduce((sum, status) => sum + status.attempts, 0),
  };
}

export type Achievement = { title: string; desc: string; earned: boolean };

/** أربع شارات قابلة للتحقيق فعلًا، ولا تُمنح أي منها قبل تحقق شرطها من البيانات. */
export function achievements(statuses: readonly LessonStatus[]): Achievement[] {
  return [
    { title: "الخطوة الأولى", desc: "أكملت درسًا واحدًا: كل مهامه + اختبار 70٪ أو أكثر", earned: statuses.some(status => status.completed) },
    { title: "أتممت التدريب", desc: "أنجزت كل مهام درس ما", earned: statuses.some(status => status.trainingComplete) },
    { title: "علامة كاملة", desc: "نتيجة كاملة في اختبار درس", earned: statuses.some(status => status.best !== null && status.best.score === status.best.total) },
    { title: "مجتهد", desc: "حسّنت نتيجتك في محاولة لاحقة", earned: statuses.some(status => status.improved) },
  ];
}

/** وصف حالة الدرس للطالب بلغة تفصل الزيارة والتدريب والاجتياز والإتمام. */
export function statusLabel(status: LessonStatus): string {
  if (status.mastered) return "إتقان كامل";
  if (status.completed) return "درس مكتمل";
  if (status.passed) return "نجحت في الاختبار — أكمل التدريب";
  if (status.trainingComplete) return "التدريب منجز — اجتز الاختبار";
  if (status.missionsDone > 0) return "تدريب جارٍ";
  if (status.attempts > 0) return "محاولة اختبار دون اجتياز";
  if (status.visited) return "زيارة فقط";
  return "لم يبدأ";
}
