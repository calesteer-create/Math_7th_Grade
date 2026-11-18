# مراجعة تنبيهات npm audit

تاريخ الفحص: 18 نوفمبر 2026. ثُبّتت الحزم من `package-lock.json` باستخدام `npm ci`. أظهر `npm audit` **14 تنبيهًا عالي الخطورة**، وأظهر `npm audit --omit=dev` **صفر تنبيهات**. يشير العدد إلى حزم في سلاسل اعتماد، لا إلى 14 ثغرة أصلية مستقلة.

## السبب والأثر

الثغرة الأصلية هي [GHSA-fc5q-39xc-vjpf / CVE-2026-112366](https://github.com/advisories/GHSA-fc5q-39xc-vjpf): يمكن لنمط glob مُعدّ خصيصًا يحتوي extglob متكررًا أن يسبب استهلاكًا مفرطًا للمعالج (ReDoS) داخل `picomatch`. قاعدة البيانات تصنّف جميع الإصدارات حتى `4.0.7` متأثرة، ولا تسجل إصدارًا مصححًا حتى وقت الفحص. الإصدارات المثبتة هما `2.3.2` و`4.0.7`؛ والأخير أحدث إصدار منشور في npm وقت الفحص.

تأتي النسختان من أدوات التطوير، وليس من كود المتصفح أو موقع Pages الناتج. أهم المسارات في الشجرة:

- `eslint-config-next@16.4.6` ← `@next/eslint-plugin-next@16.4.6` ← `fast-glob@3.3.1` ← `micromatch@4.0.8` ← `picomatch@2.3.2`.
- `eslint-config-next@16.4.6` ← `eslint-import-resolver-typescript@3.10.1` ← `tinyglobby@0.2.17` ← `picomatch@4.0.7`، وكذلك عبر `fdir@6.5.0`.
- `eslint-config-next@16.4.6` ← `typescript-eslint@8.73.0` ← `@typescript-eslint/typescript-estree@8.73.0` ← `tinyglobby@0.2.17` ← `picomatch@4.0.7`.

الحزم الأربع عشرة التي أبلغ عنها التدقيق هي: `picomatch`، و`micromatch`، و`fast-glob`، و`fdir`، و`tinyglobby`، و`@next/eslint-plugin-next`، و`eslint-config-next`، و`eslint-import-resolver-typescript`، و`typescript-eslint`، و`@typescript-eslint/eslint-plugin`، و`@typescript-eslint/parser`، و`@typescript-eslint/type-utils`، و`@typescript-eslint/typescript-estree`، و`@typescript-eslint/utils`.

## القرار والإجراءات

- لم يُفرض override إلى نسخة رئيسية مختلفة، لأن مكتبات مثل `micromatch` تعتمد على واجهة الإصدار الثاني، ولا يوجد إصدار منشور غير متأثر يمكن اختياره. تطبيق رقعة محلية أو فرع غير مدمج ليس إصلاحًا رسميًا وقد يغير سلوك المطابقة والتوافق.
- أُجري `npm audit fix --dry-run`؛ بقيت النتيجة 14 تنبيهًا عاليًا. يقترح npm تغييرًا رئيسيًا أو الرجوع إلى إصدار قديم من `eslint-config-next`، دون إصلاح معتمد يضمن التوافق مع Next.js 16؛ لم يُستخدم `--force` ولم تُغيّر شجرة الاعتماديات للتظاهر بحل المشكلة.
- الخطر المتبقي يخص تشغيل أدوات الفحص/البناء عند معالجة أنماط glob غير موثوقة. تجنب تمرير أنماط يقدّمها مستخدم غير موثوق مباشرة إلى الأدوات، وراجع تغييرات إعدادات الفحص في طلبات الدمج. فحوص PR تعمل بصلاحية قراءة فقط، بينما تُمنح صلاحيات Pages وOIDC لمهمة النشر على دفع `main` فقط؛ لا يزيل ذلك احتمال تعطيل عملية الفحص نفسها.
- أعد تشغيل `npm audit` بعد صدور إصلاح رسمي، ثم حدّث تبعيات الإصدارين المتوافقين واختبر البناء وESLint والاختبارات قبل إزالة هذا التوثيق. راجع التنبيه الرسمي بدل افتراض أن تحديثًا متاحًا قد أصلح الثغرة.
