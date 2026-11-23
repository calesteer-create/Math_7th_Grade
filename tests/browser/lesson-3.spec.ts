import { readFileSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";
import { type OriginalAssessment } from "../../src/lib/assessment";
import { hasSourcePage } from "../../src/lib/math-text";

const bank = JSON.parse(readFileSync("src/content/assessments/integers-mul-div.json", "utf8")) as OriginalAssessment;

async function stage(page: Page, title: string) {
  await page.getByRole("navigation", { name: "مراحل الدرس" }).getByRole("button", { name: new RegExp(title) }).click();
  await expect(page.locator("#lesson-content h2")).toHaveText(title);
}

async function noPageOverflow(page: Page) {
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(horizontalOverflow).toBeFalsy();
}

async function assertMathDirection(page: Page) {
  await expect(page.locator(".math-error, .katex-error")).toHaveCount(0);
  const invalid = await page.locator("[data-math]").evaluateAll(elements =>
    elements.filter(el => {
      const style = getComputedStyle(el);
      return style.direction !== "ltr" || style.unicodeBidi !== "isolate";
    }).length,
  );
  expect(invalid).toBe(0);
}

async function assertExerciseOnlyCitations(page: Page) {
  const visible = await page.locator("#lesson-content").evaluate(el => {
    const clone = el.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("[data-exercise],script,style").forEach(n => n.remove());
    return clone.textContent || "";
  });
  expect(hasSourcePage(visible)).toBe(false);
  const outside = await page.locator("[data-source-citation]").evaluateAll(elements =>
    elements.filter(el => !el.closest("[data-exercise]")).length,
  );
  expect(outside).toBe(0);
}

test("Lesson 3 loads cleanly with all 6 explain tabs, zoomable book figures, and isolated KaTeX", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", error => runtimeErrors.push(error.message));

  await page.goto("/Math_7th_Grade/lessons/3");
  await expect(page.locator(".lesson-hero h1")).toHaveText("الأعداد الصحيحة (الضرب والقسمة)");
  await expect(page.getByRole("navigation", { name: "مراحل الدرس" }).getByRole("button")).toHaveCount(9);
  await expect(page.getByRole("navigation", { name: "مراحل الدرس" }).getByRole("button").last()).toContainText("دفتر الطالب");

  // stage: discover (muldivWarmup & muldivPatternLadder)
  await stage(page, "اكتشف المفهوم");
  const warmupFig = page.locator('[data-book-figure="muldivWarmup"]');
  await expect(warmupFig).toBeVisible();
  await expect(page.locator('[data-book-figure="muldivPatternLadder"]')).toBeVisible();
  await warmupFig.getByRole("button", { name: /تكبير رسم/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  // stage: explain (6 guided tabs, including muldivSignMatrix, muldivShortTable, muldivDivisionExamples)
  await stage(page, "الشرح التفصيلي");
  const tabs = page.getByRole("tablist", { name: "أفكار الشرح الموسّع" }).getByRole("tab");
  await expect(tabs).toHaveCount(6);
  await expect(page.locator('[data-book-figure="muldivSignMatrix"]')).toBeVisible();
  for (let i = 0; i < 6; i++) {
    await tabs.nth(i).click();
    await expect(tabs.nth(i)).toHaveAttribute("aria-selected", "true");
    if (i === 3) await expect(page.locator('[data-book-figure="muldivShortTable"]')).toBeVisible();
    if (i === 4) await expect(page.locator('[data-book-figure="muldivDivisionExamples"]')).toBeVisible();
    await assertMathDirection(page);
    await assertExerciseOnlyCitations(page);
    await noPageOverflow(page);
  }

  expect(await page.locator("body").innerText()).not.toMatch(/[\u0660-\u0669\u06f0-\u06f9]/);
  expect(runtimeErrors).toEqual([]);
});

test("Lesson 3 interactive IntegersMulDivStudio responds accurately across all 4 modes", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", error => runtimeErrors.push(error.message));

  await page.goto("/Math_7th_Grade/lessons/3?stage=lab");
  await expect(page.locator("#lesson-content h2")).toHaveText("المختبر التفاعلي");

  const studio = page.locator('[data-integers-mul-div-studio="true"]');

  // 1. Pattern tab: (-4) × (-5) = +20, and (-4) × 0 = 0
  await studio.getByRole("tab", { name: "لماذا السالب × السالب موجب؟" }).click();
  await expect(studio.locator('[data-studio-pattern-result="true"]')).toContainText("الإشارتان متفقتان");
  await studio.getByRole("button", { name: "(-4) × 0", exact: true }).click();
  await expect(studio.locator('[data-studio-pattern-result="true"]')).toContainText("وجود الصفر");

  // 2. Sign count tab: parity & zero absorption
  await studio.getByRole("tab", { name: "عدّاد الإشارات والخواص" }).click();
  await expect(studio.locator('[data-studio-signcount-result="true"]')).toContainText("زوجي");
  await studio.getByRole("button", { name: "(-1)(-2)(-5)", exact: true }).click();
  await expect(studio.locator('[data-studio-signcount-result="true"]')).toContainText("فردي");
  await studio.getByRole("button", { name: "(-12)(-4)(0)(-9)", exact: true }).click();
  await expect(studio.locator('[data-studio-signcount-result="true"]')).toContainText("يساوي 0");

  // 3. Shorthand tab: toggle compact/full + contrast trap
  await studio.getByRole("tab", { name: "الكتابة المختزلة والفخاخ" }).click();
  await studio.getByRole("button", { name: "(-4)(-2) مقابل -4 - 2", exact: true }).click();
  await expect(studio.locator('[data-studio-shorthand-result="true"]')).toContainText("قوسان متجاوران");
  await studio.getByRole("button", { name: "إظهار علامة × الكاملة", exact: true }).click();
  await expect(studio.getByRole("button", { name: "تطبيق الكتابة المختزلة", exact: true })).toBeVisible();
  await studio.getByRole("button", { name: "9 × 4 (حالة ممنوعة)", exact: true }).click();
  await expect(studio.locator('[data-studio-shorthand-result="true"]')).toContainText("ممنوع حذف");

  // 4. Division tab: 0 ÷ (-3) = 0 vs 4 ÷ 0 impossible + non-commutativity
  await studio.getByRole("tab", { name: "مستكشف القسمة والصفر" }).click();
  await studio.getByRole("button", { name: "0 ÷ (-3)", exact: true }).click();
  await expect(studio.locator('[data-studio-division-result="true"]')).toContainText("الصفر مقسومًا");
  await studio.getByRole("button", { name: "4 ÷ 0", exact: true }).click();
  await expect(studio.locator('[data-studio-division-result="true"]')).toContainText("قسمة غير ممكنة");
  await studio.getByRole("button", { name: "(-24) ÷ (-2)", exact: true }).click();
  await studio.getByRole("button", { name: "مقارنة التبديل والتجميع", exact: true }).click();
  await expect(studio).toContainText("ليست تبديلية");
  await expect(studio).toContainText("ليست تجميعية");

  await assertMathDirection(page);
  await noPageOverflow(page);
  expect(runtimeErrors).toEqual([]);
});

test("Lesson 3 all 7 interactive textbook missions grade accurately, accept valid muldiv-fill pairs, and persist", async ({ page }) => {
  await page.goto("/Math_7th_Grade/lessons/3?stage=apply");
  await expect(page.locator("#lesson-content h2")).toHaveText("طبّق");
  const tabs = page.getByRole("tablist", { name: "مهمات تمارين الكتاب" }).getByRole("tab");
  await expect(tabs).toHaveCount(7);

  const selectMission = async (name: RegExp, key: string) => {
    await tabs.filter({ hasText: name }).click();
    const card = page.locator(`[data-practice-key="${key}"]`);
    await expect(card).toBeVisible();
    return card;
  };
  const submitAndPass = async (key: string) => {
    const card = page.locator(`[data-practice-key="${key}"]`);
    await card.getByRole("button", { name: "تحقّق من خطواتي", exact: true }).click();
    await expect(card.locator("[data-practice-feedback]")).toHaveClass(/is-correct/);
  };

  // 1. muldiv-warmup + verify solution gate before/after attempt
  let card = page.locator('[data-practice-key="muldiv-warmup"]');
  const warmupTable = card.locator('table[aria-label="جدول انطلاقة نشطة التفاعلي للضرب والقسمة"]');
  await expect(warmupTable).toBeVisible();
  await expect(warmupTable.locator("tbody tr")).toHaveCount(5);
  await expect(card.getByRole("button", { name: "الحل خطوة بخطوة", exact: true })).toBeDisabled();

  // Wrong attempt unlocks solution
  for (const [id, key] of [
    ["r1", "B"],
    ["r2", "A"],
    ["r3", "C"],
    ["r4", "C"],
    ["r5", "C"],
  ]) {
    await card.getByRole("button", { name: new RegExp(`^${id}: الخيار ${key}`) }).click();
  }
  await card.getByRole("button", { name: "تحقّق من خطواتي", exact: true }).click();
  await expect(card.locator("[data-practice-feedback]")).toHaveClass(/needs-work/);
  await expect(card.getByRole("button", { name: "الحل خطوة بخطوة", exact: true })).toBeEnabled();

  // Correct warmup answers
  for (const [id, key] of [
    ["r1", "A"],
    ["r2", "C"],
    ["r3", "B"],
    ["r4", "A"],
    ["r5", "A"],
  ]) {
    await card.getByRole("button", { name: new RegExp(`^${id}: الخيار ${key}`) }).click();
  }
  await submitAndPass("muldiv-warmup");

  // 2. muldiv-signs
  card = await selectMission(/تعيين إشارة الناتج/, "muldiv-signs");
  await card.getByRole("button", { name: "إشارة (-5) × (+8): إشارة سالبة (−)", exact: true }).click();
  await card.getByRole("button", { name: "إشارة 9 × (-48): إشارة سالبة (−)", exact: true }).click();
  await card.getByRole("button", { name: "إشارة (-16) ÷ (-8): إشارة موجبة (+)", exact: true }).click();
  await card.getByRole("button", { name: "إشارة 145 ÷ (-5): إشارة سالبة (−)", exact: true }).click();
  await submitAndPass("muldiv-signs");

  // 3. muldiv-calc-a
  card = await selectMission(/المجموعة A/, "muldiv-calc-a");
  for (const [label, val] of [
    ["A — (1)", "-12"],
    ["A — (2)", "-6"],
    ["A — (3)", "+8"],
  ]) {
    await card.getByRole("textbox", { name: label, exact: true }).fill(val);
  }
  await submitAndPass("muldiv-calc-a");

  // 4. muldiv-calc-b
  card = await selectMission(/المجموعة B/, "muldiv-calc-b");
  for (const [label, val] of [
    ["B — (1)", "-9"],
    ["B — (2)", "0"],
    ["B — (3)", "-10"],
  ]) {
    await card.getByRole("textbox", { name: label, exact: true }).fill(val);
  }
  await submitAndPass("muldiv-calc-b");

  // 5. muldiv-calc-c
  card = await selectMission(/المجموعة C/, "muldiv-calc-c");
  for (const [label, val] of [
    ["C — (1)", "120"],
    ["C — (2)", "8"],
    ["C — (3)", "0"],
  ]) {
    await card.getByRole("textbox", { name: label, exact: true }).fill(val);
  }
  await submitAndPass("muldiv-calc-c");

  // 6. muldiv-fill (first test wrong pair (+1)(-2), then valid alternative pair (-1)(-2))
  card = await selectMission(/املأ الفراغات/, "muldiv-fill");
  await card.getByRole("textbox", { name: "فراغ المساواة (1)", exact: true }).fill("1");
  await card.getByRole("textbox", { name: "فراغ المساواة (2)", exact: true }).fill("-5");
  await card.getByRole("textbox", { name: "الفراغ الأول في (3)", exact: true }).fill("1");
  await card.getByRole("textbox", { name: "الفراغ الثاني في (3)", exact: true }).fill("-2");
  await card.getByRole("textbox", { name: "فراغ المساواة (4)", exact: true }).fill("0");
  await card.getByRole("button", { name: "تحقّق من خطواتي", exact: true }).click();
  await expect(card.locator("[data-practice-feedback]")).toHaveClass(/needs-work/);

  await card.getByRole("textbox", { name: "الفراغ الأول في (3)", exact: true }).fill("-1");
  await card.getByRole("textbox", { name: "الفراغ الثاني في (3)", exact: true }).fill("-2");
  await submitAndPass("muldiv-fill");

  // 7. muldiv-understand
  card = await selectMission(/فهمك وتعليل/, "muldiv-understand");
  await card.getByRole("button", { name: "q1: الخيار A", exact: true }).click();
  await card.getByRole("button", { name: "q2: الخيار B", exact: true }).click();
  await card.getByRole("button", { name: "q3: الخيار C", exact: true }).click();
  await submitAndPass("muldiv-understand");

  // All 7 completed and persisted across reload
  await expect(page.locator(".practice-trail-counter bdi")).toContainText("7 / 7");
  await expect(page.locator(".practice-trail-finish")).toBeVisible();
  await page.reload();
  await expect(page.locator(".practice-trail-counter bdi")).toContainText("7 / 7");
  await assertMathDirection(page);
  await noPageOverflow(page);
});

test("Lesson 3 Student Notebook saves notes across reload and prints all 4 sheets", async ({ page }) => {
  await page.goto("/Math_7th_Grade/lessons/3?stage=notebook");
  await expect(page.locator("#lesson-content h2")).toHaveText("دفتر الطالب");
  await expect(page.getByRole("tablist", { name: "أوراق دفتر الطالب" }).getByRole("tab")).toHaveCount(4);
  await expect(page.locator('[data-student-copybook] [data-block-kind="summary"]')).toHaveCount(0);

  const note = page.getByRole("textbox", { name: "ملاحظتي: قاعدة إشارتي الضرب والقسمة", exact: true });
  await note.fill("إشارتان متفقتان تعطي موجبًا، وإشارتان مختلفتان تعطي سالبًا.");
  await page.locator(".copybook-sheet.is-current").getByRole("checkbox").check();
  await page.reload();
  await expect(note).toHaveValue("إشارتان متفقتان تعطي موجبًا، وإشارتان مختلفتان تعطي سالبًا.");
  await expect(page.locator(".copybook-sheet.is-current").getByRole("checkbox")).toBeChecked();

  await page.emulateMedia({ media: "print" });
  const sheets = page.locator("[data-notebook-sheet]");
  await expect(sheets).toHaveCount(4);
  for (let i = 0; i < 4; i++) await expect(sheets.nth(i)).toBeVisible();
  await page.emulateMedia({ media: "screen" });
  await assertMathDirection(page);
  await assertExerciseOnlyCitations(page);
  await noPageOverflow(page);
});

test("Lesson 3 original 10-question quiz grades 10/10 and updates all 5 skill mastery cards", async ({ page }) => {
  await page.goto("/Math_7th_Grade/quizzes/lesson/3");
  await expect(page.getByText("تحدٍّ جديد · نفس المهارات")).toBeVisible();

  const submit = page.getByRole("button", { name: "تسليم الاختبار وإظهار النتيجة" });
  await expect(submit).toBeDisabled();

  for (let i = 0; i < bank.questions.length; i++) {
    const q = bank.questions[i];
    const section = page.locator(`[data-quiz-question="${i + 1}"]`);
    if (q.type === "mcq") await section.getByRole("button").nth(Number(q.answer)).click();
    else if (q.type === "truefalse") await section.getByRole("button", { name: q.answer === "true" ? "صح" : "خطأ", exact: true }).click();
    else await section.getByRole("textbox").fill(q.answer);
  }

  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.getByTestId("quiz-score")).toHaveText("10 / 10");

  // Verify skill mastery map on /student/
  await page.goto("/Math_7th_Grade/student/");
  await expect(page.locator("[data-skill]")).toHaveCount(41);
  for (const key of Object.keys(bank.skills)) {
    const card = page.locator(`[data-skill="${key}"]`);
    await expect(card).toHaveAttribute("data-status", "mastered");
    await expect(card).toHaveAttribute("data-evidence", "2/2");
  }
  await assertMathDirection(page);
});
