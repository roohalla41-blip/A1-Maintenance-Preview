import React from 'react';
import { Landmark, ArrowDownToLine, ArrowUpFromLine, BookOpen, FileCheck2, ClipboardCheck, ShieldCheck, CircleAlert } from 'lucide-react';

const SECTIONS = {
  opening: {
    title: 'ثبت اولیه و موجودی افتتاحیه',
    subtitle: 'تعریف صندوق، تعیین ارز و ثبت مانده آغاز دوره با سند افتتاحیه',
    icon: FileCheck2,
    tabs: ['مشخصات صندوق','مانده افتتاحیه','سند افتتاحیه','تأیید و تاریخچه'],
    columns: ['کد صندوق','نام صندوق','شعبه','ارز','مانده افتتاحیه','تاریخ مؤثر','شماره سند','وضعیت'],
    fields: ['نام و کد یکتای صندوق','شعبه و محل نگهداری','ارز پایه صندوق','مانده افتتاحیه','تاریخ و ساعت مؤثر','حساب مقابل افتتاحیه','شرح و مستندات'],
    workflow: ['تعریف صندوق و کنترل تکراری نبودن کد','انتخاب ارز و شعبه','ثبت مانده آغازین','ساخت سند افتتاحیه متوازن','بازبینی سند و تأیید مجاز','قفل‌کردن مانده افتتاحیه پس از ثبت'],
    controls: ['شناسه صندوق باید در ردیف دفترکل ثبت شود','افتتاحیه فقط یک بار برای هر صندوق و دوره ثبت شود','اصلاح افتتاحیه با سند اصلاحی و رد ممیزی باشد','صندوق بدون ارز و شعبه معتبر فعال نشود'],
    roles: ['مدیر صراف','حسابدار مجاز','تأییدکننده مالی']
  },
  receipts: {
    title: 'دریافت وجه به صندوق',
    subtitle: 'ثبت ورود وجه نقد از مشتری، صراف، بانک یا سایر حساب‌های مجاز',
    icon: ArrowDownToLine,
    tabs: ['دریافت جدید','دریافت‌های ثبت‌شده','رسیدها','ابطال و اصلاح'],
    columns: ['شماره رسید','تاریخ','صندوق مقصد','طرف حساب','ارز','مبلغ','ثبت‌کننده','وضعیت'],
    fields: ['صندوق مقصد','نوع و شناسه طرف حساب','ارز و مبلغ','نرخ تبدیل در صورت نیاز','تاریخ و ساعت','علت و شرح دریافت','پیوست و مرجع','روش تسویه'],
    workflow: ['انتخاب صندوق مقصد','انتخاب طرف حساب و ارز','ورود مبلغ و شرح','نمایش پیش‌نمایش سند و مانده پس از ثبت','تأیید کاربر مجاز','صدور رسید یکتا'],
    controls: ['ثبت تکراری با کلید یکتای عملیات مسدود شود','مانده صندوق پس از ثبت از دفترکل محاسبه شود','دریافت بدون طرف حساب فقط طبق سیاست مجاز باشد','ابطال با سند معکوس انجام شود'],
    roles: ['صندوقدار','حسابدار','سرپرست تأییدکننده']
  },
  payments: {
    title: 'پرداخت وجه از صندوق',
    subtitle: 'ثبت خروج وجه با کنترل موجودی، حدود اختیار و تأیید',
    icon: ArrowUpFromLine,
    tabs: ['پرداخت جدید','پرداخت‌های ثبت‌شده','رسید پرداخت','در انتظار تأیید'],
    columns: ['شماره پرداخت','تاریخ','صندوق مبدأ','دریافت‌کننده','ارز','مبلغ','تأییدکننده','وضعیت'],
    fields: ['صندوق مبدأ','دریافت‌کننده و حساب مقصد','ارز و مبلغ','نرخ تبدیل در صورت نیاز','تاریخ و ساعت','علت و شرح پرداخت','مرجع یا پیوست','سطح تأیید'],
    workflow: ['انتخاب صندوق مبدأ','انتخاب دریافت‌کننده و ارز','بررسی مانده قابل‌استفاده','نمایش سند و مانده پس از پرداخت','دریافت تأیید لازم','ثبت سند و صدور رسید'],
    controls: ['پرداخت بیش از مانده قابل‌استفاده ممنوع','کنترل سقف پرداخت صندوقدار','پرداخت به حساب خود صندوق ممنوع','ثبت و تأیید توسط یک نفر در عملیات حساس ممنوع'],
    roles: ['صندوقدار','سرپرست صندوق','حسابدار']
  },
  bank: {
    title: 'اتصال صندوق و بانک',
    subtitle: 'مدیریت واریز، برداشت و انتقال بین محل‌های نگهداری وجه',
    icon: Landmark,
    tabs: ['حساب‌های بانکی','واریز به بانک','برداشت از بانک','تطبیق بانکی'],
    columns: ['بانک','شماره حساب','شعبه','ارز','مانده دفتری','مانده صورت‌حساب','اختلاف','وضعیت'],
    fields: ['حساب بانکی مبدأ یا مقصد','صندوق مرتبط','ارز مشترک','مبلغ و کارمزد','شماره پیگیری بانکی','تاریخ ارزش','شرح و سند پیوست'],
    workflow: ['انتخاب دو حساب مشخص','کنترل یکسان بودن ارز یا ثبت تبدیل مستقل','ثبت مرجع بانکی','پیش‌نمایش سند دوطرفه','تأیید و ثبت','تطبیق با صورت‌حساب'],
    controls: ['مبدأ و مقصد یکسان نباشند','حساب بانکی و صندوق با شناسه واقعی انتخاب شوند','انتقال ارزی متفاوت بدون سند تبدیل مجاز نباشد','کارمزد جداگانه ثبت شود'],
    roles: ['خزانه‌دار','حسابدار','تأییدکننده مالی']
  },
  ledger: {
    title: 'دفتر و اسناد صندوق',
    subtitle: 'ردیابی هر گردش تا سند روزنامه و ردیف‌های دفترکل',
    icon: BookOpen,
    tabs: ['دفتر صندوق','اسناد روزنامه','ریز گردش','مانده به تفکیک ارز'],
    columns: ['تاریخ','شماره سند','نوع عملیات','شرح','بدهکار','بستانکار','ارز','مانده'],
    fields: ['بازه زمانی','صندوق و شعبه','ارز','نوع سند','وضعیت ثبت','شماره مرجع','ثبت‌کننده'],
    workflow: ['انتخاب صندوق و بازه','نمایش گردش مرتب‌شده','بازکردن سند مادر','مشاهده ردیف‌های بدهکار و بستانکار','ردیابی به رسید یا عملیات اصلی','چاپ یا خروجی مجاز'],
    controls: ['جمع بدهکار و بستانکار سند باید برابر باشد','شماره سند یکتا و غیرقابل تکرار باشد','مانده از ردیف‌های دفترکل استخراج شود','سوابق ثبت‌شده حذف فیزیکی نشوند'],
    roles: ['حسابدار','مدیر مالی','حسابرس فقط‌خواندنی']
  },
  audit: {
    title: 'ممیزی و ردپای عملیات',
    subtitle: 'ثبت شفاف ایجاد، تأیید، اصلاح، ابطال و تغییرات دسترسی',
    icon: ClipboardCheck,
    tabs: ['رویدادها','تغییرات اسناد','تأییدها','گزارش دسترسی'],
    columns: ['زمان','کاربر','عملیات','شناسه سند','مقدار قبل','مقدار بعد','دلیل','نشانی دستگاه'],
    fields: ['بازه زمانی','کاربر و نقش','نوع رویداد','شناسه سند یا صندوق','دلیل تغییر','وضعیت تأیید'],
    workflow: ['ثبت خودکار رویداد','اتصال رویداد به سند و کاربر','نمایش مقدار قبل و بعد','فیلتر و بررسی رویداد','خروجی فقط‌خواندنی برای حسابرس'],
    controls: ['کاربر عادی نتواند ردپا را پاک یا ویرایش کند','زمان و عامل عملیات اجباری باشد','تغییرات حساس نیازمند دلیل باشند','دسترسی ممیزی مستقل از ثبت مالی باشد'],
    roles: ['مدیر سیستم','مدیر مالی','حسابرس']
  }
};

