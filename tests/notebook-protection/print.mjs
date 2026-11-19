import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import * as mupdf from 'mupdf';
import { put } from './evidence.mjs';
import { settle } from './harness.mjs';

const options = { format: 'A4', scale: 1, printBackground: true, displayHeaderFooter: false,
  margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' } };

// Check the actual paginated PDF, not just print-media HTML. Metadata / timestamps
// and PDF object numbers are not a visual reference. Rasterize the WHOLE page.
export async function checkPrint(page, run, actual, state, ids) {
  await page.emulateMedia({ media: 'print' });
  try {
    await settle(page);
    const sheets = page.locator('[data-notebook-sheet]');
    const css = await sheets.evaluateAll(nodes => nodes.map(n => ({ id: n.dataset.notebookSheet,
      displayed: n.checkVisibility(), breakAfter: getComputedStyle(n).breakAfter,
      note: n.querySelector('.copybook-print-note p').innerText,
    })));
    assert.deepEqual(css.map(s => s.id), ids);
    assert.ok(css.every(s => s.displayed));
    assert.equal(await page.locator('[data-student-copybook] :is(textarea,button):visible').count(), 0);
    const bytes = await page.pdf(options);
    await writeFile(join(run, `${state}.pdf`), bytes); // diagnostic, never an expected file
    const doc = mupdf.Document.openDocument(bytes, 'application/pdf');
    const pages = [], markers = [], sheetNumbers = [];
    const anchors = [
      '0\n1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12', 'V = d × p',
      '0\n8\n3\n0\n0\n0\n0\n5\n0\n0\n0\n2', '200000 + 80000 + 4000 + 300 + 10 + 5 = 284315',
    ];
    try {
      for (let i = 0; i < doc.countPages(); i++) {
        const p = doc.loadPage(i), text = p.toStructuredText('preserve-whitespace');
        const [, , width, height] = p.getBounds();
        assert.ok(Math.abs(width-595.28)<1 && Math.abs(height-841.89)<1.1, 'Expected portrait A4 media box');
        const pix = p.toPixmap(mupdf.Matrix.scale(1.5, 1.5), mupdf.ColorSpace.DeviceRGB, false);
        try {
          const content = text.asText();
          const label = `print/${state}/page-${String(i+1).padStart(2, '0')}`;
          await put(actual, label + '.png', pix.asPNG());
          await put(actual, label + '.txt', content);
          // Ink at the physical paper edges, missing end-of-sheet notes, page moves,
          // clipped diagrams and rewrapping have independent checks or pixel witnesses.
          const data = pix.getPixels(), w = pix.getWidth(), h = pix.getHeight(), stride = pix.getStride();
          let l = w, t = h, r = -1, b = -1;
          for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
            const k = y*stride+x*3;
            if (Math.min(data[k], data[k+1], data[k+2]) < 245) {
              if (x < l) l=x; if (x > r) r=x; if (y < t) t=y; if (y > b) b=y;
            }
          }
          assert.ok(r >= l && b >= t && l>0 && t>0 && r<w-1 && b<h-1, `Blank page or ink touching paper edge: ${label}`);
          const number = content.match(/^(0[1-4]) ورقة$/m)?.[1];
          if (number) {
            sheetNumbers.push(number);
            assert.ok(content.includes(anchors[Number(number)-1]), `Lost printed figure digits or equation on sheet ${number}`);
          }
          const found = content.match(/NB0[1-4]END/g) || [];
          markers.push(...found);
          pages.push({ page: i+1, sheetHeader: number || null, paperPt: p.getBounds(), inkBoxPx: [l,t,r,b], endMarkers: found });
        } finally { pix.destroy(); text.destroy(); p.destroy(); }
      }
    } finally { doc.destroy(); }
    assert.deepEqual(sheetNumbers, ['01','02','03','04']);
    if (state !== 'max-note') assert.equal(pages.length, 4, `One page per sheet for ${state}`);
    assert.deepEqual(markers, state === 'blank' ? [] : ['NB01END','NB02END','NB03END','NB04END']);
    await put(actual, `print/${state}/pagination.json`, { options, dpi: 108, pageCount: pages.length, sheets: css, pages });
    console.log(`  PDF ${state}: ${pages.length} physical A4 pages; all pages rasterized + text extracted.`);
  } finally { await page.emulateMedia({ media: 'screen' }); await settle(page); }
}
