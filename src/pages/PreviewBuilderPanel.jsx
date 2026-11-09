import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Users, Layers3, Crown, Clock3, ClipboardCheck, Settings2, Store, LogOut } from 'lucide-react';

const groups = [
  { icon: Users, title: 'مدیریت کاربران', description: 'نمای کلی مشتریان، صرافان و وضعیت حساب‌ها' },
  { icon: ClipboardCheck, title: 'درخواست‌های ارتقا', description: 'بررسی درخواست صراف برای Professional یا Enterprise' },
  { icon: Crown, title: 'مدیریت سطوح', description: 'تعریف قابلیت‌های Basic، Professional و Enterprise' },
  { icon: Clock3, title: 'مدت اعتبار دسترسی', description: 'تعیین تاریخ شروع و پایان؛ نمونه‌های یک‌ساله و دوساله' },
  { icon: Layers3, title: 'نقشه ساختار برنامه', description: 'مشاهده مراکز کاری، ماژول‌ها و وضعیت تکمیل آن‌ها' },
  { icon: Settings2, title: 'تنظیمات سازنده', description: 'نمایش تنظیمات مدیریتی و کنترل‌های کلان سامانه' },
];

export default function PreviewBuilderPanel() {
  return (
    <main dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-200">
              <ShieldCheck className="h-4 w-4" /> محیط نمایشی آزمایشی
            </div>
            <h1 className="text-2xl font-bold sm:text-3xl">پنل سازنده سامانه</h1>
            <p className="mt-2 text-sm text-slate-400">پیش‌نمایش ساختار مدیریتی؛ داده‌ها و عملیات این صفحه نمایشی هستند.</p>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">
            <LogOut className="h-4 w-4" /> بازگشت به ورودی‌ها
          </Link>
        </div>

        <section className="mb-6 grid gap-3 sm:grid-cols-3">
          {[['۳','سطح اشتراک'],['۲','سطح قابل درخواست'],['۰','اتصال به پایگاه داده']].map(([value,label]) => (
            <div key={label} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <div className="text-3xl font-bold text-amber-300">{value}</div>
              <div className="mt-1 text-sm text-slate-400">{label}</div>
            </div>
          ))}
        </section>

        <section className="mb-6 rounded-xl border border-amber-400/25 bg-amber-400/5 p-4">
          <h2 className="font-semibold text-amber-200">جریان تأیید ارتقای صراف</h2>
          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-4">
            {['ثبت‌نام صراف با سطح Basic','ثبت درخواست Professional یا Enterprise','تعیین سطح و مدت اعتبار توسط سازنده','فعال‌شدن دسترسی تا تاریخ پایان'].map((item,index) => (
              <div key={item} className="rounded-lg border border-slate-700 bg-slate-900 p-3">
                <span className="mb-2 block text-xs text-amber-300">مرحله {index+1}</span>{item}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-6 text-slate-400">در نسخه نهایی، تأیید و انقضای سطح باید در سمت سرور ثبت و کنترل شود. این صفحه فعلاً فقط نقشه و ظاهر پنل را نشان می‌دهد.</p>
        </section>

        <h2 className="mb-3 text-lg font-semibold">بخش‌های پنل سازنده</h2>
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map(({icon:Icon,title,description}) => (
            <article key={title} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400/10 text-amber-300"><Icon className="h-5 w-5" /></div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
              <span className="mt-4 inline-block rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-400">نمایش ساختار</span>
            </article>
          ))}
        </section>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm leading-7 text-slate-400">
          <Store className="ml-2 inline h-4 w-4 text-amber-300" />
          این پنل عمداً از پنل سازنده اصلی و سرویس‌های آنلاین جدا است. هیچ حساب، رمز، کاربر واقعی یا تراکنش مالی در آن ایجاد یا تغییر نمی‌شود.
        </div>
        <div className="mt-6"><Link to="/" className="inline-flex items-center gap-2 text-sm text-amber-300 hover:text-amber-200"><ArrowRight className="h-4 w-4" /> بازگشت</Link></div>
      </div>
    </main>
  );
}
