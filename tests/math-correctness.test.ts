import assert from "node:assert/strict";
import { test } from "node:test";
import { isCorrect, normalizeAnswer } from "../src/lib/assessment";
import { displayRational, equalExactText, isInvalidNumericText, normalizeDigits, normalizeNumericText, parseExactNumber, rationalText, reduceFraction } from "../src/lib/numbers";
import { lineStatusText, percentOf, projectOnLine, unitRate } from "../src/lib/lab-math";
import { gradePractice, validatePracticeResponse, type PracticeBank, type PracticeDefinition } from "../src/lib/practice-grading";

const domain = { min: -2, max: 2, start: 20, width: 360 } as const;
const xOf = (value: number) => domain.start + ((value - domain.min) / (domain.max - domain.min)) * domain.width;

// ————— تطبيع الأرقام —————
test("تطبيع الأرقام: غربية وعربية وهندية ومسافات وفاصل عشري", () => {
  assert.equal(normalizeDigits("٠١٢٣٤٥٦٧٨٩"), "0123456789");
  assert.equal(normalizeDigits("۰۱۲۳۴۵۶۷۸۹"), "0123456789");
  assert.equal(normalizeNumericText("  ٧٠٠٠٠  "), "70000");
  assert.equal(normalizeNumericText("٦٫٥"), "6.5");
  assert.equal(normalizeNumericText("۷۰۰۰۰"), "70000");
  assert.equal(normalizeNumericText("\u200f70\u200f000"), "70000");
  assert.equal(normalizeAnswer(" 70,000 "), "70000");
  // النص غير الصالح لا يُحوَّل إلى صفر.
  assert.equal(parseExactNumber("abc"), null);
  assert.equal(parseExactNumber("12 34"), null);
  assert.equal(parseExactNumber("70,00"), null);
  assert.equal(parseExactNumber("1/0"), null);
  assert.equal(parseExactNumber(""), null);
});

// ————— دقة مقارنة الإجابات —————
test("رفض الفروق العشرية الصغيرة التي يخفيها Number", () => {
  assert.equal(isCorrect("70000", "70000.000000000001", "problem"), false);
  assert.equal(isCorrect("0.1", "0.10000000000000001", "problem"), false);
  assert.equal(isCorrect("1", "1.0000000000000002", "fill"), false);
  assert.equal(isCorrect("0.3", "0.30000000000000004", "problem"), false);
  // Number("70000.000000000001") === 70000، لكن المقارنة الدقيقة ترفضها.
  assert.equal(Number("70000.000000000001") === 70000, true);
});

test("قبول الصيغ المتكافئة فعلًا فقط: أصفار زائدة وكسور وأرقام عربية", () => {
  assert.equal(isCorrect("70000", "70000.000", "problem"), true);
  assert.equal(isCorrect("70000", "70,000", "problem"), true);
  assert.equal(isCorrect("70000", "٧٠٠٠٠", "problem"), true);
  assert.equal(isCorrect("70000", "۷۰۰۰۰", "problem"), true);
  assert.equal(isCorrect("70000", " 70000 ", "problem"), true);
  assert.equal(isCorrect("0.5", ".5", "fill"), true);
  assert.equal(isCorrect("0.5", "0.50", "fill"), true);
  assert.equal(isCorrect("0", "-0", "problem"), true);
  assert.equal(isCorrect("1/2", "0.5", "problem"), true);
  assert.equal(isCorrect("2/4", "1/2", "problem"), true);
  assert.equal(isCorrect("-3/4", "-0.75", "problem"), true);
  assert.equal(isCorrect("1/3", "0.333", "problem"), false, "0.333 ليست 1/3");
  assert.equal(isCorrect("70000", "70000abc", "problem"), false);
  assert.equal(isCorrect("70000", "70,00", "problem"), false);
  assert.equal(isCorrect("0", "", "fill"), false);
});

test("الأعداد الكبيرة تُقارن بدقة تتجاوز حدود الفاصلة العائمة", () => {
  assert.equal(isCorrect("9007199254740993", "9007199254740992", "problem"), false);
  assert.equal(isCorrect("9007199254740993", "9007199254740993", "problem"), true);
  assert.equal(isCorrect("100000000000000000000", "100000000000000000001", "problem"), false);
  const toArabicDigits = (text: string) => text.replace(/\d/g, digit => String.fromCharCode(0x0660 + Number(digit)));
  assert.equal(isCorrect("100000000000000000000", toArabicDigits("100000000000000000000"), "problem"), true);
  assert.equal(equalExactText("123456789012345678901234567890", "123456789012345678901234567891"), false);
});

