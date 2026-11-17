import { cookies } from "next/headers";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq } from "drizzle-orm";

const COOKIE_NAME = "student_id";

export async function getStudentId(): Promise<number | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  const id = raw ? Number(raw) : NaN;
  if (!Number.isInteger(id)) return null;
  const rows = await db
    .select({ id: students.id })
    .from(students)
    .where(eq(students.id, id))
    .limit(1);
  return rows[0]?.id ?? null;
}

// ينشئ طالبًا افتراضيًا عند أول زيارة ويحفظ معرّفه في كوكي httpOnly
export async function ensureStudent(name?: string): Promise<number> {
  const existing = await getStudentId();
  if (existing) return existing;
  const rows = await db
    .insert(students)
    .values({ name: name?.trim() || "طالب المنصة" })
    .returning({ id: students.id });
  const store = await cookies();
  store.set(COOKIE_NAME, String(rows[0].id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 365 * 24 * 60 * 60,
  });
  return rows[0].id;
}

export async function renameStudent(name: string): Promise<void> {
  const id = await ensureStudent(name);
  await db
    .update(students)
    .set({ name: name.trim() || "طالب المنصة" })
    .where(eq(students.id, id));
}
