import { readFileSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";
import { type OriginalAssessment } from "../../src/lib/assessment";
import { hasSourcePage } from "../../src/lib/math-text";

const bank = JSON.parse(readFileSync("src/content/assessments/integers-add-sub.json", "utf8")) as OriginalAssessment;

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

test("Lesson 2 loads cleanly with all 6 explain tabs, zoomable figures, and isolated KaTeX", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", error => runtimeErrors.push(error.message));

  await page.goto("/Math_7th_Grade/lessons/2");
  await expect(page.locator(".lesson-hero h1")).toHaveText("الأعداد الصحيحة (الجمع والطرح)");
  await expect(page.getByRole("navigation", { name: "مراحل الدرس" }).getByRole("button")).toHaveCount(9);
  await expect(page.getByRole("navigation", { name: "مراحل الدرس" }).getByRole("button").last()).toContainText("دفتر الطالب");

  // figure in intro
  const setsLine = page.locator('[data-book-figure="intSetsLine"]');
  await expect(setsLine).toBeVisible();
  const zoomBtn = setsLine.getByRole("button", { name: /تكبير رسم/ });
  await zoomBtn.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  // stage: discover
  await stage(page, "اكتشف المفهوم");
  await expect(page.locator('[data-book-figure="intOpposites"]')).toBeVisible();
  await page.locator('[data-practice-key="game-paths"]').getByText("الشكل الأصلي للكتاب", { exact: true }).click();
  await expect(page.locator('[data-book-figure="intGamePaths"]')).toBeVisible();

  // stage: explain (6 guided tabs)
  await stage(page, "الشرح التفصيلي");
  const tabs = page.getByRole("tablist", { name: "أفكار الشرح الموسّع" }).getByRole("tab");
  await expect(tabs).toHaveCount(6);
  for (let i = 0; i < 6; i++) {
    await tabs.nth(i).click();
    await expect(tabs.nth(i)).toHaveAttribute("aria-selected", "true");
    await assertMathDirection(page);
    await assertExerciseOnlyCitations(page);
    await noPageOverflow(page);
  }

  expect(await page.locator("body").innerText()).not.toMatch(/[\u0660-\u0669\u06f0-\u06f9]/);
  expect(runtimeErrors).toEqual([]);
});

test("Lesson 2 interactive IntegersStudio responds accurately across all 4 modes", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", error => runtimeErrors.push(error.message));

  await page.goto("/Math_7th_Grade/lessons/2?stage=lab");
  await expect(page.locator("#lesson-content h2")).toHaveText("المختبر التفاعلي");

  // 1. Explorer tab
  const studio = page.locator('[data-integers-studio="true"]');
  await studio.getByRole("tab", { name: "المعاكس والبُعد" }).click();
  const slider = studio.getByRole("slider", { name: "اختيار العدد الصحيح" });
  await slider.fill("-4");
  await expect(studio.locator('[role="status"]').first()).toContainText("سالب تمامًا");

  // 2. Add/Sub tab
  await studio.getByRole("tab", { name: "الجمع والطرح على المستقيم" }).click();
  await studio.getByRole("button", { name: "مثال طرح 2", exact: true }).click();
  await expect(studio.locator('[data-studio-result="true"]')).toContainText("نحوّل الطرح إلى جمع المعاكس");
  await expect(studio.locator('[data-studio-result="true"]')).toContainText("الطرح ليس تبديليًا");

  // اختبار التبديل مع القيمة -7 دون قص
  await studio.getByRole("button", { name: "تبديل العددين", exact: true }).click();
  await expect(studio.getByRole("slider", { name: "العدد الأول في العملية" })).toHaveValue("-7");
  await expect(studio.getByRole("slider", { name: "العدد الثاني في العملية" })).toHaveValue("-2");
  await expect(studio.locator('[data-studio-result="true"]')).toContainText("(-7)");

  // 3. Game paths tab
  await studio.getByRole("tab", { name: "لعبة المسارات" }).click();
  const gameStatus = studio.locator('[role="status"]');
  await expect(gameStatus).toContainText("0 / 4");
  await expect(gameStatus).not.toContainText("أكبر مجموع");

  // استكشاف المسارات الأربعة خطوة بخطوة
  await studio.getByRole("button", { name: "المرحلة 2: -6 (علوي)", exact: true }).click();
  await studio.getByRole("button", { name: "المرحلة 3: +2 (علوي)", exact: true }).click(); // مسار 1
  await expect(gameStatus).toContainText("1 / 4");

  await studio.getByRole("button", { name: "المرحلة 3: +5 (وسط)", exact: true }).click(); // مسار 2
  await expect(gameStatus).toContainText("2 / 4");

  await studio.getByRole("button", { name: "المرحلة 2: -4 (سفلي)", exact: true }).click();
  await studio.getByRole("button", { name: "المرحلة 3: +5 (وسط)", exact: true }).click(); // مسار 3
  await expect(gameStatus).toContainText("3 / 4");

  await studio.getByRole("button", { name: "المرحلة 3: +2 (سفلي)", exact: true }).click(); // مسار 4
  await expect(gameStatus).toContainText("4 / 4");
  await expect(gameStatus).toContainText("أكبر مجموع");

  // 4. Short notation tab
  await studio.getByRole("tab", { name: "الكتابة المختزلة" }).click();
  await studio.getByRole("button", { name: /مثال الكتاب/ }).click();
  await assertMathDirection(page);
  await noPageOverflow(page);
  expect(runtimeErrors).toEqual([]);
});

