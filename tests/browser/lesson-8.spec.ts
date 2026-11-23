import { test, expect, type Page } from "@playwright/test";

const BASE = "/Math_7th_Grade";

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
}

test("Lesson 8 renders all stages, book figures, and 6 guided explain tabs without overflow at laptop viewports", async ({ page }) => {
  const errors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", msg => { if (msg.type() === "error") consoleErrors.push(msg.text()); });

  for (const vp of [{ width: 1366, height: 768 }, { width: 1920, height: 1080 }]) {
    await page.setViewportSize(vp);
    await page.goto(BASE + "/lessons/8/");
    await expect(page.locator("#lesson-content h2")).toHaveText("التهيئة والاستكشاف");
    await noOverflow(page);
  }

  await page.setViewportSize({ width: 1366, height: 768 });
  await page.getByRole("button", { name: /اكتشف المفهوم/ }).click();
  await expect(page.locator('[data-book-figure="equationBalance"]')).toBeVisible();
  await expect(page.locator('[data-book-figure="divideCoefficientFlow"]')).toBeVisible();
  await noOverflow(page);

  await page.getByRole("button", { name: /الشرح التفصيلي/ }).click();
  const tabs = page.getByRole("tablist", { name: "أفكار الشرح الموسّع" }).getByRole("tab");
  await expect(tabs).toHaveCount(6);
  await tabs.nth(3).click();
  await expect(page.locator("#lesson-content")).toContainText("القاعدة");
  await noOverflow(page);

  expect(errors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("Lesson 8 EquationsStudio responds live across tabs including a = 0 edge cases", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(BASE + "/lessons/8/?stage=lab");
  const studio = page.locator("[data-equations-studio]");
  await expect(studio).toBeVisible();
  await expect(studio.locator("[data-eq-balance-result]")).toContainText("حلّ");

  // Switch to mental solver tab
  await studio.getByRole("tab", { name: "الحلّ الذهني" }).click();
  await expect(studio.locator("[data-eq-mental-result]")).toBeVisible();

  // Switch to ax = c solver tab and test a = 0 edge case button
  await studio.getByRole("tab", { name: "معادلة ax = c" }).click();
  await studio.getByRole("button", { name: /0x = 5/ }).click();
  await expect(studio.locator("[data-eq-axc-result]")).toContainText("لا يوجد عدد نضربه في 0");

  // Switch to problem modeling tab
  await studio.getByRole("tab", { name: "توظيف في مسائل" }).click();
  await expect(studio.locator("[data-eq-problem-result]")).toBeVisible();
  await noOverflow(page);
  expect(errors).toEqual([]);
});

test("Lesson 8 practice grades solution checks, hints, and persists progress", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(BASE + "/lessons/8/?stage=apply");
  const tabs = page.getByRole("tablist", { name: "مهمات تمارين الكتاب" }).getByRole("tab");
  await expect(tabs).toHaveCount(6);

  // First task: eq-check-solutions
  const card = page.locator('[data-practice-key="eq-check-solutions"]');
  await expect(card).toBeVisible();

  // Hint check
  await card.getByRole("button", { name: /تلميح/ }).click();
  await expect(card.locator("ol li")).toHaveCount(1);

  const inputs = card.getByRole("textbox");
  await inputs.nth(0).fill("1");
  await inputs.nth(1).fill("4");
  const groups = card.getByRole("group");
  await groups.nth(0).getByRole("button", { name: "نعم، لأن الطرفين متساويان", exact: true }).click();
  await groups.nth(1).getByRole("button", { name: "لا، لأن 4 لا يساوي 2", exact: true }).click();
  await card.getByRole("button", { name: "تحقّق من خطواتي", exact: true }).click();
  await expect(card.locator("[data-practice-feedback]")).toHaveClass(/is-correct/);
  await expect(page.locator(".practice-trail-counter bdi")).toContainText("1 / 6");

  await page.reload();
  await expect(page.locator(".practice-trail-counter bdi")).toContainText("1 / 6");
});

test("Lesson 8 notebook has 4 sheets and quiz exposes 10 original questions cleanly", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 1366, height: 768 });

  await page.goto(BASE + "/lessons/8/?stage=notebook");
  await expect(page.locator("[data-student-copybook]")).toBeVisible();
  await expect(page.getByRole("tablist", { name: "أوراق دفتر الطالب" }).getByRole("tab")).toHaveCount(4);
  await noOverflow(page);

  await page.goto(BASE + "/quizzes/lesson/8/");
  await expect(page.locator("[data-quiz-question]")).toHaveCount(10);
  await noOverflow(page);
  expect(errors).toEqual([]);
});
