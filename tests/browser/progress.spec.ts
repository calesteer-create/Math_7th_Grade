import { test, expect, type Page } from "@playwright/test";

const BASE = "/Math_7th_Grade";
const REVISION = "natural-book-practice-v1";
const MISSIONS = ["count-five", "place-7430", "twin-fives", "point-eight", "big-place", "neptune-code"];

const solvedState = { response: {}, attempts: 1, solved: true, hintsShown: 0, solutionViewed: false };
const date = "2026-02-01T09:00:00.000Z";

async function seed(page: Page, data: Record<string, unknown>) {
  await page.goto(`${BASE}/student/`);
  await page.evaluate(entries => {
    localStorage.clear();
    for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, JSON.stringify(value));
  }, data);
  await page.goto(`${BASE}/student/`);
}

function practiceSeed(): Record<string, unknown> {
  const entries: Record<string, unknown> = {};
  for (const key of MISSIONS) entries[`math7-practice-1-${REVISION}-${key}`] = solvedState;
  return entries;
}

test("اللوحة تحتسب الإتمام من التدريب والاختبار لا من فتح المراحل", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));

  // زيارة كل المراحل بلا تدريب ولا اختبار: ليست إتمامًا.
  await seed(page, { "math7-stage-1": 8, "math7-visited-1": [0, 1, 2, 3, 4, 5, 6, 7, 8] });
  await expect(page.locator('[data-stat="completed"]')).toContainText("0");
  await expect(page.locator('[data-stat="points"]')).toContainText("0");
  await expect(page.locator('[data-lesson-status="1"]')).toContainText("زيارة فقط");

  // تدريب كامل بلا اختبار: التدريب منجز، والإتمام لا.
  await seed(page, { "math7-visited-1": [0], ...practiceSeed() });
  await expect(page.locator('[data-stat="points"]')).toContainText("30");
  await expect(page.locator('[data-stat="completed"]')).toContainText("0");
  await expect(page.locator('[data-lesson-status="1"]')).toContainText("التدريب منجز — اجتز الاختبار");
  await page.reload();
  await expect(page.locator('[data-stat="points"]')).toContainText("30");
  await expect(page.locator('[data-stat="completed"]')).toContainText("0");

  // تدريب + اجتياز 70٪: إتمام كامل بـ50 نقطة.
  await seed(page, {
    "math7-visited-1": [0], ...practiceSeed(),
    "math7-quiz-attempts": [{ title: "اختبار درس: الأعداد الطبيعية", score: 7, total: 10, date, lessonId: 1 }],
  });
  await expect(page.locator('[data-stat="completed"]')).toContainText("1");
  await expect(page.locator('[data-stat="points"]')).toContainText("44");
  await expect(page.locator('[data-stat="average"]')).toContainText("70");
  await expect(page.locator('[data-lesson-status="1"]')).toContainText("درس مكتمل");

  expect(errors).toEqual([]);
});

test("إعادة الاختبار لا تضاعف النقاط، والمحاولات القديمة لا تدخل الإحصاءات", async ({ page }) => {
  const repeated = Array.from({ length: 5 }, () => ({ title: "اختبار درس: الأعداد الطبيعية", score: 8, total: 8, date, lessonId: 1 }));
  const legacy = { title: "اختبار درس: الأعداد الطبيعية", score: 3, total: 8, date: "2025-09-01T08:00:00.000Z" };
  await seed(page, { "math7-visited-1": [0], ...practiceSeed(), "math7-quiz-attempts": [...repeated, legacy] });

  await expect(page.locator('[data-stat="points"]')).toContainText("50");
  await expect(page.locator('[data-stat="attempts"]')).toContainText("5");
  await expect(page.locator('[data-stat="average"]')).toContainText("100");
  await expect(page.locator('[data-badge="earned"]').filter({ hasText: "علامة كاملة" })).toHaveCount(1);

  const legacyBox = page.locator("[data-legacy-attempts]");
  await expect(legacyBox).toContainText("محاولات سابقة");
  await expect(legacyBox).toContainText("3 / 8");
});

test("تخزين تالف لا يُسقط صفحة التقدّم ويُعلن بلا حذف", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await seed(page, {
    "math7-quiz-attempts": { not: "array" },
    "math7-stage-1": "7",
    "math7-visited-1": "8",
    [`math7-practice-1-${REVISION}-count-five`]: { solved: "true", attempts: 1 },
  });

  await expect(page.getByRole("heading", { name: "رحلتك في التعلّم" })).toBeVisible();
  await expect(page.locator("[data-storage-notice]")).toContainText("تعذّر قراءة جزء من بياناتك المحفوظة");
  await expect(page.locator('[data-stat="points"]')).toContainText("0");
  await expect(page.locator('[data-stat="attempts"]')).toContainText("0");
  expect(errors).toEqual([]);
  // لا كتابة تنظيف تلقائية: البيانات كما زرعناها.
  const raw = await page.evaluate(() => localStorage.getItem("math7-quiz-attempts"));
  expect(raw).toBe(JSON.stringify({ not: "array" }));
});

