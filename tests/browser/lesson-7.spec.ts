import { test, expect, type Page } from "@playwright/test";

const BASE = "/Math_7th_Grade";

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
}

test("Lesson 7 renders all stages, book figures, and 6 guided explain tabs without overflow at laptop viewports", async ({ page }) => {
  const errors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", msg => { if (msg.type() === "error") consoleErrors.push(msg.text()); });

  for (const vp of [{ width: 1366, height: 768 }, { width: 1920, height: 1080 }]) {
    await page.setViewportSize(vp);
    await page.goto(BASE + "/lessons/7/");
    await expect(page.locator("#lesson-content h2")).toHaveText("التهيئة والاستكشاف");
    await noOverflow(page);
  }

  await page.setViewportSize({ width: 1366, height: 768 });
  await page.getByRole("button", { name: /اكتشف المفهوم/ }).click();
  await expect(page.locator('[data-book-figure="envelopesModels"]')).toBeVisible();
  await expect(page.locator('[data-book-figure="expressionAnatomy"]')).toBeVisible();
  await expect(page.locator('[data-book-figure="envelopesAddition"]')).toBeVisible();
  await noOverflow(page);

  await page.getByRole("button", { name: /الشرح التفصيلي/ }).click();
  const tabs = page.getByRole("tablist", { name: "أفكار الشرح الموسّع" }).getByRole("tab");
  await expect(tabs).toHaveCount(6);
  await tabs.nth(3).click();
  await expect(page.locator("#lesson-content")).toContainText("خاصّة التوزيع");
  await tabs.nth(5).click();
  await expect(page.locator("#lesson-content")).toContainText("العبارة");
  await noOverflow(page);

  expect(errors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("Lesson 7 AlgebraStudio responds live across its four interactive tabs", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(BASE + "/lessons/7/?stage=lab");
  const studio = page.locator("[data-algebra-studio]");
  await expect(studio).toBeVisible();
  await expect(studio.locator("[data-algebra-eval-result]")).toContainText("103");

  // Switch to like-terms combining tab
  await studio.getByRole("tab", { name: "الحدود المتشابهة" }).click();
  await expect(studio.locator("[data-algebra-combine-result]")).toContainText("5x");

  // Switch to distribution tab
  await studio.getByRole("tab", { name: "خاصّة التوزيع" }).click();
  await expect(studio.locator("[data-algebra-dist-result]")).toContainText("14x");

  // Switch to translation tab
  await studio.getByRole("tab", { name: "من النص إلى العبارة" }).click();
  await expect(studio.locator("[data-algebra-translate-result]")).toBeVisible();
  await noOverflow(page);
  expect(errors).toEqual([]);
});

test("Lesson 7 practice grades answers, reveals progressive hints, and persists progress", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(BASE + "/lessons/7/?stage=apply");
  const tabs = page.getByRole("tablist", { name: "مهمات تمارين الكتاب" }).getByRole("tab");
  await expect(tabs).toHaveCount(8);

  // Open the triangle perimeter task (alg-train-triangle)
  await tabs.nth(6).click();
  const card = page.locator('[data-practice-key="alg-train-triangle"]');
  await expect(card).toBeVisible();

  // Request first progressive hint
  await card.getByRole("button", { name: /تلميح/ }).click();
  await expect(card.locator("ol li")).toHaveCount(1);

  // Submit wrong answer first -> feedback explains mistake
  await card.getByRole("group").first().getByRole("button").nth(1).click();
  await card.getByRole("textbox").fill("10");
  await card.getByRole("button", { name: "تحقّق من خطواتي", exact: true }).click();
  await expect(card.locator("[data-practice-feedback]")).not.toHaveClass(/is-correct/);

  // Submit correct answer -> passes and increments counter
  await card.getByRole("group").first().getByRole("button").nth(0).click();
  await card.getByRole("textbox").fill("18");
  await card.getByRole("button", { name: "تحقّق من خطواتي", exact: true }).click();
  await expect(card.locator("[data-practice-feedback]")).toHaveClass(/is-correct/);
  await expect(page.locator(".practice-trail-counter bdi")).toContainText("1 / 8");

  // Reload confirms persistence
  await page.reload();
  await expect(page.locator(".practice-trail-counter bdi")).toContainText("1 / 8");
});

test("Lesson 7 notebook has 4 sheets and quiz exposes 10 original questions cleanly", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 1366, height: 768 });

  await page.goto(BASE + "/lessons/7/?stage=notebook");
  await expect(page.locator("[data-student-copybook]")).toBeVisible();
  await expect(page.getByRole("tablist", { name: "أوراق دفتر الطالب" }).getByRole("tab")).toHaveCount(4);
  await noOverflow(page);

  await page.goto(BASE + "/quizzes/lesson/7/");
  await expect(page.locator("[data-quiz-question]")).toHaveCount(10);
  await noOverflow(page);
  expect(errors).toEqual([]);
});
