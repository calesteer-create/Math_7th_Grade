import { test, expect } from "@playwright/test";

// Branding and the public solutions page are rendered in the static export.


test("name-only SR identity is consistent in header, footer and public solutions", async ({ page }, info) => {
  for (const route of ["/", "/units", "/quizzes", "/teacher"]) {
    await page.goto(`/Math_7th_Grade${route}`);
    await expect(page.locator(".engineer-topbar")).toContainText("المهندس سومر شاهين");
    await expect(page.locator(".engineer-topbar [data-engineer-mark='SR'] svg text")).toHaveText("SR");
    await expect(page.locator("footer [data-engineer-mark='SR'] svg text")).toHaveText("SR");
    await expect(page.locator('[data-engineer-mark="Sh"]')).toHaveCount(0);
    const platformMarks = page.locator('[data-platform-mark="pi"]');
    await expect(platformMarks).toHaveCount(2);
    for (const mark of await platformMarks.all()) {
      await expect(mark.locator(".katex")).toHaveCount(1);
      await expect(mark.locator('annotation[encoding="application/x-tex"]')).toHaveText(String.raw`\pi`);
      await expect(mark.locator("[data-math]")).toHaveCSS("direction", "ltr");
      await expect(mark.locator("[data-math]")).toHaveCSS("unicode-bidi", "isolate");
      const outer = (await mark.boundingBox())!;
      const glyph = (await mark.locator(".katex-html").boundingBox())!;
      expect(glyph.x).toBeGreaterThanOrEqual(outer.x);
      expect(glyph.y).toBeGreaterThanOrEqual(outer.y);
      expect(glyph.x + glyph.width).toBeLessThanOrEqual(outer.x + outer.width + 1);
      expect(glyph.y + glyph.height).toBeLessThanOrEqual(outer.y + outer.height + 1);
    }
    await expect(page.locator(".math-error, .katex-error")).toHaveCount(0);
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/تصميم وتطوير|إعداد وتطوير|س·ش/);
    const contacts = page.locator('a[href^="https://wa.me/"]');
    expect(await contacts.count()).toBeGreaterThan(1);
    for (const link of await contacts.all()) {
      expect(new URL((await link.getAttribute("href"))!).pathname).toBe("/963930210222");
      await expect(link).toHaveAttribute("target", "_blank");
    }
  }
  await page.goto("/Math_7th_Grade/");
  await page.locator("header.no-print").screenshot({ path: info.outputPath("sr-header.png") });
  await page.locator("footer").screenshot({ path: info.outputPath("sr-footer.png"), style: "header.sticky { visibility:hidden !important; }" });
});

test("lesson notebook signature keeps the same SR mark and name without credit prefix", async ({ page }, info) => {
  await page.goto("/Math_7th_Grade/lessons/1?stage=notebook");
  await expect(page.locator("[data-student-copybook]")).toBeVisible();
  const mark = page.locator("[data-student-copybook] [data-engineer-mark='SR']");
  await expect(mark.locator("svg text")).toHaveText("SR");
  await page.emulateMedia({ media: "print" });
  await expect(mark).toHaveCSS("print-color-adjust", "exact");
  await page.emulateMedia({ media: "screen" });
  const signature = mark.locator("..");
  await expect(signature).toContainText("المهندس سومر شاهين");
  expect(await signature.innerText()).not.toMatch(/تصميم وتطوير|إعداد وتطوير/);
  await signature.screenshot({ path: info.outputPath("sr-notebook-signature.png"), style: "header.sticky { visibility:hidden !important; }" });
});
