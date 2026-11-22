"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { BookOpen, Maximize2, X } from "lucide-react";
import MathText from "@/components/MathText";

/**
 * إطار موحّد للرسوم الجديدة: ترويسة، تكبير في نافذة حوار، وتعليق مصدر.
 * الشكل نفسه يُرسم في مكوّن مستقل ليُعاد استعماله في المختبر.
 */
export default function FigureFrame({ kind, title, detail, children }: { kind: string; title: string; detail: string; children: ReactNode }) {
  const [zoomed, setZoomed] = useState(false);
  const zoomButton = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => { if (zoomed) dialog.current?.showModal(); }, [zoomed]);
  return <>
    <figure data-book-figure={kind} aria-labelledby={`${id}-caption`} className="my-1 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_10px_35px_-25px_rgba(25,37,79,.30)] print:break-inside-avoid print:shadow-none">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><BookOpen size={17} /></span>
          <div><p className="text-[10px] font-extrabold text-indigo-500">تأمّل الشكل وافهم الفكرة</p><h3 className="mt-0.5 text-sm font-extrabold text-[#243252]">{title}</h3></div>
        </div>
        <button ref={zoomButton} type="button" onClick={() => setZoomed(true)} aria-label={`تكبير رسم ${title}`} className="no-print flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-600"><Maximize2 size={13} /> تكبير</button>
      </div>
      <div className="overflow-x-auto bg-[#fbfcff] px-4 py-6 md:px-6">{children}</div>
      <figcaption id={`${id}-caption`} className="flex flex-wrap items-start justify-between gap-2 border-t border-slate-100 px-5 py-3 text-[11px] leading-5 text-slate-500"><span className="max-w-xl"><MathText text={detail} /></span></figcaption>
    </figure>
    {zoomed && <dialog ref={dialog} aria-label={`عرض مكبّر: ${title}`} onClose={() => { setZoomed(false); zoomButton.current?.focus({ preventScroll: true }); }} onCancel={event => { event.preventDefault(); dialog.current?.close(); }}
      onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}
      className="no-print fixed inset-0 m-auto max-h-[90vh] w-[min(1100px,94vw)] max-w-none overflow-auto rounded-[24px] border-0 bg-white p-0 text-ink shadow-2xl backdrop:bg-[#0f193c]/65 backdrop:backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div><span className="text-xs font-semibold text-indigo-500">تفاصيل أوضح · عرض مكبّر</span><h3 className="mt-1 text-lg font-extrabold">{title}</h3></div>
        <button type="button" onClick={() => dialog.current?.close()} aria-label="إغلاق الرسم المكبّر" className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-indigo-600"><X size={19} /></button>
      </div>
      <div className="overflow-x-auto bg-[#fafbfd] p-7">{children}</div>
      <p className="border-t border-slate-100 px-6 py-4 text-xs leading-6 text-slate-500"><MathText text={detail} /></p>
    </dialog>}
  </>;
}