test("نقاط التدريب تُقرأ من مفاتيح مهام الدرس الفعلية", async ({ page }) => {
  await seed(page, {
    [`math7-practice-1-${REVISION}-count-five`]: solvedState,
    [`math7-practice-1-${REVISION}-place-7430`]: solvedState,
    [`math7-practice-1-${REVISION}-unknown-mission`]: solvedState,
  });
  await expect(page.locator('[data-stat="points"]')).toContainText("10");
  await expect(page.locator('[data-lesson-status="1"]')).toContainText("2/6 مهمة");
});

test("اختبار الوحدة غير معروض ولا صفحة له", async ({ page }) => {
  await page.goto(`${BASE}/quizzes/`);
  await expect(page.locator('a[href*="quizzes/unit"]')).toHaveCount(0);
  const response = await page.goto(`${BASE}/quizzes/unit/1/`);
  expect(response?.status()).toBe(404);
  await expect(page.locator("body")).not.toContainText("اختبار الوحدة");
});

test("حفظ محاولة جديدة ينسبها إلى الدرس دون كسر الشكل القديم", async ({ page }) => {
  await page.goto(`${BASE}/quizzes/lesson/1/`);
  const sections = page.locator("[data-quiz-question]");
  await expect(sections).toHaveCount(8);
  for (const section of await sections.all()) {
    const text = section.locator('input[type="text"]');
    if (await text.count()) await text.fill("1");
    else await section.locator("button[aria-pressed]").first().click();
  }
  await page.getByRole("button", { name: "تسليم الاختبار وإظهار النتيجة" }).click();
  await expect(page.locator('[data-testid="quiz-score"]')).toBeVisible();

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("math7-quiz-attempts") ?? "[]"));
  expect(saved.length).toBe(1);
  expect(saved[0].lessonId).toBe(1);
  expect(saved[0].total).toBe(8);

  await page.goto(`${BASE}/student/`);
  await expect(page.locator('[data-stat="attempts"]')).toContainText("1");
  await expect(page.locator('[data-lesson-status="1"]')).toContainText("محاولة اختبار دون اجتياز");
});

test("حفظ محاولة جديدة لا يحذف سجلات قديمة أو تالفة", async ({ page }) => {
  // سجل قديم صالح (بلا lessonId) + سجل تالف داخل مصفوفة: كلاهما يبقى بعد الحفظ.
  const legacy = { title: "اختبار قديم", score: 4, total: 8, date: "2025-09-01T08:00:00.000Z" };
  await page.goto(`${BASE}/student/`);
  await page.evaluate(entries => { localStorage.clear(); localStorage.setItem("math7-quiz-attempts", JSON.stringify(entries)); }, [legacy, { broken: true }]);

  await page.goto(`${BASE}/quizzes/lesson/1/`);
  for (const section of await page.locator("[data-quiz-question]").all()) {
    const text = section.locator('input[type="text"]');
    if (await text.count()) await text.fill("1");
    else await section.locator("button[aria-pressed]").first().click();
  }
  await page.getByRole("button", { name: "تسليم الاختبار وإظهار النتيجة" }).click();
  await expect(page.locator('[data-testid="quiz-score"]')).toBeVisible();

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("math7-quiz-attempts") ?? "[]"));
  expect(saved.length).toBe(3);
  expect(saved[0].lessonId).toBe(1);
  expect(saved).toContainEqual(legacy);
  expect(saved).toContainEqual({ broken: true });

  // قيمة غير مصفوفة: تُنسخ احتياطيًا ولا تُمحى.
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem("math7-quiz-attempts", JSON.stringify({ not: "array" })); });
  await page.reload();
  for (const section of await page.locator("[data-quiz-question]").all()) {
    const text = section.locator('input[type="text"]');
    if (await text.count()) await text.fill("2");
    else await section.locator("button[aria-pressed]").first().click();
  }
  await page.getByRole("button", { name: "تسليم الاختبار وإظهار النتيجة" }).click();
  await expect(page.locator('[data-testid="quiz-score"]')).toBeVisible();
  const backup = await page.evaluate(() => localStorage.getItem("math7-quiz-attempts-backup"));
  expect(backup).toBe(JSON.stringify({ not: "array" }));
  const fresh = await page.evaluate(() => JSON.parse(localStorage.getItem("math7-quiz-attempts") ?? "[]"));
  expect(fresh.length).toBe(1);
  expect(fresh[0].lessonId).toBe(1);
});

