import { test, expect, type Page } from "@playwright/test";

const BASE = "/Math_7th_Grade";

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
}

test("Unit 1 exercises are reachable from the unit page and cover all 25 cards", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(BASE + "/units/1/");
  const link = page.getByRole("link", { name: /تمرينات الوحدة/ });
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/\/units\/1\/exercises\//);
  await expect(page.locator("[data-unit-exercise]")).toHaveCount(25);
  await expect(page.locator("[data-unit-progress]")).toHaveText("0 / 25");
  await noOverflow(page);
  expect(errors).toEqual([]);
});

test("Filtering by skill narrows the list without losing the exercise identity", async ({ page }) => {
  await page.goto(BASE + "/units/1/exercises/");
  const all = page.locator("[data-unit-exercise]");
  await expect(all).toHaveCount(25);
  await page.getByRole("button", { name: /العمليات على الأعداد الصحيحة/ }).click();
  await expect(page.locator("[data-unit-exercise]")).toHaveCount(7);
  await expect(page.locator('[data-unit-exercise="u1-08"]')).toBeVisible();
  await expect(page.locator('[data-unit-exercise="u1-01"]')).toHaveCount(0);
  await page.getByRole("button", { name: /كل التمرينات/ }).click();
  await expect(page.locator("[data-unit-exercise]")).toHaveCount(25);
});

test("A unit exercise grades exactly, guides a wrong attempt, and reveals the reference solution", async ({ page }) => {
  await page.goto(BASE + "/units/1/exercises/");
  const card = page.locator('[data-unit-exercise="u1-08"]');
  await card.scrollIntoViewIfNeeded();
  const inputs = card.getByRole("textbox");
  await expect(inputs).toHaveCount(4);

  await card.getByRole("button", { name: /تلميح/ }).click();
  await expect(card.locator("ol li")).toHaveCount(1);

  for (const [index, value] of ["-7", "-8", "9", "12"].entries()) await inputs.nth(index).fill(value);
  await card.getByRole("button", { name: /تحقّق من إجابتي/ }).click();
  await expect(card.locator("[data-unit-feedback]")).toHaveAttribute("data-unit-feedback", "wrong");
  await expect(card.locator("[data-unit-feedback]")).toContainText("الإشارة سالبة");

  for (const [index, value] of ["-9", "-3", "-2", "20"].entries()) await inputs.nth(index).fill(value);
  await card.getByRole("button", { name: /تحقّق من إجابتي/ }).click();
  await expect(card.locator("[data-unit-feedback]")).toHaveAttribute("data-unit-feedback", "correct");
  await expect(page.locator("[data-unit-progress]")).toHaveText("1 / 25");

  await card.getByRole("button", { name: /الحل المرجعي/ }).click();
  await expect(card.locator("[data-unit-solution]")).toBeVisible();
  await expect(card.locator("[data-unit-solution]")).toContainText("الحل المرجعي خطوة بخطوة");
});

test("Unit exercises never touch lesson progress or local storage", async ({ page }) => {
  await page.goto(BASE + "/units/1/exercises/");
  const before = await page.evaluate(() => Object.keys(localStorage).sort());
  const card = page.locator('[data-unit-exercise="u1-01"]');
  await card.scrollIntoViewIfNeeded();
  const groups = card.getByRole("group");
  for (const [index, choice] of ["1", "3", "7", "9", "12"].entries()) {
    await groups.nth(index).getByRole("button", { name: choice, exact: true }).click();
  }
  await card.getByRole("button", { name: /تحقّق من إجابتي/ }).click();
  await expect(card.locator("[data-unit-feedback]")).toHaveAttribute("data-unit-feedback", "correct");
  const after = await page.evaluate(() => Object.keys(localStorage).sort());
  expect(after).toEqual(before);
  expect(after.filter(key => key.startsWith("math7"))).toEqual([]);
  await page.reload();
  await expect(page.locator("[data-unit-progress]")).toHaveText("0 / 25");
});

test("Page reload keeps the exercise data server-rendered with no API requests", async ({ page }) => {
  const api: string[] = [];
  page.on("request", request => { if (new URL(request.url()).pathname.includes("/api/")) api.push(request.url()); });
  await page.goto(BASE + "/units/1/exercises/");
  await page.reload();
  await expect(page.locator("[data-unit-exercise]")).toHaveCount(25);
  expect(api).toEqual([]);
});
