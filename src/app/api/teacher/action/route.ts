import crypto from "node:crypto";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  createTeacherSession,
  clearTeacherSession,
  getTeacherCredentials,
  hashPassword,
  isTeacher,
  verifyTeacherPassword,
} from "@/lib/teacher-auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      action?: "login" | "logout" | "password";
      password?: string;
      current?: string;
      next?: string;
    };

    if (body.action === "login") {
      if (!body.password || !(await verifyTeacherPassword(body.password))) {
        return Response.json(
          { error: "كلمة المرور غير صحيحة." },
          { status: 401 }
        );
      }
      await createTeacherSession();
      return Response.json({ ok: true });
    }

    if (body.action === "logout") {
      await clearTeacherSession();
      return Response.json({ ok: true });
    }

    if (body.action === "password") {
      if (!(await isTeacher())) {
        return Response.json({ error: "غير مصرح." }, { status: 401 });
      }
      if (!body.current || !(await verifyTeacherPassword(body.current))) {
        return Response.json(
          { error: "كلمة المرور الحالية غير صحيحة." },
          { status: 401 }
        );
      }
      if (!body.next || body.next.length < 6) {
        return Response.json(
          { error: "كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف." },
          { status: 400 }
        );
      }
      const newSalt = crypto.randomBytes(16).toString("hex");
      const newHash = hashPassword(body.next, newSalt);
      await db
        .update(settings)
        .set({ value: newSalt })
        .where(eq(settings.key, "teacher_pw_salt"));
      await db
        .update(settings)
        .set({ value: newHash })
        .where(eq(settings.key, "teacher_pw_hash"));
      await getTeacherCredentials();
      await createTeacherSession();
      return Response.json({ ok: true });
    }

    return Response.json({ error: "إجراء غير معروف." }, { status: 400 });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "حدث خطأ في الخادم." }, { status: 500 });
  }
}
