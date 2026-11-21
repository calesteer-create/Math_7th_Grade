"use client";

import { useId } from "react";
import { Check, Sparkles } from "lucide-react";
import TeX from "@/components/TeX";
import MathText from "@/components/MathText";
import {
  BOOK_CALC_GROUP_A,
  BOOK_CALC_GROUP_B,
  BOOK_CALC_GROUP_C,
  BOOK_SIGN_EXERCISES,
  MULDIV_WARMUP_ROWS,
} from "@/lib/integers-mul-div";
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

function SignedNumericCard({
  field,
  value,
  onChange,
  disabled,
  formula,
}: {
  field: PracticeField;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  formula?: string;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="block min-w-0 rounded-xl border border-slate-200 bg-white p-3.5 text-center shadow-2xs">
      <span className="mb-1.5 block text-[11px] font-extrabold text-slate-600">{field.label}</span>
      {formula && (
        <div className="mb-2.5 rounded-lg bg-slate-50 py-2 text-base font-bold text-ink">
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
          placeholder="مثال: -12"
          className="input"
          dir="ltr"
        />
      </span>
    </label>
  );
}

function WarmupWidget({ response, onChange, disabled }: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-violet-200 bg-white shadow-2xs">
      <table dir="ltr" className="w-full min-w-[580px] border-collapse text-center" aria-label="جدول انطلاقة نشطة التفاعلي للضرب والقسمة">
        <thead>
          <tr>
            {["A", "B", "C"].map(letter => (
              <th
                key={letter}
                scope="col"
                className="w-[18%] border-e border-violet-200 bg-violet-100/90 py-3 font-serif text-lg font-bold italic text-violet-900"
              >
                <TeX tex={letter} />
              </th>
            ))}
            <th scope="col" className="bg-emerald-100/90 px-4 text-xs font-extrabold text-emerald-950" dir="rtl">
              في كل سطر إجابة واحدة صحيحة (اضغط على الخيار الصحيح)
            </th>
          </tr>
        </thead>
        <tbody>
          {MULDIV_WARMUP_ROWS.map((row, idx) => (
            <tr key={row.id} className="border-t border-violet-200">
              {row.options.map(opt => {
                const picked = response[row.id] === opt.key;
                return (
                  <td key={opt.key} className="border-e border-violet-200 p-2 align-middle">
                    <button
                      type="button"
                      disabled={disabled}
                      aria-label={`${row.id}: الخيار ${opt.key} (${opt.label})`}
                      aria-pressed={picked}
                      onClick={() => onChange(row.id, opt.key)}
                      className={`flex w-full flex-col items-center justify-center gap-1 rounded-xl border-2 px-2 py-2.5 transition ${
                        picked
                          ? "border-violet-600 bg-violet-100/90 font-black text-violet-950 shadow-xs ring-2 ring-violet-400/40"
                          : "border-slate-200 bg-slate-50/60 font-bold text-slate-700 hover:border-violet-300 hover:bg-violet-50/50"
                      }`}
                    >
                      <span className="text-[11px] font-black text-violet-600">
                        <TeX tex={opt.key} />
                      </span>
                      <span className="text-base font-extrabold">
                        {opt.tex ? <TeX tex={opt.tex} /> : <span dir="rtl">{opt.label}</span>}
                      </span>
                      {picked && <Check size={14} className="text-violet-700" />}
                    </button>
                  </td>
                );
              })}
              <th scope="row" className="bg-emerald-50/60 px-4 py-3 text-right text-sm font-bold leading-7 text-emerald-950 align-middle" dir="rtl">
                <span className="me-2 rounded-full bg-emerald-200/80 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-900">
                  السطر <bdi dir="ltr">{idx + 1}</bdi>
                </span>
                <span className="font-extrabold text-ink"><MathText text={row.prompt} /></span>
              </th>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SignsWidget({ view, response, onChange, disabled }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {BOOK_SIGN_EXERCISES.map(item => {
        const field = view.fields.find(f => f.key === item.key)!;
        const picked = response[item.key];
        return (
          <div key={item.key} className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-2xs">
            <span className="text-[11px] font-extrabold text-slate-500">{field.label}</span>
            <div className="my-2.5 rounded-xl bg-slate-50 py-3 text-lg font-black text-ink">
              <TeX tex={item.tex} />
            </div>
            <div className="grid grid-cols-2 gap-2.5" dir="ltr">
              {[
                { val: "+", label: "إشارة موجبة (+)", tone: "emerald" },
                { val: "-", label: "إشارة سالبة (−)", tone: "rose" },
              ].map(opt => {
                const isSelected = picked === opt.val;
                return (
                  <button
                    key={opt.val}
                    type="button"
                    disabled={disabled}
                    aria-label={`${field.label}: ${opt.label}`}
                    aria-pressed={isSelected}
                    onClick={() => onChange(item.key, opt.val)}
                    className={`rounded-xl border-2 px-3 py-2.5 text-sm font-extrabold transition ${
                      isSelected
                        ? opt.tone === "emerald"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200"
                          : "border-rose-600 bg-rose-50 text-rose-900 ring-2 ring-rose-200"
                        : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-violet-300"
                    }`}
                  >
                    <span dir="rtl">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CalcGroupWidget({
  items,
  view,
  response,
  onChange,
  disabled,
  tip,
}: Props & {
  items: readonly { key: string; index: number; tex: string; expected: number }[];
  tip: string;
}) {
  return (
    <div className="space-y-4">
      <p className="rounded-xl border border-teal-200 bg-teal-50/60 px-4 py-2.5 text-xs font-bold leading-6 text-teal-950">
        <MathText text={tip} />
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map(item => {
          const field = view.fields.find(f => f.key === item.key)!;
          return (
            <SignedNumericCard
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

function FillWidget({ view, response, onChange, disabled }: Props) {
  const f1 = view.fields.find(f => f.key === "f1")!;
  const f2 = view.fields.find(f => f.key === "f2")!;
  const f3a = view.fields.find(f => f.key === "f3a")!;
  const f3b = view.fields.find(f => f.key === "f3b")!;
  const f4 = view.fields.find(f => f.key === "f4")!;

  const aVal = response.f3a?.trim() ? Number(response.f3a) : null;
  const bVal = response.f3b?.trim() ? Number(response.f3b) : null;
  const pairProduct = aVal !== null && bVal !== null && Number.isFinite(aVal) && Number.isFinite(bVal) ? aVal * bVal : null;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 text-xs font-bold leading-6 text-indigo-950">
        <Sparkles size={14} className="me-1 inline" />
        <MathText text="احسب ناتج الأعداد المعلومة أولًا، ثم حدّد العدد الصحيح الذي يجعل الطرفين متساويين (انتبه إلى الإشارة!)." />
      </div>

      {/* 1 */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <span className="rounded-lg bg-violet-100 px-2.5 py-1 text-xs font-black text-violet-900">1</span>
        <div className="flex flex-wrap items-center gap-2 text-lg font-extrabold" dir="ltr">
          <TeX tex="(-3)(+5)(" />
          <input
            aria-label={f1.label}
            value={response.f1 ?? ""}
            onChange={e => onChange("f1", normalizeSignedInput(e.target.value))}
            disabled={disabled}
            placeholder="…"
            className="input w-24 text-center"
            dir="ltr"
          />
          <TeX tex=")=-15" />
        </div>
      </div>

      {/* 2 */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <span className="rounded-lg bg-violet-100 px-2.5 py-1 text-xs font-black text-violet-900">2</span>
        <div className="flex flex-wrap items-center gap-2 text-lg font-extrabold" dir="ltr">
          <TeX tex="(" />
          <input
            aria-label={f2.label}
            value={response.f2 ?? ""}
            onChange={e => onChange("f2", normalizeSignedInput(e.target.value))}
            disabled={disabled}
            placeholder="…"
            className="input w-24 text-center"
            dir="ltr"
          />
          <TeX tex=")(-2)(+14)=140" />
        </div>
      </div>

      {/* 3 */}
      <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-lg bg-violet-100 px-2.5 py-1 text-xs font-black text-violet-900">3</span>
          <div className="flex flex-wrap items-center gap-2 text-lg font-extrabold" dir="ltr">
            <TeX tex="(" />
            <input
              aria-label={f3a.label}
              value={response.f3a ?? ""}
              onChange={e => onChange("f3a", normalizeSignedInput(e.target.value))}
              disabled={disabled}
              placeholder="…"
              className="input w-20 text-center"
              dir="ltr"
            />
            <TeX tex=")(" />
            <input
              aria-label={f3b.label}
              value={response.f3b ?? ""}
              onChange={e => onChange("f3b", normalizeSignedInput(e.target.value))}
              disabled={disabled}
              placeholder="…"
              className="input w-20 text-center"
              dir="ltr"
            />
            <TeX tex=")(+9)(-2)=-36" />
          </div>
        </div>
        <p className="text-xs font-bold text-slate-500">
          توضيح: أي عددين صحيحين ناتج ضربهما <TeX tex="+2" /> يصحّان هنا
          {pairProduct !== null && (
            <>
              {" "}· ناتج العددين اللذين كتبتهما الآن هو <bdi dir="ltr" className="font-black text-violet-800">{pairProduct}</bdi>.
            </>
          )}
        </p>
      </div>

      {/* 4 */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <span className="rounded-lg bg-violet-100 px-2.5 py-1 text-xs font-black text-violet-900">4</span>
        <div className="flex flex-wrap items-center gap-2 text-lg font-extrabold" dir="ltr">
          <TeX tex="(-123)(-47)(" />
          <input
            aria-label={f4.label}
            value={response.f4 ?? ""}
            onChange={e => onChange("f4", normalizeSignedInput(e.target.value))}
            disabled={disabled}
            placeholder="…"
            className="input w-24 text-center"
            dir="ltr"
          />
          <TeX tex=")=0" />
        </div>
      </div>
    </div>
  );
}

const UNDERSTAND_CARDS = [
  {
    key: "q1",
    badge: "تحقق من فهمك",
    prompt: "إذا كانت إشارة ناتج جداء عددين صحيحين غير معدومين موجبة، فما إشارة العددين؟",
    options: [
      { value: "A", text: "للعددين الإشارة نفسها: إما كلاهما موجب تمامًا، أو كلاهما سالب تمامًا." },
      { value: "B", text: "لا بد أن يكون كلا العددين موجبًا دائمًا ولا يمكن أن يكونا سالبين." },
      { value: "C", text: "أحدهما موجب والآخر سالب." },
    ],
  },
  {
    key: "q2",
    badge: "خواص القسمة",
    prompt: "لماذا لا يصح تبديل العددين في عملية القسمة مثل \\((-24)\\div(-2)\\) و\\((-2)\\div(-24)\\)؟",
    options: [
      { value: "A", text: "لأن القسمة لا تحافظ على قاعدة الإشارات." },
      { value: "B", text: "لأن عملية القسمة ليست تبديلية وليست تجميعية في مجموعة الأعداد الصحيحة." },
      { value: "C", text: "لأن العدد الأكبر يجب أن يكون دائمًا موجبًا." },
    ],
  },
  {
    key: "q3",
    badge: "الكتابة المختزلة",
    prompt: "متى يمكن الاستغناء عن إشارة الضرب \\(\\times\\) في الكتابة المختزلة؟",
    options: [
      { value: "A", text: "بين أي عددين متجاورين حتى دون أقواس مثل \\(5\\times 8\\)." },
      { value: "B", text: "في عملية القسمة أيضًا قبل الأقواس." },
      { value: "C", text: "إذا جاء بعد إشارة الضرب حرف أو قوس، كما في \\(-15a\\) و\\((-5)(+8)\\) و\\(9(x+2)\\)." },
    ],
  },
] as const;

function UnderstandWidget({ response, onChange, disabled }: Props) {
  return (
    <div className="space-y-4">
      {UNDERSTAND_CARDS.map(card => (
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

export default function IntegersMulDivPracticeWidgets(props: Props) {
  switch (props.view.kind) {
    case "muldiv-warmup": return <WarmupWidget {...props} />;
    case "muldiv-signs": return <SignsWidget {...props} />;
    case "muldiv-calc-a":
      return (
        <CalcGroupWidget
          {...props}
          items={BOOK_CALC_GROUP_A}
          tip="حدّد الإشارة أولًا (متفقتان ← موجب، مختلفتان ← سالب)، ولا تنسَ أن \\((-4)(-2)\\) تعني ضربًا مختزلًا!"
        />
      );
    case "muldiv-calc-b":
      return (
        <CalcGroupWidget
          {...props}
          items={BOOK_CALC_GROUP_B}
          tip="انتبه: قسمة الصفر على عدد غير معدوم تساوي \\(0\\)، وعدّ الإشارات السالبة في جداء ثلاثة أعداد!"
        />
      );
    case "muldiv-calc-c":
      return (
        <CalcGroupWidget
          {...props}
          items={BOOK_CALC_GROUP_C}
          tip="في العبارة ذات الأقواس، احسب ما داخل كل قوس أولًا بدقة الإشارات ثم اضرب النواتج."
        />
      );
    case "muldiv-fill": return <FillWidget {...props} />;
    case "muldiv-understand": return <UnderstandWidget {...props} />;
    default: return null;
  }
}
