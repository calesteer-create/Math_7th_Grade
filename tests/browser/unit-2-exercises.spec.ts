import { test, expect, type Page } from "@playwright/test";

const BASE = "/Math_7th_Grade";

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
}

test("Unit 2 exercises are reachable from /units/2/ and render all 14 cards and 3 figures cleanly", async ({ page }) => {
  const errors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", msg => { if (msg.type() === "error") consoleErrors.push(msg.text()); });

  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(BASE + "/units/2/");
  const link = page.getByRole("link", { name: /تمرينات الوحدة الثانية/ });
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/\/units\/2\/exercises\//);
  await expect(page.locator("[data-unit-exercise]")).toHaveCount(14);
  await expect(page.locator("[data-unit-progress]")).toHaveText("0 / 14");

  // Verify the three Unit 2 visual figures render cleanly
  await expect(page.locator('[data-unit-figure="u2-rect-perimeter"]')).toBeVisible();
  await expect(page.locator('[data-unit-figure="u2-cycle-diagram"]')).toBeVisible();
  await expect(page.locator('[data-unit-figure="u2-cuboid-tank"]')).toBeVisible();
  await noOverflow(page);

  await page.setViewportSize({ width: 1920, height: 1080 });
  await noOverflow(page);

  expect(errors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("Unit 2 skill filters narrow cards accurately and return to all 14", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(BASE + "/units/2/exercises/");
  await expect(page.locator("[data-unit-exercise]")).toHaveCount(14);

  await page.getByRole("button", { name: /التحقّق وحلّ المعادلات وتطبيقاتها/ }).click();
  await expect(page.locator("[data-unit-exercise]")).toHaveCount(4);
  await expect(page.locator('[data-unit-exercise="u2-09"]')).toBeVisible();
  await expect(page.locator('[data-unit-exercise="u2-12"]')).toBeVisible();
  await expect(page.locator('[data-unit-exercise="u2-01a"]')).toHaveCount(0);

  await page.getByRole("button", { name: /كل التمرينات/ }).click();
  await expect(page.locator("[data-unit-exercise]")).toHaveCount(14);
});

test("Unit 2 exercise grades wrong and right attempts, shows progressive hints and reference solution, and never writes localStorage", async ({ page }) => {
  const api: string[] = [];
  page.on("request", request => { if (new URL(request.url()).pathname.includes("/api/")) api.push(request.url()); });

  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(BASE + "/units/2/exercises/");
  const beforeStorage = await page.evaluate(() => Object.keys(localStorage).sort());

  const card = page.locator('[data-unit-exercise="u2-11"]');
  await card.scrollIntoViewIfNeeded();
  const inputs = card.getByRole("textbox");
  await expect(inputs).toHaveCount(4);

  // Progressive hint
  await card.getByRole("button", { name: /تلميح/ }).click();
  await expect(card.locator("ol li")).toHaveCount(1);

  // Wrong attempt
  for (const [i, v] of ["-1", "20", "-5", "-160"].entries()) await inputs.nth(i).fill(v);
  await card.getByRole("button", { name: /تحقّق من إجابتي/ }).click();
  await expect(card.locator("[data-unit-feedback]")).toHaveAttribute("data-unit-feedback", "wrong");

  // Correct attempt
  for (const [i, v] of ["-23", "20", "-5", "160"].entries()) await inputs.nth(i).fill(v);
  await card.getByRole("button", { name: /تحقّق من إجابتي/ }).click();
  await expect(card.locator("[data-unit-feedback]")).toHaveAttribute("data-unit-feedback", "correct");
  await expect(page.locator("[data-unit-progress]")).toHaveText("1 / 14");

  // Reference solution
  await card.getByRole("button", { name: /الحل المرجعي/ }).click();
  await expect(card.locator("[data-unit-solution]")).toBeVisible();

  // Confirm ZERO localStorage keys created & zero API calls
  const afterStorage = await page.evaluate(() => Object.keys(localStorage).sort());
  expect(afterStorage).toEqual(beforeStorage);
  expect(afterStorage.filter(key => key.startsWith("math7"))).toEqual([]);
  expect(api).toEqual([]);

  // Reload resets progress (not persisted)
  await page.reload();
  await expect(page.locator("[data-unit-progress]")).toHaveText("0 / 14");
});
