# مدير صفحات فيسبوك (Facebook Pages Manager)

منصة لإدارة صفحات فيسبوك وجدولة نشر المحتوى عليها تلقائيًا، مبنية بـ Next.js 14 (App Router) + Drizzle ORM + Postgres.

## المكونات

- **نظام مستخدمين**: تسجيل / دخول بكلمة مرور مشفّرة (bcrypt) وجلسة موقّعة بـ JWT في كوكي httpOnly.
- **إدارة صفحات فيسبوك**: إضافة/حذف صفحات، مع تشفير Page Access Token في قاعدة البيانات (AES-256-GCM) قبل حفظه — لا يُرسل التوكن الخام للمتصفح أبدًا بعد الحفظ.
- **جدولة المنشورات**: نص + صورة اختيارية، بحد أقصى **4 منشورات يوميًا لكل صفحة**.
- **Heartbeat تلقائي**: GitHub Action تعمل كل 6 ساعات وتستدعي `/api/heartbeat`، اللي بيدور على المنشورات المستحقة وينشرها فعليًا على فيسبوك.

## ⚠️ قبل ما تشغّل النشر الفعلي — اقرأ ده

نشر منشورات (خصوصًا صور/فيديو) على صفحة فيسبوك عن طريق Graph API محتاج صلاحية `pages_manage_posts` بمستوى **Advanced Access**، وميتا **مش بتديها** غير بعد اجتياز **Business Verification** لحساب الـ Business Manager. من غير التحقق ده:

- منشورات نصية بسيطة ممكن تشتغل لو حساب المستخدم Admin/Tester على الـ App (Development mode).
- منشورات فيديو/صور بحجم أكبر أو لمستخدمين تانيين هتترفض بخطأ صلاحيات.

الكود هنا **بيحاول ينشر ويرجّع رسالة الخطأ زي ما هي** من فيسبوك (تظهر في لوحة التحكم تحت كل منشور)، بدل ما يفشل بصمت. لو عندك تحقق Business Verification قيد المراجعة أو مرفوض، هتشوف رسالة الخطأ توضح كده بالظبط.

## الإعداد

1. انسخ `.env.example` إلى `.env.local` واملأ القيم:
   - `DATABASE_URL`: من Neon أو Supabase أو أي Postgres.
   - `AUTH_SECRET`: نص عشوائي طويل (مثلاً: `openssl rand -hex 32`).
   - `HEARTBEAT_SECRET`: نص عشوائي تاني، مختلف عن الأول.
   - `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET`: من Meta Developer Console (اختياري في هذه المرحلة، التوكنات بتتضاف يدويًا لكل صفحة من الواجهة).

2. ثبّت الباكدجات:
   ```bash
   npm install
   ```

3. أنشئ الجداول في قاعدة البيانات:
   ```bash
   npm run db:push
   ```

4. شغّل محليًا:
   ```bash
   npm run dev
   ```

## النشر (Deployment)

- انشر المشروع على أي منصة تدعم Next.js (Vercel مثلاً مجانًا للمشاريع الصغيرة).
- في إعدادات الـ Secrets الخاصة بريبو GitHub، ضيف:
  - `APP_URL`: رابط المشروع بعد النشر (مثلاً `https://your-app.vercel.app`).
  - `HEARTBEAT_SECRET`: نفس القيمة اللي حطيتها في `.env.local` / إعدادات الاستضافة.
- الـ workflow في `.github/workflows/heartbeat.yml` هيستدعي `/api/heartbeat` تلقائيًا كل 6 ساعات.

## الخطوات التالية المقترحة

1. ربط `FACEBOOK_APP_ID`/`FACEBOOK_APP_SECRET` واستخدام Graph API Explorer لتوليد Page Access Token طويل المدى لكل صفحة.
2. متابعة حالة Business Verification في Meta Business Suite — من غيرها النشر هيفضل يفشل برسالة صلاحيات.
3. (اختياري) إضافة صفحة "سجل الأخطاء" منفصلة لعرض كل محاولات النشر الفاشلة بشكل مجمّع.