test("Lesson 2 all 8 interactive textbook missions grade accurately, gate solutions, and persist", async ({ page }) => {
  await page.goto("/Math_7th_Grade/lessons/2?stage=apply");
  await expect(page.locator("#lesson-content h2")).toHaveText("طبّق");
  const tabs = page.getByRole("tablist", { name: "مهمات تمارين الكتاب" }).getByRole("tab");
  await expect(tabs).toHaveCount(8);

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

  // 1. int-warmup + verify direct table visibility + solution gate before/after attempt
  let card = page.locator('[data-practice-key="int-warmup"]');
  const warmupTable = card.locator('table[aria-label="جدول انطلاقة نشطة التفاعلي"]');
  await expect(warmupTable).toBeVisible();
  await expect(warmupTable.locator("thead th")).toContainText(["A", "B", "C"]);
  await expect(warmupTable.locator("tbody tr")).toHaveCount(3);
  await expect(card.getByRole("button", { name: "الحل خطوة بخطوة", exact: true })).toBeDisabled();
  await card.getByRole("button", { name: /تلميح صغير/ }).click();
  await expect(card.locator(".practice-hints")).toBeVisible();
  await expect(card.getByRole("button", { name: "الحل خطوة بخطوة", exact: true })).toBeDisabled();

  // Wrong attempt unlocks coaching solution
  await card.getByRole("button", { name: /^temp: الخيار B/ }).click();
  await card.getByRole("button", { name: /^coordM: الخيار A/ }).click();
  await card.getByRole("button", { name: /^distG: الخيار B/ }).click();
  await card.getByRole("button", { name: "تحقّق من خطواتي", exact: true }).click();
  await expect(card.locator("[data-practice-feedback]")).toHaveClass(/needs-work/);
  await expect(card.getByRole("button", { name: "الحل خطوة بخطوة", exact: true })).toBeEnabled();

  // Now answer correctly
  await card.getByRole("button", { name: /^temp: الخيار A/ }).click();
  await card.getByRole("button", { name: /^coordM: الخيار C/ }).click();
  await card.getByRole("button", { name: /^distG: الخيار C/ }).click();
  await submitAndPass("int-warmup");

  // 2. game-paths
  card = await selectMission(/مسارات لعبة الحاسوب/, "game-paths");
  for (const [label, val] of [
    ["نتيجة المسار 1", "-2"],
    ["نتيجة المسار 2", "+1"],
    ["نتيجة المسار 3", "3"],
    ["نتيجة المسار 4", "0"],
  ]) {
    await card.getByRole("textbox", { name: label, exact: true }).fill(val);
  }
  await card.getByRole("button", { name: "اختيار المسار 3 كأكبر مجموع", exact: true }).click();
  await submitAndPass("game-paths");

  // 3. elevator-sub
  card = await selectMission(/المصعد والغواصة/, "elevator-sub");
  await card.getByRole("textbox", { name: "العدد الصحيح لمكان المصعد", exact: true }).fill("+4");
  await card.getByRole("textbox", { name: "العدد الصحيح لارتفاع الغواصة عن سطح البحر", exact: true }).fill("-25");
  await submitAndPass("elevator-sub");

  // 4. calc-ab
  card = await selectMission(/المجموعتان/, "calc-ab");
  for (const [label, val] of [
    ["A — (1)", "-4"],
    ["A — (2)", "-8"],
    ["A — (3)", "-6"],
    ["B — (1)", "10"],
    ["B — (2)", "-14"],
    ["B — (3)", "-20"],
  ]) {
    await card.getByRole("textbox", { name: label, exact: true }).fill(val);
  }
  await submitAndPass("calc-ab");

  // 5. calc-c
  card = await selectMission(/المجموعة C/, "calc-c");
  for (const [label, val] of [
    ["C — (1)", "-1"],
    ["C — (2)", "0"],
    ["C — (3)", "-44"],
  ]) {
    await card.getByRole("textbox", { name: label, exact: true }).fill(val);
  }
  await submitAndPass("calc-c");

  // 6. match-short
  card = await selectMission(/مطابقة الصيغة المختزلة/, "match-short");
  const matchPairs: [string, string][] = [
    ["9 - 3", "m1"],
    ["-4 + 7", "m2"],
    ["-6 - 2", "m3"],
    ["9 + 3", "m4"],
    ["6 + 2", "m5"],
  ];
  for (const [cardTex, fieldKey] of matchPairs) {
    await card.getByRole("button", { name: `بطاقة ${cardTex}`, exact: true }).click();
    await card.locator(`[data-drop-field="${fieldKey}"] button`).click();
  }
  await submitAndPass("match-short");

  // 7. line-ops
  card = await selectMission(/الحركة على مستقيم الأعداد/, "line-ops");
  await card.getByRole("button", { name: /ناتج العملية \(a\):.*تعيين الناتج عند -3$/ }).click();
  await card.getByRole("button", { name: /ناتج العملية \(b\):.*تعيين الناتج عند 0$/ }).click();
  await card.getByRole("button", { name: /ناتج العملية \(c\):.*تعيين الناتج عند 3$/ }).click();
  await submitAndPass("line-ops");

  // 8. int-reasoning
  card = await selectMission(/التفكير والتعليل الرياضي/, "int-reasoning");
  await card.getByRole("button", { name: "counter: الخيار B", exact: true }).click();
  await card.getByRole("button", { name: "whyComm: الخيار B", exact: true }).click();
  await card.getByRole("button", { name: "whyAssoc: الخيار B", exact: true }).click();
  await submitAndPass("int-reasoning");

  // All 8 completed and persisted across reload
  await expect(page.locator(".practice-trail-counter bdi")).toContainText("8 / 8");
  await expect(page.locator(".practice-trail-finish")).toBeVisible();
  await page.reload();
  await expect(page.locator(".practice-trail-counter bdi")).toContainText("8 / 8");
  await assertMathDirection(page);
  await noPageOverflow(page);
});

