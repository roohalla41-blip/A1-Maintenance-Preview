import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ListTree, BookOpenCheck, Scale, TrendingUp, GitBranch, CalendarDays,
  CalendarCheck, Building2, HandCoins, FileClock, ShieldCheck, FolderOpen,
  ClipboardCheck, FileSpreadsheet, BadgeCheck, Landmark, Wallet, ArrowLeftRight,
  ChartNoAxesCombined, Users, FileCheck2, LockKeyhole
} from 'lucide-react';

const MODULES = {
  'chart-of-accounts': {
    title: 'کدینگ و ساختار حساب‌ها', icon: ListTree, group: 'حسابداری و دفاتر مالی',
    purpose: 'تعریف ساختار استاندارد و درختی حساب‌های کل، معین و تفصیلی برای همه شعب و ارزها.',
    functions: ['کدینگ چندسطحی و قابل توسعه', 'ماهیت و گروه‌بندی حساب‌ها', 'حساب‌های کنترلی و تفصیلی', 'الگوهای حسابداری صرافی'],
    controls: ['جلوگیری از کد تکراری', 'کنترل حساب‌های سیستمی', 'ردیابی تغییرات کدینگ'],
    outputs: ['درخت حساب‌ها', 'فهرست حساب‌های بدون گردش', 'گزارش تغییرات کدینگ']
  },
  'subsidiary-ledger': {
    title: 'دفاتر معین و تفصیلی', icon: BookOpenCheck, group: 'حسابداری و دفاتر مالی',
    purpose: 'اتصال گردش حساب‌ها به مشتری، صراف، شعبه، ارز، صندوق و سایر اشخاص یا مراکز.',
    functions: ['دفتر معین اشخاص', 'تفصیلی شناور', 'گردش به تفکیک ارز و شعبه', 'مانده اول دوره و پایان دوره'],
    controls: ['تطبیق با دفتر کل', 'کنترل مانده‌های غیرعادی', 'ردیابی سند مبنا'],
    outputs: ['کارت حساب', 'ریز گردش', 'مانده تفصیلی']
  },
  'trial-balance': {
    title: 'تراز آزمایشی', icon: Scale, group: 'حسابداری و دفاتر مالی',
    purpose: 'کنترل برابری جمع بدهکار و بستانکار و بررسی مانده حساب‌ها در سطوح مختلف.',
    functions: ['تراز آزمایشی دو ستونی و چهارستونی', 'فیلتر شعبه و ارز', 'مقایسه دوره‌ای', 'نمایش گردش و مانده'],
    controls: ['کنترل توازن', 'هشدار اسناد نامتوازن', 'قفل دوره گزارش'],
    outputs: ['تراز آزمایشی', 'گزارش مغایرت', 'خروجی قابل چاپ']
  },
  'cash-flow': {
    title: 'صورت جریان وجوه نقد', icon: TrendingUp, group: 'گزارش‌ها و تحلیل مالی',
    purpose: 'نمایش جریان نقدی عملیاتی، سرمایه‌گذاری و تأمین مالی با تفکیک ارز و شعبه.',
    functions: ['روش مستقیم و غیرمستقیم', 'جریان ورودی و خروجی', 'تحلیل نقدینگی', 'مقایسه دوره‌ها'],
    controls: ['تطبیق با مانده نقد و بانک', 'کنترل طبقه‌بندی جریان‌ها'],
    outputs: ['صورت جریان وجوه نقد', 'پیش‌بینی نقدینگی']
  },
  'cost-centers': {
    title: 'مراکز هزینه و سود', icon: GitBranch, group: 'مدیریت و کنترل سازمانی',
    purpose: 'اندازه‌گیری درآمد و هزینه در سطح شعبه، واحد، کارمند یا فعالیت.',
    functions: ['تعریف مرکز هزینه', 'تخصیص هزینه', 'تحلیل سودآوری شعب', 'بودجه در برابر عملکرد'],
    controls: ['الزام مرکز هزینه برای حساب‌های منتخب', 'کنترل تخصیص کامل'],
    outputs: ['گزارش سودآوری شعب', 'گزارش انحراف هزینه']
  },
  'fiscal-periods': {
    title: 'سال و دوره‌های مالی', icon: CalendarDays, group: 'حسابداری و دفاتر مالی',
    purpose: 'مدیریت سال مالی، دوره‌های حسابداری، تقویم و وضعیت باز یا بسته بودن دوره.',
    functions: ['تعریف سال مالی', 'تقسیم‌بندی دوره‌ها', 'انتقال مانده افتتاحیه', 'تقویم شمسی و میلادی'],
    controls: ['جلوگیری از ثبت در دوره بسته', 'کنترل تاریخ سند'],
    outputs: ['وضعیت دوره‌ها', 'گزارش انتقال مانده']
  },
  'period-close': {
    title: 'بستن دوره و اختتام حساب‌ها', icon: CalendarCheck, group: 'حسابداری و دفاتر مالی',
    purpose: 'فرآیند کنترل‌شده بستن ماهانه و سالانه، انتقال مانده‌ها و ثبت اسناد اختتامیه.',
    functions: ['چک‌لیست بستن دوره', 'بستن موقت و نهایی', 'سند اختتامیه و افتتاحیه', 'بازگشایی با مجوز'],
    controls: ['تأیید چندمرحله‌ای', 'قفل پس از بستن', 'ثبت ردپای حسابرسی'],
    outputs: ['گزارش آمادگی بستن', 'گزارش اسناد اختتامیه']
  },
  'fixed-assets': {
    title: 'دارایی‌های ثابت', icon: Building2, group: 'مدیریت و کنترل سازمانی',
    purpose: 'ثبت و کنترل دارایی‌های ثابت، استهلاک و تغییرات ارزش در طول عمر دارایی.',
    functions: ['دفتر دارایی‌ها', 'روش‌های استهلاک', 'انتقال و واگذاری', 'محاسبه استهلاک دوره‌ای'],
    controls: ['تطبیق با دفتر کل', 'ثبت تاریخچه دارایی'],
    outputs: ['دفتر دارایی', 'گزارش استهلاک', 'ارزش دفتری']
  },
  'accounts-receivable': {
    title: 'حساب‌های دریافتنی', icon: HandCoins, group: 'مشتریان و طرف‌های حساب',
    purpose: 'مدیریت مطالبات از مشتریان، نمایندگان و طرف‌های تجاری با سررسید و پیگیری.',
    functions: ['صورتحساب و مانده مشتری', 'سررسید مطالبات', 'دریافت و تخصیص پرداخت', 'طبقه‌بندی سنی مطالبات'],
    controls: ['حد اعتباری', 'هشدار تأخیر', 'تطبیق با تفصیلی'],
    outputs: ['گزارش سنی مطالبات', 'صورت‌حساب مشتری']
  },
  'accounts-payable': {
    title: 'حساب‌های پرداختنی', icon: Wallet, group: 'مشتریان و طرف‌های حساب',
    purpose: 'کنترل بدهی به تأمین‌کنندگان، صراف‌های همکار و سایر طرف‌های تجاری.',
    functions: ['ثبت بدهی و سررسید', 'برنامه پرداخت', 'تخصیص پرداخت‌ها', 'تطبیق صورت‌حساب طرف حساب'],
    controls: ['تأیید پرداخت', 'کنترل تکرار فاکتور', 'تطبیق با دفتر کل'],
    outputs: ['گزارش سنی بدهی', 'برنامه پرداخت']
  },
  'budgets': {
    title: 'بودجه و پیش‌بینی', icon: ChartNoAxesCombined, group: 'گزارش‌ها و تحلیل مالی',
    purpose: 'برنامه‌ریزی درآمد، هزینه و نقدینگی و مقایسه عملکرد واقعی با بودجه.',
    functions: ['بودجه سالانه و دوره‌ای', 'سناریوهای پیش‌بینی', 'بودجه شعب', 'تحلیل انحراف'],
    controls: ['نسخه‌بندی بودجه', 'گردش تأیید بودجه'],
    outputs: ['بودجه در برابر عملکرد', 'پیش‌بینی مالی']
  },
  'treasury': {
    title: 'خزانه‌داری و مدیریت نقدینگی', icon: Landmark, group: 'صندوق، بانک و خزانه‌داری',
    purpose: 'نمای یکپارچه نقد، صندوق‌ها، بانک‌ها، موجودی ارزی و نیازهای نقدینگی.',
    functions: ['موقعیت نقدی روزانه', 'انتقال بین صندوق و بانک', 'پیش‌بینی نقدینگی', 'مدیریت وجوه شعب'],
    controls: ['حداقل و حداکثر موجودی', 'تأیید انتقال', 'تطبیق مانده‌ها'],
    outputs: ['گزارش موقعیت نقدی', 'پیش‌بینی کسری و مازاد']
  },
  'intercompany': {
    title: 'حساب‌های بین‌صرافی و بین‌شعبه‌ای', icon: ArrowLeftRight, group: 'حواله‌ها و تسویه',
    purpose: 'مدیریت حساب‌های متقابل بین صرافی‌ها، شعب و شرکای تسویه با کنترل دوطرفه.',
    functions: ['حساب متقابل طرفین', 'تسویه بین‌شعبه‌ای', 'ثبت کارمزد و نرخ توافقی', 'تطبیق مانده طرفین'],
    controls: ['تأیید دوطرفه', 'کنترل اختلاف مانده', 'ردیابی شناسه تسویه'],
    outputs: ['صورت‌حساب بین‌صرافی', 'گزارش مغایرت طرفین']
  },
  'multi-company': {
    title: 'مدیریت چندشرکتی و چندشعبه‌ای', icon: Building2, group: 'مدیریت و کنترل سازمانی',
    purpose: 'پشتیبانی ساختاری از چند شخصیت حقوقی، صرافی، شعبه و واحد عملیاتی در یک سامانه.',
    functions: ['ساختار شرکت و شعب', 'دفتر مالی مستقل', 'گزارش تجمیعی', 'تراکنش بین‌شرکتی'],
    controls: ['جداسازی داده بر اساس شرکت', 'محدودیت دسترسی سازمانی'],
    outputs: ['گزارش مستقل و تلفیقی', 'ساختار سازمانی']
  },
  'kyc': {
    title: 'شناخت و احراز هویت مشتری (KYC)', icon: BadgeCheck, group: 'ریسک، انطباق و امنیت',
    purpose: 'چارچوب ثبت اطلاعات هویتی، بررسی مدارک و ارزیابی سطح شناخت مشتری.',
    functions: ['پرونده شناخت مشتری', 'مدیریت مدارک', 'سطح‌بندی ریسک', 'بازبینی دوره‌ای'],
    controls: ['دسترسی محدود به داده حساس', 'ثبت رضایت و تاریخچه بررسی'],
    outputs: ['وضعیت تکمیل پرونده', 'گزارش بازبینی']
  },
  'compliance': {
    title: 'انطباق و کنترل مقررات', icon: ShieldCheck, group: 'ریسک، انطباق و امنیت',
    purpose: 'چارچوب سیاست‌ها، کنترل‌های داخلی و پیگیری الزامات قانونی متناسب با حوزه فعالیت.',
    functions: ['ماتریس الزامات', 'کنترل‌های داخلی', 'ثبت موارد نیازمند بررسی', 'مدیریت سیاست‌ها'],
    controls: ['تفکیک وظایف', 'ثبت تصمیم و دلیل', 'قابلیت ممیزی'],
    outputs: ['گزارش انطباق', 'فهرست موارد باز']
  },
  'audit-log': {
    title: 'ردپای حسابرسی و رویدادها', icon: FileClock, group: 'ریسک، انطباق و امنیت',
    purpose: 'ثبت قابل پیگیری رویدادهای حساس، تغییرات اطلاعات و اقدامات کاربران.',
    functions: ['تاریخچه ورود و خروج', 'تغییرات رکوردها', 'رویدادهای مالی', 'جست‌وجو بر اساس کاربر و زمان'],
    controls: ['ثبت غیرقابل‌انکار در معماری نهایی', 'محدودیت حذف و ویرایش'],
    outputs: ['گزارش حسابرسی', 'تاریخچه تغییرات']
  },
  'document-center': {
    title: 'مرکز اسناد و مدارک', icon: FolderOpen, group: 'ریسک، انطباق و امنیت',
    purpose: 'مدیریت متمرکز رسیدها، قراردادها، مدارک مشتری و پیوست اسناد مالی.',
    functions: ['بایگانی دسته‌بندی‌شده', 'اتصال مدرک به سند و تراکنش', 'نسخه‌بندی', 'جست‌وجوی اسناد'],
    controls: ['مجوز مشاهده و دریافت', 'ثبت تاریخچه دسترسی', 'سیاست نگهداری'],
    outputs: ['فهرست اسناد', 'گزارش مدارک ناقص']
  },
  'approvals': {
    title: 'گردش تأیید و تفکیک وظایف', icon: ClipboardCheck, group: 'ریسک، انطباق و امنیت',
    purpose: 'تعریف مراحل بررسی و تأیید برای اسناد، پرداخت‌ها، انتقال‌ها و تغییرات حساس.',
    functions: ['سطوح تأیید', 'تأیید چندمرحله‌ای', 'صف کارهای در انتظار', 'تفکیک ثبت‌کننده و تأییدکننده'],
    controls: ['محدودیت خودتأییدی', 'حدود مبلغ و نقش', 'ثبت دلیل رد یا تأیید'],
    outputs: ['گزارش گردش تأیید', 'کارهای معوق']
  },
  'fx-exposure': {
    title: 'موقعیت و ریسک ارزی', icon: ChartNoAxesCombined, group: 'ارز و مدیریت ریسک',
    purpose: 'نمایش خالص دارایی و بدهی ارزی و تحلیل حساسیت نسبت به تغییر نرخ‌ها.',
    functions: ['موقعیت باز هر ارز', 'سود و زیان تسعیر', 'سناریوی تغییر نرخ', 'حدود ریسک ارزی'],
    controls: ['کنترل نرخ مبنا', 'ثبت منبع نرخ', 'ردیابی تعدیلات'],
    outputs: ['گزارش موقعیت ارزی', 'تحلیل حساسیت']
  },
  'tax': {
    title: 'مالیات و گزارش‌های قانونی', icon: FileSpreadsheet, group: 'ریسک، انطباق و امنیت',
    purpose: 'جایگاه ساختاری برای تنظیمات مالیاتی و خروجی‌های قانونی متناسب با کشور محل فعالیت.',
    functions: ['پروفایل مالیاتی کشور', 'نگاشت حساب‌ها', 'گزارش‌های دوره‌ای', 'سوابق ارسال'],
    controls: ['نسخه‌بندی قوانین', 'تأیید گزارش پیش از ارسال'],
    outputs: ['گزارش مالیاتی', 'سوابق اظهار و ارسال']
  }
};

