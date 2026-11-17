// نقطة تشغيل متوافقة مع الأمر السابق. كل عمليات قاعدة البيانات تتم عبر Drizzle.
import { tsImport } from "tsx/esm/api";
const { seedLessonOne } = await tsImport("./seed-lesson-one.ts", import.meta.url);
await seedLessonOne();
