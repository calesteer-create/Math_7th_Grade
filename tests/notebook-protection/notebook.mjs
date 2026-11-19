import assert from 'node:assert/strict';
import { devices, lesson, session, settle } from './harness.mjs';
import { elementImage, put, sheetLayout, stableElementImage } from './evidence.mjs';
import { checkPrint } from './print.mjs';
import { entryView, pannedViews, usedFonts } from './screen.mjs';

// Independent contract, not constants imported from the implementation under test.
const ids = ['natural-foundations', 'place-values', 'three-forms', 'written-solution'];
const titles = ['الأعداد الطبيعية ومستقيم الأعداد', 'المنازل وقاعدة حساب القيمة', 'جدول المنازل والصيغ الثلاث', 'أرتّب حلّي في الدفتر'];
const key = 'math7:copybook:1';
const note = i => `ملاحظة اختبار للورقة ${i+1}: أراجع الفكرة وأكتب السبب.\nNB0${i+1}END`;
const sentinels = {
  'math7-stage-1': '0', 'math7-visited-1': '[2]',
  'math7-stage-2': '3', 'math7-visited-2': '[0,3]',
  'math7-quiz-attempts': JSON.stringify([{ title: 'اختبار اصطناعي', score: 2, total: 3, date: '2026-01-01T00:00:00Z' }]),
  'math7-practice-1-natural-book-practice-v1-count-five': JSON.stringify({ response: {}, attempts: 0, solved: false, hintsShown: 1, solutionViewed: false }),
  'math7:copybook:2': JSON.stringify({ written: {}, notes: { other: 'دفتر اختبار مستقل' } }),
};
const storage = page => page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
const notebook = page => page.locator('[data-student-copybook]');
const active = page => notebook(page).getByRole('tabpanel');
const tabs = page => notebook(page).getByRole('tab');
async function ready(page) {
  await notebook(page).locator('textarea:visible:enabled').waitFor();
  await settle(page);
}
async function selected(page, i) {
  const tab = tabs(page).nth(i);
  await active(page).filter({ has: page.getByRole('heading', { name: titles[i], exact: true }) }).waitFor();
  assert.equal(await active(page).count(), 1);
  assert.equal(await active(page).getAttribute('data-notebook-sheet'), ids[i]);
  assert.deepEqual(await tabs(page).evaluateAll(nodes => nodes.map(n => [n.getAttribute('aria-selected'), n.tabIndex])),
    ids.map((_, n) => n === i ? ['true', 0] : ['false', -1]));
  assert.equal(await active(page).getAttribute('aria-labelledby'), await tab.getAttribute('id'));
  assert.equal(await active(page).getByRole('textbox', { name: `ملاحظتي: ${titles[i]}`, exact: true }).count(), 1);
  assert.equal(await tab.getAttribute('aria-controls'), await active(page).getAttribute('id'));
}
async function choose(page, i) { await tabs(page).nth(i).click(); await selected(page, i); }
async function count(page, n) {
  assert.equal((await notebook(page).locator('.copybook-toolbar bdi').innerText()).trim(), `${n} / 4`);
}

