import { test, expect, type Page } from "@playwright/test";

const BASE = "/Math_7th_Grade";

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
}

test("Lesson 10 renders all stages, area figures, and 6 guided explain tabs without overflow at laptop viewports", async ({ page }) => {
  const errors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", msg => { if (msg.type() === "error") consoleErrors.push(msg.text()); });

  for (const vp of [{ width: 1366, height: 768 }, { width: 1920, height: 1080 }]) {
    await page.setViewportSize(vp);
    await page.goto(BASE + "/lessons/10/");
    await expect(page.locator("#lesson-content h2")).toHaveText("التهيئة والاستكشاف");
    await noOverflow(page);
  }

  await page.setViewportSize({ width: 1366, height: 768 });
  await page.getByRole("button", { name: /اكتشف المفهوم/ }).click();
  await expect(page.locator('[data-book-figure="areaCutPaste"] svg[role="img"]')).toBeVisible();
  await expect(page.locator('[data-book-figure="areaUnitMismatch"] svg[role="img"]')).toBeVisible();
  await noOverflow(page);

  await page.getByRole("button", { name: /الشرح التفصيلي/ }).click();
  const tabs = page.getByRole("tablist", { name: "أفكار الشرح الموسّع" }).getByRole("tab");
  await expect(tabs).toHaveCount(6);
  await expect(page.locator('[data-book-figure="areaTwoHeights"] svg[role="img"]')).toBeVisible();
  await tabs.nth(3).click();
  await expect(page.locator('[data-book-figure="areaWorkedExample"] svg[role="img"]')).toBeVisible();
  await noOverflow(page);

  expect(errors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("Lesson 10 ParallelogramAreaStudio responds live across all 4 tabs", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(BASE + "/lessons/10/?stage=lab");
  const studio = page.locator('[data-studio="parallelogram-area"]');
  await expect(studio).toBeVisible();
  await expect(studio.locator('svg[role="img"]')).toBeVisible();

  await studio.getByRole("tab", { name: "طريقتا المساحة والارتفاعان" }).click();
  await expect(studio.locator('svg[role="img"]')).toBeVisible();
  await studio.getByRole("tab", { name: "البعد المجهول والواحدات" }).click();
  await expect(studio).toContainText("4.00");
  await studio.getByLabel("الواحدة الموحّدة للحساب:").selectOption("cm");
  await expect(studio).toContainText("30000");
  await studio.getByRole("tab", { name: "المناطق المظلّلة" }).click();
  await expect(studio.locator('svg[role="img"]')).toBeVisible();
  await noOverflow(page);
  expect(errors).toEqual([]);
});

test("Lesson 10 practice grades training area calculations and persists progress", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(BASE + "/lessons/10/?stage=apply");
  const tabs = page.getByRole("tablist", { name: "مهمات تمارين الكتاب" }).getByRole("tab");
  await expect(tabs).toHaveCount(6);

  // Switch to the last task: area-train-four (a=96, b=7.5 m², c=120, d=108)
  await tabs.nth(5).click();
  const card = page.locator('[data-practice-key="area-train-four"]');
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: /تلميح/ }).click();
  await expect(card.locator("ol li")).toHaveCount(1);

  const inputs = card.getByRole("textbox");
  await inputs.nth(0).fill("96");
  await card.locator('[data-choice*="7.5"]').click();
  await inputs.nth(1).fill("120");
  await inputs.nth(2).fill("108");
  await card.getByRole("button", { name: "تحقّق من خطواتي", exact: true }).click();
  await expect(card.locator("[data-practice-feedback]")).toHaveClass(/is-correct/);
  await expect(page.locator(".practice-trail-counter bdi")).toContainText("1 / 6");

  await page.reload();
  await expect(page.locator(".practice-trail-counter bdi")).toContainText("1 / 6");
});

test("Lesson 10 notebook has 4 writing sheets and quiz exposes 10 original questions cleanly", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 1366, height: 768 });

  await page.goto(BASE + "/lessons/10/?stage=notebook");
  await expect(page.locator("[data-student-copybook]")).toBeVisible();
  await expect(page.getByRole("tablist", { name: "أوراق دفتر الطالب" }).getByRole("tab")).toHaveCount(4);
  await noOverflow(page);

  await page.goto(BASE + "/quizzes/lesson/10/");
  await expect(page.locator("[data-quiz-question]")).toHaveCount(10);
  await noOverflow(page);
  expect(errors).toEqual([]);
});
