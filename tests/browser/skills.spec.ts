import { test, expect, type Page } from "@playwright/test";

const BASE = "/Math_7th_Grade";
const REV = "natural-book-practice-v1";
const MISSIONS = ["count-five", "place-7430", "twin-fives", "point-eight", "big-place", "neptune-code"];
const solved = { response: {}, attempts: 1, solved: true, hintsShown: 0, solutionViewed: false };
const date = "2026-02-01T09:00:00.000Z";

type Item = { id: number; skill: string; correct: boolean };

/** محاولة مفصّلة: outcomes لكل مهارة بعدد أسئلتها في البنك الحقيقي. */
function attempt(lessonId: number, outcomes: Record<string, boolean[]>, at = date, score?: number) {
  const items: Item[] = [];
  for (const [skill, flags] of Object.entries(outcomes)) for (const correct of flags) items.push({ id: items.length + 1, skill, correct });
  items.forEach((item, index) => { item.id = index + 1; });
  return {
    title: "اختبار درس: الأعداد الطبيعية", score: score ?? items.filter(item => item.correct).length,
    total: items.length, date: at, lessonId, items,
  };
}

async function seed(page: Page, data: Record<string, unknown>) {
  await page.goto(BASE + "/student/");
  await page.evaluate(entries => {
    localStorage.clear();
    for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, JSON.stringify(value));
  }, data);
  await page.goto(BASE + "/student/");
  await expect(page.getByRole("heading", { name: "خريطة مهاراتك" })).toBeVisible();
}

const skill = (page: Page, key: string) => page.locator(`[data-skill="${key}"]`);

test("بطاقة لكل مهارة معلنة بعدد إجاباتها الحقيقي", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await seed(page, { "math7-quiz-attempts": [attempt(1, { "place-value": [true, true, true], writing: [true, true], counting: [true], "number-line": [false], reading: [true] })] });

  await expect(page.locator("[data-skill]")).toHaveCount(15);
  await expect(skill(page, "place-value")).toHaveAttribute("data-evidence", "3/3");
  await expect(skill(page, "writing")).toHaveAttribute("data-evidence", "2/2");
  await expect(skill(page, "counting")).toHaveAttribute("data-evidence", "1/1");
  await expect(skill(page, "reading")).toHaveAttribute("data-status", "insufficient");
  await expect(skill(page, "number-line")).toHaveAttribute("data-status", "insufficient");
  expect(errors).toEqual([]);
});

test("الحالات الخمس تظهر بأسماء وألوان ونصوص مختلفة", async ({ page }) => {
  // لا دليل: reading (لم تُجب). دليل غير كافٍ: counting 1/1. متقنة: place-value 3/3. قيد التثبيت: writing 1/2. مراجعة: number-line لا يمكن (سؤال واحد) ⇒ نستخدم محاولة سابقة.
  await seed(page, {
    "math7-quiz-attempts": [attempt(1, { "place-value": [true, true, true], writing: [true, false], counting: [true], "number-line": [true] })],
  });
  await expect(skill(page, "place-value")).toHaveAttribute("data-status", "mastered");
  await expect(skill(page, "place-value")).toContainText("متقنة");
  await expect(skill(page, "writing")).toHaveAttribute("data-status", "developing");
  await expect(skill(page, "writing")).toContainText("قيد التثبيت");
  await expect(skill(page, "counting")).toHaveAttribute("data-status", "insufficient");
  await expect(skill(page, "counting")).toContainText("دليل غير كافٍ");
  await expect(skill(page, "reading")).toHaveAttribute("data-status", "no-evidence");
  await expect(skill(page, "reading")).toContainText("لا دليل بعد");

  const note = await skill(page, "counting").innerText();
  expect(note).toContain("1 من 1");
  expect(note).toContain("لا تعني ضعفًا");
  const noEvidenceNote = await skill(page, "reading").innerText();
  expect(noEvidenceNote).toContain("ليس ضعفًا");

  const tones = await page.locator("[data-skill]").evaluateAll(nodes => nodes.map(node => {
    const chip = node.querySelector(".chip") as HTMLElement | null;
    return chip ? getComputedStyle(chip).backgroundColor : "";
  }));
  expect(new Set(tones.filter(Boolean)).size).toBeGreaterThanOrEqual(4);
});

test("الأحدث يحلّ محل الأقدم: التراجع يظهر في التصنيف والاتجاه", async ({ page }) => {
  await seed(page, {
    "math7-quiz-attempts": [
      attempt(1, { "place-value": [true, false, false] }, "2026-03-01T09:00:00.000Z"),
      attempt(1, { "place-value": [true, true, true] }, "2026-01-01T09:00:00.000Z"),
    ],
  });
  await expect(skill(page, "place-value")).toHaveAttribute("data-status", "needs-review");
  await expect(skill(page, "place-value")).toHaveAttribute("data-evidence", "1/3");
  await expect(skill(page, "place-value").locator("[data-skill-trend]")).toHaveAttribute("data-skill-trend", "down");
  await expect(skill(page, "place-value")).toContainText("تراجعت");
  // المهارات طبقة عرض فقط: لا نقاط من التفصيل المهاري.
  await expect(page.locator('[data-stat="points"]')).toContainText("0");
});