export async function exercise(browser, out, run, actual, device) {
  const { context, page, errors } = await session(browser, out, device, sentinels);
  try {
    console.log(`Testing ${device} (${devices[device].viewport.width}×${devices[device].viewport.height})`);
    const cdp = await context.newCDPSession(page);
    const image = async (name, target, settled = false) => put(actual, `${device}/${name}.png`,
      await (settled ? stableElementImage(page, cdp, target) : elementImage(page, cdp, target)));
    const book = notebook(page);
    // Exercise the real entry action, not just a server-rendered hidden element.
    await context.addInitScript(() => {
      // Passive observation of both sides of the hydration gate, not a delay
      // or a mock of React, the saved draft, or the component lifecycle.
      window.__restoreStates = [];
      const observer = new MutationObserver(() => {
        const b = document.querySelector('[data-student-copybook]');
        if (!b?.querySelector('textarea')) return;
        const message = b.querySelector('.copybook-toolbar>span:last-child').textContent;
        if (window.__restoreStates.at(-1)?.[0] !== message) {
          window.__restoreStates.push([message, ...[...b.querySelectorAll('header button,textarea,input[type=checkbox]')].map(e => e.disabled)]);
        }
        if (window.__restoreStates.length >= 2) observer.disconnect();
      });
      observer.observe(document, { subtree: true, attributes: true, childList: true, characterData: true });
    });
    await page.goto(lesson);
    await page.waitForFunction(() => localStorage.getItem('math7-visited-1') === '[2,0]');
    const stages = page.getByRole('navigation', { name: 'مراحل الدرس' }).getByRole('button');
    assert.match(await stages.last().innerText(), /دفتر الطالب/);
    await stages.last().click(); await ready(page);
    assert.deepEqual(await book.locator('[data-notebook-sheet]').evaluateAll(a => a.map(e => e.dataset.notebookSheet)), ids);
    await selected(page, 0); await count(page, 0);
    const afterEntry = await storage(page);
    assert.equal(afterEntry[key], undefined);
    assert.deepEqual(afterEntry, { ...sentinels, 'math7-stage-1': '8', 'math7-visited-1': '[2,0,8]' }, 'Only expected lesson-stage transition on entry');
    assert.deepEqual(await page.evaluate(() => window.__restoreStates), [
      ['جارٍ استعادة ملاحظاتك…', ...Array(9).fill(true)],
      ['العلامات والملاحظات محفوظة في هذا المتصفح فقط.', ...Array(9).fill(false)],
    ]);
    assert.equal(await book.getByRole('tablist', { name: 'أوراق دفتر الطالب' }).count(), 1);
    await put(actual, `${device}/entry-visible-stage.png`, await entryView(page));

    const measures = [];
    for (const [i,id] of ids.entries()) {
      await choose(page, i);
      assert.equal(await active(page).getByRole('textbox').inputValue(), '');
      assert.equal(await active(page).getByRole('checkbox').isChecked(), false);
      assert.equal(await active(page).locator('.math-error,.katex-error').count(), 0);
      await image(`${i+1}-${id}`, book);
      measures.push({ id, title: titles[i], layout: await sheetLayout(active(page)) });
      await put(actual, `${device}/${i+1}-accessibility.txt`, await active(page).ariaSnapshot() + '\n');
      if (device === 'phone' && i === 0) await pannedViews(page, active(page).locator('.formula-surface'), 'set-formula', image, [1]);
      const zoom = active(page).getByRole('button', { name: /تكبير رسم/ });
      if (i === 0 || i === 2) {
        if (device === 'phone') await pannedViews(page, active(page).locator('[data-book-figure]'), `figure-${id}`, image);
        await zoom.click(); const dialog = page.getByRole('dialog'); await dialog.waitFor();
        await image(`zoom-${id}`, dialog);
        if (device === 'phone') await pannedViews(page, dialog, `zoom-${id}`, image, [0.5, 1], true);
        if (i === 0) await page.keyboard.press('Escape');
        else await dialog.getByRole('button', { name: 'إغلاق الرسم المكبّر' }).click();
        await dialog.waitFor({ state: 'detached' });
        assert.ok(await zoom.evaluate(e => e === document.activeElement), 'Zoom must restore focus');
      }
    }
    await put(actual, `${device}/layout.json`, measures);
    await choose(page, 0); await usedFonts(page, cdp, out, actual, device);

    await tabs(page).last().focus();
    for (const [button, i] of [['Home',0], ['ArrowRight',3], ['ArrowLeft',0], ['End',3]]) {
      await page.keyboard.press(button); await selected(page,i);
      assert.ok(await tabs(page).nth(i).evaluate(e => e === document.activeElement));
    }
    await image('keyboard-focus', book.getByRole('tablist'));
    // Native print UI is not available headlessly. Observe the button dispatch;
    // separately generate and inspect the real browser print output (print.mjs).
    if (device === 'desktop') {
      await page.evaluate(() => { window.print = () => { window.__printCalls = (window.__printCalls || 0) + 1; }; });
      await book.getByRole('button', { name: 'طباعة أوراق الدفتر' }).click();
      assert.equal(await page.evaluate(() => window.__printCalls), 1);
      await checkPrint(page, run, actual, 'blank', ids);
    }

    const draft = { written: {}, notes: {} };
    for (const [i,id] of ids.entries()) {
      await choose(page, i);
      const input = active(page).getByRole('textbox');
      if (i === 0) {
        await input.fill('س'.repeat(1601)); assert.equal((await input.inputValue()).length, 1600);
        assert.equal(JSON.parse((await storage(page))[key]).notes[id], 'س'.repeat(1600));
        await input.fill(''); assert.equal(JSON.parse((await storage(page))[key]).notes[id], '');
      }
      await input.fill(note(i)); await active(page).getByRole('checkbox').check();
      draft.notes[id] = note(i); draft.written[id] = true;
      await count(page, i+1);
    }
    await image('all-written-tabs', book.getByRole('tablist'));
    await choose(page, 1); await active(page).getByRole('checkbox').uncheck(); draft.written[ids[1]] = false;
    await count(page, 3);
    async function checkStore() {
      const data = await storage(page);
      assert.deepEqual(JSON.parse(data[key]), draft, 'Persisted copybook key/schema/contents');
      delete data[key]; assert.deepEqual(data, afterEntry, 'Copybook writes changed other storage');
    }
    await checkStore();
    await page.reload(); await ready(page); await selected(page, 0); await count(page, 3);
    await image('restored', book);
    for (const [i,id] of ids.entries()) {
      await choose(page,i);
      assert.equal(await active(page).getByRole('textbox').inputValue(), note(i));
      assert.equal(await active(page).getByRole('checkbox').isChecked(), draft.written[id]);
    }
    await checkStore();
    if (device === 'desktop') {
      await checkPrint(page, run, actual, 'written', ids);
      await choose(page, 2);
      const head = 'NB03BEGIN\n' + 'أكتب خطوةً ثم أتحقق من النتيجة.\n'.repeat(60);
      const stress = head.slice(0, 1592) + '\nNB03END';
      assert.equal(stress.length, 1600);
      await active(page).getByRole('textbox').fill(stress);
      await checkPrint(page, run, actual, 'max-note', ids);
      await active(page).getByRole('textbox').fill(note(2)); await checkStore();
    }
    if (device === 'phone') await checkPrint(page, run, actual, 'written-phone', ids);
    // Reverse isolation: actually visit another lesson stage; notes survive, while
    // the shell is free to update its own visited/stage records normally.
    const raw = (await storage(page))[key];
    await stages.filter({ hasText: 'الملخص' }).click(); await book.waitFor({ state: 'detached' });
    assert.equal((await storage(page))[key], raw);
    await stages.last().click(); await ready(page); assert.equal(await active(page).getByRole('textbox').inputValue(), note(0));
    assert.deepEqual(errors, []);
    console.log(`  PASS: four sheets, both zooms, keyboard, limit/erase/write/check/uncheck, reload, counter and storage isolation.`);
  } finally { await context.close(); }
}

