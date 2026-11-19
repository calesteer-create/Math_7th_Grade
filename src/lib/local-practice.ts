import { gradePractice, publicPractice, validatePracticeResponse, type SavedPractice } from "@/lib/practice-grading";
import { practiceForLesson } from "@/lib/lesson-banks";
import { practiceKey, readLocal, writeLocal } from "@/lib/local-progress";

const temporary = new Map<string, SavedPractice>();
const empty = (): SavedPractice => ({ response: {}, attempts: 0, solved: false, hintsShown: 0, solutionViewed: false });
export function loadPractice(lessonId: number) {
  const bank = practiceForLesson(lessonId);
  if (!bank) return [];
  return bank.exercises.map(definition => publicPractice(definition.key, bank.revision, definition,
    readLocal(practiceKey(lessonId, bank.revision, definition.key), temporary.get(practiceKey(lessonId, bank.revision, definition.key)) ?? empty())));
}
export function actPractice(lessonId: number, key: string, action: "check" | "hint" | "solution", response: Record<string, string>) {
  const bank = practiceForLesson(lessonId);
  const definition = bank?.exercises.find(item => item.key === key);
  if (!bank || !definition) throw new Error("النشاط غير متاح.");
  const storageKey = practiceKey(lessonId, bank.revision, key);
  const state = readLocal<SavedPractice>(storageKey, temporary.get(storageKey) ?? empty());
  if (action === "check") {
    state.response = validatePracticeResponse(definition, response);
    state.attempts++;
    state.solved ||= gradePractice(definition, state.response).correct;
  } else if (action === "hint") state.hintsShown = Math.min(state.hintsShown + 1, definition.hints.length);
  else {
    if (!state.attempts) throw new Error("جرّب المهمة أولًا.");
    state.solutionViewed = true;
  }
  const saved = writeLocal(storageKey, state);
  if (saved) temporary.delete(storageKey); else temporary.set(storageKey, state);
  return { entry: publicPractice(key, bank.revision, definition, state), saved };
}