test("Lesson 2 Student Notebook saves notes across reload and prints all 4 sheets", async ({ page }) => {
  await page.goto("/Math_7th_Grade/lessons/2?stage=notebook");
  await expect(page.locator("#lesson-content h2")).toHaveText("دفتر الطالب");
  await expect(page.getByRole("tablist", { name: "أوراق دفتر الطالب" }).getByRole("tab")).toHaveCount(4);
  await expect(page.locator('[data-student-copybook] [data-block-kind="summary"]')).toHaveCount(0);

  const note = page.getByRole("textbox", { name: "ملاحظتي: الأعداد الصحيحة والعددان المتعاكسان", exact: true });
  await note.fill("المسافة عن الصفر موجبة دائمًا، ومجموع المتعاكسين يساوي صفر.");
  await page.locator(".copybook-sheet.is-current").getByRole("checkbox").check();
  await page.reload();
  await expect(note).toHaveValue("المسافة عن الصفر موجبة دائمًا، ومجموع المتعاكسين يساوي صفر.");
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

test("Lesson 2 original 10-question quiz grades 10/10 and updates all 5 skill mastery cards", async ({ page }) => {
  await page.goto("/Math_7th_Grade/quizzes/lesson/2");
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
  await expect(page.locator("[data-skill]")).toHaveCount(10);
  for (const key of Object.keys(bank.skills)) {
    const card = page.locator(`[data-skill="${key}"]`);
    await expect(card).toHaveAttribute("data-status", "mastered");
    await expect(card).toHaveAttribute("data-evidence", "2/2");
  }
  await assertMathDirection(page);
});
