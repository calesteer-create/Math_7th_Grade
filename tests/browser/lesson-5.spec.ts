import { test, expect, type Page } from "@playwright/test";

const BASE = "/Math_7th_Grade";

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
}

test("Lesson 5 opens with all stages, six explain tabs, exact math, and no runtime errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(BASE + "/lessons/5");
  await expect(page.locator("#lesson-content h2")).toHaveText("التهيئة والاستكشاف");
  await expect(page.locator(".journey-step")).toHaveCount(9);
  await page.getByRole("button", { name: /الشرح التفصيلي/ }).click();
  const tabs = page.getByRole("tablist", { name: "أفكار الشرح الموسّع" }).getByRole("tab");
  await expect(tabs).toHaveCount(6);
  await tabs.nth(1).click();
  await expect(page.locator("#lesson-content")).toContainText("31500000");
  await expect(page.locator("#lesson-content")).toContainText("3.15");
  await tabs.nth(4).click();
  await expect(page.locator("#lesson-content")).toContainText("مقلوب");
  await noOverflow(page);
  expect(errors).toEqual([]);
});

test("Lesson 5 lab computes scientific notation, powers, fractions and decimals from controls", async ({ page }) => {
  await page.goto(BASE + "/lessons/5?stage=lab");
  const studio = page.locator("[data-operations-studio]");
  await expect(studio).toBeVisible();
  await expect(studio.locator("[data-sci-result]")).toContainText("3.15");
  await studio.getByRole("textbox", { name: "عدد للتحويل إلى الترميز العلمي" }).fill("629450000000");
  await expect(studio.locator("[data-sci-result]")).toContainText("6.2945");
  await expect(studio.locator("[data-sci-result]")).toContainText("11");

  await studio.getByRole("tab", { name: "قوى العشرة" }).click();
  await expect(studio.locator("[data-power-result]")).toContainText("1000");

  await studio.getByRole("tab", { name: "العمليات الأربع" }).click();
  await expect(studio.locator("[data-frac-result]")).toContainText("+");
  await expect(studio.locator("[data-frac-result]")).toContainText("11");
  await studio.getByRole("button", { name: "قسمة", exact: true }).click();
  await expect(studio.locator("[data-frac-result]")).toContainText("16");

  await studio.getByRole("tab", { name: "الفاصلة العشرية" }).click();
  await expect(studio.locator("[data-decimal-result]")).toContainText("76.346");
  await studio.getByRole("button", { name: "ضرب", exact: true }).click();
  await expect(studio.locator("[data-decimal-result]")).toBeVisible();
});

test("Lesson 5 practice grades exact answers, explains mistakes, and persists after reload", async ({ page }) => {
  await page.goto(BASE + "/lessons/5?stage=apply");
  const tabs = page.getByRole("tablist", { name: "مهمات تمارين الكتاب" }).getByRole("tab");
  await expect(tabs).toHaveCount(13);

  await tabs.filter({ hasText: /من العدد إلى الترميز العلمي/ }).click();
  const card = page.locator('[data-practice-key="op-sci-sun"]');
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: "0.15", exact: true }).click();
  await card.getByRole("textbox", { name: "أس العشرة" }).fill("8");
  await card.getByRole("button", { name: "تحقّق من خطواتي", exact: true }).click();
  await expect(card.locator("[data-practice-feedback]")).toHaveClass(/needs-work/);
  await expect(card.locator("[data-practice-feedback]")).toContainText("العامل");
  await card.getByRole("button", { name: "1.5", exact: true }).click();
  await card.getByRole("button", { name: "تحقّق من خطواتي", exact: true }).click();
  await expect(card.locator("[data-practice-feedback]")).toHaveClass(/is-correct/);

  await tabs.filter({ hasText: /جمع وطرح بمقامات متساوية/ }).click();
  const fractions = page.locator('[data-practice-key="op-addsub-same"]');
  const inputs = fractions.getByRole("textbox");
  for (const [index, value] of ["1", "11", "-4", "9"].entries()) await inputs.nth(index).fill(value);
  await fractions.getByRole("button", { name: "تحقّق من خطواتي", exact: true }).click();
  await expect(fractions.locator("[data-practice-feedback]")).toHaveClass(/is-correct/);
  await expect(page.locator(".practice-trail-counter bdi")).toContainText("2 / 13");

  await page.reload();
  await expect(page.locator(".practice-trail-counter bdi")).toContainText("2 / 13");

  await page.goto(BASE + "/student/");
  await expect(page.locator('[data-lesson-status="5"]')).toContainText("10/50");
});

test("Lesson 5 notebook keeps four writing sheets and the shared copybook intact", async ({ page }) => {
  await page.goto(BASE + "/lessons/5?stage=notebook");
  await expect(page.locator("[data-student-copybook]")).toBeVisible();
  const tabs = page.getByRole("tablist", { name: "أوراق دفتر الطالب" }).getByRole("tab");
  await expect(tabs).toHaveCount(4);
  await page.getByRole("tab", { name: /الترميز العلمي/ }).click();
  await expect(page.locator('[data-notebook-sheet="sci-notation-sheet"]')).toContainText("150000000");
  await page.getByRole("tab", { name: /قواعد العمليات الأربع/ }).click();
  await expect(page.locator('[data-notebook-sheet="operations-rules-sheet"]')).toContainText("المقلوب");
  await noOverflow(page);
});

test("Lesson 5 quiz exposes 12 new questions and the shared grading flow", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(BASE + "/quizzes/lesson/5/");
  const questions = page.locator("[data-quiz-question]");
  await expect(questions).toHaveCount(12);
  await expect(page.locator("[data-quiz-question]").first()).toContainText("640000");
  await page.reload();
  await expect(questions).toHaveCount(12);
  expect(errors).toEqual([]);
});
