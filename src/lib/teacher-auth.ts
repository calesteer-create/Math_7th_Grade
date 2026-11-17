import crypto from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

const COOKIE_NAME = "teacher_session";
const SALT_KEY = "teacher_pw_salt";
const HASH_KEY = "teacher_pw_hash";
const SESSION_DAYS = 7;

// التهيئة لأول مرة عبر متغير بيئة سري فقط؛ التجزئة في قاعدة البيانات تبقى بعد حذف المتغير.

export function hashPassword(password: string, salt: string): string {
  return crypto
    .scryptSync(password.normalize("NFKC"), salt, 32)
    .toString("hex");
}

export async function getTeacherCredentials(): Promise<{
  salt: string;
  hash: string;
}> {
  const saltRow = await db
    .select()
    .from(settings)
    .where(eq(settings.key, SALT_KEY))
    .limit(1);
  const hashRow = await db
    .select()
    .from(settings)
    .where(eq(settings.key, HASH_KEY))
    .limit(1);
  const salt = saltRow[0]?.value;
  const hash = hashRow[0]?.value;
  if (salt && hash) return { salt, hash };

  const initialPassword = process.env.TEACHER_PASSWORD;
  if (!initialPassword) throw new Error("TEACHER_PASSWORD is required for first-time teacher setup");
  const newSalt = crypto.randomBytes(16).toString("hex");
  const newHash = hashPassword(initialPassword, newSalt);
  await db
    .insert(settings)
    .values([
      { key: SALT_KEY, value: newSalt },
      { key: HASH_KEY, value: newHash },
    ])
    .onConflictDoNothing();
  return { salt: newSalt, hash: newHash };
}

export async function verifyTeacherPassword(password: string): Promise<boolean> {
  const { salt, hash } = await getTeacherCredentials();
  const candidate = hashPassword(password, salt);
  const a = Buffer.from(candidate, "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// سر الجلسة مشتق من تجزئة كلمة المرور — تغيير كلمة المرور يُلغي كل الجلسات
function sessionSecret(pwHash: string): string {
  return crypto
    .createHash("sha256")
    .update(`${pwHash}::teacher-session`)
    .digest("hex");
}

export async function createTeacherSession(): Promise<void> {
  const { hash } = await getTeacherCredentials();
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const sig = crypto
    .createHmac("sha256", sessionSecret(hash))
    .update(String(exp))
    .digest("hex");
  const store = await cookies();
  store.set(COOKIE_NAME, `${exp}.${sig}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearTeacherSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isTeacher(): Promise<boolean> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return false;
  const [expStr, sig] = raw.split(".");
  const exp = Number(expStr);
  if (!exp || Number.isNaN(exp) || exp < Date.now() || !sig) return false;
  const { hash } = await getTeacherCredentials();
  const expected = crypto
    .createHmac("sha256", sessionSecret(hash))
    .update(expStr)
    .digest("hex");
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
