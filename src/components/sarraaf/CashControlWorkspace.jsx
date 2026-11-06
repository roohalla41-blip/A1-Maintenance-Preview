import React from 'react';
import { BadgeCheck, ClipboardList, FileSpreadsheet, ShieldCheck, Users, Scale, FileBarChart, Settings2, Clock3, LockKeyhole, ArrowLeftRight, CircleAlert } from 'lucide-react';

const WORKSPACES = {
  cashiers: {
    title: 'مدیریت صندوقداران و شیفت‌ها',
    subtitle: 'چرخه مسئولیت صندوق از تخصیص تا تحویل و بستن شیفت',
    icon: Users,
    tabs: ['فهرست صندوقداران','تخصیص صندوق و ارز','شیفت‌های فعال','تحویل و تحول','حدود اختیار'],
    columns: ['کد کارمند','نام و نام خانوادگی','شعبه','صندوق‌های مجاز','وضعیت دسترسی','آخرین شیفت','اقدامات مجاز'],
    fields: ['کارمند / شناسه کاربر','شعبه و واحد','صندوق‌های مجاز','ارزهای مجاز','تاریخ شروع اعتبار','حد دریافت هر عملیات','حد پرداخت هر عملیات','نیاز به تأیید سرپرست'],
    workflow: ['انتخاب کارمند و شعبه','تخصیص صندوق و ارز','تعیین سقف و مجوزها','تأیید سرپرست','شروع شیفت','ثبت شمارش و تحویل پایان شیفت'],
    controls: ['هر شیفت فقط یک مسئول اصلی داشته باشد','تحویل شیفت با ثبت مانده شمارش‌شده انجام شود','تغییر مسئولیت در تاریخچه ثبت شود','صندوقدار فقط صندوق‌های مجاز خود را ببیند'],
    roles: ['مدیر صراف','سرپرست صندوق','صندوقدار','حسابرس فقط‌خواندنی'],
    empty: 'هنوز صندوقداری در این فهرست بارگذاری نشده است.'
  },
  reconciliation: {
    title: 'مغایرت‌گیری و بستن صندوق',
    subtitle: 'مقایسه موجودی شمارش‌شده با مانده دفتری و رسیدگی به اختلاف',
    icon: Scale,
    tabs: ['جلسات شمارش','شمارش بر اساس ارز','اختلاف‌های باز','تعدیلات پیشنهادی','تأیید و بستن'],
    columns: ['شماره شمارش','صندوق','شعبه','ارز','مانده دفتری','مانده شمارش‌شده','اختلاف','مسئول','وضعیت'],
    fields: ['صندوق و محل نگهداری','تاریخ و ساعت شمارش','مسئول شمارش','شاهد / تأییدکننده','ارز','مبلغ شمارش‌شده','علت اختلاف','پیوست صورت‌جلسه','شرح اقدام اصلاحی'],
    workflow: ['انتخاب صندوق و زمان مبنا','قفل موقت عملیات هم‌زمان در صورت سیاست سازمان','ثبت شمارش واقعی','محاسبه اختلاف با مانده دفتری','ثبت علت و مدرک','بررسی مستقل','تأیید تعدیل یا ارجاع','بستن صورت‌جلسه'],
    controls: ['شمارش‌کننده نباید تعدیل خودش را تأیید کند','تعدیل فقط با سند حسابداری مجاز انجام شود','اختلاف بدون علت و مدرک بسته نشود','شمارش و تأیید دارای زمان و کاربر باشند'],
    roles: ['صندوقدار شمارش‌کننده','سرپرست تأییدکننده','حسابدار ثبت‌کننده سند','حسابرس'],
    empty: 'هنوز صورت‌جلسه شمارش یا مغایرتی ثبت نشده است.'
  },
  reports: {
    title: 'گزارش‌ها و تحلیل صندوق',
    subtitle: 'گزارش‌های عملیاتی، مانده، عملکرد، کنترل و خروجی حسابرسی',
    icon: FileBarChart,
    tabs: ['گردش روزانه','مانده صندوق‌ها','دریافت و پرداخت','عملکرد صندوقدار','انتقال‌ها','مغایرت‌ها'],
    columns: ['نام گزارش','بُعد گزارش','فیلترهای اصلی','سطح جزئیات','خروجی'],
    fields: ['بازه تاریخ و ساعت','شرکت و شعبه','صندوق و صندوقدار','ارز','نوع عملیات','وضعیت سند','طرف حساب','سطح تجمیع'],
    workflow: ['انتخاب گزارش','تعیین فیلترها و دامنه دسترسی','نمایش جمع‌های کنترلی','رفتن از جمع به ریز سند','بازبینی و چاپ یا خروجی مجاز'],
    controls: ['جمع گزارش باید با دفتر فرعی و حساب کنترلی قابل تطبیق باشد','منطقه زمانی و ارز گزارش مشخص باشد','گزارش حساس فقط برای نقش مجاز نمایش داده شود','خروجی دارای زمان تولید و فیلترهای اعمال‌شده باشد'],
    roles: ['مدیر مالی','سرپرست صندوق','حسابدار','حسابرس'],
    empty: 'پس از تعیین فیلترها، نتایج گزارش در این قسمت نمایش داده می‌شود.'
  },
  controls: {
    title: 'کنترل‌های داخلی و تنظیمات صندوق',
    subtitle: 'سیاست‌های عملیاتی، حدود، تفکیک وظایف و ردپای تغییرات',
    icon: Settings2,
    tabs: ['حدود عملیات','قواعد تأیید','سیاست شیفت','قواعد شمارش','تاریخچه تغییرات'],
    columns: ['نام سیاست','دامنه اجرا','مقدار / قاعده','مالک سیاست','تاریخ اعتبار','وضعیت'],
    fields: ['نام و کد سیاست','شرکت / شعبه / صندوق','ارز و نوع عملیات','حداقل و حداکثر مبلغ','سطح تأیید لازم','نقش‌های مجاز','تاریخ شروع و پایان اعتبار','دلیل تغییر'],
    workflow: ['تعریف سیاست در پیش‌نویس','تعیین دامنه و نقش‌های مشمول','بررسی تعارض با سیاست‌های بالادستی','تأیید مسئول مجاز','فعال‌شدن از تاریخ مشخص','ثبت نسخه و امکان بازبینی'],
    controls: ['سیاست جدید نباید سوابق قبلی را بازنویسی کند','تغییر سقف‌ها نیازمند دلیل و ثبت تاریخچه است','محدودیت شعبه نباید از محدودیت شرکت گسترده‌تر شود','دسترسی مشاهده و تغییر سیاست جدا باشد'],
    roles: ['مدیر صراف','مدیر مالی','مدیر شعبه','مسئول کنترل داخلی'],
    empty: 'هنوز سیاست اختصاصی در این بخش تعریف نشده است.'
  }
};

