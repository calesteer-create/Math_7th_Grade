// فهرس الكتاب المصوّر المرسل من المالك — صفحة 2. لا يعني إدراج العنوان أن محتوى الدرس أُضيف.
// يعاد تشغيل هذا السكربت بأمان: يحافظ على معرّفات الدروس المحتفظ بها وتقدّم الطلاب.
import { readFileSync } from "node:fs";
import crypto from "node:crypto";
import pg from "pg";

const env = {};
for (const line of readFileSync(".env", "utf8").split("\n")) {
  const i = line.indexOf("=");
  if (i > 0) env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
}
const client = new pg.Client({ connectionString: process.env.DATABASE_URL || env.DATABASE_URL });
const curriculum = [
  { title: "الأعداد والعمليات", description: "الأعداد الطبيعية والصحيحة والعادية والعمليات عليها.", icon: "divide", color: "brand", lessons: [
    ["الأعداد الطبيعية", 3], ["الأعداد الصحيحة (الجمع والطرح)", 5], ["الأعداد الصحيحة (الضرب والقسمة)", 10], ["الأعداد العادية", 13], ["العمليات على الأعداد العادية", 15], ["الأعداد العادية ومعلّم المستوي", 20]
  ] },
  { title: "العبارات الجبرية والمعادلات", description: "العبارات الجبرية وحل المعادلات.", icon: "variable", color: "violet", lessons: [
    ["العبارات الجبرية", 25], ["حل المعادلات", 28]
  ] },
  { title: "متوازيات الأضلاع", description: "متوازي الأضلاع، المساحة، والتوازي في الأشكال الرباعية.", icon: "shapes", color: "sky", lessons: [
    ["متوازي الأضلاع ومركز التناظر", 36], ["مساحة متوازي الأضلاع", 42], ["مستقيمات متوازية والقاطع", 46], ["الانتقال من الشكل الرباعي إلى متوازي الأضلاع", 49], ["حالات خاصة: مستطيل، معين، مربع", 55]
  ] },
  { title: "التناظر", description: "التناظر المركزي، نظيم النقطة، ومراكز ومحاور التناظر.", icon: "triangle", color: "emerald", lessons: [
    ["التناظر المركزي", 59], ["إيجاد النظيم بالنسبة إلى نقطة", 68], ["مركز ومحور التناظر", 71]
  ] },
  { title: "النسبة والتناسب", description: "التناسب والنسبة المئوية والقياس ومقياس الرسم والحركة المنتظمة.", icon: "scale", color: "amber", lessons: [
    ["التناسب", 75], ["النسبة المئوية", 84], ["عنوان الدرس غير واضح في الفهرس", 90], ["وحدات القياس", 94], ["مقياس الرسم", 98], ["الطول والحركة المنتظمة", 101]
  ] },
  { title: "المثلث والدائرة", description: "تصنيف المثلث وزواياه ورسمه، ومساحة المثلث والدائرة.", icon: "triangle", color: "rose", lessons: [
    ["تصنيف المثلث", 109], ["مجموع قياسات زوايا المثلث", 113], ["رسم المثلث", 118], ["رسم الدائرة المارة برؤوس المثلث", 124], ["مساحة المثلث", 127], ["مساحة الدائرة", 130]
  ] },
  { title: "المجسمات", description: "المنشور القائم والأسطوانة الدورانية.", icon: "box", color: "cyan", lessons: [
    ["المنشور القائم", 137], ["الأسطوانة الدورانية", 143]
  ] },
  { title: "الإحصاء والاحتمالات", description: "التمثيلات البيانية والانتشار والارتباط والأحداث واحتمالاتها.", icon: "chart", color: "fuchsia", lessons: [
    ["التمثيلات البيانية", 149], ["الانتشار والارتباط", 155], ["الأحداث واحتمالاتها", 157]
  ] },
];

await client.connect();
try {
  await client.query("BEGIN");
  for (let i = 0; i < curriculum.length; i++) {
    const unit = curriculum[i];
    const { rows: existingUnit } = await client.query('SELECT id FROM units WHERE "order"=$1 LIMIT 1', [i + 1]);
    let unitId;
    if (existingUnit.length) {
      unitId = existingUnit[0].id;
      await client.query('UPDATE units SET title=$1, description=$2, icon=$3, color=$4 WHERE id=$5', [unit.title, unit.description, unit.icon, unit.color, unitId]);
    } else {
      const { rows } = await client.query('INSERT INTO units (title,description,icon,color,"order") VALUES ($1,$2,$3,$4,$5) RETURNING id', [unit.title, unit.description, unit.icon, unit.color, i + 1]);
      unitId = rows[0].id;
    }
    for (let j = 0; j < unit.lessons.length; j++) {
      const [title, page] = unit.lessons[j];
      const { rows: existing } = await client.query('SELECT id,status FROM lessons WHERE unit_id=$1 AND "order"=$2 LIMIT 1', [unitId, j + 1]);
      if (existing.length) {
        if (existing[0].status === 'pending') {
          await client.query('UPDATE lessons SET title=$1, source_page=$2 WHERE id=$3', [title, page, existing[0].id]);
        } else {
          await client.query('UPDATE lessons SET source_page=$1 WHERE id=$2', [page, existing[0].id]);
        }
      } else {
        await client.query('INSERT INTO lessons (unit_id,title,"order",source_page,status) VALUES ($1,$2,$3,$4,\'pending\')', [unitId, title, j + 1, page]);
      }
    }
    // احذف فقط عناوين البذرة القديمة غير المنشورة التي ليس لها أي ارتباطات.
    await client.query(`DELETE FROM lessons l WHERE l.unit_id=$1 AND l."order">$2 AND l.status='pending'
      AND l.content IS NULL AND NOT EXISTS (SELECT 1 FROM lesson_progress p WHERE p.lesson_id=l.id)
      AND NOT EXISTS (SELECT 1 FROM quiz_attempts a WHERE a.lesson_id=l.id)
      AND NOT EXISTS (SELECT 1 FROM quiz_questions q WHERE q.lesson_id=l.id)
      AND NOT EXISTS (SELECT 1 FROM teacher_solutions s WHERE s.lesson_id=l.id)`, [unitId, unit.lessons.length]);
    console.log(`الوحدة ${i + 1}: ${unit.title} — ${unit.lessons.length} دروس`);
  }
  const { rows: credentials } = await client.query("SELECT 1 FROM settings WHERE key='teacher_pw_hash'");
  if (!credentials.length) {
    const salt = crypto.randomBytes(16).toString("hex");
    const password = process.env.TEACHER_PASSWORD;
    if (!password) throw new Error("TEACHER_PASSWORD is required for first-time setup");
    const hash = crypto.scryptSync(password.normalize("NFKC"), salt, 32).toString("hex");
    await client.query("INSERT INTO settings (key,value) VALUES ('teacher_pw_salt',$1),('teacher_pw_hash',$2)", [salt, hash]);
  }
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