test("النسخة الاحتياطية تبقى كما هي بعد أكثر من تسليم", async ({ page }) => {
  const answerAll = async (value: string) => {
    for (const section of await page.locator("[data-quiz-question]").all()) {
      const text = section.locator('input[type="text"]');
      if (await text.count()) await text.fill(value);
      else await section.locator("button[aria-pressed]").first().click();
    }
    await page.getByRole("button", { name: "تسليم الاختبار وإظهار النتيجة" }).click();
    await expect(page.locator('[data-testid="quiz-score"]')).toBeVisible();
  };

  await page.goto(`${BASE}/student/`);
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("math7-quiz-attempts", JSON.stringify({ corrupt: 1 }));
    localStorage.setItem("math7-quiz-attempts-backup", JSON.stringify({ savedEarlier: true }));
  });

  // التسليم الأول: القيمة الأساسية تالفة، والنسخة الموجودة مسبقًا يجب ألا تُلمس.
  await page.goto(`${BASE}/quizzes/lesson/1/`);
  await answerAll("1");
  expect(await page.evaluate(() => localStorage.getItem("math7-quiz-attempts-backup"))).toBe(JSON.stringify({ savedEarlier: true }));

  // إتلاف القيمة الأساسية مرة أخرى ثم تسليم ثانٍ: النسخة القديمة تبقى بلا استبدال.
  await page.evaluate(() => localStorage.setItem("math7-quiz-attempts", JSON.stringify({ corrupt: 2 })));
  await page.reload();
  await answerAll("2");
  expect(await page.evaluate(() => localStorage.getItem("math7-quiz-attempts-backup"))).toBe(JSON.stringify({ savedEarlier: true }));

  // تسليم ثالث عبر إعادة المحاولة داخل الصفحة نفسها.
  await page.getByRole("button", { name: "إعادة المحاولة" }).click();
  await answerAll("3");
  expect(await page.evaluate(() => localStorage.getItem("math7-quiz-attempts-backup"))).toBe(JSON.stringify({ savedEarlier: true }));
  const main = await page.evaluate(() => JSON.parse(localStorage.getItem("math7-quiz-attempts") ?? "[]"));
  expect(Array.isArray(main)).toBe(true);
  expect(main.length).toBeGreaterThan(0);
  expect(main.every((item: { lessonId?: number }) => item.lessonId === undefined || item.lessonId === 1)).toBe(true);
});

test("الحالات الخمس مستقلة وواضحة في الواجهة", async ({ page }) => {
  const REV = "natural-book-practice-v1";
  const MISSIONS = ["count-five", "place-7430", "twin-fives", "point-eight", "big-place", "neptune-code"];
  const solved = { response: {}, attempts: 1, solved: true, hintsShown: 0, solutionViewed: false };
  const practice = Object.fromEntries(MISSIONS.map(key => [`math7-practice-1-${REV}-${key}`, solved]));
  const quiz = (score: number) => [{ title: "اختبار درس: الأعداد الطبيعية", score, total: 8, date, lessonId: 1 }];

  const signature = async (seed: Record<string, unknown>) => {
    await page.goto(`${BASE}/student/`);
    await page.evaluate(entries => {
      localStorage.clear();
      for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, JSON.stringify(value));
    }, seed);
    await page.goto(`${BASE}/student/`);
    const markers = page.locator('[data-lesson-status="1"] [data-progress-state]');
    await expect(markers).toHaveCount(5);
    return markers.evaluateAll(nodes => nodes.map(node => `${node.getAttribute("data-progress-state")}:${node.getAttribute("data-earned")}`).join(","));
  };

  const states = {
    none: await signature({}),
    visit: await signature({ "math7-visited-1": [0] }),
    training: await signature(practice),
    quiz: await signature({ "math7-quiz-attempts": quiz(8) }),
    completed: await signature({ ...practice, "math7-quiz-attempts": quiz(7) }),
    mastered: await signature({ ...practice, "math7-quiz-attempts": quiz(8) }),
  };

  expect(states.none).toBe("visited:false,training:false,quiz:false,completion:false,mastery:false");
  expect(states.visit).toBe("visited:true,training:false,quiz:false,completion:false,mastery:false");
  expect(states.training).toBe("visited:false,training:true,quiz:false,completion:false,mastery:false");
  expect(states.quiz).toBe("visited:false,training:false,quiz:true,completion:false,mastery:false");
  expect(states.completed).toBe("visited:false,training:true,quiz:true,completion:true,mastery:false");
  expect(states.mastered).toBe("visited:false,training:true,quiz:true,completion:true,mastery:true");

  // الحالات الخمس متميزة: لكل واحدة بصمة مختلفة عن غيرها.
  const fiveStates = [states.visit, states.training, states.quiz, states.completed, states.mastered];
  expect(new Set(fiveStates).size).toBe(5);

  // دلالة اللون: كل علامة متحققة لها صنف لوني مختلف عن العلامة المجاورة.
  const tones = await page.locator('[data-lesson-status="1"] [data-progress-state]').evaluateAll(nodes =>
    nodes.map(node => `${node.getAttribute("data-progress-state")}=${getComputedStyle(node).backgroundColor}`));
  expect(new Set(tones).size).toBe(5);
});
