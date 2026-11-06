import React from 'react';
import { Boxes, Layers3, Workflow, ShieldCheck, MonitorSmartphone, Database, FileCheck2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const PANELS = [
  ['ورود و دسترسی عمومی', 'ورود، ثبت‌نام، بازیابی حساب، زبان، قوانین و راهنمای شروع'],
  ['پنل صرافی', 'عملیات روزانه، مشتریان، صندوق، خزانه‌داری، حواله، حسابداری و گزارش‌ها'],
  ['پنل مشتری', 'حساب شخصی، گردش حساب، کیف پول، درخواست‌ها، سفارش‌ها و پشتیبانی'],
  ['پنل فروشنده و خدمات', 'کاتالوگ خدمات، درخواست‌ها، پذیرش، انجام سفارش و تسویه'],
  ['پنل کارمند', 'وظایف محدود به نقش، شعبه، صندوق و سطح اختیار'],
  ['پنل سازنده سامانه', 'مدیریت ساختار، ماژول‌ها، نقش‌ها، سیاست‌ها، نسخه‌ها و سلامت سامانه'],
];

const DOMAINS = [
  ['عملیات صرافی', 'خرید، فروش، تبدیل، دادوگرفت و نرخ‌گذاری'],
  ['طرف‌های حساب', 'مشتری، بدهکار، بستانکار، نماینده و حساب بین‌صرافی'],
  ['صندوق و خزانه‌داری', 'صندوق‌ها، خزانه، بانک، انتقال وجه و تطبیق'],
  ['حواله و تسویه', 'ارسال، دریافت، کارمزد، رهگیری و تسویه'],
  ['هسته حسابداری', 'کدینگ، سند، دفتر روزنامه، دفتر کل، معین و تراز آزمایشی'],
  ['گزارش‌های مالی', 'ترازنامه، سود و زیان، جریان نقد، بودجه و بستن دوره'],
  ['ارز و ارزش‌گذاری', 'ارزها، نرخ‌ها، تسعیر و سود و زیان تحقق‌یافته/تحقق‌نیافته'],
  ['حاکمیت و کنترل', 'دسترسی، تأیید، حسابرسی، KYC، AML و نگهداری اسناد'],
  ['خدمات دیجیتال', 'محصولات، درگاه پرداخت، فروشندگان و سفارش‌ها'],
  ['زیرساخت مشترک', 'هویت، شعب، شماره‌گذاری، اسناد، اعلان، جست‌وجو و همگام‌سازی'],
];

const PRINCIPLES = [
  'هر رویداد مالی باید به سند حسابداری متوازن و قابل ردیابی منتهی شود.',
  'ثبت قطعی حذف یا بازنویسی نمی‌شود؛ اصلاح از مسیر برگشت و ثبت جایگزین انجام می‌شود.',
  'خاموش‌کردن ماژول فقط نمایش و دسترسی کاری را محدود می‌کند؛ تاریخچه و مانده‌ها حفظ می‌شوند.',
  'تنظیمات و داشبورد کنترل‌های پایه هستند و نباید با خاموش‌کردن ماژول‌ها ناپدید شوند.',
  'نمایش منو جایگزین کنترل دسترسی نیست؛ مسیر و عملیات باید جداگانه مجوز داشته باشند.',
  'شماره نهایی اسناد در حالت آنلاین باید از مرجع مرکزی صادر شود؛ صف آفلاین فقط موقت است.',
];

function ItemList({ items }) {
  return <div className="grid gap-2 sm:grid-cols-2">{items.map(([title, description]) => (
    <div key={title} className="rounded-xl border border-border p-3">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-6 text-muted-foreground">{description}</p>
    </div>
  ))}</div>;
}

export default function WorkspaceArchitecturePanel() {
  return (
    <div dir="rtl" className="space-y-4">
      <Card><CardContent className="p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2"><Layers3 className="h-5 w-5 text-primary" /><h2 className="font-bold">نقشه پنل‌های سامانه</h2></div>
        <p className="mb-4 text-xs leading-6 text-muted-foreground">این نقشه، چارچوب هدف برای طراحی یک محصول چندنقشی و چندسکویی است؛ وجود هر عنوان به‌تنهایی به معنی تکمیل منطق عملیاتی آن نیست.</p>
        <ItemList items={PANELS} />
      </CardContent></Card>
      <Card><CardContent className="p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2"><Boxes className="h-5 w-5 text-primary" /><h2 className="font-bold">دامنه‌های اصلی کسب‌وکار</h2></div>
        <ItemList items={DOMAINS} />
      </CardContent></Card>
      <Card><CardContent className="p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2"><Workflow className="h-5 w-5 text-primary" /><h2 className="font-bold">قواعد یکپارچگی</h2></div>
        <ul className="space-y-2">{PRINCIPLES.map(item => <li key={item} className="flex gap-2 text-xs leading-6"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /><span>{item}</span></li>)}</ul>
      </CardContent></Card>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card><CardContent className="p-3"><MonitorSmartphone className="mb-2 h-5 w-5 text-primary" /><p className="text-sm font-semibold">چندسکویی</p><p className="mt-1 text-xs leading-5 text-muted-foreground">وب، موبایل و نمایشگرهای بزرگ با چیدمان واکنش‌گرا</p></CardContent></Card>
        <Card><CardContent className="p-3"><ShieldCheck className="mb-2 h-5 w-5 text-primary" /><p className="text-sm font-semibold">امنیت و نقش‌ها</p><p className="mt-1 text-xs leading-5 text-muted-foreground">تفکیک وظایف و کنترل دسترسی در مسیر و عملیات</p></CardContent></Card>
        <Card><CardContent className="p-3"><Database className="mb-2 h-5 w-5 text-primary" /><p className="text-sm font-semibold">حفاظت داده</p><p className="mt-1 text-xs leading-5 text-muted-foreground">بدون حذف سوابق هنگام غیرفعال‌سازی ماژول</p></CardContent></Card>
      </div>
      <Card><CardContent className="flex gap-3 p-4">
        <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div><p className="text-sm font-semibold">وضعیت این نقشه</p><p className="mt-1 text-xs leading-6 text-muted-foreground">این صفحه مرجع ساختاری و چک‌لیست طراحی است. تأیید نهایی مستلزم تکمیل مسیرها، اتصال واقعی گردش‌کارها، آزمون نقش‌ها، آزمون ماژول‌ها و بررسی انتشار است.</p></div>
      </CardContent></Card>
    </div>
  );
}
