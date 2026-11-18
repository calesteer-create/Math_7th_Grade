// جميع البيانات تخص هذا المتصفح فقط؛ قد يمنع المتصفح التخزين في الوضع الخاص.
export function readLocal<T>(key: string, fallback: T): T {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; }
  catch { return fallback; }
}
export function writeLocal(key: string, value: unknown): boolean {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}
export const visitedKey = (id: number) => `math7-visited-${id}`;
export const stageKey = (id: number) => `math7-stage-${id}`;
export const practiceKey = (id: number, revision: string, key: string) => `math7-practice-${id}-${revision}-${key}`;
export const quizKey = "math7-quiz-attempts";
export type QuizAttempt = { title: string; score: number; total: number; date: string };
