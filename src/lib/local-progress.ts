// جميع البيانات تخص هذا المتصفح فقط؛ قد يمنع المتصفح التخزين في الوضع الخاص.
// القراءة هنا لا تكتب شيئًا أبدًا: التحقق من الشكل يجري في الذاكرة فقط حفاظًا على بيانات الطالب.
export function readLocal<T>(key: string, fallback: T): T {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; }
  catch { return fallback; }
}
export function writeLocal(key: string, value: unknown): boolean {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}
/** كتابة لمرة واحدة: لا تستبدل قيمة محفوظة سابقًا (تُستخدم للنسخ الاحتياطية). */
export function writeLocalOnce(key: string, value: unknown): boolean {
  try {
    if (localStorage.getItem(key) !== null) return false;
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch { return false; }
}
export const visitedKey = (id: number) => `math7-visited-${id}`;
export const stageKey = (id: number) => `math7-stage-${id}`;
export const practiceKey = (id: number, revision: string, key: string) => `math7-practice-${id}-${revision}-${key}`;
export const quizKey = "math7-quiz-attempts";

/** عنصر تفصيلي داخل محاولة: أي سؤال، أي مهارة، وهل كانت الإجابة صحيحة. */
export type AttemptItem = { id: number; skill: string; correct: boolean };

/**
 * محاولة اختبار محفوظة. `lessonId` و`items` حقلان اختياريان جديدان:
 * المحاولات القديمة تبقى كما هي بلا هوية درس ولا تفصيل مهاري، وتُقرأ دون تعديل.
 */
export type QuizAttempt = {
  title: string; score: number; total: number; date: string;
  lessonId?: number; items?: AttemptItem[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const isWholeNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 0;

/** يقرأ تفصيل المحاولة؛ يُرجع null إذا كان ناقصًا أو مكررًا أو غير مطابق لعدد الأسئلة. */
function parseItems(value: unknown, total: number): AttemptItem[] | null {
  if (!Array.isArray(value)) return null;
  const items: AttemptItem[] = [];
  const ids = new Set<number>();
  for (const raw of value) {
    if (!isRecord(raw)) return null;
    const { id, skill, correct } = raw;
    if (!Number.isInteger(id) || (id as number) < 1) return null;
    if (typeof skill !== "string" || !skill.trim() || skill.length > 64) return null;
    if (typeof correct !== "boolean") return null;
    if (ids.has(id as number)) return null;
    ids.add(id as number);
    items.push({ id: id as number, skill, correct });
  }
  return items.length === total ? items : null;
}

/** يقرأ محاولة واحدة؛ يُرجع null لأي شكل غير صالح بدل تمريره إلى الواجهة. */
export function parseAttempt(value: unknown): QuizAttempt | null {
  if (!isRecord(value)) return null;
  const { title, score, total, date, lessonId } = value;
  if (typeof title !== "string" || !title.trim()) return null;
  if (!isWholeNumber(score) || !isWholeNumber(total) || total < 1 || score > total) return null;
  if (typeof date !== "string" || !date.trim()) return null;
  if (lessonId !== undefined && (!isWholeNumber(lessonId) || lessonId < 1)) return null;
  const attempt: QuizAttempt = { title, score, total, date };
  if (lessonId !== undefined) attempt.lessonId = lessonId;
  // التفصيل المهاري اختياري: أي خلل فيه يُسقطه فقط، ولا يُسقط المحاولة ولا يمسّ بياناتها.
  const items = value.items === undefined ? null : parseItems(value.items, total);
  if (items) attempt.items = items;
  return attempt;
}

/**
 * يقرأ قائمة المحاولات دون حذف أو إعادة كتابة: يرجع المحاولات الصالحة وعدد المُستبعَد.
 * أي شكل غير مصفوفة لا يُسقط الصفحة، ويُبلَّغ عنه للطالب برسالة هادئة.
 */
export function parseAttempts(value: unknown): { attempts: QuizAttempt[]; invalid: number } {
  if (!Array.isArray(value)) return { attempts: [], invalid: value === undefined || value === null ? 0 : 1 };
  const attempts: QuizAttempt[] = [];
  let invalid = 0;
  for (const item of value) {
    const attempt = parseAttempt(item);
    if (attempt) attempts.push(attempt); else invalid++;
  }
  return { attempts, invalid };
}

/** يقرأ فهرس مرحلة محفوظًا؛ أي قيمة خارج المدى أو غير صحيحة تعني «لا مرحلة محفوظة». */
export function parseStage(value: unknown, stageCount: number): number | null {
  return isWholeNumber(value) && value < stageCount ? value : null;
}

/** يقرأ المراحل المزارة: أعداد صحيحة فريدة داخل المدى، ويُهمل ما عداها. */
export function parseVisited(value: unknown, stageCount: number): number[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<number>();
  for (const item of value) if (isWholeNumber(item) && item < stageCount) seen.add(item);
  return [...seen];
}

/** هل حالة تدريب محفوظة تعلن إنجازًا حقيقيًا؟ (سجل محاولة واحد على الأقل + solved) */
export function parsePracticeSolved(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return value.solved === true && isWholeNumber(value.attempts) && value.attempts >= 1;
}

/** تاريخ محاولة للعرض، دون كسر الواجهة إذا كان النص غير قابل للتحليل. */
export function attemptDateText(date: string): string {
  const time = Date.parse(date);
  return Number.isFinite(time) ? new Date(time).toLocaleDateString("ar") : "—";
}