export default function CashBlueprintWorkspace({ section }) {
  const config = SECTIONS[section];
  if (!config) return null;
  const Icon = config.icon;
  return <div className="space-y-4" dir="rtl">
    <header className="rounded-2xl border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-primary/10 p-3 text-primary"><Icon className="h-6 w-6" /></div>
        <div className="min-w-0 flex-1"><h2 className="font-bold">{config.title}</h2><p className="mt-1 text-xs leading-6 text-muted-foreground">{config.subtitle}</p></div>
        <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-800">اسکلت ساختاری</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">{config.tabs.map((tab, i) => <span key={tab} className={`rounded-lg border px-3 py-2 text-xs ${i === 0 ? 'border-primary bg-primary/10 font-bold text-primary' : 'text-muted-foreground'}`}>{tab}</span>)}</div>
    </header>
    <div className="grid gap-3 xl:grid-cols-2">
      {[['فیلدهای فرم', config.fields], ['گردش‌کار', config.workflow], ['کنترل‌های مالی و اعتبارسنجی', config.controls], ['نقش‌ها و مسئولیت‌ها', config.roles]].map(([title, items]) => <section key={title} className="rounded-xl border bg-card p-4"><h3 className="text-sm font-bold">{title}</h3><ul className="mt-3 space-y-2">{items.map(item => <li key={item} className="flex gap-2 text-xs leading-6 text-muted-foreground"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{item}</li>)}</ul></section>)}
    </div>
    <section className="overflow-hidden rounded-2xl border bg-card">
      <div className="border-b p-4 text-sm font-bold">ساختار فهرست و ستون‌های اطلاعاتی</div>
      <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-right text-xs"><thead className="bg-muted/60"><tr>{config.columns.map(col => <th key={col} className="whitespace-nowrap px-3 py-3 font-semibold">{col}</th>)}</tr></thead><tbody><tr><td colSpan={config.columns.length} className="px-4 py-8 text-center text-muted-foreground">پس از طراحی سرویس داده و اتصال آزمایشی، اطلاعات این فهرست نمایش داده می‌شود.</td></tr></tbody></table></div>
    </section>
    <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-900"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /><p>این بخش فعلاً نقشه و اسکلت رابط کاربری است؛ ثبت مالی یا تأیید ساختگی انجام نمی‌شود. هر عملیات پس از تکمیل سرویس، کنترل دسترسی و آزمون سند حسابداری فعال خواهد شد.</p></div>
    <div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4" />اصل طراحی: هیچ بخش غیرفعالی نباید سوابق، مانده یا اسناد قبلی را حذف کند.</div>
  </div>;
}
