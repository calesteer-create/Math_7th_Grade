import { test, expect, type Page } from "@playwright/test";

const BASE = "/Math_7th_Grade";

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
}

test("Lesson 11 renders all stages, parallel/transversal figures, and 6 guided explain tabs without overflow at laptop viewports", async ({ page }) => {
  const errors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", msg => { if (msg.type() === "error") consoleErrors.push(msg.text()); });

  for (const vp of [{ width: 1366, height: 768 }, { width: 1920, height: 1080 }]) {
    await page.setViewportSize(vp);
    await page.goto(BASE + "/lessons/11/");
    await expect(page.locator("#lesson-content h2")).toHaveText("التهيئة والاستكشاف");
    await expect(page.locator('[data-book-figure="plWarmupAngles"] svg[role="img"]')).toBeVisible();
    await noOverflow(page);
  }

  await page.setViewportSize({ width: 1366, height: 768 });
  await page.getByRole("button", { name: /اكتشف المفهوم/ }).click();
  await expect(page.locator('[data-book-figure="plSymmetryTransversal"] svg[role="img"]')).toBeVisible();
  await noOverflow(page);

  await page.getByRole("button", { name: /الشرح التفصيلي/ }).click();
  const tabs = page.getByRole("tablist", { name: "أفكار الشرح الموسّع" }).getByRole("tab");
  await expect(tabs).toHaveCount(6);
  await tabs.nth(1).click();
  await expect(page.locator('[data-book-figure="plVerticalAdjacent"] svg[role="img"]')).toBeVisible();
  await tabs.nth(4).click();
  await expect(page.locator('[data-book-figure="plConsecutiveProof"] svg[role="img"]')).toBeVisible();
  await expect(page.locator('[data-book-figure="plCheckAngleA"] svg[role="img"]')).toBeVisible();
  await noOverflow(page);

  expect(errors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("Lesson 11 ParallelLinesStudio responds live across all 4 tabs", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(BASE + "/lessons/11/?stage=lab");
  const studio = page.locator('[data-studio="parallel-lines"]');
  await expect(studio).toBeVisible();
  await expect(studio.locator('svg[role="img"]')).toBeVisible();

  await studio.getByRole("tab", { name: "مستقيمان وقاطع" }).click();
  await expect(studio.locator('svg[role="img"]')).toBeVisible();
  await studio.getByRole("tab", { name: "إثبات التوازي" }).click();
  await expect(studio.locator('svg[role="img"]')).toBeVisible();
  await studio.getByRole("tab", { name: "المستقيم المساعد" }).click();
  await expect(studio.locator('svg[role="img"]')).toBeVisible();
  await noOverflow(page);
  expect(errors).toEqual([]);
});

test("Lesson 11 practice grades auxiliary-line angle calculation and persists progress", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(BASE + "/lessons/11/?stage=apply");
  const tabs = page.getByRole("tablist", { name: "مهمات تمارين الكتاب" }).getByRole("tab");
  await expect(tabs).toHaveCount(7);

  // Switch to task 6: pl-train-find-m (70, 107, 23, 113)
  await tabs.nth(5).click();
  const card = page.locator('[data-practice-key="pl-train-find-m"]');
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: /تلميح/ }).click();
  await expect(card.locator("ol li")).toHaveCount(1);

  const inputs = card.getByRole("textbox");
  await inputs.nth(0).fill("70");
  await inputs.nth(1).fill("107");
  await inputs.nth(2).fill("23");
  await inputs.nth(3).fill("113");
  await card.getByRole("button", { name: "تحقّق من خطواتي", exact: true }).click();
  await expect(card.locator("[data-practice-feedback]")).toHaveClass(/is-correct/);
  await expect(page.locator(".practice-trail-counter bdi")).toContainText("1 / 7");

  await page.reload();
  await expect(page.locator(".practice-trail-counter bdi")).toContainText("1 / 7");
});

test("Lesson 11 notebook has 4 writing sheets and quiz exposes 10 original questions cleanly", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 1366, height: 768 });

  await page.goto(BASE + "/lessons/11/?stage=notebook");
  await expect(page.locator("[data-student-copybook]")).toBeVisible();
  await expect(page.getByRole("tablist", { name: "أوراق دفتر الطالب" }).getByRole("tab")).toHaveCount(4);
  await noOverflow(page);

  await page.goto(BASE + "/quizzes/lesson/11/");
  await expect(page.locator("[data-quiz-question]")).toHaveCount(10);
  await noOverflow(page);
  expect(errors).toEqual([]);
});
