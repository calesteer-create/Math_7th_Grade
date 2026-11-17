import { sql } from "drizzle-orm";
import type { PracticeDefinition } from "@/lib/practice-grading";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  foreignKey,
  uniqueIndex,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// الوحدات الدراسية للمنهاج
export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 40 }).notNull().default("shapes"),
  color: varchar("color", { length: 30 }).notNull().default("brand"),
  order: integer("order").notNull(),
});

// الدروس — المحتوى يُضاف درسًا بعد درس عند استلام صور الكتاب
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  unitId: integer("unit_id")
    .notNull()
    .references(() => units.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  order: integer("order").notNull(),
  sourcePage: integer("source_page"), // صفحة بدء الدرس وفق فهرس الكتاب المرسل
  // pending = بانتظار صور الكتاب | published = أُضيف المحتوى واعتُمد
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  goals: text("goals"),
  duration: varchar("duration", { length: 40 }),
  content: jsonb("content"),
  notebook: jsonb("notebook"),
});

// أسئلة اختبارات الدروس والوحدات (مفاتيح الإجابة محمية — لا تُرسل للطالب)
export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").references(() => lessons.id, {
    onDelete: "cascade",
  }),
  unitId: integer("unit_id").references(() => units.id, {
    onDelete: "cascade",
  }),
  scope: varchar("scope", { length: 10 }).notNull().default("lesson"),
  type: varchar("type", { length: 20 }).notNull(), // mcq | truefalse | fill | problem
  question: text("question").notNull(),
  options: jsonb("options"),
  answer: text("answer").notNull(),
  explanation: text("explanation"),
  difficulty: varchar("difficulty", { length: 10 }).notNull().default("medium"),
  source: text("source"),
  order: integer("order").notNull().default(0),
});

// الحلول التفصيلية للمعلم — لا تُرسل لمنطقة الطالب إطلاقًا
export const teacherSolutions = pgTable("teacher_solutions", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").references(() => lessons.id, {
    onDelete: "cascade",
  }),
  unitId: integer("unit_id").references(() => units.id, {
    onDelete: "cascade",
  }),
  title: text("title").notNull(),
  source: text("source"),
  question: text("question"),
  answer: text("answer").notNull(),
  steps: jsonb("steps"),
  law: text("law"),
  notes: text("notes"),
  commonMistakes: jsonb("common_mistakes"),
  status: varchar("status", { length: 20 }).notNull().default("ready"), // ready | review
  order: integer("order").notNull().default(0),
});

// الطلاب
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("طالب المنصة"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// تقدم الطالب داخل كل درس
export const lessonProgress = pgTable("lesson_progress", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  lessonId: integer("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  stage: integer("stage").notNull().default(0),
  completedStages: jsonb("completed_stages")
    .notNull()
    .default(sql`'[]'::jsonb`),
  completed: boolean("completed").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// محاولات الاختبارات والنتائج
export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  lessonId: integer("lesson_id"),
  unitId: integer("unit_id"),
  scope: varchar("scope", { length: 10 }).notNull(),
  title: text("title"),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  answers: jsonb("answers").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// إعدادات المنصة (تجزئة كلمة مرور المعلم وملحها — لا تُخزن كلمة المرور نصًا)
export const settings = pgTable("settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
});

export type Unit = typeof units.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type TeacherSolution = typeof teacherSolutions.$inferSelect;
export type Student = typeof students.$inferSelect;
export type LessonProgress = typeof lessonProgress.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;

// تعريفات تمارين الكتاب الخاصة بالخادم؛ إصدار جديد لا يمحو سجل الإصدار السابق.
export const lessonExercises = pgTable("lesson_exercises", {
  lessonId: integer("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  key: varchar("exercise_key", { length: 64 }).notNull(),
  version: varchar("version", { length: 36 }).notNull(),
  authorRevision: varchar("author_revision", { length: 64 }).notNull(),
  definition: jsonb("definition").$type<PracticeDefinition>().notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, table => [
  primaryKey({ columns: [table.lessonId, table.key, table.version] }),
  uniqueIndex("one_active_lesson_exercise").on(table.lessonId, table.key).where(sql`${table.active} = true`),
]);

export const practiceProgress = pgTable("practice_progress", {
  studentId: integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  lessonId: integer("lesson_id").notNull(),
  exerciseKey: varchar("exercise_key", { length: 64 }).notNull(),
  version: varchar("version", { length: 36 }).notNull(),
  response: jsonb("response").$type<Record<string, string>>().notNull().default(sql`'{}'::jsonb`),
  attempts: integer("attempts").notNull().default(0),
  hintsShown: integer("hints_shown").notNull().default(0),
  solved: boolean("solved").notNull().default(false),
  solutionViewed: boolean("solution_viewed").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, table => [
  primaryKey({ columns: [table.studentId, table.lessonId, table.exerciseKey, table.version] }),
  foreignKey({ name: "practice_progress_exercise_fk", columns: [table.lessonId, table.exerciseKey, table.version], foreignColumns: [lessonExercises.lessonId, lessonExercises.key, lessonExercises.version] }).onDelete("cascade"),
]);
