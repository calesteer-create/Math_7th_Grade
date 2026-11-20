"use client";

import { useId, useState } from "react";
import { ArrowDown, Building2, Check, MousePointer2, Waves } from "lucide-react";
import TeX from "@/components/TeX";
import MathText from "@/components/MathText";
import {
  BOOK_CALC_AB,
  BOOK_CALC_C,
  BOOK_LINE_OPS,
  BOOK_MATCH_LEFT_ORDER,
  BOOK_MATCH_PAIRS,
  GAME_PATHS,
  INT_WARMUP_ROWS,
} from "@/lib/integers";
import { GamePathsDiagram, IntegerLineSVG, MiniWarmupAxis } from "@/components/figures/IntegerFigures";
import { latinDigits, type PracticeField, type PracticeView } from "@/lib/practice-types";

type Props = {
  view: PracticeView;
  response: Record<string, string>;
  onChange: (key: string, value: string) => void;
  disabled: boolean;
};

function normalizeSignedInput(raw: string): string {
  return latinDigits(raw).replace(/[\u2212\u2013\u2014]/g, "-");
}

function SignedNumericField({
  field,
  value,
  onChange,
  disabled,
  formula,
  unit,
}: {
  field: PracticeField;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  formula?: string;
  unit?: string;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="block min-w-0 rounded-xl border border-slate-200 bg-white p-3 text-center shadow-2xs">
      <span className="mb-1.5 block text-[11px] font-extrabold text-slate-600">{field.label}</span>
      {formula && (
        <div className="mb-2 rounded-lg bg-slate-50 py-1.5 text-base font-bold text-ink">
          <TeX tex={formula} />
        </div>
      )}
      <span className="practice-input-wrap" dir="ltr">
        <input
          id={id}
          aria-label={field.label}
          value={value}
          onChange={e => onChange(normalizeSignedInput(e.target.value))}
          inputMode="text"
          autoComplete="off"
          maxLength={16}
          disabled={disabled}
          placeholder="مثال: -4"
          className="input"
          dir="ltr"
        />
        {unit && <span className="practice-unit">{unit}</span>}
      </span>
    </label>
  );
}

