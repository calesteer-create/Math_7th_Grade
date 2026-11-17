import "dotenv/config";
import { readFileSync } from "node:fs";
import { createHash, createHmac, randomUUID } from "node:crypto";
import { test, expect, request as playwrightRequest, type Page } from "@playwright/test";
import { and, eq, like } from "drizzle-orm";
import { db, pool } from "../../src/db";
import { students, settings } from "../../src/db/schema";
import { displayAnswer, type OriginalAssessment } from "../../src/lib/assessment";
import { lineX } from "../../src/lib/natural-numbers";
import { hasSourcePage } from "../../src/lib/math-text";

const bank = JSON.parse(readFileSync("src/content/assessments/natural-numbers.json", "utf8")) as OriginalAssessment;
const sessions = new WeakMap<Page, number>();
test.beforeEach(async ({ page }) => {
  const response = await page.request.post("/api/student", { data: { name: `qa-option-b-${randomUUID()}` } });
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  sessions.set(page, data.student.id);
});
test.afterEach(async ({ page }) => {
  const id = sessions.get(page);
  if (id) await db.delete(students).where(and(eq(students.id, id), like(students.name, "qa-option-b-%")));
});
test.afterAll(async () => { await pool.end(); });

async function stage(page: Page, title: string) {
  await page.getByRole("navigation", { name: "مراحل الدرس" }).getByRole("button", { name: new RegExp(title) }).click();
  await expect(page.locator("#lesson-content h2")).toHaveText(title);
}
async function noPageOverflow(page: Page) {
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(horizontalOverflow).toBeFalsy();
}

test("source figures preserve labels, counts, direction and spacing", async ({ page }, info) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", error => runtimeErrors.push(error.message));
  await page.goto("/lessons/1");
  const counting = page.locator('[data-book-figure="counting"]');
  await expect(counting).toBeVisible();
  for (let n = 0; n <= 4; n++) await expect(counting.locator(`[data-count="${n}"] [data-dot]`)).toHaveCount(n);
  await stage(page, "اكتشف المفهوم");
  await page.getByText("الشكل الأصلي للكتاب", { exact: true }).click();
  const warmup = page.locator('[data-book-figure="warmup"]');
  await expect(warmup.locator("svg [data-dot]")).toHaveCount(12);
  const positions: number[] = [];
  for (const letter of ["A", "B", "C"]) positions.push((await warmup.getByRole("columnheader", { name: letter, exact: true }).boundingBox())!.x);
  expect(positions[0]).toBeLessThan(positions[1]); expect(positions[1]).toBeLessThan(positions[2]);
  await warmup.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  await warmup.screenshot({ path: info.outputPath("source-warmup.png") });
  const line = page.locator('[data-book-figure="numberLine"]');
  await expect(line.locator("[data-tick]")).toHaveCount(13);
  await expect(line.locator('[data-point="M"]')).toHaveAttribute("cx", String(lineX(5)));
  await line.scrollIntoViewIfNeeded();
  await line.screenshot({ path: info.outputPath("source-line.png") });
  await noPageOverflow(page);
  expect(runtimeErrors).toEqual([]);
});

test("place-value source figure zooms, closes by Escape and preserves all zeros", async ({ page }, info) => {
  await page.goto("/lessons/1");
  await stage(page, "الشرح التفصيلي");
  await page.getByRole("tab", { name: /الأعداد الكبيرة/ }).click();
  const figure = page.locator('[data-book-figure="placeValue"]');
  await figure.scrollIntoViewIfNeeded();
  expect((await figure.locator("[data-place]").allTextContents()).join("")).toBe("083000050002");
  await figure.screenshot({ path: info.outputPath("source-place-value.png") });
  const zoom = figure.getByRole("button", { name: "تكبير رسم خريطة منازل العدد" });
  await zoom.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("[data-place]")).toHaveCount(12);
  await page.screenshot({ path: info.outputPath("zoom-desktop.png") });
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(zoom).toBeFocused();
  await noPageOverflow(page);
  expect(await page.locator("body").innerText()).not.toMatch(/[\u0660-\u0669\u06f0-\u06f9]/);
  await expect(page.locator(".katex-error")).toHaveCount(0);
});

