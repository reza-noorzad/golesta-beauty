# Golesta Beauty V2 — Firebase Login Starter

این ZIP را **داخل پوشه v2** استخراج کن. فقط سه فایل موجود را جایگزین می‌کند:
`src/components/admin/AdminShell.tsx`، `src/app/admin/login/page.tsx` و فایل‌های جدید را اضافه می‌کند. سایر صفحات و سایت اصلی تغییر نمی‌کنند.

## ۱. نصب

```powershell
cd C:\projects\golesta-beauty\v2
npm.cmd install firebase
```

## ۲. تنظیمات Firebase

فایل `.env.local.example` را کپی کن و نام کپی را `.env.local` بگذار. مقادیر خالی را دقیقاً از Firebase Console > Project settings > Your apps > SDK setup and configuration وارد کن. **کلید خصوصی یا Service Account را وارد نکن.**

مقادیر `NEXT_PUBLIC_...` تنظیمات عمومی وب‌اپ هستند، نه رمز عبور. فایل `.env.local` را در Git commit نکن؛ مطمئن شو `.gitignore` شامل `.env*` است.

## ۳. قوانین Firestore (الزامی)

Firebase Console > Firestore Database > Rules: متن کامل `firestore.rules` را در بخش Rules قرار بده و Publish کن. **این قوانین تمام داده‌ها را قفل می‌کنند** جز خواندن سند مجوز خودِ کاربر. اگر دیتابیس دیگری از همین Firebase استفاده می‌کند، این قوانین می‌توانند آن را از کار بیندازند؛ ابتدا بررسی کن.

## ۴. ایجاد حساب مدیر

Firebase Console > Authentication > Users > Add user: ایمیل و رمز قوی مدیر را ایجاد کن. UID حساب ساخته‌شده را کپی کن.

Firestore Database > Data > Start collection:
- Collection ID: `admins`
- Document ID: **همان UID دقیق** (نه ایمیل)
- Field: `active` / type `boolean` / value `true`

برای غیرفعال کردن مدیر، `active` را `false` کن. هرگز برای کاربران عادی این سند را نساز.

## ۵. آزمایش

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd run dev
```

به `http://localhost:3000/admin/login` برو. با حساب مدیر وارد شو. بعد از ورود باید داشبورد را ببینی. یک حساب بدون سند `admins/{uid}` نباید داشبورد را ببیند. خروج را آزمایش کن.

**محدودیت امنیتی مهم:** این بسته فقط Firebase Auth، کنترل مجوز Firestore و محافظت سمت مرورگر برای صفحات نمایشی را فراهم می‌کند. حفاظت سمت سرور برای HTML و APIهای آینده، اعتبارسنجی داده‌ها و قوانین دقیق هر مجموعه هنوز لازم‌اند. بنابراین این نسخه را به Vercel production منتقل نکن. قوانین Firestore برای داده‌های سایت همچنان بسته‌اند و هیچ فرم ویرایشی هنوز فعال نیست.
