# سجل الدروس وحزم المحتوى

مصدر الحقيقة الوحيد لهوية الدروس وترتيبها وحالة نشرها هو `src/content/lesson-registry.json`.
لا تُشتق المعرّفات من موضع الدرس في قائمة، ولا يوجد «درس أول» مفترض في أي مكوّن عام.

## شكل السجل

```json
{
  "version": 1,
  "units": [{ "id": 1, "key": "numbers-and-operations", "order": 1, "title": "…", "description": "…", "icon": "…", "color": "…" }],
  "lessons": [
    {
      "id": 1, "unitId": 1, "order": 1, "title": "الأعداد الطبيعية", "sourcePage": 3,
      "status": "published",
      "key": "natural-numbers",
      "contentRef": "lesson-1.json",
      "assessmentRef": "assessments/natural-numbers.json",
      "practiceRef": "practice/natural-numbers.json"
    },
    { "id": 2, "unitId": 1, "order": 2, "title": "…", "sourcePage": 5, "status": "pending" }
  ]
}
```

- `id`: معرّف ثابت وفريد، هو نفسه رقم الرابط `/lessons/<id>/` و`/quizzes/lesson/<id>/`، ولا يتغير عند الإضافة أو إعادة الترتيب.
- `order`: ترتيب العرض داخل الوحدة فقط، لا هوية. تكراره داخل الوحدة مرفوض.
- `status`: `published` أو `pending` فقط. الدرس غير المنشور لا يحمل `key` ولا أي مرجع حزمة.
- `key`, `contentRef`, `assessmentRef`, `practiceRef`: مطلوبة/مسموحة للدرس المنشور فقط، والمفتاح بصيغة kebab-case فريد.

الأنواع والفحص الصارم في `src/lib/lesson-registry.ts`، والنسخة المفحوصة وقت التشغيل تُصدَّر من
`src/content/lesson-registry.ts` باسم `LESSON_REGISTRY`. واجهة الصفحات هي `src/lib/curriculum.ts`
(`units`, `lessons`, `publishedLessons`, `findLesson`, `findUnit`, `lessonsInUnit`, `lessonPackage`).

## ربط الحزمة

كل درس منشور له ملفات مستقلة، تُعلن في السجل وتُسجَّل في الفهارس:

| الفهرس | الملف | الغرض |
| --- | --- | --- |
| `src/content/lesson-index.ts` | `lesson-1.json` | المحتوى والمراحل والأهداف والدفتر |
| `src/content/assessment-index.ts` | `assessments/natural-numbers.json` | بنك أسئلة الاختبار |
| `src/content/practice-index.ts` | `practice/natural-numbers.json` | بنك المهام التفاعلية والتلميحات والحلول |

كل ملف يحمل `lessonId` يجب أن يطابق معرّف الدرس، والمحتوى يعلن `assessmentRef`/`practiceRef` مطابقين للسجل.
المكوّنات العامة (`QuizPlayer`, `src/lib/local-practice.ts`, صفحات الاختبارات والدرس واللوحة و`/teacher`)
تقرأ الحزمة عبر `assessmentForLesson` / `practiceForLesson` / `lessonPackage`، ولا تستورد بنكًا بعينه.
المعرّف المجهول يعيد «لا شيء» ويؤدي إلى `notFound()`، لا إلى سقوط على الدرس الأول.

## المدقق

`scripts/validate-content.ts` (يُشغَّل قبل `next build`) يستدعي `validateLessonPackages` الذي يجمع:

1. فحص السجل: الحقول المطلوبة، رفض الحقول غير المعروفة والمكررة، الربط بالوحدة، تفرّد `id` و`key` و`order`، ومنع مراجع الحزم على درس غير منشور.
2. وجود كل مرجع في فهرسه، ومنع أن يتشارك درسا نشر بنكًا واحدًا، ومنع بقاء ملف في الفهرس بلا درس منشور يعلنه.
3. تطابق `lessonId` بين المحتوى والاختبار والتمارين والسجل، وتطابق `assessmentRef`/`practiceRef` المعلنة في المحتوى مع السجل.
4. مراحل الدرس المعروفة فقط (`STAGES`)، وفحص كل كتلة: النوع المعروف، الحقول المطلوبة والمسموحة، قيم التعداد (الشكل، أداة المختبر، وضع المختبر، مفاتيح الاختيار)، وتكرار التعشيش داخل `guide`.
5. بنية صارمة لكل كائنات الحزم: ملف الدرس وحلوله وأوراق دفتره، وملف الاختبار وأسئلته، وملف التمارين ومهامه وأسئلة تفاعلها وحقولها وتلميحاتها وحلولها. أي حقل زائد أو حقل مطلوب مفقود أو نوع غير صالح (بما فيه تلميح فارغ أو مسافات فقط) يوقف البناء برسالة تحمل اسم الملف والمسار، ولا تُمرَّر أي مصفوفة أو كائن إلى عملية قبل التحقق من شكله، فلا تظهر أخطاء JavaScript خامة.
6. مراجع التمارين: كل `practiceId` في المحتوى موجود في بنك التمارين، وكل `hint`/`solution` مطلوب قائم.
7. إعادة استخدام الفحصين التربويين القائمين `validateLessonPublication` و`validatePracticeBank` بدل تكرارهما.

الرسائل تسمّي المصدر والحقل والمشكلة، مثل:
`حزمة المحتوى (src/content/lesson-registry.json) ← lessons[id=1 «natural-numbers»].assessmentRef: بنك الاختبار مربوط بالدرس 1 لا بالدرس 2.`

أي نوع كتلة غير معروف أو مرجع غير مطابق يفشل البناء؛ لا يوجد تجاهل صامت ولا سقوط إلى بديل.

## النشر والتصدير

`generateStaticParams` في `/lessons/[lessonId]` و`/quizzes/lesson/[lessonId]` يُبنى من `publishedLessons` فقط،
وصفحاتها تستدعي `notFound()` لغير المنشور. لهذا لا تُصدَّر صفحات درس ناقص ولا تُفهرس، وبطاقات الدرس في
`/units/[unitId]` و`/quizzes` تظهر للدرس غير المنشور بلا رابط.

`scripts/check-export.mjs` يقرأ السجل نفسه ويشترط وجود صفحة لكل درس منشور، ويشترط **غياب** صفحة الدرس وصفحة
اختباره لكل درس غير منشور، ثم يفحص كل مرجع محلي في HTML المصدر. عدد الصفحات يتبع حالة السجل، لا أرقامًا مثبتة.

## إضافة درس جديد

1. أضف الدرس إلى `lessons` في السجل بمعرّف جديد غير مستخدم (لا تعِد ترقيم الموجود) وحالة `pending`.
2. أنشئ ملفات الحزمة الثلاثة وسجّلها في الفهارس، ثم املأ `lessonId` و`key` والمراجع في السجل.
3. شغّل `npm run build` (يشمل المدقق) ثم `npm run check:export` و`npm test` و`npm run test:browser`.
4. لا تنشر الدرس إلا باكتمال محتواه ودفتره وحلوله واختباره وأنشطته؛ النشر يعني `status: "published"` مع حزمة كاملة صالحة.

اختبارات القبول للسجل والحزم في `tests/lesson-registry.test.ts` وتستخدم بيانات اصطناعية مستقلة عن محتوى الدرس الأول.
