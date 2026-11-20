"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { ArrowLeftRight, CheckCircle2, FlaskConical, Minus, Plus, RotateCcw, Sparkles } from "lucide-react";
import TeX from "@/components/TeX";
import { describeIntegerOp, GAME_PATHS, signedTeX } from "@/lib/integers";
import { GamePathsDiagram, IntegerLineSVG } from "@/components/figures/IntegerFigures";

const TABS = [
  { id: "explorer", title: "المعاكس والبُعد" },
  { id: "addsub", title: "الجمع والطرح على المستقيم" },
  { id: "game", title: "لعبة المسارات" },
  { id: "simplify", title: "الكتابة المختزلة" },
] as const;
type Tool = (typeof TABS)[number]["id"];

export default function IntegersStudio({ mode = "full" }: { mode?: "full" | Tool }) {
  const [tab, setTab] = useState<Tool>(mode === "full" ? "addsub" : mode);
  const uid = useId();

  // أداة 1: المعاكس والبُعد والمقارنة
  const [focus, setFocus] = useState(-3);
  const [compareWith, setCompareWith] = useState(-5);

  // أداة 2: الجمع والطرح على مستقيم الأعداد
  const [a, setA] = useState(-5);
  const [op, setOp] = useState<"+" | "-">("+");
  const [b, setB] = useState(3);
  const calc = describeIntegerOp(a, op, b);
  const swapped = describeIntegerOp(b, op, a);

  // أداة 3: استكشاف لعبة المسارات
  const [stage2Choice, setStage2Choice] = useState<"top" | "bottom">("bottom");
  const [stage3Choice, setStage3Choice] = useState<"top" | "middle" | "bottom">("middle");
  const [discoveredPaths, setDiscoveredPaths] = useState<number[]>([3]);

  // أداة 4: الكتابة المختزلة والتجميع
  const [s1, setS1] = useState(-9);
  const [s2, setS2] = useState(7);
  const [s3, setS3] = useState(2);

  function changeTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === "ArrowLeft") next = (index + 1) % TABS.length;
    else if (event.key === "ArrowRight") next = (index + TABS.length - 1) % TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TABS.length - 1;
    else return;
    event.preventDefault();
    setTab(TABS[next].id);
    document.getElementById(`${uid}-${TABS[next].id}`)?.focus();
  }

  function pickGame(nextS2: "top" | "bottom", nextS3: "top" | "middle" | "bottom") {
    const validS3 =
      nextS2 === "top"
        ? nextS3 === "bottom"
          ? "middle"
          : nextS3
        : nextS3 === "top"
          ? "middle"
          : nextS3;
    setStage2Choice(nextS2);
    setStage3Choice(validS3);
    const matched = GAME_PATHS.find(p => p.stage2Slot === nextS2 && p.stage3Slot === validS3);
    if (matched && !discoveredPaths.includes(matched.id)) {
      setDiscoveredPaths(prev => [...prev, matched.id].sort((x, y) => x - y));
    }
  }

  const activePath = GAME_PATHS.find(p => p.stage2Slot === stage2Choice && p.stage3Slot === stage3Choice) ?? GAME_PATHS[2];
  const shortSum = s1 + s2 + s3;
  const positivesSum = [s1, s2, s3].filter(n => n > 0).reduce((acc, n) => acc + n, 0);
  const negativesSum = [s1, s2, s3].filter(n => n < 0).reduce((acc, n) => acc + n, 0);

  return (
    <section className="overflow-hidden rounded-[24px] border border-indigo-200 bg-white shadow-sm" data-integers-studio="true">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-l from-violet-600 to-indigo-600 px-6 py-5 text-white">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 text-amber-300"><FlaskConical size={23} /></span>
          <div>
            <p className="text-[10px] font-bold text-amber-200">مختبر الأعداد الصحيحة · تجربة إضافية</p>
            <h3 className="mt-1 text-xl font-extrabold">حرّك الإشارات واكتشف القاعدة</h3>
          </div>
        </div>
        <span className="rounded-full border border-white/25 px-3 py-1.5 text-[11px] text-indigo-100">جرّب • قارن • استنتج</span>
      </div>

      <div className="p-5 md:p-6">
        {mode === "full" && (
          <div className="mb-6 flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="أدوات مختبر الأعداد الصحيحة">
            {TABS.map((t, i) => (
              <button
                key={t.id}
                id={`${uid}-${t.id}`}
                type="button"
                role="tab"
                aria-controls={`${uid}-panel`}
                aria-selected={tab === t.id}
                tabIndex={tab === t.id ? 0 : -1}
                onKeyDown={e => changeTab(e, i)}
                onClick={() => setTab(t.id)}
                className={`flex-1 rounded-lg px-2 py-2.5 text-xs font-extrabold outline-offset-2 transition focus-visible:outline-2 focus-visible:outline-indigo-500 ${
                  tab === t.id ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-indigo-600"
                }`}
              >
                {t.title}
              </button>
            ))}
          </div>
        )}

        <div id={`${uid}-panel`} role={mode === "full" ? "tabpanel" : undefined} aria-labelledby={mode === "full" ? `${uid}-${tab}` : undefined}>
          {/* تبويب 1: المعاكس والبُعد والترتيب */}
          {tab === "explorer" && (
            <div className="space-y-5">
              <div>
                <h4 className="font-extrabold text-ink">الفاصلة والبُعد عن الصفر والمعاكس</h4>
                <p className="mt-1 text-sm leading-7 text-slate-500">
                  غيّر العدد وراقب كيف يقف معاكسه على الجهة المقابلة تمامًا من الصفر، وكيف يبقى البُعد موجبًا دائمًا.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-slate-50/60 px-2 py-2">
                <IntegerLineSVG
                  min={-8}
                  max={8}
                  highlightOpposite={focus}
                  markerPoint={{ label: "M", value: focus }}
                  ariaTitle={`العدد ${focus} ومعاكسه ${-focus} على مستقيم الأعداد`}
                  ariaDesc={`النقطة M عند ${focus}، وبُعدها عن الصفر ${Math.abs(focus)}، ومعاكسها ${-focus}.`}
                />
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-slate-200 px-4 py-3" dir="ltr">
                <button
                  type="button"
                  aria-label="إنقاص العدد"
                  disabled={focus <= -8}
                  onClick={() => setFocus(v => Math.max(-8, v - 1))}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-100 disabled:opacity-30"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="range"
                  min={-8}
                  max={8}
                  step={1}
                  value={focus}
                  onChange={e => setFocus(Number(e.target.value))}
                  aria-label="اختيار العدد الصحيح"
                  className="w-full accent-violet-600"
                />
                <button
                  type="button"
                  aria-label="زيادة العدد"
                  disabled={focus >= 8}
                  onClick={() => setFocus(v => Math.min(8, v + 1))}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-100 disabled:opacity-30"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-3" role="status">
                <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-4 text-center">
                  <p className="text-[11px] font-extrabold text-violet-600">العدد (الفاصلة)</p>
                  <div className="mt-2 text-xl font-black text-violet-950"><TeX tex={signedTeX(focus)} /></div>
                  <p className="mt-1 text-[11px] text-slate-500">{focus > 0 ? "موجب تمامًا (يمين الصفر)" : focus < 0 ? "سالب تمامًا (يسار الصفر)" : "المبدأ (لا موجب ولا سالب)"}</p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-center">
                  <p className="text-[11px] font-extrabold text-emerald-700">البُعد عن المبدأ</p>
                  <div className="mt-2 text-xl font-black text-emerald-950"><TeX tex={String(Math.abs(focus))} /></div>
                  <p className="mt-1 text-[11px] text-slate-500">عدد الوحدات حتى الصفر (غير سالب دائمًا)</p>
                </div>
                <div className="rounded-2xl border border-orange-200 bg-orange-50/70 p-4 text-center">
                  <p className="text-[11px] font-extrabold text-orange-700">معاكس العدد</p>
                  <div className="mt-2 text-xl font-black text-orange-950"><TeX tex={signedTeX(-focus)} /></div>
                  <p className="mt-1 text-[11px] text-slate-600">
                    <TeX tex={`(${signedTeX(focus)})+(${signedTeX(-focus)})=0`} />
                  </p>
                </div>
              </div>

              {/* مقارنة تفاعلية مع عدد ثانٍ */}
              <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-extrabold text-sky-900">
                    قارن <TeX tex={signedTeX(focus)} /> مع عدد ثانٍ:
                  </p>
                  <div className="flex flex-wrap gap-1.5" dir="ltr">
                    {[-7, -5, -1, 0, 2, 6].map(val => (
                      <button
                        key={val}
                        type="button"
                        aria-pressed={compareWith === val}
                        onClick={() => setCompareWith(val)}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-extrabold ${
                          compareWith === val ? "border-sky-600 bg-sky-600 text-white" : "border-sky-200 bg-white text-sky-900 hover:bg-sky-100"
                        }`}
                      >
                        <TeX tex={signedTeX(val, false)} />
                      </button>
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-sm font-bold text-sky-950">
                  <TeX tex={`${signedTeX(focus, false)} ${focus > compareWith ? ">" : focus < compareWith ? "<" : "="} ${signedTeX(compareWith, false)}`} />{" "}
                  —{" "}
                  {focus === compareWith
                    ? "العددان يقعان في الموضع نفسه على المستقيم."
                    : focus > compareWith
                      ? <>لأن <TeX tex={signedTeX(focus, false)} /> يقع إلى <b>يمين</b> <TeX tex={signedTeX(compareWith, false)} /> على مستقيم الأعداد.</>
                      : <>لأن <TeX tex={signedTeX(focus, false)} /> يقع إلى <b>يسار</b> <TeX tex={signedTeX(compareWith, false)} /> على مستقيم الأعداد.</>}
                </p>
              </div>
            </div>
          )}

          {/* تبويب 2: مختبر الجمع والطرح على المستقيم */}
          {tab === "addsub" && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-extrabold text-ink">شاهد العملية تتحرك على مستقيم الأعداد</h4>
                  <p className="mt-1 text-sm leading-7 text-slate-500">
                    اختر العددين ونوع العملية، وراقب اتجاه القوس الأحمر وقاعدة الإشارات.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "مثال جمع 1", a: -5, op: "+" as const, b: 3 },
                    { label: "مثال جمع 2", a: -2, op: "+" as const, b: -3 },
                    { label: "مثال طرح 1", a: -4, op: "-" as const, b: 2 },
                    { label: "مثال طرح 2", a: -2, op: "-" as const, b: -7 },
                  ].map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => { setA(preset.a); setOp(preset.op); setB(preset.b); }}
                      className="rounded-lg border border-indigo-200 bg-indigo-50/70 px-2.5 py-1.5 text-[11px] font-extrabold text-indigo-800 hover:bg-indigo-100"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* أدوات التحكم في a و op و b */}
              <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-extrabold text-amber-800">
                    <span>العدد الأول</span>
                    <TeX tex={signedTeX(a)} />
                  </div>
                  <input
                    type="range"
                    min={-6}
                    max={6}
                    step={1}
                    value={a}
                    onChange={e => setA(Number(e.target.value))}
                    aria-label="العدد الأول في العملية"
                    dir="ltr"
                    className="w-full accent-amber-500"
                  />
                </div>

                <div className="flex flex-col items-center justify-center gap-2">
                  <span className="text-xs font-extrabold text-slate-600">العملية</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      aria-label="عملية الجمع"
                      aria-pressed={op === "+"}
                      onClick={() => setOp("+")}
                      className={`rounded-xl border px-4 py-2 text-sm font-black transition ${
                        op === "+" ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      جمع <TeX tex="+" />
                    </button>
                    <button
                      type="button"
                      aria-label="عملية الطرح"
                      aria-pressed={op === "-"}
                      onClick={() => setOp("-")}
                      className={`rounded-xl border px-4 py-2 text-sm font-black transition ${
                        op === "-" ? "border-rose-600 bg-rose-600 text-white" : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      طرح <TeX tex="-" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-extrabold text-indigo-800">
                    <span>العدد الثاني</span>
                    <TeX tex={signedTeX(b)} />
                  </div>
                  <input
                    type="range"
                    min={-7}
                    max={7}
                    step={1}
                    value={b}
                    onChange={e => setB(Number(e.target.value))}
                    aria-label="العدد الثاني في العملية"
                    dir="ltr"
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

              {/* مستقيم الأعداد الحي */}
              <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white p-2">
                <IntegerLineSVG
                  min={-13}
                  max={13}
                  startPoint={a}
                  endPoint={calc.result}
                  ariaTitle={`تمثيل ${calc.fullTeX} = ${calc.result}`}
                  ariaDesc={`نبدأ عند ${a} ثم ننتقل بمقدار ${calc.effectiveB} فنصل إلى ${calc.result}.`}
                />
              </div>

              {/* تحليل الخطوات والنتيجة */}
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5" role="status" data-studio-result="true">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-lg font-black text-indigo-950">
                    <TeX
                      tex={
                        op === "-"
                          ? `${calc.fullTeX} = ${calc.asAddTeX} = ${calc.shortTeX} = ${signedTeX(calc.result, false)}`
                          : `${calc.fullTeX} = ${calc.shortTeX} = ${signedTeX(calc.result, false)}`
                      }
                      block
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => { const prevA = a; setA(Math.max(-6, Math.min(6, b))); setB(prevA); }}
                    className="btn btn-ghost text-xs"
                  >
                    <ArrowLeftRight size={14} /> تبديل العددين
                  </button>
                </div>

                <div className="mt-3 grid gap-3 text-xs leading-7 text-slate-700 md:grid-cols-2">
                  <div className="rounded-xl bg-white/90 p-3">
                    <b className="text-indigo-800">تفسير الحركة والقاعدة:</b>
                    <p className="mt-1">
                      {op === "-" && (
                        <>نحوّل الطرح إلى جمع المعاكس: معاكس <TeX tex={signedTeX(b)} /> هو <TeX tex={signedTeX(calc.effectiveB)} />. </>
                      )}
                      {calc.oppositePair ? (
                        <>العددان متعاكسان، ومجموع أي عدد ومعاكسه يساوي <TeX tex="0" />.</>
                      ) : calc.effectiveB === 0 ? (
                        <>إضافة أو طرح الصفر لا يغيّر الموضع، فنبقى عند <TeX tex={signedTeX(a, false)} />.</>
                      ) : calc.sameSign ? (
                        <>للعددين الإشارة نفسها؛ نجمع بُعديهما (<TeX tex={`${calc.distA}+${calc.distB}=${calc.distA + calc.distB}`} />) ونُبقي الإشارة المشتركة.</>
                      ) : (
                        <>للعددين إشارتان مختلفتان؛ نطرح البُعد الأصغر من الأكبر (<TeX tex={`${Math.max(calc.distA, calc.distB)}-${Math.min(calc.distA, calc.distB)}=${Math.abs(calc.result)}`} />) ونأخذ إشارة الأبعد عن الصفر.</>
                      )}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/90 p-3">
                    <b className="text-violet-800">اختبار الخاصية التبديلية:</b>
                    <p className="mt-1">
                      عند تبديل الترتيب نحصل على <TeX tex={`${swapped.fullTeX}=${signedTeX(swapped.result, false)}`} />.{" "}
                      {op === "+" ? (
                        <span className="font-bold text-emerald-700">الناتج نفسه دائمًا لأن الجمع تبديلي!</span>
                      ) : calc.result === swapped.result ? (
                        <span className="font-bold text-amber-800">تساويا هنا فقط لأن العددين متساويان، لكن جرّب عددين مختلفين لترى أن الطرح ليس تبديليًا!</span>
                      ) : (
                        <span className="font-bold text-rose-700">الناتجان مختلفان (<TeX tex={`${calc.result}\\ne${swapped.result}`} />)؛ الطرح ليس تبديليًا!</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* تبويب 3: لعبة المسارات التفاعلية */}
          {tab === "game" && (
            <div className="space-y-5">
              <div>
                <h4 className="font-extrabold text-ink">استكشف مسارات لعبة الحاسوب الأربعة</h4>
                <p className="mt-1 text-sm leading-7 text-slate-500">
                  اختر محطة في المرحلة (2) ثم محطة متصلة بها في المرحلة (3) لتتابع تغيّر مجموع نقاطك خطوةً خطوة.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-violet-200 bg-violet-50/50 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-600">المرحلة (1):</span>
                  <span className="rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-black text-amber-900"><TeX tex="+2" /></span>
                </div>
                <span className="text-slate-400">←</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-slate-600">المرحلة (2):</span>
                  <button
                    type="button"
                    aria-pressed={stage2Choice === "top"}
                    onClick={() => pickGame("top", stage3Choice)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-black ${
                      stage2Choice === "top" ? "border-violet-600 bg-violet-600 text-white" : "border-amber-300 bg-amber-50 text-amber-900"
                    }`}
                  >
                    <TeX tex="-6" />
                  </button>
                  <button
                    type="button"
                    aria-pressed={stage2Choice === "bottom"}
                    onClick={() => pickGame("bottom", stage3Choice)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-black ${
                      stage2Choice === "bottom" ? "border-violet-600 bg-violet-600 text-white" : "border-amber-300 bg-amber-50 text-amber-900"
                    }`}
                  >
                    <TeX tex="-4" />
                  </button>
                </div>
                <span className="text-slate-400">←</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-slate-600">المرحلة (3):</span>
                  {stage2Choice === "top" ? (
                    <>
                      <button
                        type="button"
                        aria-pressed={stage3Choice === "top"}
                        onClick={() => pickGame("top", "top")}
                        className={`rounded-lg border px-3 py-1.5 text-sm font-black ${
                          stage3Choice === "top" ? "border-violet-600 bg-violet-600 text-white" : "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-900"
                        }`}
                      >
                        <TeX tex="+2" /> (علوي)
                      </button>
                      <button
                        type="button"
                        aria-pressed={stage3Choice === "middle"}
                        onClick={() => pickGame("top", "middle")}
                        className={`rounded-lg border px-3 py-1.5 text-sm font-black ${
                          stage3Choice === "middle" ? "border-violet-600 bg-violet-600 text-white" : "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-900"
                        }`}
                      >
                        <TeX tex="+5" /> (وسط)
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        aria-pressed={stage3Choice === "middle"}
                        onClick={() => pickGame("bottom", "middle")}
                        className={`rounded-lg border px-3 py-1.5 text-sm font-black ${
                          stage3Choice === "middle" ? "border-violet-600 bg-violet-600 text-white" : "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-900"
                        }`}
                      >
                        <TeX tex="+5" /> (وسط)
                      </button>
                      <button
                        type="button"
                        aria-pressed={stage3Choice === "bottom"}
                        onClick={() => pickGame("bottom", "bottom")}
                        className={`rounded-lg border px-3 py-1.5 text-sm font-black ${
                          stage3Choice === "bottom" ? "border-violet-600 bg-violet-600 text-white" : "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-900"
                        }`}
                      >
                        <TeX tex="+2" /> (سفلي)
                      </button>
                    </>
                  )}
                </div>
              </div>

              <GamePathsDiagram highlightPath={activePath.id} />

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4" role="status">
                <p className="text-xs font-extrabold text-emerald-800">
                  المسار رقم <bdi dir="ltr">{activePath.id}</bdi> — حساب المجموع خطوة بخطوة:
                </p>
                <div className="mt-2">
                  <TeX
                    block
                    tex={`(+2)+(${activePath.stage2})+(+${activePath.stage3}) = (${signedTeX(2 + activePath.stage2)}) + (+${activePath.stage3}) = ${signedTeX(activePath.total)}`}
                  />
                </div>
                <p className="mt-2 flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <CheckCircle2 size={15} />
                  اكتشفت <bdi dir="ltr">{discoveredPaths.length} / 4</bdi> مسارات.{" "}
                  {activePath.id === 3 && "هذا هو المسار الذي يمنح أكبر مجموع (+3)!"}
                </p>
              </div>
            </div>
          )}

          {/* تبويب 4: الكتابة المختزلة والتجميع الذكي */}
          {tab === "simplify" && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-extrabold text-ink">من الأقواس إلى الكتابة المختزلة والتجميع الذكي</h4>
                  <p className="mt-1 text-sm leading-7 text-slate-500">
                    كل عدد يحمل إشارته أمامه. غيّر الحدود الثلاثة ولاحظ كيف يسهّل تجميع الموجبات معًا والسالبيات معًا الحساب.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setS1(-9); setS2(7); setS3(2); }}
                  className="btn btn-ghost text-xs"
                >
                  <RotateCcw size={14} /> مثال الكتاب
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { label: "الحد الأول", val: s1, set: setS1 },
                  { label: "الحد الثاني", val: s2, set: setS2 },
                  { label: "الحد الثالث", val: s3, set: setS3 },
                ].map(item => (
                  <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                    <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
                      <span>{item.label}</span>
                      <TeX tex={signedTeX(item.val)} />
                    </div>
                    <input
                      type="range"
                      min={-15}
                      max={15}
                      step={1}
                      value={item.val}
                      onChange={e => item.set(Number(e.target.value))}
                      aria-label={item.label}
                      dir="ltr"
                      className="mt-2 w-full accent-teal-600"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-3 rounded-2xl border border-teal-200 bg-teal-50/50 p-5" role="status">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-200/70 pb-3">
                  <span className="text-xs font-extrabold text-teal-800">الكتابة الكاملة بالأقواس:</span>
                  <TeX tex={`(${signedTeX(s1)})+(${signedTeX(s2)})+(${signedTeX(s3)})`} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-200/70 pb-3">
                  <span className="text-xs font-extrabold text-violet-800">الكتابة المختزلة (بدون أقواس وإشارة الجمع):</span>
                  <TeX
                    tex={`${signedTeX(s1, false)} ${s2 >= 0 ? `+ ${s2}` : `- ${Math.abs(s2)}`} ${s3 >= 0 ? `+ ${s3}` : `- ${Math.abs(s3)}`}`}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-800">
                    <Sparkles size={14} /> تجميع الموجب مع الموجب والسالب مع السالب:
                  </span>
                  <TeX
                    tex={`(${signedTeX(positivesSum)})+(${signedTeX(negativesSum)}) = ${signedTeX(shortSum, false)}`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-[10px] leading-5 text-slate-400">
        نسخة تفاعلية إضافية مبنية على مفاهيم الدرس. الرسوم المرجعية الثابتة في الشرح لا تتغيّر.
      </div>
    </section>
  );
}