function ModuleList({ title, items }) {
  return (
    <section className="rounded-xl border bg-card p-4">
      <h3 className="mb-3 text-sm font-bold">{title}</h3>
      <ul className="space-y-2">
        {items.map(item => <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />{item}</li>)}
      </ul>
    </section>
  );
}

export default function EnterpriseModulePage() {
  const { moduleKey } = useParams();
  const module = MODULES[moduleKey];
  if (!module) {
    return <div className="rounded-xl border bg-card p-6"><h1 className="text-lg font-bold">بخش موردنظر یافت نشد</h1><Link className="text-primary underline mt-3 inline-block" to="/dashboard">بازگشت به داشبورد</Link></div>;
  }
  const Icon = module.icon;
  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4 md:p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-7 w-7" strokeWidth={1.8} /></div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{module.group}</p>
          <h1 className="text-xl font-extrabold">{module.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{module.purpose}</p>
        </div>
        <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300">اسکلت تعریف شده · هنوز عملیاتی نیست</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <ModuleList title="قابلیت‌های برنامه‌ریزی‌شده" items={module.functions} />
        <ModuleList title="کنترل‌ها و الزامات" items={module.controls} />
        <ModuleList title="گزارش‌ها و خروجی‌ها" items={module.outputs} />
      </div>
      <div className="rounded-xl border border-dashed bg-muted/20 p-4">
        <div className="flex items-center gap-2 font-semibold text-sm"><LockKeyhole className="h-4 w-4 text-muted-foreground" />وضعیت این مرحله</div>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">این صفحه برای تکمیل معماری و اسکلت محصول ایجاد شده است. هیچ عملیات مالی، ثبت سند یا تغییر اطلاعاتی از این صفحه انجام نمی‌شود. گردش‌کار، مجوزها، کنترل‌های حسابداری و اتصال امن داده باید در مرحله پیاده‌سازی جداگانه طراحی و آزمون شوند.</p>
      </div>
      <div className="flex justify-between border-t pt-3 text-xs text-muted-foreground"><span>نسخه آزمایشی مستقل</span><Link to="/dashboard" className="text-primary hover:underline">بازگشت به داشبورد</Link></div>
    </div>
  );
}