test("interactive figures respond accurately without changing source values", async ({ page }, info) => {
  await page.goto("/lessons/1");
  await stage(page, "المختبر التفاعلي");
  await page.getByRole("button", { name: "اختر المجموعة B" }).click();
  await expect(page.getByRole("status")).toContainText("حاول مرة أخرى");
  await page.getByRole("button", { name: "اختر المجموعة A" }).click();
  await expect(page.getByRole("status")).toContainText("أحسنت");
  await page.getByRole("tab", { name: "مستقيم الأعداد" }).click();
  const slider = page.getByRole("slider", { name: "موضع النقطة M" });
  await slider.focus(); await slider.press("End"); await slider.press("ArrowLeft");
  await expect(slider).toHaveValue("11");
  await expect(page.locator('[data-number-line] [data-point="M"]')).toHaveAttribute("cx", String(lineX(11)));
  await page.getByRole("button", { name: "استعادة رسم الكتاب" }).click();
  await expect(slider).toHaveValue("5");
  await page.getByRole("tab", { name: "استكشف المنازل" }).click();
  await page.getByRole("button", { name: "استكشف الرقمين 5" }).click();
  await page.getByRole("button", { name: "مئات الآلاف: 5", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("500000");
  await page.getByRole("button", { name: "آحاد الآلاف: 5", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("5000");
  const input = page.getByRole("textbox", { name: "اكتب العدد" });
  await input.fill("");
  await expect(page.getByRole("status")).toContainText("اكتب عددًا");
  await input.fill("999999999999");
  await page.getByRole("button", { name: "مئات المليارات (البلايين): 9", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("900000000000");
  await page.getByRole("button", { name: "عدد جدول الكتاب" }).click();
  await expect(input).toHaveValue("83000050002");
  await page.screenshot({ path: info.outputPath("interactive-places.png") });
  await noPageOverflow(page);
  await expect(page.locator(".katex-error")).toHaveCount(0);
});

test("fresh final quiz grades correctly and keeps results after refresh", async ({ page }, info) => {
  await page.goto("/quizzes/lesson/1");
  await expect(page.getByText("تحدٍّ جديد · نفس المهارات")).toBeVisible();
  const response = await page.request.get("/api/quiz?lesson=1");
  const payload = await response.json();
  expect(payload.questions).toHaveLength(8);
  const submit = page.getByRole("button", { name: "تسليم الاختبار وإظهار النتيجة" });
  await expect(submit).toBeDisabled();
  for (let i = 0; i < payload.questions.length; i++) {
    const q = payload.questions[i];
    expect(q.question).toBe(bank.questions[i].question);
    expect(q).not.toHaveProperty("answer"); expect(q).not.toHaveProperty("explanation");
    const section = page.locator(`[data-quiz-question="${q.id}"]`);
    const answer = bank.questions[i].answer;
    if (q.type === "mcq") await section.getByRole("button").nth(Number(answer)).click();
    else if (q.type === "truefalse") await section.getByRole("button", { name: answer === "true" ? "صح" : "خطأ", exact: true }).click();
    else await section.getByRole("textbox").fill(answer);
  }
  await expect(submit).toBeEnabled(); await submit.click();
  await expect(page.getByTestId("quiz-score")).toHaveText("8 / 8");
  await expect(page.getByText("حُفظت محاولتك في منطقة الطالب")).toBeVisible();
  await page.screenshot({ path: info.outputPath("quiz-result.png") });
  await page.reload();
  const overview = await (await page.request.get("/api/student")).json();
  expect(overview.attempts).toHaveLength(1);
  expect(overview.attempts[0]).toMatchObject({ score: 8, total: 8 });
});

test("API does not reveal keys early, mix scopes or accept stale submissions", async ({ page }) => {
  const payload = await (await page.request.get("/api/quiz?lesson=1")).json();
  expect((await page.request.get("/api/teacher/overview")).status()).toBe(401);
  expect((await page.request.get("/api/quiz?lesson=1&unit=1")).status()).toBe(400);
  expect((await (await page.request.get("/api/quiz?unit=1")).json()).questions).toEqual([]);
  expect((await (await page.request.get("/api/quiz?lesson=2")).json()).questions).toEqual([]);
  const incomplete = await page.request.post("/api/quiz", { data: { scope: "lesson", id: 1, version: payload.version, answers: {} } });
  expect(incomplete.status()).toBe(400); expect(await incomplete.json()).not.toHaveProperty("results");
  const stale = await page.request.post("/api/quiz", { data: { scope: "lesson", id: 1, version: "old-version", answers: {} } });
  expect(stale.status()).toBe(409); expect(await stale.json()).not.toHaveProperty("results");
  const invalid = await page.request.post("/api/quiz", { data: { scope: "anything", id: 1 } });
  expect(invalid.status()).toBe(400);
  const [credential] = await db.select().from(settings).where(eq(settings.key, "teacher_pw_hash")).limit(1);
  expect(credential).toBeTruthy();
  // جلسة اختبار موقعة من سر الخادم؛ لا كلمات مرور صريحة في الاختبار أو الواجهة.
  const exp = Date.now() + 60000;
  const secret = createHash("sha256").update(`${credential.value}::teacher-session`).digest("hex");
  const signature = createHmac("sha256", secret).update(String(exp)).digest("hex");
  await page.context().addCookies([{ name: "teacher_session", value: `${exp}.${signature}`, url: "http://127.0.0.1:3000", httpOnly: true, sameSite: "Lax" }]);
  const privateResponse = await page.request.get("/api/teacher/overview");
  expect(privateResponse.status()).toBe(200);
  const overview = await privateResponse.json();
  const keys = overview.quizKeys.find((q: { id: string }) => q.id === "lesson:1").questions;
  expect(keys).toHaveLength(8);
  expect(overview.solutions).toHaveLength(7);
  for (let i = 0; i < keys.length; i++) {
    expect(keys[i].answer).toBe(displayAnswer(bank.questions[i]));
    expect(keys[i].explanation).toBe(bank.questions[i].explanation);
    expect(keys[i].source).toContain(bank.revision);
  }
});

test("lesson navigation, notebook and print preserve the shared figures", async ({ page }, info) => {
  await page.goto("/lessons/1");
  const navigation = page.getByRole("navigation", { name: "مراحل الدرس" });
  await expect(navigation.getByRole("button")).toHaveCount(9);
  await expect(navigation.getByRole("button").last()).toContainText("دفتر الطالب");
  await page.getByRole("button", { name: "المحطة التالية" }).click();
  await expect(page.locator("#lesson-content h2")).toHaveText("اكتشف المفهوم");
  await page.getByRole("button", { name: "السابق", exact: true }).click();
  await expect(page.locator("#lesson-content h2")).toHaveText("التهيئة والاستكشاف");
  const saved = page.waitForResponse(r => r.url().endsWith("/api/progress") && r.request().method() === "POST");
  await stage(page, "دفتر الطالب"); await saved;
  await page.reload();
  await expect(page.locator("#lesson-content h2")).toHaveText("دفتر الطالب");
  await expect(page.locator('[data-book-figure="numberLine"]')).toHaveCount(1);
  await expect(page.locator('[data-book-figure="placeValue"]')).toHaveCount(1);
  await page.emulateMedia({ media: "print" });
  await expect(navigation).toBeHidden();
  const box = await page.locator("#lesson-content").boundingBox();
  expect(box!.width).toBeGreaterThan(600);
  await page.locator('[data-book-figure="placeValue"]').screenshot({ path: info.outputPath("notebook-print-figure.png") });
  await page.emulateMedia({ media: "screen" });
  await noPageOverflow(page);
});


async function assertMathDirection(page: Page) {
  await expect(page.locator(".math-error, .katex-error")).toHaveCount(0);
  const invalid = await page.locator("[data-math]").evaluateAll(elements => elements.filter(el => {
    const style = getComputedStyle(el);
    return style.direction !== "ltr" || style.unicodeBidi !== "isolate";
  }).length);
  expect(invalid).toBe(0);
}
async function assertExerciseOnlyCitations(page: Page) {
  const visible = await page.locator("#lesson-content").evaluate(el => {
    const clone = el.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("[data-exercise],script,style").forEach(n => n.remove());
    return clone.textContent || "";
  });
  expect(hasSourcePage(visible)).toBe(false);
  const outside = await page.locator("[data-source-citation]").evaluateAll(elements => elements.filter(el => !el.closest("[data-exercise]")).length);
  expect(outside).toBe(0);
}

test("colorful shared design preserves clear desktop navigation", async ({ page }, info) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("الرياضيات للسابع");
  await noPageOverflow(page);
  await assertMathDirection(page);
  await page.screenshot({ path: info.outputPath("home-bright.png") });
  await page.getByRole("link", { name: "ابدأ رحلة التعلّم" }).click();
  await expect(page.locator(".lesson-hero h1")).toHaveText("الأعداد الطبيعية");
  await expect(page.getByRole("navigation", { name: "مراحل الدرس" }).getByRole("button")).toHaveCount(9);
  await assertExerciseOnlyCitations(page);
  await assertMathDirection(page);
  await page.screenshot({ path: info.outputPath("lesson-bright.png") });
});

test("all six expanded explanation steps use isolated KaTeX and supplemental labels", async ({ page }, info) => {
  await page.goto("/lessons/1");
  await stage(page, "الشرح التفصيلي");
  const tabs = page.getByRole("tablist", { name: "أفكار الشرح الموسّع" }).getByRole("tab");
  await expect(tabs).toHaveCount(6);
  for (let i = 0; i < 6; i++) {
    await tabs.nth(i).click();
    await expect(tabs.nth(i)).toHaveAttribute("aria-selected", "true");
    expect(await page.locator("#lesson-content [data-extra-explanation]").count()).toBeGreaterThan(0);
    await assertExerciseOnlyCitations(page);
    await assertMathDirection(page);
    await noPageOverflow(page);
    if (i === 2) await page.screenshot({ path: info.outputPath("expanded-example.png") });
  }
  await page.getByRole("button", { name: "6000", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("جرّب من جديد");
  await page.getByRole("button", { name: "60000", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("أحسنت");
  await stage(page, "طبّق");
  const tasks = page.getByRole("tablist", { name: "مهمات تمارين الكتاب" }).getByRole("tab");
  await expect(tasks).toHaveCount(6);
  for (let index = 0; index < 6; index++) {
    await tasks.nth(index).click();
    await expect(page.locator("[data-exercise]")).toHaveCount(1);
    await expect(page.locator("[data-source-citation]")).toHaveCount(1);
  }
  await assertExerciseOnlyCitations(page);
  await stage(page, "دفتر الطالب");
  await expect(page.locator("[data-source-citation]")).toHaveCount(0);
  await assertExerciseOnlyCitations(page);
  await assertMathDirection(page);
});

test("laboratory fractions and relations render with KaTeX, not flipped plain text", async ({ page }, info) => {
  await page.goto("/lab");
  expect(await page.locator(".katex .mfrac").count()).toBeGreaterThan(2);
  await assertMathDirection(page);
  await noPageOverflow(page);
  await page.screenshot({ path: info.outputPath("laboratory-katex.png") });
});


async function openPractice(page: Page) {
  await page.goto("/lessons/1?stage=apply");
  await expect(page.locator("#lesson-content h2")).toHaveText("طبّق");
  await expect(page.locator('[data-practice-key="count-five"]')).toBeVisible();
}
async function selectPractice(page: Page, title: RegExp, key: string) {
  await page.getByRole("tablist", { name: "مهمات تمارين الكتاب" }).getByRole("tab", { name: title }).click();
  await expect(page.locator(`[data-practice-key="${key}"]`)).toBeVisible();
  return page.locator(`[data-practice-key="${key}"]`);
}
async function checkPractice(page: Page, key: string) {
  const card=page.locator(`[data-practice-key="${key}"]`);
  await card.getByRole("button", { name: "تحقّق من خطواتي", exact: true }).click();
  await expect(card.locator("[data-practice-feedback]")).toHaveClass(/is-correct/);
}

test("all six textbook missions are interactive and keep their progress", async ({ page }, info) => {
  await openPractice(page);
  let card=page.locator('[data-practice-key="count-five"]');
  await card.getByRole("button", { name: "اختر المجموعة A", exact:true }).click();
  await checkPractice(page,"count-five");
  card=await selectPractice(page,/محقّق المنازل/,"place-7430");
  await card.getByRole("button",{name:"الرقم 4",exact:true}).click();
  await card.getByRole("button",{name:"400",exact:true}).click();
  await checkPractice(page,"place-7430");
  card=await selectPractice(page,/توأمان/,"twin-fives");
  await card.getByRole("button",{name:"بطاقة 500000",exact:true}).dragTo(card.locator('[data-drop-field="leftValue"]'));
  await expect(card.locator('[data-drop-field="leftValue"] button')).toContainText("500000");
  await card.getByRole("button",{name:"بطاقة 5000",exact:true}).focus();
  await page.keyboard.press("Enter");
  await card.locator('[data-drop-field="rightValue"] button').focus();
  await page.keyboard.press("Enter");
  await expect(card.locator('[data-drop-field="rightValue"] button')).toContainText("5000");
  await checkPractice(page,"twin-fives");
  await card.screenshot({path:info.outputPath("creative-twins.png"),style:"header.sticky { visibility:hidden !important; }"});
  card=await selectPractice(page,/المحطة 8/,"point-eight");
  const slider=card.getByRole("slider",{name:"موضع نقطة التمرين"});
  await slider.focus();await slider.press("End");
  for(let i=0;i<4;i++) await slider.press("ArrowLeft");
  await expect(slider).toHaveValue("8");
  await expect(card.locator('[data-point="M"]')).toHaveAttribute("cx",String(lineX(8)));
  await checkPractice(page,"point-eight");
  card=await selectPractice(page,/العدسة الكبيرة/,"big-place");
  await card.getByRole("button",{name:"الرقم 2",exact:true}).click();
  await card.getByRole("textbox",{name:"قيمة الرقم 2",exact:true}).fill("٢٠٠٠٠٠٠٠٠");
  await expect(card.getByRole("textbox",{name:"قيمة الرقم 2",exact:true})).toHaveValue("200000000");
  await checkPractice(page,"big-place");
  card=await selectPractice(page,/شفرة نبتون/,"neptune-code");
  for(const [label,value] of [["المليارات","4"],["الملايين","503"],["الآلاف","444"],["الوحدات","0"],["المسافة بالصيغة العددية","4503444000"]]) await card.getByRole("textbox",{name:label,exact:true}).fill(value);
  await checkPractice(page,"neptune-code");
  await expect(page.locator(".practice-trail-counter bdi")).toContainText("6 / 6");
  await expect(page.locator(".practice-trail-finish")).toBeVisible();
  await card.screenshot({path:info.outputPath("creative-neptune.png"),style:"header.sticky { visibility:hidden !important; }"});
  await assertMathDirection(page);await noPageOverflow(page);
  await page.reload();
  await expect(page.locator(".practice-trail-counter bdi")).toContainText("6 / 6");
  const practice=await (await page.request.get("/api/practice?lesson=1")).json();
  expect(practice.exercises.filter((entry:{state:{solved:boolean}})=>entry.state.solved)).toHaveLength(6);
  const student=await (await page.request.get("/api/student")).json();
  expect(student.attempts).toHaveLength(0);
});

test("hints and failed attempts lead to a detailed solution without bypassing the gate", async ({ page }, info) => {
  await openPractice(page);
  const data=await (await page.request.get("/api/practice?lesson=1")).json();
  const entry=data.exercises.find((e:{key:string})=>e.key==="place-7430");
  expect(entry).not.toHaveProperty("solution");
  expect(entry).not.toHaveProperty("expected");
  expect(entry.state.hints).toEqual([]);
  const base={lessonId:1,exerciseKey:entry.key,version:entry.version};
  const forged=await page.request.post("/api/practice",{data:{...base,action:"solution",attempts:99,solved:true}});
  expect(forged.status()).toBe(403);
  const incomplete=await page.request.post("/api/practice",{data:{...base,action:"check",response:{position:"2"}}});
  expect(incomplete.status()).toBe(400);
  let card=await selectPractice(page,/محقّق المنازل/,"place-7430");
  await expect(card.getByRole("button",{name:"الحل خطوة بخطوة",exact:true})).toBeDisabled();
  await card.getByRole("button",{name:/تلميح صغير/}).click();
  await expect(card.locator(".practice-hints")).toBeVisible();
  await expect(card.getByRole("button",{name:"الحل خطوة بخطوة",exact:true})).toBeDisabled();
  await card.getByRole("button",{name:"الرقم 4",exact:true}).click();
  await card.getByRole("button",{name:"4",exact:true}).click();
  await card.getByRole("button",{name:"تحقّق من خطواتي",exact:true}).click();
  await expect(card.locator("[data-practice-feedback]")).toHaveClass(/needs-work/);
  await card.getByRole("button",{name:"الحل خطوة بخطوة",exact:true}).click();
  await expect(card.locator("[data-solution-step]")).toHaveCount(1);
  for(let i=0;i<3;i++) await card.getByRole("button",{name:"الخطوة التالية في الحل",exact:true}).click();
  await expect(card.locator("[data-solution-step]")).toHaveCount(4);
  await expect(card.locator("[data-practice-solution]")).toContainText("400");
  await assertMathDirection(page);
  await card.locator("[data-practice-solution]").screenshot({path:info.outputPath("step-by-step-solution.png")});
  await page.reload();
  card=await selectPractice(page,/محقّق المنازل/,"place-7430");
  await expect(card.locator("[data-practice-solution]")).toBeVisible();
  const restored=await (await page.request.get("/api/practice?lesson=1")).json();
  const state=restored.exercises.find((e:{key:string})=>e.key===entry.key).state;
  expect(state.attempts).toBe(1);expect(state.solved).toBe(false);expect(state.hints).toHaveLength(1);
});

test("copybook contains writing sheets, saves personal notes locally, and prints every sheet", async ({ page }, info) => {
  await page.goto("/lessons/1?stage=notebook");
  await expect(page.locator("#lesson-content h2")).toHaveText("دفتر الطالب");
  await expect(page.getByRole("heading",{name:"ما أكتبه في دفتري",exact:true})).toBeVisible();
  await expect(page.getByRole("tablist",{name:"أوراق دفتر الطالب"}).getByRole("tab")).toHaveCount(4);
  await expect(page.locator('[data-student-copybook] [data-block-kind="summary"]')).toHaveCount(0);
  const note=page.getByRole("textbox",{name:"ملاحظتي: الأعداد الطبيعية ومستقيم الأعداد",exact:true});
  await expect(note).toBeEnabled();
  await note.fill("أبدأ تحديد المنزلة من اليمين وأذكر سبب اختياري.");
  await page.locator(".copybook-sheet.is-current").getByRole("checkbox").check();
  await page.reload();
  await expect(note).toHaveValue("أبدأ تحديد المنزلة من اليمين وأذكر سبب اختياري.");
  await expect(page.locator(".copybook-sheet.is-current").getByRole("checkbox")).toBeChecked();
  await page.locator(".copybook-sheet.is-current").screenshot({path:info.outputPath("writing-sheet.png"),style:"header.sticky { visibility:hidden !important; }"});
  await page.getByRole("tab",{name:/المنازل وقاعدة حساب القيمة/}).click();
  await expect(page.locator(".copybook-sheet.is-current")).toContainText("المعطى");
  await expect(page.locator(".copybook-sheet.is-current")).toContainText("40000");
  await page.evaluate(()=>{window.print=()=>{document.documentElement.dataset.printRequested="yes";};});
  await page.getByRole("button",{name:"طباعة أوراق الدفتر",exact:true}).click();
  await expect(page.locator("html")).toHaveAttribute("data-print-requested","yes");
  await page.emulateMedia({media:"print"});
  const sheets=page.locator("[data-notebook-sheet]");
  await expect(sheets).toHaveCount(4);
  for(let i=0;i<4;i++) await expect(sheets.nth(i)).toBeVisible();
  await expect(page.locator(".copybook-print-note").first()).toContainText("أبدأ تحديد المنزلة");
  const pdf=await page.pdf({path:info.outputPath("student-copybook.pdf"),format:"A4",printBackground:true,margin:{top:"12mm",bottom:"12mm",left:"10mm",right:"10mm"}});
  expect(pdf.length).toBeGreaterThan(10000);
  await page.emulateMedia({media:"screen"});
  await assertMathDirection(page);await noPageOverflow(page);await assertExerciseOnlyCitations(page);
});

test("practice rejects stale or invalid requests and isolates each learner's progress", async ({ page }) => {
  const data=await (await page.request.get("/api/practice?lesson=1")).json();
  expect(data.exercises).toHaveLength(6);
  expect(JSON.stringify(data)).not.toContain('"expected"');
  expect(JSON.stringify(data)).not.toContain('"mistakes"');
  expect(JSON.stringify(data)).not.toContain('"sourceOrder"');
  const entry=data.exercises.find((e:{key:string})=>e.key==="count-five");
  const base={lessonId:1,exerciseKey:entry.key,version:entry.version};
  expect((await page.request.post("/api/practice",{data:{...base,version:"00000000-0000-4000-8000-000000000000",action:"check",response:{group:"A"}}})).status()).toBe(409);
  expect((await page.request.post("/api/practice",{data:{...base,action:"check",response:{group:"A",extra:"bad"}}})).status()).toBe(400);
  expect((await page.request.get("/api/practice?lesson=2")).status()).toBe(404);
  expect((await page.request.post("/api/practice",{data:{...base,action:"check",response:{group:"A"}}})).ok()).toBeTruthy();
  const peer=await playwrightRequest.newContext({baseURL:process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000"});
  let peerId:number | undefined;
  try {
    const identity=await (await peer.post("/api/student",{data:{name:`qa-practice-peer-${randomUUID()}`}})).json();peerId=identity.student.id;
    const peerData=await (await peer.get("/api/practice?lesson=1")).json();
    expect(peerData.exercises.every((e:{state:{attempts:number;solved:boolean}})=>e.state.attempts===0 && !e.state.solved)).toBeTruthy();
    expect((await peer.post("/api/practice",{data:{...base,action:"solution",studentId:sessions.get(page)}})).status()).toBe(403);
  } finally {
    if(peerId) await db.delete(students).where(and(eq(students.id,peerId),like(students.name,"qa-practice-peer-%")));
    await peer.dispose();
  }
});
