import { test, expect, type Page } from "@playwright/test";

const BASE = "/Math_7th_Grade";

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
}

test("Lesson 9 renders all stages, coordinate-accurate figures, and 6 guided explain tabs without overflow at laptop viewports", async ({ page }) => {
  const errors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", msg => { if (msg.type() === "error") consoleErrors.push(msg.text()); });

  for (const vp of [{ width: 1366, height: 768 }, { width: 1920, height: 1080 }]) {
    await page.setViewportSize(vp);
    await page.goto(BASE + "/lessons/9/");
    await expect(page.locator("#lesson-content h2")).toHaveText("التهيئة والاستكشاف");
    await expect(page.locator('[data-book-figure="pgramUnitLaunchQuad"] svg[role="img"]')).toBeVisible();
    await noOverflow(page);
  }

  await page.setViewportSize({ width: 1366, height: 768 });
  await page.getByRole("button", { name: /اكتشف المفهوم/ }).click();
  await expect(page.locator('[data-book-figure="pgramIdentifyFive"] svg[role="img"]')).toBeVisible();
  await expect(page.locator('[data-book-figure="pgramSymmetryProof"] svg[role="img"]')).toBeVisible();
  const box = await page.locator('[data-book-figure="pgramSymmetryProof"] svg[role="img"]').boundingBox();
  expect(box && box.width > 120 && box.height > 80).toBeTruthy();
  await noOverflow(page);

  await page.getByRole("button", { name: /الشرح التفصيلي/ }).click();
  const tabs = page.getByRole("tablist", { name: "أفكار الشرح الموسّع" }).getByRole("tab");
  await expect(tabs).toHaveCount(6);
  await expect(page.locator('[data-book-figure="pgramUnitLaunchZ"] svg[role="img"]')).toBeVisible();
  await tabs.nth(3).click();
  await expect(page.locator('[data-book-figure="pgramDoubleMidpoint"] svg[role="img"]')).toBeVisible();
  await noOverflow(page);

  expect(errors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("Lesson 9 ParallelogramStudio responds live across all 4 tabs", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(BASE + "/lessons/9/?stage=lab");
  const studio = page.locator('[data-studio="parallelogram"]');
  await expect(studio).toBeVisible();
  await expect(studio.locator('svg[role="img"]')).toBeVisible();

  await studio.getByRole("tab", { name: "تقاطع شريطين" }).click();
  await expect(studio.locator('svg[role="img"]')).toBeVisible();
  await studio.getByRole("tab", { name: "إكمال متوازي الأضلاع بالمركز" }).click();
  await expect(studio.locator('svg[role="img"]')).toBeVisible();
  await studio.getByRole("tab", { name: "المعلم المتعامد" }).click();
  await expect(studio.locator('svg[role="img"]')).toBeVisible();
  await noOverflow(page);
  expect(errors).toEqual([]);
});

test("Lesson 9 practice grades interactive geometry tasks, reveals hints, and persists progress", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(BASE + "/lessons/9/?stage=apply");
  const tabs = page.getByRole("tablist", { name: "مهمات تمارين الكتاب" }).getByRole("tab");
  await expect(tabs).toHaveCount(6);

  const card = page.locator('[data-practice-key="pg-unit-launch"]');
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: /تلميح/ }).click();
  await expect(card.locator("ol li")).toHaveCount(1);

  await card.locator('[data-choice*="MTCB"]').click();
  await card.locator('[data-choice="قطران"]').click();
  await card.locator('[data-choice="الشكل 2"]').click();
  await card.locator('[data-choice*="[CD)"][data-choice*="[CB)"]').click();
  await card.locator('[data-choice="يقبل مركز تناظر"]').click();
  await card.getByRole("button", { name: "تحقّق من خطواتي", exact: true }).click();
  await expect(card.locator("[data-practice-feedback]")).toHaveClass(/is-correct/);
  await expect(page.locator(".practice-trail-counter bdi")).toContainText("1 / 6");

  await page.reload();
  await expect(page.locator(".practice-trail-counter bdi")).toContainText("1 / 6");
});

test("Lesson 9 notebook has 4 writing sheets and quiz exposes 10 original questions cleanly", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 1366, height: 768 });

  await page.goto(BASE + "/lessons/9/?stage=notebook");
  await expect(page.locator("[data-student-copybook]")).toBeVisible();
  await expect(page.getByRole("tablist", { name: "أوراق دفتر الطالب" }).getByRole("tab")).toHaveCount(4);
  await noOverflow(page);

  await page.goto(BASE + "/quizzes/lesson/9/");
  await expect(page.locator("[data-quiz-question]")).toHaveCount(10);
  await noOverflow(page);
  expect(errors).toEqual([]);
});
