import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { EngineerCard, EngineerChip, EngineerMonogram, EngineerSignature, PlatformLogo } from "../src/components/Identity";
import Footer from "../src/components/Footer";
import { ENGINEER, WHATSAPP_URL } from "../src/lib/site";

const visibleText = (html: string) => html.replace(/<[^>]*>/g, "").trim();

test("engineer monogram reads capital S and capital R at every existing size", () => {
  for (const size of ["h-5 w-5", "h-8 w-8", "h-9 w-9", "h-14 w-14"]) {
    const html = renderToStaticMarkup(createElement(EngineerMonogram, { size }));
    assert.equal(visibleText(html), "SR");
    assert.match(html, /data-engineer-mark="SR"/);
    assert.match(html, /viewBox="0 0 64 64"/);
    assert.match(html, /direction="ltr"/);
    assert.match(html, /print-color-adjust:exact/);
    assert.ok(html.includes(ENGINEER.name));
  }
});

test("all shared identity surfaces keep the full name without role prefixes", () => {
  for (const Component of [EngineerCard, EngineerChip, EngineerSignature]) {
    const html = renderToStaticMarkup(createElement(Component));
    assert.ok(visibleText(html).includes("المهندس سومر شاهين"));
    assert.doesNotMatch(html, /تصميم وتطوير|إعداد وتطوير|س·ش/);
    assert.match(html, /data-engineer-mark="SR"/);
  }
});

test("footer identity uses name only and retains direct WhatsApp access", () => {
  const html = renderToStaticMarkup(createElement(Footer));
  assert.doesNotMatch(html, /تصميم وتطوير|التصميم والتطوير|إعداد وتطوير/);
  assert.ok(visibleText(html).includes(ENGINEER.name));
  assert.ok(html.includes(WHATSAPP_URL));
  assert.ok(html.includes('target="_blank"'));
});

test("approved engineer name and WhatsApp number are unchanged", () => {
  assert.equal(ENGINEER.name, "المهندس سومر شاهين");
  assert.equal(ENGINEER.phoneDisplay, "0930215022");
  assert.equal(new URL(WHATSAPP_URL).pathname, "/963930210222");
});


test("platform pi is actual KaTeX HTML and MathML, isolated left to right", () => {
  const html = renderToStaticMarkup(createElement(PlatformLogo));
  assert.match(html, /data-platform-mark="pi"/);
  assert.match(html, /class="katex"/);
  assert.match(html, /class="katex-mathml"/);
  assert.ok(html.includes(String.raw`<annotation encoding="application/x-tex">\pi</annotation>`));
  assert.match(html, /data-math="inline"/);
  assert.match(html, /unicode-bidi:isolate/);
  assert.doesNotMatch(html, /math-error/);
});