test("الاختيار من متعدد والصح/الخطأ يبقيان مقارنة نصية صارمة", () => {
  assert.equal(isCorrect("1", "1.0", "mcq"), false);
  assert.equal(isCorrect("1", "01", "mcq"), false);
  assert.equal(isCorrect("true", "true", "truefalse"), true);
  assert.equal(isCorrect("true", "True", "truefalse"), false);
  assert.equal(isCorrect("false", "false ", "truefalse"), true);
});

test("تصحيح التمارين الرقمية يستخدم المقارنة الدقيقة لا Number", () => {
  const definition: PracticeDefinition = {
    key: "synthetic",
    sourceOrder: 1,
    view: { kind: "digit-value", title: "تجربة", instruction: "اكتب القيمة", fields: [{ key: "value", label: "القيمة", type: "integer", max: 999999999999 }] },
    expected: { value: "999999999999" },
    hints: ["تلميح"],
    mistakes: { value: "راجع المنزلة" },
    solution: { steps: [{ title: "خطوة", text: "نص" }], final: "999999999999" },
  };
  assert.equal(gradePractice(definition, { value: "999999999999" }).correct, true);
  assert.equal(gradePractice(definition, { value: "999999999998" }).correct, false);
  assert.equal(gradePractice(definition, { value: "0999999999999" }).correct, true, "الأصفار البادئة صيغة مكافئة");
  assert.equal(gradePractice(definition, { value: "٩٩٩٩٩٩٩٩٩٩٩٩" }).correct, true);
  assert.equal(gradePractice(definition, { value: "999999999999.0000001" }).correct, false);
  const bank = { revision: "v", exercises: [definition] } as unknown as PracticeBank;
  assert.equal(bank.exercises.length, 1);
  assert.deepEqual(validatePracticeResponse(definition, { value: " ٩٩٩٩٩٩٩٩٩٩٩٩ " }), { value: "999999999999" });
  assert.throws(() => validatePracticeResponse(definition, { value: "1000000000000" }), /عددًا طبيعيًا صالحًا/);
});

// ————— القراءة العشرية الصادقة —————
test("العرض العشري دقيق عند الإمكان وموسوم بالتقريب عند الحاجة", () => {
  assert.deepEqual(rationalText(12, 1), { text: "12", approximate: false, undefined: false });
  assert.deepEqual(rationalText(1, 8), { text: "0.125", approximate: false, undefined: false });
  assert.deepEqual(rationalText(3, 4), { text: "0.75", approximate: false, undefined: false });
  assert.deepEqual(rationalText(-1, 2), { text: "-0.5", approximate: false, undefined: false });
  assert.deepEqual(rationalText(0, 5), { text: "0", approximate: false, undefined: false });
  assert.deepEqual(rationalText(1, 3, { maxFractionDigits: 3 }), { text: "0.333", approximate: true, undefined: false });
  assert.equal(rationalText(1, 0).undefined, true);
  assert.equal(displayRational(1, 3, 3), "≈ 0.333");
  assert.equal(displayRational(1, 4, 3), "0.25");
  assert.equal(displayRational(12, 1, 3), "12");
  assert.deepEqual(reduceFraction(6, 8), { numerator: 3, denominator: 4 });
  assert.deepEqual(reduceFraction(4, -6), { numerator: -2, denominator: 3 });
});

// ————— خط الأعداد: الموضع = القيمة —————
test("نقطة خط الأعداد تقع على قيمتها الحقيقية دون تقريب", () => {
  assert.equal(projectOnLine(-2, domain).x, xOf(-2));
  assert.equal(projectOnLine(0, domain).x, xOf(0));
  assert.equal(projectOnLine(1.5, domain).x, xOf(1.5));
  assert.equal(projectOnLine(2, domain).x, xOf(2));
  const third = projectOnLine(1 / 3, domain);
  assert.equal(third.inRange, true);
  assert.ok(third.x !== null && Math.abs(third.x - xOf(1 / 3)) < 1e-9);
  const seventh = projectOnLine(1 / 7, domain);
  assert.ok(seventh.x !== null && Math.abs(seventh.x - xOf(1 / 7)) < 1e-9);
});

test("القيم خارج المجال لا تُرسم في موضع كاذب وتُعلن صراحة", () => {
  const report = projectOnLine(12, domain); // الحالة المعروفة: 12/1 ظهر عند التدريجة 2
  assert.equal(report.inRange, false);
  assert.equal(report.x, null, "لا إحداثي مضلل داخل المجال");
  assert.equal(report.edgeX, domain.start + domain.width);
  assert.equal(report.direction, "right");
  const negative = projectOnLine(-3, domain);
  assert.equal(negative.inRange, false);
  assert.equal(negative.x, null);
  assert.equal(negative.edgeX, domain.start);
  assert.equal(negative.direction, "left");
  assert.equal(projectOnLine(2.0001, domain).inRange, false);
  assert.equal(projectOnLine(Number.NaN, domain).x, null);
  assert.match(lineStatusText(12, domain), /خارج المجال المرسوم/);
  assert.match(lineStatusText(12, domain), /لا تُرسم في موضعها/);
  assert.match(lineStatusText(1, domain), /في موضعها الحقيقي/);
  assert.match(lineStatusText(-3, domain), /أصغر من -2/);
});