export async function blockedStorage(browser, out, actual) {
  const { context, page, errors } = await session(browser, out, 'phone');
  try {
    await context.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Test profile: storage denied', 'SecurityError'); } }));
    await page.goto(lesson + '?stage=notebook'); await ready(page);
    const warning = notebook(page).getByText(/تعذر الحفظ محليًا/); await warning.waitFor();
    await active(page).getByRole('textbox').fill('ملاحظة اختبار مؤقتة'); await active(page).getByRole('checkbox').check();
    await count(page,1); await warning.waitFor();
    await put(actual, 'phone/storage-denied.png', await elementImage(page, await context.newCDPSession(page), notebook(page)));
    await page.reload(); await ready(page); await warning.waitFor(); await count(page,0);
    assert.equal(await active(page).getByRole('textbox').inputValue(), '');
    assert.deepEqual(errors, []);
    console.log('PASS: isolated denied-storage profile, visible warning, session editing, no false restoration.');
  } finally { await context.close(); }
}

// Not produced by this version's save function: catches incompatible migrations
// even if the writer and reader were accidentally changed together.
export async function savedProfiles(browser, out) {
  const legacy = JSON.stringify({ notes: { [ids[2]]: 'م'.repeat(1604), [ids[1]]: 42 }, written: { [ids[2]]: true, [ids[1]]: 'true' } });
  for (const [name, raw] of [['existing', legacy], ['malformed', '{']]) {
    const { context, page, errors } = await session(browser, out, 'desktop', { ...sentinels, [key]: raw });
    try {
      await page.goto(lesson + '?stage=notebook'); await ready(page);
      assert.equal((await storage(page))[key], raw, 'Reading must not overwrite an existing draft');
      if (name === 'existing') {
        await choose(page, 2); await count(page, 1);
        assert.equal(await active(page).getByRole('textbox').inputValue(), 'م'.repeat(1600));
        assert.equal(await active(page).getByRole('checkbox').isChecked(), true);
        await choose(page, 1);
        assert.equal(await active(page).getByRole('textbox').inputValue(), '');
        assert.equal(await active(page).getByRole('checkbox').isChecked(), false);
      } else {
        const warning = notebook(page).getByText(/تعذر الحفظ محليًا/);
        await warning.waitFor(); await count(page, 0);
        await active(page).getByRole('textbox').fill(note(0)); await warning.waitFor({ state: 'hidden' });
        await page.reload(); await ready(page);
        assert.equal(await active(page).getByRole('textbox').inputValue(), note(0));
      }
      assert.deepEqual(errors, []);
    } finally { await context.close(); }
  }
  console.log('PASS: externally seeded existing draft, type filtering, length cap and malformed JSON recovery.');
}