function WarmupWidget({ response, onChange, disabled }: Props) {
  return (
    <div className="space-y-4">
      {INT_WARMUP_ROWS.map((row, idx) => (
        <div key={row.id} className="rounded-2xl border border-violet-200/80 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-extrabold text-violet-700">
              السطر <bdi dir="ltr">{idx + 1}</bdi>
            </span>
            <p className="flex-1 text-sm font-extrabold text-ink">
              <MathText text={row.prompt} />
            </p>
          </div>
          {"pointLabel" in row && <MiniWarmupAxis pointLabel={row.pointLabel} pointValue={row.pointValue} />}
          <div className="mt-3 grid grid-cols-3 gap-2.5" dir="ltr">
            {row.options.map(opt => {
              const picked = response[row.id] === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  disabled={disabled}
                  aria-label={`${row.id}: الخيار ${opt.key} (${opt.label})`}
                  aria-pressed={picked}
                  onClick={() => onChange(row.id, opt.key)}
                  className={`flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 transition ${
                    picked
                      ? "border-violet-600 bg-violet-50 text-violet-900 shadow-xs"
                      : "border-slate-200 bg-slate-50/50 text-slate-700 hover:border-violet-300"
                  }`}
                >
                  <span className="text-[11px] font-black text-violet-500">
                    <TeX tex={opt.key} />
                  </span>
                  <span className="text-lg font-extrabold">
                    {opt.tex ? <TeX tex={opt.tex} /> : <span dir="rtl">{opt.label}</span>}
                  </span>
                  {picked && <Check size={14} className="text-violet-600" />}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function GamePathsWidget({ view, response, onChange, disabled }: Props) {
  const [previewPath, setPreviewPath] = useState<1 | 2 | 3 | 4 | null>(1);
  const bestField = view.fields.find(f => f.key === "best");
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs font-extrabold text-slate-500">معاينة مسار على المخطط:</span>
        {GAME_PATHS.map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPreviewPath(p.id)}
            className={`rounded-lg border px-3 py-1 text-xs font-extrabold transition ${
              previewPath === p.id ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"
            }`}
          >
            المسار <bdi dir="ltr">{p.id}</bdi>
          </button>
        ))}
      </div>

      <GamePathsDiagram highlightPath={previewPath} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {GAME_PATHS.map(p => {
          const field = view.fields.find(f => f.key === `p${p.id}`)!;
          return (
            <SignedNumericField
              key={field.key}
              field={field}
              value={response[field.key] ?? ""}
              onChange={val => { setPreviewPath(p.id); onChange(field.key, val); }}
              disabled={disabled}
              formula={`(+2)+(${p.stage2})+(+${p.stage3})`}
            />
          );
        })}
      </div>

      {bestField && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-center">
          <p className="mb-3 text-xs font-extrabold text-amber-900">{bestField.label}</p>
          <div className="flex flex-wrap justify-center gap-2" dir="ltr">
            {bestField.choices?.map(choice => (
              <button
                key={choice}
                type="button"
                disabled={disabled}
                aria-label={`اختيار المسار ${choice} كأكبر مجموع`}
                aria-pressed={response.best === choice}
                onClick={() => { setPreviewPath(Number(choice) as 1 | 2 | 3 | 4); onChange("best", choice); }}
                className={`rounded-xl border-2 px-5 py-2.5 text-sm font-black transition ${
                  response.best === choice
                    ? "border-amber-600 bg-amber-500 text-white"
                    : "border-amber-200 bg-white text-amber-900 hover:border-amber-400"
                }`}
              >
                <span dir="rtl">المسار </span>
                {choice}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ElevatorSubWidget({ view, response, onChange, disabled }: Props) {
  const elevField = view.fields.find(f => f.key === "elevator")!;
  const subField = view.fields.find(f => f.key === "submarine")!;
  const elevVal = Number(response.elevator);
  const subVal = Number(response.submarine);
  const elevPos = Number.isFinite(elevVal) && response.elevator?.trim() ? Math.max(-2, Math.min(6, elevVal)) : 0;
  const subPos = Number.isFinite(subVal) && response.submarine?.trim() ? Math.max(-30, Math.min(5, subVal)) : 0;

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><Building2 size={20} /></span>
          <div>
            <h4 className="text-sm font-black text-emerald-950">تدريب 1: المصعد</h4>
            <p className="text-xs text-slate-600">ارتفع المصعد من الطابق الأرضي (<TeX tex="0" />) مقدار <TeX tex="4" /> طوابق.</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 rounded-xl border border-emerald-200/70 bg-white px-4 py-3 text-xs font-bold text-slate-600">
          <span>مستوى الأرض <TeX tex="0" /></span>
          <span>←</span>
          <span className="rounded-lg bg-emerald-100 px-3 py-1 font-black text-emerald-900" dir="ltr">
            {response.elevator?.trim() ? `الطابق ${elevPos >= 0 ? `+${elevPos}` : elevPos}` : "أدخل العدد"}
          </span>
        </div>
        <SignedNumericField
          field={elevField}
          value={response.elevator ?? ""}
          onChange={v => onChange("elevator", v)}
          disabled={disabled}
        />
      </div>

      <div className="rounded-2xl border border-sky-200 bg-sky-50/40 p-4 space-y-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-700"><Waves size={20} /></span>
          <div>
            <h4 className="text-sm font-black text-sky-950">تدريب 2: الغواصة</h4>
            <p className="text-xs text-slate-600">غطست الغواصة <TeX tex="25" /> مترًا تحت سطح البحر (<TeX tex="0" />).</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 rounded-xl border border-sky-200/70 bg-white px-4 py-3 text-xs font-bold text-slate-600">
          <span>سطح البحر <TeX tex="0" /></span>
          <span>←</span>
          <span className="rounded-lg bg-sky-100 px-3 py-1 font-black text-sky-900" dir="ltr">
            {response.submarine?.trim() ? `${subPos} m` : "أدخل العدد"}
          </span>
        </div>
        <SignedNumericField
          field={subField}
          value={response.submarine ?? ""}
          onChange={v => onChange("submarine", v)}
          disabled={disabled}
          unit="m"
        />
      </div>
    </div>
  );
}

function CalcABWidget({ view, response, onChange, disabled }: Props) {
  const groupA = BOOK_CALC_AB.filter(item => item.group === "A");
  const groupB = BOOK_CALC_AB.filter(item => item.group === "B");
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {[
        { title: "المجموعة A", tone: "border-violet-200 bg-violet-50/40", badge: "bg-violet-600", items: groupA },
        { title: "المجموعة B", tone: "border-teal-200 bg-teal-50/40", badge: "bg-teal-600", items: groupB },
      ].map(group => (
        <div key={group.title} className={`space-y-3 rounded-2xl border p-4 ${group.tone}`}>
          <div className="flex items-center gap-2">
            <span className={`rounded-lg px-2.5 py-1 text-xs font-black text-white ${group.badge}`}>{group.title}</span>
            <span className="text-xs font-bold text-slate-500">اكتب الناتج الصحيح بإشارته</span>
          </div>
          {group.items.map(item => {
            const field = view.fields.find(f => f.key === item.key)!;
            return (
              <SignedNumericField
                key={item.key}
                field={field}
                value={response[item.key] ?? ""}
                onChange={v => onChange(item.key, v)}
                disabled={disabled}
                formula={item.tex}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function CalcCWidget({ view, response, onChange, disabled }: Props) {
  return (
    <div className="space-y-4">
      <p className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-2.5 text-xs font-bold leading-6 text-amber-900">
        فكرة مساعدة: في الكتابة المختزلة، كل عدد يحمل إشارته إلى يساره. يمكنك تجميع الأعداد الموجبة معًا والسالبة معًا ثم حساب الناتج!
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {BOOK_CALC_C.map(item => {
          const field = view.fields.find(f => f.key === item.key)!;
          return (
            <SignedNumericField
              key={item.key}
              field={field}
              value={response[item.key] ?? ""}
              onChange={v => onChange(item.key, v)}
              disabled={disabled}
              formula={item.tex}
            />
          );
        })}
      </div>
    </div>
  );
}

function MatchShortWidget({ view, response, onChange, disabled }: Props) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const cards = BOOK_MATCH_LEFT_ORDER;
  const compactValue = (display: string) => display.replace(/\s+/g, "");

  function place(fieldKey: string, value: string) {
    const clean = value.replace(/\s+/g, "");
    const field = view.fields.find(f => f.key === fieldKey);
    if (!disabled && field?.choices?.includes(clean)) {
      onChange(fieldKey, clean);
      setSelectedCard(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-3 text-center text-xs font-extrabold text-slate-500">
          بطاقات الصيغ المُبسّطة (المختزلة) — اختر بطاقة أو اسحبها إلى العبارة المطابقة:
        </p>
        <div className="practice-palette" dir="ltr" aria-label="بطاقات الصيغ المختزلة">
          {cards.map(display => {
            const val = compactValue(display);
            const used = Object.values(response).includes(val);
            return (
              <button
                key={val}
                type="button"
                disabled={disabled}
                draggable={!disabled}
                aria-label={`بطاقة ${display}`}
                aria-pressed={selectedCard === val}
                onDragStart={event => {
                  event.dataTransfer.setData("text/plain", val);
                  setSelectedCard(val);
                }}
                onClick={() => setSelectedCard(selectedCard === val ? null : val)}
                className={`practice-value-card ${selectedCard === val ? "is-selected" : ""} ${used ? "opacity-75" : ""}`}
              >
                <TeX tex={display} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2.5">
        {BOOK_MATCH_PAIRS.map(pair => {
          const placed = response[pair.key];
          const placedDisplay = BOOK_MATCH_PAIRS.find(p => p.short === placed)?.displayShort ?? placed;
          return (
            <div
              key={pair.key}
              data-drop-field={pair.key}
              onDragOver={event => event.preventDefault()}
              onDrop={event => {
                event.preventDefault();
                place(pair.key, event.dataTransfer.getData("text/plain"));
              }}
              className="grid items-center gap-3 rounded-2xl border border-violet-200/80 bg-violet-50/40 p-3 sm:grid-cols-[1fr_auto_1fr]"
            >
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-lg font-bold">
                <TeX tex={pair.expression} />
              </div>
              <span className="text-center text-sm font-black text-violet-400">←</span>
              <button
                type="button"
                disabled={disabled}
                aria-label={`ضع الصيغة المختزلة للعبارة ${pair.expression}`}
                onClick={() => selectedCard && place(pair.key, selectedCard)}
                className="flex min-h-[54px] w-full items-center justify-center rounded-xl border-2 border-dashed border-violet-300 bg-white/90 px-4 py-2 text-lg font-extrabold text-violet-800 hover:bg-white"
              >
                {placed ? (
                  <TeX tex={placedDisplay} />
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <ArrowDown size={15} /> اختر بطاقة ثم اضغط هنا
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <p className="practice-widget-note">
        <MousePointer2 size={13} /> يمكنك سحب البطاقة وإفلاتها، أو النقر على البطاقة ثم النقر على الخانة المقابلة للعبارة.
      </p>
    </div>
  );
}

function LineOpsWidget({ view, response, onChange, disabled }: Props) {
  const ticks = Array.from({ length: 13 }, (_, i) => i - 6);
  return (
    <div className="space-y-5">
      {BOOK_LINE_OPS.map(item => {
        const field = view.fields.find(f => f.key === item.key)!;
        const currentRaw = response[item.key];
        const hasVal = currentRaw !== undefined && currentRaw.trim() !== "" && Number.isFinite(Number(currentRaw));
        const endVal = hasVal ? Number(currentRaw) : undefined;
        return (
          <div key={item.key} className="practice-line-game space-y-3" data-line-op={item.key}>
            <div className="flex flex-wrap items-center justify-between gap-2 px-3">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-teal-600 text-xs font-black text-white" dir="ltr">
                  {item.label}
                </span>
                <span className="text-base font-black text-ink">
                  <TeX tex={item.tex} />
                </span>
              </div>
              <span className="text-xs font-bold text-teal-800">
                البداية عند <TeX tex={String(item.a)} /> · النقطة المختارة:{" "}
                {hasVal ? <TeX tex={String(endVal)} /> : "لم تُعيَّن بعد"}
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl bg-white px-2 py-1">
              <IntegerLineSVG
                min={-6}
                max={6}
                startPoint={item.a}
                endPoint={endVal}
                compact
                ariaTitle={`مستقيم العملية ${item.label}: ${item.tex}`}
                ariaDesc={`نبدأ عند ${item.a} ونعيّن الناتج على المستقيم من -6 إلى 6.`}
              />
            </div>

            <div className="practice-line-choices" dir="ltr">
              {ticks.map(t => (
                <button
                  key={t}
                  type="button"
                  disabled={disabled}
                  aria-label={`${field.label}: تعيين الناتج عند ${t}`}
                  aria-pressed={currentRaw === String(t)}
                  onClick={() => onChange(item.key, String(t))}
                >
                  {t}
                </button>
              ))}
            </div>

            <label className="block px-4">
              <span className="sr-only">{field.label}</span>
              <input
                aria-label={field.label}
                type="range"
                min={-6}
                max={6}
                step={1}
                value={endVal ?? item.a}
                disabled={disabled}
                onChange={e => onChange(item.key, e.target.value)}
                dir="ltr"
                className="w-full accent-teal-600"
              />
            </label>
          </div>
        );
      })}
    </div>
  );
}

const REASONING_CARDS = [
  {
    key: "counter",
    badge: "تحقق من فهمك",
    prompt: "أي مثال عددي يبيّن خطأ القول: «ناتج جمع عددين أحدهما موجب تمامًا والآخر سالب تمامًا هو عدد موجب دومًا»؟",
    options: [
      { value: "A", text: "\\((+7)+(-2)=+5\\)" },
      { value: "B", text: "\\((+3)+(-8)=-5\\) (الناتج سالب وليس موجبًا)" },
      { value: "C", text: "\\((+4)+(+6)=+10\\)" },
      { value: "D", text: "\\((-4)+(-6)=-10\\)" },
    ],
  },
  {
    key: "whyComm",
    badge: "تدريب 6 — (1)",
    prompt: "ما التفسير الرياضي الصحيح للمساواة \\(-9+3=3-9\\)؟",
    options: [
      { value: "A", text: "لأن عملية الطرح تبديلية في مجموعة الأعداد الصحيحة." },
      { value: "B", text: "لأن \\(-9+3\\) هي الكتابة المختزلة للجمع \\((-9)+(+3)\\)، والجمع تبديلي فيساوي \\((+3)+(-9)=3-9\\)." },
      { value: "C", text: "لأن إشارة العدد السالب تختفي عند تغيير ترتيب العددين." },
    ],
  },
  {
    key: "whyAssoc",
    badge: "تدريب 6 — (2)",
    prompt: "ما التفسير الرياضي الصحيح للمساواة \\(5-3-1=(5-3)-1\\)؟",
    options: [
      { value: "A", text: "لأن الطرح عملية تجميعية يمكن وضع الأقواس فيها في أي موضع." },
      { value: "B", text: "لأن \\(5-3-1\\) هي الكتابة المختزلة للجمع \\((+5)+(-3)+(-1)\\)، والجمع تجميعي فيساوي \\(((+5)+(-3))+(-1)=(5-3)-1\\)." },
      { value: "C", text: "لأننا نطرح \\(3-1=2\\) أولًا ثم نطرح الناتج من \\(5\\)." },
    ],
  },
] as const;

function ReasoningWidget({ response, onChange, disabled }: Props) {
  return (
    <div className="space-y-4">
      {REASONING_CARDS.map(card => (
        <div key={card.key} className="rounded-2xl border border-indigo-200/80 bg-white p-4">
          <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-extrabold text-indigo-700">
            {card.badge}
          </span>
          <p className="mt-2 text-sm font-extrabold leading-7 text-ink">
            <MathText text={card.prompt} />
          </p>
          <div className="mt-3 grid gap-2">
            {card.options.map(opt => {
              const picked = response[card.key] === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={disabled}
                  aria-label={`${card.key}: الخيار ${opt.value}`}
                  aria-pressed={picked}
                  onClick={() => onChange(card.key, opt.value)}
                  className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-right text-sm leading-7 transition ${
                    picked
                      ? "border-indigo-600 bg-indigo-50 font-bold text-indigo-950"
                      : "border-slate-200 bg-slate-50/40 text-slate-700 hover:border-indigo-300"
                  }`}
                >
                  <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-black ${
                    picked ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                    {opt.value}
                  </span>
                  <span className="flex-1"><MathText text={opt.text} /></span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function IntegerPracticeWidgets(props: Props) {
  switch (props.view.kind) {
    case "int-warmup": return <WarmupWidget {...props} />;
    case "int-game": return <GamePathsWidget {...props} />;
    case "int-context": return <ElevatorSubWidget {...props} />;
    case "int-calc-ab": return <CalcABWidget {...props} />;
    case "int-calc-c": return <CalcCWidget {...props} />;
    case "int-match": return <MatchShortWidget {...props} />;
    case "int-lines": return <LineOpsWidget {...props} />;
    case "int-reasoning": return <ReasoningWidget {...props} />;
    default: return null;
  }
}
