import { readFileSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";
import { type OriginalAssessment } from "../../src/lib/assessment";
import { lineX } from "../../src/lib/natural-numbers";
import { hasSourcePage } from "../../src/lib/math-text";
const bank = JSON.parse(readFileSync("src/content/assessments/natural-numbers.json", "utf8")) as OriginalAssessment;

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
  await page.goto("/Math_7th_Grade/lessons/1");
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
  await page.goto("/Math_7th_Grade/lessons/1");
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
  await page.goto("/Math_7th_Grade/lessons/1");
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
  await page.goto("/Math_7th_Grade/quizzes/lesson/1");
  await expect(page.getByText("تحدٍّ جديد · نفس المهارات")).toBeVisible();
  const payload = { questions: bank.questions.map((q, i) => ({ ...q, id: i + 1 })) };
  const submit = page.getByRole("button", { name: "تسليم الاختبار وإظهار النتيجة" });
  await expect(submit).toBeDisabled();
  for (let i = 0; i < payload.questions.length; i++) {
    const q = payload.questions[i];
    expect(q.question).toBe(bank.questions[i].question);
    const section = page.locator(`[data-quiz-question="${q.id}"]`);
    const answer = bank.questions[i].answer;
    if (q.type === "mcq") await section.getByRole("button").nth(Number(answer)).click();
    else if (q.type === "truefalse") await section.getByRole("button", { name: answer === "true" ? "صح" : "خطأ", exact: true }).click();
    else await section.getByRole("textbox").fill(answer);
  }
  await expect(submit).toBeEnabled(); await submit.click();
  await expect(page.getByTestId("quiz-score")).toHaveText("8 / 8");
  await expect(page.getByText("نتيجتك على هذا الجهاز")).toBeVisible();
  await page.screenshot({ path: info.outputPath("quiz-result.png") });
  await page.reload();
  await page.goto("/Math_7th_Grade/student");
  await expect(page.locator("body")).toContainText("8 / 8");
});

test("lesson navigation, notebook and print preserve the shared figures", async ({ page }, info) => {
  await page.goto("/Math_7th_Grade/lessons/1");
  const navigation = page.getByRole("navigation", { name: "مراحل الدرس" });
  await expect(navigation.getByRole("button")).toHaveCount(9);
  await expect(navigation.getByRole("button").last()).toContainText("دفتر الطالب");
  await page.getByRole("button", { name: "المحطة التالية" }).click();
  await expect(page.locator("#lesson-content h2")).toHaveText("اكتشف المفهوم");
  await page.getByRole("button", { name: "السابق", exact: true }).click();
  await expect(page.locator("#lesson-content h2")).toHaveText("التهيئة والاستكشاف");
  await stage(page, "دفتر الطالب");
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
  await page.goto("/Math_7th_Grade/");
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
  await page.goto("/Math_7th_Grade/lessons/1");
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
  await page.goto("/Math_7th_Grade/lab");
  expect(await page.locator(".katex .mfrac").count()).toBeGreaterThan(2);
  await assertMathDirection(page);
  await noPageOverflow(page);
  await page.screenshot({ path: info.outputPath("laboratory-katex.png") });
});


async function openPractice(page: Page) {
  await page.goto("/Math_7th_Grade/lessons/1?stage=apply");
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

});

test("hints and failed attempts lead to a detailed solution without bypassing the gate", async ({ page }, info) => {
  await openPractice(page);
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
  await expect(card.locator(".practice-hints")).toBeVisible();
});

test("copybook contains writing sheets, saves personal notes locally, and prints every sheet", async ({ page }, info) => {
  await page.goto("/Math_7th_Grade/lessons/1?stage=notebook");
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
