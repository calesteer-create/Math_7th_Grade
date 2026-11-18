import { test, expect } from "@playwright/test";

test("mobile deep links, client navigation and local interactions need no API", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const apiRequests: string[] = [];
  const errors: string[] = [];
  page.on("request", request => { if (new URL(request.url()).pathname.includes("/api/")) apiRequests.push(request.url()); });
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/Math_7th_Grade/lessons/1/?stage=apply");
  await expect(page.locator("#lesson-content h2")).toHaveText("طبّق");
  const card = page.locator('[data-practice-key="count-five"]');
  await card.getByRole("button", { name: "اختر المجموعة A" }).click();
  await card.getByRole("button", { name: "تحقّق من خطواتي" }).click();
  await expect(card.locator("[data-practice-feedback]")).toHaveClass(/is-correct/);
  await page.reload();
  await expect(page.locator('[data-practice-key="count-five"] .practice-completed')).toBeVisible();
  await page.goto("/Math_7th_Grade/quizzes/lesson/1/");
  await expect(page.locator("[data-quiz-question]")).toHaveCount(8);
  await page.reload();
  await expect(page.locator("[data-quiz-question]")).toHaveCount(8);
  await page.goto("/Math_7th_Grade/units/1/");
  await page.getByRole("link", { name: /الأعداد الطبيعية/ }).first().click();
  await expect(page).toHaveURL(/\/Math_7th_Grade\/lessons\/1\//);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
  expect(apiRequests).toEqual([]);
  expect(errors).toEqual([]);
});

test("practice remains usable if local storage is blocked", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new Error("storage blocked"); } });
  });
  await page.goto("/Math_7th_Grade/lessons/1/?stage=apply");
  const card = page.locator('[data-practice-key="count-five"]');
  await card.getByRole("button", { name: "اختر المجموعة A" }).click();
  await card.getByRole("button", { name: "تحقّق من خطواتي" }).click();
  await expect(card.locator("[data-practice-feedback]")).toHaveClass(/is-correct/);
  await expect(card.getByRole("alert")).toContainText("تعذر الحفظ");
  await card.getByRole("button", { name: "الحل خطوة بخطوة" }).click();
  await expect(card.locator("[data-practice-solution]")).toBeVisible();
});
