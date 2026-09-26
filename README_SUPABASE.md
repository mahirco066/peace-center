# ربط مركز دراسات السلام والتنمية بـ Supabase

## 1) في Supabase
افتح SQL Editor والصق محتوى `supabase_schema.sql` ثم Run.

## 2) Storage
أنشئ Bucket باسم:
`peace-files`
واجعله Public حتى تظهر الصور والملفات المنشورة للزوار.

## 3) Render
في Environment Variables أضف:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

لا تضع `SUPABASE_SERVICE_ROLE_KEY` داخل `public` أو GitHub؛ المفتاح السري يجب أن يبقى في الخادم فقط.

## 4) البيانات
عند أول تشغيل سيُنشئ النظام حساب المدير إذا لم يكن موجودًا، ويحمّل المحتوى الافتراضي إلى Supabase.

بيانات الدخول الافتراضية:
- username: `admin`
- password: `Peace@2026`

غيّرها من لوحة التحكم بعد أول دخول.
