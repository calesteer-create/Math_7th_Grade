import { readFileSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";
import { type OriginalAssessment } from "../../src/lib/assessment";
import { hasSourcePage } from "../../src/lib/math-text";
import { RATIONAL_ASCENDING_ORDER } from "../../src/lib/rational-numbers";

const bank = JSON.parse(readFileSync("src/content/assessments/rational-numbers.json", "utf8")) as OriginalAssessment;
const practice = JSON.parse(readFileSync("src/content/practice/rational-numbers.json", "utf8")) as {
  exercises: { key: string; expected: Record<string, string> }[];
};
const expected = Object.fromEntries(practice.exercises.map(exercise => [exercise.key, exercise.expected]));

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

async function submitAndPass(page: Page, key: string) {
  const card = page.locator(`[data-practice-key="${key}"]`);
  await card.getByRole("button", { name: "تحقّق من خطواتي", exact: true }).click();
  await expect(card.locator("[data-practice-feedback]")).toHaveClass(/is-correct/);
}

test("Lesson 4 opens with 9 stages, 4 precise book figures, 5 guided explain tabs, and no page overflow", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", error => runtimeErrors.push(error.message));

  await page.goto("/Math_7th_Grade/lessons/4");
  await expect(page.locator(".lesson-hero h1")).toHaveText("الأعداد العادية");
  await expect(page.getByRole("navigation", { name: "مراحل الدرس" }).getByRole("button")).toHaveCount(9);
  await expect(page.getByRole("navigation", { name: "مراحل الدرس" }).getByRole("button").last()).toContainText("دفتر الطالب");

  await stage(page, "اكتشف المفهوم");
  const warmupFig = page.locator('[data-book-figure="rationalWarmup"]');
  await expect(warmupFig).toBeVisible();
  await expect(warmupFig).toContainText("مساواة القيمة");
  await expect(warmupFig).toContainText("الصورة القياسية");
  const nestingFig = page.locator('[data-book-figure="rationalSetNesting"]');
  await expect(nestingFig).toBeVisible();
  await expect(nestingFig.locator('[data-diagram-math="true"]')).toHaveCount(3);
  const diagramLabels = await nestingFig.locator('[data-diagram-math="true"] .katex-html').allInnerTexts();
  expect(diagramLabels.join(" ")).toMatch(/Q/);
  expect(diagramLabels.join(" ")).toMatch(/Z/);
  expect(diagramLabels.join(" ")).toMatch(/N/);
  expect(diagramLabels.join(" ")).not.toContain("mathbb");
  await expect(nestingFig.locator(".katex-error")).toHaveCount(0);
  await warmupFig.getByRole("button", { name: /تكبير رسم/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await stage(page, "الشرح التفصيلي");
  const tabs = page.getByRole("tablist", { name: "أفكار الشرح الموسّع" }).getByRole("tab");
  await expect(tabs).toHaveCount(5);
  for (let i = 0; i < 5; i++) {
    await tabs.nth(i).click();
    await expect(tabs.nth(i)).toHaveAttribute("aria-selected", "true");
    if (i === 2) {
      await expect(page.locator('[data-book-figure="rationalNumberLine"]')).toBeVisible();
      await expect(page.locator('[data-book-figure="rationalCheckLine"]')).toBeVisible();
    }
    await assertMathDirection(page);
    await assertExerciseOnlyCitations(page);
    await noPageOverflow(page);
  }

  expect(await page.locator("body").innerText()).not.toMatch(/[\u0660-\u0669\u06f0-\u06f9]/);
  expect(runtimeErrors).toEqual([]);
});

test("Lesson 4 studio proves the definition, line, comparison, ordering, and decimal conversion across all 5 modes", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", error => runtimeErrors.push(error.message));

  await page.goto("/Math_7th_Grade/lessons/4?stage=lab");
  await expect(page.locator("#lesson-content h2")).toHaveText("المختبر التفاعلي");
  const studio = page.locator('[data-rational-studio="true"]');
  await expect(studio.getByRole("tablist", { name: "أدوات مختبر الأعداد العادية" }).getByRole("tab")).toHaveCount(5);

  // 1) Builder: 5/4 = 1.25 and 0/5 is also an integer.
  await studio.getByRole("tab", { name: "بانِي العدد العادي" }).click();
  await studio.getByRole("button", { name: "5/4", exact: true }).click();
  await expect(studio.locator('[data-studio-builder-result="true"]')).toContainText("1.25");
  await studio.getByRole("button", { name: "0/5", exact: true }).click();
  await expect(studio.locator('[data-studio-builder-result="true"]')).toContainText("عدد صحيح");

  // 2) Line: 5/4 is between 1 and 2; -14/3 is between -5 and -4 and is drawn left of zero.
  await studio.getByRole("tab", { name: "على مستقيم الأعداد" }).click();
  const line = studio.locator('[data-rational-studio-line="true"]');
  await expect(line).toBeVisible();
  await expect(studio.getByRole("status")).toContainText("بين");
  await studio.getByRole("button", { name: "-14/3", exact: true }).click();
  await expect(studio.getByRole("status")).toContainText("-5");
  await expect(studio.getByRole("status")).toContainText("-4");
  await expect(line.locator('[data-studio-point="true"]')).toHaveAttribute("cx", /^[0-9.]+$/);

  // 3) Compare: -13/15 > -19/21 via common denominator 105, and a positive beats zero.
  await studio.getByRole("tab", { name: "قارن عددين" }).click();
  await expect(studio.locator('[data-studio-compare-result="true"]')).toContainText("105");
  await expect(studio.locator('[data-studio-compare-result="true"]')).toContainText(">");
  await studio.getByRole("button", { name: "-1/2 مقابل 0", exact: true }).click();
  await expect(studio.locator('[data-studio-compare-result="true"]')).toContainText("الصفر أكبر");

  // 4) Order: interactively place training 1 in ascending order and verify.
  await studio.getByRole("tab", { name: "رتّب مجموعة أعداد" }).click();
  const given = studio.getByText("الأعداد المعطاة — انقر عليها بالترتيب المطلوب:").locator("..").locator("button");
  for (const value of RATIONAL_ASCENDING_ORDER) {
    const needle = value.replace("+", "");
    await given.filter({ hasText: needle }).first().click();
  }
  await studio.getByRole("button", { name: "تحقّق من ترتيبي", exact: true }).click();
  await expect(studio.locator('[data-studio-order-result="true"]')).toContainText("ترتيب صحيح تمامًا");

  // 5) Decimal: 17/4 = 4.25, and typing 0.03 yields a denominator of 100.
  await studio.getByRole("tab", { name: "بين الكسر والعشري" }).click();
  await expect(studio.locator('[data-studio-decimal-result="true"]')).toContainText("4.25");
  await studio.getByRole("textbox", { name: "عدد عشري لتحويله إلى كسر" }).fill("0.03");
  await expect(studio.locator('[role="status"]').nth(1)).toContainText("0.03");
  await expect(studio.locator('[role="status"]').nth(1)).toContainText("100");

  await assertMathDirection(page);
  await noPageOverflow(page);
  expect(runtimeErrors).toEqual([]);
});

test("Lesson 4 all 7 textbook missions grade accurately, guide wrong attempts, gate solutions, and persist", async ({ page }) => {
  await page.goto("/Math_7th_Grade/lessons/4?stage=apply");
  await expect(page.locator("#lesson-content h2")).toHaveText("طبّق");
  const tabs = page.getByRole("tablist", { name: "مهمات تمارين الكتاب" }).getByRole("tab");
  await expect(tabs).toHaveCount(7);

  const selectMission = async (name: RegExp, key: string) => {
    await tabs.filter({ hasText: name }).click();
    const card = page.locator(`[data-practice-key="${key}"]`);
    await expect(card).toBeVisible();
    return card;
  };

  // 1) Warmup: a deliberate wrong attempt is guided, then C, B, A, B passes.
  let card = await selectMission(/انطلاقة نشطة/, "rat-warmup");
  await expect(card).toContainText("مساواة القيمة");
  await expect(card).toContainText("الصورة القياسية");
  await expect(card.getByRole("button", { name: "الحل خطوة بخطوة", exact: true })).toBeDisabled();
  await card.getByRole("button", { name: /تلميح صغير/ }).click();
  await expect(card.locator(".practice-hints li")).toHaveCount(1);
  for (const [i, choice] of ["B", "C", "B", "A"].entries()) {
    await card.getByRole("group").nth(i).getByRole("button", { name: new RegExp(`^${choice}:`) }).click();
  }
  await card.getByRole("button", { name: "تحقّق من خطواتي", exact: true }).click();
  await expect(card.locator("[data-practice-feedback]")).toHaveClass(/needs-work/);
  await expect(card.getByRole("button", { name: "الحل خطوة بخطوة", exact: true })).toBeEnabled();
  for (const [i, choice] of ["C", "B", "A", "B"].entries()) {
    await card.getByRole("group").nth(i).getByRole("button", { name: new RegExp(`^${choice}:`) }).click();
  }
  await submitAndPass(page, "rat-warmup");
  await card.getByRole("button", { name: "الحل خطوة بخطوة", exact: true }).click();
  await expect(card.locator("[data-practice-solution]")).toBeVisible();

  // 2) Integers as fractions: -14/2 and 36/3.
  card = await selectMission(/من العدد الصحيح إلى الكسر/, "rat-represent");
  const represent = card.getByRole("textbox");
  for (const [i, value] of ["-14", "2", "36", "3"].entries()) await represent.nth(i).fill(value);
  await submitAndPass(page, "rat-represent");

  // 3) Decimals as fractions: 35/10, 425/100, 3/100.
  card = await selectMission(/من العدد العشري إلى الكسر/, "rat-decimal");
  const decimalInputs = card.getByRole("textbox");
  for (const [i, value] of ["35", "425", "3"].entries()) await decimalInputs.nth(i).fill(value);
  await submitAndPass(page, "rat-decimal");

  // 4) Check-line: D, G, C, F, H, E placed left to right.
  card = await selectMission(/تحقق من فهمك/, "rat-line");
  const slots = card.getByRole("button", { name: /^ضع بطاقة في الموضع/ });
  for (const [i, letter] of ["D", "G", "C", "F", "H", "E"].entries()) {
    await card.getByRole("button", { name: `بطاقة ${letter}`, exact: true }).click();
    await slots.nth(i).click();
  }
  await submitAndPass(page, "rat-line");

  // 5) Compare: <, <, <, >, >.
  card = await selectMission(/مقارنة الأعداد العادية/, "rat-compare");
  const pairs = card.getByRole("group");
  for (const [i, symbol] of ["<", "<", "<", ">", ">"].entries()) {
    const label = symbol === "<" ? /^أصغر من:/ : /^أكبر من:/;
    await pairs.nth(i).getByRole("button", { name: label }).click();
  }
  await submitAndPass(page, "rat-compare");

  // 6) Training 1 ascending.
  card = await selectMission(/تدريب 1/, "rat-order-asc");
  let drops = card.getByRole("button", { name: /^ضع عددًا في/ });
  for (const [i, value] of Object.entries(expected["rat-order-asc"]).map(entry => entry[1]).entries()) {
    await card.getByRole("button", { name: `بطاقة ${value}`, exact: true }).click();
    await drops.nth(i).click();
  }
  await submitAndPass(page, "rat-order-asc");

  // 7) Training 2 descending.
  card = await selectMission(/تدريب 2/, "rat-order-desc");
  drops = card.getByRole("button", { name: /^ضع عددًا في/ });
  for (const [i, value] of Object.entries(expected["rat-order-desc"]).map(entry => entry[1]).entries()) {
    await card.getByRole("button", { name: `بطاقة ${value}`, exact: true }).click();
    await drops.nth(i).click();
  }
  await submitAndPass(page, "rat-order-desc");

  await expect(page.locator(".practice-trail-counter bdi")).toContainText("7 / 7");
  await page.reload();
  await expect(page.locator(".practice-trail-counter bdi")).toContainText("7 / 7");
  await page.goto("/Math_7th_Grade/student/");
  await expect(page.locator('[data-lesson-status="4"]')).toContainText("30/50");
  await expect(page.locator('[data-stat="points"] b')).toHaveText("30");
  await assertMathDirection(page);
  await noPageOverflow(page);
});

test("Lesson 4 notebook saves a private note across reload and prints exactly its 4 lesson sheets", async ({ page }) => {
  await page.goto("/Math_7th_Grade/lessons/4?stage=notebook");
  await expect(page.locator("#lesson-content h2")).toHaveText("دفتر الطالب");
  await expect(page.getByRole("tablist", { name: "أوراق دفتر الطالب" }).getByRole("tab")).toHaveCount(4);
  await expect(page.locator('[data-student-copybook] [data-block-kind="summary"]')).toHaveCount(0);

  const note = page.getByRole("textbox", { name: /ملاحظتي: العدد العادي/ });
  await note.fill("كل عدد صحيح عدد عادي لأنه يكتب على شكل كسر مقامه 1، والمقام لا يكون صفرًا.");
  await page.locator(".copybook-sheet.is-current").getByRole("checkbox").check();
  await page.reload();
  await expect(note).toHaveValue("كل عدد صحيح عدد عادي لأنه يكتب على شكل كسر مقامه 1، والمقام لا يكون صفرًا.");
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

test("Lesson 4 original 10-question quiz scores 10/10 and masters all 5 skills with 2 evidences each", async ({ page }) => {
  await page.goto("/Math_7th_Grade/quizzes/lesson/4");
  await expect(page.getByText(/جديد · نفس المهارات/)).toBeVisible();
  await expect(page.locator("[data-quiz-question]")).toHaveCount(10);

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

  await page.goto("/Math_7th_Grade/student/");
  await expect(page.locator("[data-skill]")).toHaveCount(31);
  for (const key of Object.keys(bank.skills)) {
    const card = page.locator(`[data-skill="${key}"]`);
    await expect(card).toHaveAttribute("data-status", "mastered");
    await expect(card).toHaveAttribute("data-evidence", "2/2");
  }
  await expect(page.locator('[data-stat="points"] b')).toHaveText("20");
  await expect(page.locator('[data-lesson-status="4"]')).toContainText("20/50");
  await expect(page.locator('[data-badge="earned"]').first()).toBeVisible();
  await assertMathDirection(page);
  await noPageOverflow(page);
});
