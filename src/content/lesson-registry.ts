import raw from "@/content/lesson-registry.json";
import { validateLessonRegistry } from "@/lib/lesson-registry";

// يُفحص السجل عند أول استيراد؛ أي معرّف مكرر أو وحدة مفقودة توقف البناء برسالة تحدد الحقل.
export const LESSON_REGISTRY = validateLessonRegistry(raw, "src/content/lesson-registry.json");
