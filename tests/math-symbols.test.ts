import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import MathText from "../src/components/MathText";
import { NumberLineDiagram, CountingDiagram, WarmupDiagram } from "../src/components/figures/NaturalNumberFigures";
import { MATH_SYMBOL_TEX, standaloneSymbolTeX, splitLtrTokens, assertValidTeX } from "../src/lib/math-text";

const count = (text: string, value: string) => text.split(value).length - 1;

test("standalone math symbols use their genuine TeX commands", () => {
  assert.equal(standaloneSymbolTeX("π"), String.raw`\pi`);
  assert.equal(standaloneSymbolTeX("ℕ"), String.raw`\mathbb{N}`);
  assert.equal(standaloneSymbolTeX("M"), "M");
  for (const tex of Object.values(MATH_SYMBOL_TEX)) assert.doesNotThrow(() => assertValidTeX(tex));
  assert.equal(standaloneSymbolTeX("SR"), null);
  assert.equal(standaloneSymbolTeX("WhatsApp"), null);
  assert.equal(standaloneSymbolTeX("constructor"), null);
  assert.equal(standaloneSymbolTeX("toString"), null);
  assert.equal(standaloneSymbolTeX("m/s"), null);
});

test("mixed Arabic text renders symbols via KaTeX without treating units as fractions", () => {
  const html = renderToStaticMarkup(createElement(MathText, { text: "النقطة M، والمجموعة ℕ، والثابت π، والسرعة 20 m/s." }));
  assert.equal(count(html, 'class="katex"'), 3);
  assert.equal(count(html, 'data-math="inline"'), 3);
  assert.ok(html.includes(String.raw`<annotation encoding="application/x-tex">\pi</annotation>`));
  assert.ok(html.includes('<bdi dir="ltr" class="numeric-token">20 m/s</bdi>'));
  assert.ok(splitLtrTokens("رمز π ثم M").includes("π"));
  assert.doesNotMatch(html, /class="mfrac"|math-error/);
});

test("mathematical labels on number lines and counting diagrams render through KaTeX", () => {
  const line = renderToStaticMarkup(createElement(NumberLineDiagram));
  assert.equal(count(line, 'data-diagram-math="true"'), 14);
  assert.equal(count(line, 'class="katex"'), 14);
  assert.ok(line.includes('<annotation encoding="application/x-tex">M</annotation>'));
  assert.ok(line.includes('data-point="M"'));
  const sets = renderToStaticMarkup(createElement(CountingDiagram));
  assert.equal(count(sets, 'data-diagram-math="true"'), 5);
  assert.equal(count(sets, 'data-dot="true"'), 10);
  const warmup = renderToStaticMarkup(createElement(WarmupDiagram));
  assert.equal(count(warmup, 'class="katex"'), 3);
  assert.equal(count(warmup, 'data-dot="true"'), 12);
});
