import { test, expect, type Page } from "@playwright/test";

const BASE = "/Math_7th_Grade";

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
}

test("Lesson 6 renders all stages with six guided ideas and the quadrant figure", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(BASE + "/lessons/6");
  await expect(page.locator("#lesson-content h2")).toHaveText("التهيئة والاستكشاف");
  await page.getByRole("button", { name: /اكتشف المفهوم/ }).click();
  await expect(page.locator("[data-book-figure]")).toHaveCount(2);
  await expect(page.locator('[data-book-figure="coordinateAxes"]')).toContainText("محور الفواصل");
  await page.getByRole("button", { name: /الشرح التفصيلي/ }).click();
  const tabs = page.getByRole("tablist", { name: "أفكار الشرح الموسّع" }).getByRole("tab");
  await expect(tabs).toHaveCount(6);
  await tabs.nth(3).click();
  await expect(page.locator("#lesson-content")).toContainText("(+,+)");
  await tabs.nth(5).click();
  await expect(page.locator("#lesson-content")).toContainText("ليست في أي ربع");
  await noOverflow(page);
  expect(errors).toEqual([]);
});

test("Lesson 6 coordinate lab reflects slider changes, quadrants, and correct plotting", async ({ page }) => {
  await page.goto(BASE + "/lessons/6?stage=lab");
  const studio = page.locator("[data-coordinate-studio]");
  await expect(studio).toBeVisible();
  await expect(studio.locator("[data-coordinate-result]")).toContainText("الربع الأول");

  const xSlider = studio.locator('input[aria-label="الفاصلة x (أفقيًا)"]');
  await xSlider.focus();
  await xSlider.press("Home");
  for (let step = 0; step < 3; step++) await xSlider.press("ArrowRight");
  await expect(studio.locator("[data-coordinate-result]")).toContainText("-2");
  await expect(studio.locator("[data-coordinate-result]")).toContainText("الربع الثاني");

  await studio.getByRole("button", { name: "E(0,−3)", exact: true }).click();
  await expect(studio.locator("[data-coordinate-result]")).toContainText("محور الترتيب");

  await studio.getByRole("button", { name: "O(0,0)", exact: true }).click();
  await expect(studio.locator("[data-coordinate-result]")).toContainText("المبدأ");

  await studio.getByRole("tab", { name: "الأرباع والإشارات" }).click();
  await studio.getByRole("button", { name: /الربع الثالث/ }).click();
  await expect(studio.locator("[role=status]")).toContainText("(-,-)");

  await studio.getByRole("tab", { name: "عيّن النقطة" }).click();
  const grid = studio.locator("[data-plot-grid]");
  const box = await grid.boundingBox();
  if (!box) throw new Error("شبكة التعيين غير ظاهرة");
  // النقطة A(3,3) داخل مجال −5..5: حساب الموضع في الإطار ثم في الصفحة.
  const scale = (380 - 68) / 10;
  const px = 190 + 3 * scale;
  const py = 190 - 3 * scale;
  await grid.click({ position: { x: (px / 380) * box.width, y: (py / 380) * box.height } });
  await expect(studio.locator('[data-plot-feedback="correct"]')).toBeVisible();
  await expect(studio.locator("[data-plot-feedback]")).toContainText("الربع الأول");
});

test("Lesson 6 practice reads coordinates, classifies points, and persists", async ({ page }) => {
  await page.goto(BASE + "/lessons/6?stage=apply");
  const tabs = page.getByRole("tablist", { name: "مهمات تمارين الكتاب" }).getByRole("tab");
  await expect(tabs).toHaveCount(6);

  await tabs.filter({ hasText: /النقطتين a وb/ }).click();
  const card = page.locator('[data-practice-key="cp-read-a"]');
  const inputs = card.getByRole("textbox");
  await expect(inputs).toHaveCount(4);
  for (const [index, value] of ["3", "3", "-2", "1"].entries()) await inputs.nth(index).fill(value);
  await card.getByRole("button", { name: "تحقّق من خطواتي", exact: true }).click();
  await expect(card.locator("[data-practice-feedback]")).toHaveClass(/is-correct/);

  await tabs.filter({ hasText: /الربع أو المحور \(1\)/ }).click();
  const quadrant = page.locator('[data-practice-key="cp-quadrant-1"]');
  const groups = quadrant.getByRole("group");
  for (const [index, name] of ["الربع الأول", "الربع الثاني", "الربع الرابع", "الربع الثالث"].entries()) {
    await groups.nth(index).getByRole("button", { name, exact: true }).click();
  }
  await quadrant.getByRole("button", { name: "تحقّق من خطواتي", exact: true }).click();
  await expect(quadrant.locator("[data-practice-feedback]")).toHaveClass(/is-correct/);
  await expect(page.locator(".practice-trail-counter bdi")).toContainText("2 / 6");

  await page.reload();
  await expect(page.locator(".practice-trail-counter bdi")).toContainText("2 / 6");
  await page.goto(BASE + "/student/");
  await expect(page.locator('[data-lesson-status="6"]')).toContainText("10/50");
});

test("Lesson 6 notebook has four sheets drawn from the book concepts", async ({ page }) => {
  await page.goto(BASE + "/lessons/6?stage=notebook");
  await expect(page.locator("[data-student-copybook]")).toBeVisible();
  await expect(page.getByRole("tablist", { name: "أوراق دفتر الطالب" }).getByRole("tab")).toHaveCount(4);
  await page.getByRole("tab", { name: /الأرباع وإشاراتها/ }).click();
  await expect(page.locator('[data-notebook-sheet="quadrants-sheet"]')).toContainText("(+,-)");
  await page.getByRole("tab", { name: /قراءة النقط وتعيينها/ }).click();
  await expect(page.locator('[data-notebook-sheet="reading-points-sheet"]')).toContainText("M(-2,3)");
  await noOverflow(page);
});

test("Lesson 6 quiz exposes 11 questions without breaking the shared player", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(BASE + "/quizzes/lesson/6/");
  await expect(page.locator("[data-quiz-question]")).toHaveCount(11);
  await expect(page.locator("[data-quiz-question]").first()).toContainText("محور الترتيب");
  expect(errors).toEqual([]);
});