function Panel({title,items}) {
  return <section className="rounded-xl border bg-card p-4"><h3 className="text-sm font-bold">{title}</h3><ul className="mt-3 space-y-2">{items.map(item=><li key={item} className="flex gap-2 text-xs leading-6 text-muted-foreground"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"/>{item}</li>)}</ul></section>;
}

export default function CashControlWorkspace({section}) {
  const config=WORKSPACES[section];
  if(!config) return null;
  const Icon=config.icon;
  return <div className="space-y-4" dir="rtl">
    <header className="rounded-2xl border bg-card p-4">
      <div className="flex items-start gap-3"><div className="rounded-xl bg-primary/10 p-3 text-primary"><Icon className="h-6 w-6"/></div><div className="min-w-0 flex-1"><h2 className="font-bold">{config.title}</h2><p className="mt-1 text-xs leading-6 text-muted-foreground">{config.subtitle}</p></div><span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-800">اسکلت UI · اتصال عملیاتی در فاز بعد</span></div>
      <div className="mt-4 flex flex-wrap gap-2">{config.tabs.map((tab,i)=><span key={tab} className={`rounded-lg border px-3 py-2 text-xs ${i===0?'border-primary bg-primary/10 font-bold text-primary':'text-muted-foreground'}`}>{tab}</span>)}</div>
    </header>
    <div className="grid gap-3 xl:grid-cols-2">
      <Panel title="فیلدها و اطلاعات موردنیاز فرم‌ها" items={config.fields}/>
      <Panel title="گردش‌کار تخصصی" items={config.workflow}/>
      <Panel title="کنترل‌ها و قواعد اعتبارسنجی" items={config.controls}/>
      <Panel title="نقش‌ها و مسئولیت‌ها" items={config.roles}/>
    </div>
    <section className="overflow-hidden rounded-2xl border bg-card">
      <div className="flex items-center gap-2 border-b p-4"><ClipboardList className="h-4 w-4 text-primary"/><h3 className="text-sm font-bold">ساختار فهرست و ستون‌های اطلاعاتی</h3></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-right text-xs"><thead className="bg-muted/60"><tr>{config.columns.map(col=><th key={col} className="whitespace-nowrap px-3 py-3 font-semibold">{col}</th>)}</tr></thead><tbody><tr><td colSpan={config.columns.length} className="px-4 py-8 text-center text-muted-foreground"><div className="flex flex-col items-center gap-2"><FileSpreadsheet className="h-6 w-6 opacity-50"/>{config.empty}</div></td></tr></tbody></table></div>
    </section>
    <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-900"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0"/><p>این صفحه اکنون ساختار اختصاصی فرم، فهرست، گردش‌کار، کنترل و نقش‌ها را مشخص می‌کند. تا زمان طراحی سرویس داده و اتصال آزمایشی، ثبت یا تأیید واقعی در این قسمت فعال نیست؛ هیچ داده یا نتیجه مالی ساختگی نمایش داده نمی‌شود.</p></div>
  </div>;
}