test("كل كسر داخل المجال يعطي موضعًا مطابقًا لقيمته", () => {
  for (let denominator = 1; denominator <= 12; denominator++) {
    for (let numerator = -24; numerator <= 24; numerator++) {
      const value = numerator / denominator;
      const projection = projectOnLine(value, domain);
      if (value < domain.min || value > domain.max) {
        assert.equal(projection.inRange, false, `${numerator}/${denominator} خارج المجال`);
        assert.equal(projection.x, null);
        continue;
      }
      assert.equal(projection.inRange, true);
      assert.ok(projection.x !== null && Math.abs(projection.x - xOf(value)) < 1e-9, `الموضع لا يطابق ${numerator}/${denominator}`);
    }
  }
});

// ————— النسبة ومعدل الوحدة —————
test("معدل الوحدة يُحسب فعلًا ويُعلن القسمة على صفر", () => {
  assert.equal(unitRate(80, 20), 4);
  assert.equal(unitRate(75, 3), 25);
  assert.equal(unitRate(0, 20), 0);
  assert.equal(unitRate(80, 0), null);
  assert.equal(unitRate(Number.NaN, 2), null);
  assert.equal(percentOf(20, 80), 25);
  assert.equal(percentOf(0, 80), 0);
  assert.equal(percentOf(20, 0), null);
  assert.equal(displayRational(80, 20, 3), "4");
  const repeating = rationalText(80, 3, { maxFractionDigits: 3 });
  assert.equal(repeating.approximate, true);
  assert.equal(displayRational(80, 3, 3), "≈ 26.667");
});

// ————— الكسور غير المعرّفة والمدخلات العددية غير الصالحة —————
test("الكسور غير المعرّفة لا تُعدّ صحيحة حتى مع تطابق النص", () => {
  assert.equal(isCorrect("1/0", "1/0", "problem"), false);
  assert.equal(isCorrect("0/0", "0/0", "problem"), false);
  assert.equal(isCorrect("1/0", "1/0", "fill"), false);
  assert.equal(isCorrect("0/0", "0/0", "fill"), false);
  assert.equal(isCorrect("-1/0", "-1/0", "problem"), false);
  assert.equal(isCorrect("1/0", "1/0", "mcq"), false);
  assert.equal(isCorrect("1/0", "غير معرّف", "problem"), false);
  assert.equal(isCorrect("2/0", "1/0", "problem"), false);
  // الكسور المتكافئة تبقى صحيحة.
  assert.equal(isCorrect("3/4", "6/8", "problem"), true);
  assert.equal(isCorrect("1/2", "0.5", "problem"), true);
});

test("الإجابات النصية العادية تستمر بالعمل كما كانت", () => {
  assert.equal(isCorrect("مثلث", "مثلث", "problem"), true);
  assert.equal(isCorrect("مثلث", "مربع", "problem"), false);
  assert.equal(isCorrect("مثلث", " مثلث ", "problem"), true);
  assert.equal(isCorrect("180°", "180°", "fill"), true);
  assert.equal(isCorrect("صح", "صح", "problem"), true);
  assert.equal(isCorrect("مثلث", "1/0", "problem"), false, "مدخل عددي غير صالح لا يمر نصيًا");
});

test("المدخلات العددية غير الصالحة لا تمر باعتبارها صحيحة", () => {
  assert.equal(isInvalidNumericText("1/0"), true);
  assert.equal(isInvalidNumericText("0/0"), true);
  assert.equal(isInvalidNumericText("70,00"), true);
  assert.equal(isInvalidNumericText("12 34"), true);
  assert.equal(isInvalidNumericText("1/2/3"), true);
  assert.equal(isInvalidNumericText("3/4"), false);
  assert.equal(isInvalidNumericText("0.75"), false);
  assert.equal(isInvalidNumericText("70000"), false);
  assert.equal(isInvalidNumericText("مثلث"), false);
  assert.equal(isInvalidNumericText("180°"), false);
  assert.equal(isInvalidNumericText(""), false);
  assert.equal(isInvalidNumericText("-"), false);
  assert.equal(isCorrect("70,00", "70,00", "problem"), false);
  assert.equal(isCorrect("12 34", "12 34", "problem"), false);
  assert.equal(isCorrect("1/2/3", "1/2/3", "problem"), false);
  assert.equal(isCorrect("0.75", "0,75", "problem"), false);
  assert.equal(isCorrect("100", "١٠٠", "problem"), true);
});