test("المحاولة القديمة بلا تفصيل لا تُخترع منها مهارات", async ({ page }) => {
  await seed(page, {
    "math7-quiz-attempts": [{ title: "اختبار قديم", score: 8, total: 8, date: "2025-09-01T08:00:00.000Z" }],
  });
  await expect(page.locator("[data-skill]")).toHaveCount(15);
  const statuses = await page.locator("[data-skill]").evaluateAll(nodes => nodes.map(node => node.getAttribute("data-status")));
  expect(statuses.every(status => status === "no-evidence")).toBe(true);
  await expect(page.locator("[data-legacy-attempts]")).toBeVisible();
});

test("تفصيل تالف لا يُسقط الصفحة ولا ينتحل أدلة", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await seed(page, {
    "math7-quiz-attempts": [
      { title: "تالف", score: 8, total: 8, date, lessonId: 1, items: { not: "array" } },
      { title: "ناقص", score: 8, total: 8, date, lessonId: 1, items: [{ id: 1, skill: "place-value", correct: true }] },
    ],
  });
  await expect(page.locator("[data-skill]")).toHaveCount(15);
  await expect(skill(page, "place-value")).toHaveAttribute("data-status", "no-evidence");
  expect(errors).toEqual([]);
});

test("التوجيه يفتح مرحلة موجودة دون منح نقاط أو إتمام", async ({ page }) => {
  // place-value تحتاج مراجعة (1 من 3) ⇒ رابط المراجعة. reading دليل غير كافٍ (1/1) ⇒ رابط الاختبار.
  await seed(page, {
    [`math7-practice-1-${REV}-count-five`]: solved,
    "math7-quiz-attempts": [attempt(1, { "place-value": [true, false, false], writing: [true, true], counting: [true], "number-line": [true], reading: [true] })],
  });
  await expect(skill(page, "place-value")).toHaveAttribute("data-status", "needs-review");
  await expect(skill(page, "reading")).toHaveAttribute("data-status", "insufficient");
  // الدليل غير الكافٍ يُوجَّه إلى الاختبار لتزداد الأدلة، لا إلى المراجعة.
  await expect(skill(page, "reading").getByRole("link")).toHaveAttribute("href", /\/lessons\/1\/\?stage=quiz/);

  // النقاط قبل الزيارة: من تمرين واحد محلول فقط.
  const readPoints = async () => Number((await page.locator('[data-stat="points"]').innerText()).replace(/\D+/g, ""));
  await expect.poll(readPoints).toBe(20);
  const pointsBefore = await readPoints();

  const link = skill(page, "place-value").getByRole("link");
  await expect(link).toHaveAttribute("href", /\/lessons\/1\/\?stage=check/);
  await link.click();
  await expect(page).toHaveURL(/\/lessons\/1\/\?stage=check/);
  await expect(page.locator("#lesson-content h2")).toBeVisible();

  await page.goto(BASE + "/student/");
  // النقاط من التدريب فقط، ولا تتغير بفتح رابط التوجيه.
  await expect.poll(readPoints).toBe(pointsBefore);
  // فتح مرحلة لا يُكمل الدرس.
  await expect(page.locator('[data-stat="completed"]')).toContainText("0");
  // القياس من المحاولة لا من الزيارة.
  await expect(skill(page, "place-value")).toHaveAttribute("data-status", "needs-review");
  await expect(skill(page, "place-value")).toHaveAttribute("data-evidence", "1/3");
});

test("مسار حقيقي: اختبار مُسلَّم من الواجهة يُنشئ أدلة تُقرأ في الخريطة", async ({ page }) => {
  await page.goto(BASE + "/quizzes/lesson/1/");
  const sections = page.locator("[data-quiz-question]");
  await expect(sections).toHaveCount(8);
  for (const section of await sections.all()) {
    const text = section.locator('input[type="text"]');
    if (await text.count()) await text.fill("1");
    else await section.locator("button[aria-pressed]").first().click();
  }
  await page.getByRole("button", { name: "تسليم الاختبار وإظهار النتيجة" }).click();
  await expect(page.locator('[data-testid="quiz-score"]')).toBeVisible();

  // المحاولة المحفوظة تحمل تفصيلًا بالمهارة لكل سؤال من الأسئلة الثمانية.
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("math7-quiz-attempts") ?? "[]"));
  expect(saved).toHaveLength(1);
  const items: Item[] = saved[0].items;
  expect(items).toHaveLength(8);
  expect(items.map(item => item.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  expect(new Set(items.map(item => item.skill))).toEqual(new Set(["place-value", "writing", "counting", "number-line", "reading"]));

  // الخريطة تُبنى من نفس المحاولة: الأدلة والحالات تطابق قواعد القياس.
  await page.goto(BASE + "/student/");
  await expect(page.locator("[data-skill]")).toHaveCount(15);
  const shown = await page.locator("[data-skill]").evaluateAll(nodes => nodes.map(node => ({
    key: node.getAttribute("data-skill"), status: node.getAttribute("data-status"), evidence: node.getAttribute("data-evidence"),
  })));
  let totalEvidence = 0;
  for (const card of shown) {
    const mine = items.filter(item => item.skill === card.key);
    const correct = mine.filter(item => item.correct).length;
    const total = mine.length;
    totalEvidence += total;
    const expected = total === 0 ? "no-evidence" : total < 2 ? "insufficient" : correct * 10 >= total * 8 ? "mastered" : correct * 2 >= total ? "developing" : "needs-review";
    expect({ key: card.key, status: card.status, evidence: card.evidence }).toEqual({ key: card.key, status: expected, evidence: `${correct}/${total}` });
  }
  expect(totalEvidence).toBe(8);
});
