import React, { useMemo, useState } from 'react';
import {
  LayoutDashboard, Users, ArrowLeftRight, Send, Wallet, BookOpen,
  ChartNoAxesCombined, GitBranch, Globe2, Settings2, Search, Bell,
  ChevronLeft, ChevronDown, Plus, FileText, CircleDollarSign, ArrowDownUp,
  Landmark, ClipboardList, ShieldCheck, CalendarDays, Filter, Menu,
  PanelRightClose, X, CheckCircle2, Clock3, Building2, Calculator,
  ReceiptText, Scale, BookMarked, BadgeCheck, Package, History
} from 'lucide-react';

const GROUPS = [
  { id: 'dashboard', title: 'داشبورد', subtitle: 'نمای کلی وضعیت مالی و عملیاتی', icon: LayoutDashboard, modules: ['خلاصه وضعیت', 'مانده صندوق‌ها', 'سود و زیان', 'فعالیت‌های اخیر'] },
  { id: 'customers', title: 'مشتریان و حساب‌ها', subtitle: 'پرونده ساده مشتری و گردش حساب', icon: Users, modules: ['ثبت مشتری', 'فهرست مشتریان', 'حساب مشتری', 'بدهکاران و بستانکاران', 'گردش حساب'] },
  { id: 'operations', title: 'عملیات روزانه', subtitle: 'ثبت یک‌باره دریافت، پرداخت و معامله', icon: ArrowLeftRight, modules: ['ثبت معامله ارز', 'دریافت وجه', 'پرداخت وجه', 'انتقال بین حساب‌ها', 'اصلاح و برگشت عملیات'] },
  { id: 'remittances', title: 'حواله‌ها', subtitle: 'چرخه ثبت تا تسویه و بایگانی حواله', icon: Send, modules: ['حواله‌های ارسالی', 'حواله‌های دریافتی', 'دفتر حواله', 'وضعیت تسویه', 'رسید و پیگیری'] },
  { id: 'treasury', title: 'صندوق و خزانه', subtitle: 'کنترل نقدینگی، صندوق و حساب‌های بانکی', icon: Wallet, modules: ['صندوق‌ها', 'موجودی نقدی', 'حساب‌های بانکی', 'انتقال بین صندوق‌ها', 'شمارش و تطبیق صندوق'] },
  { id: 'ledger', title: 'دفاتر حسابداری', subtitle: 'ساختار استاندارد ثبت دوطرفه و اسناد', icon: BookOpen, modules: ['سند حسابداری', 'دفتر روزنامه', 'دفتر کل', 'دفتر معین', 'دفتر تفصیلی', 'کدینگ حساب‌ها', 'تراز آزمایشی'] },
  { id: 'reports', title: 'گزارش‌ها و بایگانی', subtitle: 'گزارش‌های مدیریتی و مالی قابل ردیابی', icon: ChartNoAxesCombined, modules: ['گزارش روزانه', 'گزارش ماهانه و سالانه', 'سود و زیان', 'ترازنامه', 'گردش ارزها', 'بایگانی اسناد'] },
  { id: 'branches', title: 'شعب و نمایندگی‌ها', subtitle: 'مدیریت شعب و حساب‌های بین‌شعبه‌ای', icon: GitBranch, modules: ['فهرست شعب', 'مدیران شعب', 'حساب بین‌شعبه‌ای', 'تسویه شعب', 'گزارش عملکرد شعب'] },
  { id: 'services', title: 'خدمات و نرخ ارز', subtitle: 'نرخ‌گذاری و خدمات جانبی صرافی', icon: Globe2, modules: ['نرخ ارزها', 'تبدیل ارز', 'کارمزدها', 'خدمات مشتری', 'سفارش خدمات'] },
  { id: 'management', title: 'مدیریت و تنظیمات', subtitle: 'کنترل کاربران، نقش‌ها و سوابق سامانه', icon: Settings2, modules: ['کاربران و کارکنان', 'نقش‌ها و دسترسی‌ها', 'سوابق حسابرسی', 'تنظیمات عمومی', 'پشتیبان‌گیری'] },
];

const SAMPLE_ROWS = [
  { ref: 'TX-DEMO-1048', type: 'معامله ارز', account: 'صندوق اصلی نمونه', debit: '۱٬۲۵۰٫۰۰', credit: '۱٬۲۵۰٫۰۰', state: 'متوازن' },
  { ref: 'TX-DEMO-1047', type: 'دریافت از مشتری', account: 'حساب مشتری نمونه', debit: '۴۸۰٫۰۰', credit: '۴۸۰٫۰۰', state: 'متوازن' },
  { ref: 'TX-DEMO-1046', type: 'حواله دریافتی', account: 'حواله‌های در جریان', debit: '۹۰۰٫۰۰', credit: '۹۰۰٫۰۰', state: 'در انتظار بررسی' },
];

const METRICS = [
  { label: 'مانده صندوق نمونه', value: '۱۲۵٬۴۰۰', note: 'واحد نمایشی', icon: Wallet },
  { label: 'عملیات امروز', value: '۳۸', note: 'داده ساختگی', icon: ArrowDownUp },
  { label: 'اسناد متوازن', value: '۳۶', note: 'از ۳۸ سند نمونه', icon: Scale },
  { label: 'حواله‌های باز', value: '۰۷', note: 'نیازمند پیگیری', icon: Send },
];

function MetricCard({ item }) {
  const Icon = item.icon;
  return <div className="rounded-xl border bg-card p-3 sm:p-4 min-w-0">
    <div className="flex items-center justify-between gap-2"><span className="text-[11px] text-muted-foreground">{item.label}</span><span className="rounded-lg bg-muted p-2"><Icon className="h-4 w-4 text-primary" /></span></div>
    <div className="mt-3 text-xl sm:text-2xl font-bold tracking-tight">{item.value}</div>
    <div className="mt-1 text-[10px] text-muted-foreground">{item.note}</div>
  </div>;
}

export default function AccountingStructurePreview() {
  const [device, setDevice] = useState('desktop');
  const [active, setActive] = useState('dashboard');
  const [query, setQuery] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState('');
  const activeGroup = GROUPS.find(group => group.id === active) || GROUPS[0];
  const ActiveIcon = activeGroup.icon;
  const filteredGroups = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return GROUPS;
    return GROUPS.filter(group => (group.title + ' ' + group.subtitle + ' ' + group.modules.join(' ')).toLocaleLowerCase().includes(term));
  }, [query]);

  const chooseGroup = (id) => {
    setActive(id);
    setMobileMenu(false);
    setNotice('');
  };

  return <div dir="rtl" className="space-y-4">
    <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/20 dark:border-emerald-900 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-emerald-100 dark:bg-emerald-900 p-2.5"><ShieldCheck className="h-5 w-5 text-emerald-700 dark:text-emerald-300" /></div>
          <div><h2 className="font-bold text-sm sm:text-base">طراحی ساختار حرفه‌ای پنل صراف</h2><p className="mt-1 text-xs text-muted-foreground leading-6">اسکلت رابط کاربری حسابداری تخصصی صرافی · فقط برای ارزیابی چیدمان و دسته‌بندی امکانات</p></div>
        </div>
        <span className="rounded-full border border-emerald-300 bg-white/70 dark:bg-background px-3 py-1.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">محیط آزمایشی · داده نمونه</span>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground">نمای مستقل برای نمایشگر لپ‌تاپ و گوشی</p>
        <div className="inline-flex rounded-xl border bg-background p-1 gap-1">
          <button type="button" onClick={() => setDevice('desktop')} className={'rounded-lg px-3 py-2 text-xs ' + (device === 'desktop' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>نمای لپ‌تاپ</button>
          <button type="button" onClick={() => setDevice('mobile')} className={'rounded-lg px-3 py-2 text-xs ' + (device === 'mobile' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>نمای گوشی</button>
        </div>
      </div>
    </div>

    <div className={device === 'mobile' ? 'mx-auto max-w-[430px] rounded-[30px] border-[6px] border-slate-700 bg-background p-2 shadow-xl' : 'w-full rounded-2xl border bg-background p-3 sm:p-4'}>
      <div className="flex items-center justify-between gap-3 border-b pb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="rounded-xl bg-primary p-2 text-primary-foreground"><Calculator className="h-5 w-5" /></div>
          <div className="min-w-0"><div className="font-bold text-sm">حساب صراف</div><div className="text-[10px] text-muted-foreground">سامانه حسابداری و مدیریت مالی · شعبه نمونه</div></div>
        </div>
        <div className="flex items-center gap-2"><span className="hidden sm:inline-flex rounded-full bg-muted px-2.5 py-1 text-[10px]">مدیر نمونه</span><button type="button" aria-label="اعلان‌های نمونه" onClick={() => setNotice('این اعلان صرفاً نمونه است.')} className="relative rounded-lg border p-2"><Bell className="h-4 w-4" /><span className="absolute -top-1 -left-1 h-2 w-2 rounded-full bg-amber-500" /></button></div>
      </div>

      <div className="flex items-center gap-2 py-3">
        <div className="relative flex-1"><Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="جست‌وجو در بخش‌ها و امکانات..." className="h-9 w-full rounded-lg border bg-background pr-9 pl-3 text-xs outline-none focus:ring-2 focus:ring-primary/30" /></div>
        {device === 'mobile' && <button type="button" onClick={() => setMobileMenu(value => !value)} className="rounded-lg border p-2" aria-label="نمایش فهرست بخش‌ها">{mobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>}
      </div>

      {device === 'mobile' ? <div className="space-y-3">
        {mobileMenu && <div className="grid grid-cols-2 gap-2 rounded-xl border bg-muted/20 p-2">
          {filteredGroups.map(group => { const Icon = group.icon; return <button key={group.id} type="button" onClick={() => chooseGroup(group.id)} className={'flex items-center gap-2 rounded-lg border p-2 text-right text-[11px] ' + (active === group.id ? 'border-primary bg-primary/10' : 'bg-background')}><Icon className="h-4 w-4 shrink-0" /><span>{group.title}</span></button>; })}
        </div>}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filteredGroups.map(group => { const Icon = group.icon; return <button key={group.id} type="button" onClick={() => chooseGroup(group.id)} className={'shrink-0 rounded-xl border px-3 py-2 text-[10px] ' + (active === group.id ? 'border-primary bg-primary text-primary-foreground' : 'bg-background')}><Icon className="mx-auto mb-1 h-4 w-4" />{group.title}</button>; })}
        </div>
        <WorkspaceContent group={activeGroup} onSelectModule={name => setNotice('بخش «' + name + '» در اسکلت فعلی فقط برای بررسی ساختار نمایش داده می‌شود.')} notice={notice} />
      </div> : <div className="flex gap-4 pt-1">
        <aside className="w-56 shrink-0 border-l pl-3">
          <div className="mb-2 flex items-center justify-between px-2"><span className="text-[10px] font-semibold text-muted-foreground">منوی اصلی</span><span className="text-[10px] text-muted-foreground">۱۰ بخش</span></div>
          <nav className="space-y-1">
            {filteredGroups.map(group => { const Icon = group.icon; return <button key={group.id} type="button" onClick={() => chooseGroup(group.id)} className={'flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-right text-xs transition ' + (active === group.id ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted')}><Icon className="h-4 w-4 shrink-0" /><span className="flex-1">{group.title}</span><ChevronLeft className="h-3.5 w-3.5 opacity-60" /></button>; })}
          </nav>
          <div className="mt-4 rounded-xl border bg-muted/30 p-3"><div className="flex items-center gap-2 text-xs font-semibold"><ShieldCheck className="h-4 w-4 text-emerald-600" />کنترل ساختار</div><p className="mt-2 text-[10px] leading-5 text-muted-foreground">ثبت عملیات باید یک‌بار انجام شود و سند حسابداری متناظر به‌صورت ساختاریافته ایجاد گردد.</p></div>
        </aside>
        <main className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><div className="text-[10px] text-muted-foreground">پنل صراف / ساختار پیشنهادی</div><h3 className="mt-1 text-lg font-bold">{activeGroup.title}</h3><p className="mt-1 text-xs text-muted-foreground">{activeGroup.subtitle}</p></div><button type="button" onClick={() => setNotice('فرم «' + activeGroup.modules[0] + '» در مرحله طراحی رابط کاربری قرار دارد.')} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs text-primary-foreground"><Plus className="h-4 w-4" />عملیات جدید</button></div>
          {active === 'dashboard' && <div className="grid grid-cols-4 gap-3">{METRICS.map(item => <MetricCard key={item.label} item={item} />)}</div>}
          <WorkspaceContent group={activeGroup} onSelectModule={name => setNotice('بخش «' + name + '» در اسکلت فعلی فقط برای بررسی ساختار نمایش داده می‌شود.')} notice={notice} />
        </main>
      </div>}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-[10px] text-muted-foreground"><span>نسخه نمایشی · اطلاعات غیرواقعی</span><span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />بدون اتصال به پایگاه داده</span></div>
    </div>

    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border p-3"><div className="flex items-center gap-2 text-xs font-semibold"><Scale className="h-4 w-4 text-primary" />ثبت دوطرفه</div><p className="mt-2 text-[10px] leading-5 text-muted-foreground">در طراحی نهایی، هر عملیات مالی باید بدهکار و بستانکار متناظر داشته باشد و توازن سند کنترل شود.</p></div>
      <div className="rounded-xl border p-3"><div className="flex items-center gap-2 text-xs font-semibold"><History className="h-4 w-4 text-primary" />ردیابی تغییرات</div><p className="mt-2 text-[10px] leading-5 text-muted-foreground">اصلاح، برگشت، کاربر ثبت‌کننده و زمان رویداد باید در ساختار حسابرسی دیده شوند.</p></div>
      <div className="rounded-xl border p-3"><div className="flex items-center gap-2 text-xs font-semibold"><Building2 className="h-4 w-4 text-primary" />چندشعبه‌ای و چندارزی</div><p className="mt-2 text-[10px] leading-5 text-muted-foreground">تفکیک شعب، ارزها، صندوق‌ها و حساب‌های بین‌شعبه‌ای در چیدمان از ابتدا لحاظ شده است.</p></div>
    </div>
    <p className="text-[10px] leading-5 text-muted-foreground">توجه: این بخش فقط اسکلت و چیدمان رابط کاربری است؛ هیچ دیتابیس، جدول، API، اتصال سرور، سند واقعی یا تراکنش مالی ایجاد نمی‌کند.</p>
  </div>;
}

function WorkspaceContent({ group, onSelectModule, notice }) {
  const Icon = group.icon;
  return <section className="rounded-xl border bg-card p-3 sm:p-4 space-y-3">
    <div className="flex items-center gap-2"><div className="rounded-lg bg-primary/10 p-2"><Icon className="h-4 w-4 text-primary" /></div><div><h4 className="text-sm font-bold">{group.title}</h4><p className="text-[10px] text-muted-foreground">{group.subtitle}</p></div></div>
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {group.modules.map((module, index) => {
        const moduleIcons = [FileText, ClipboardList, ReceiptText, CircleDollarSign, Landmark, BookMarked, CalendarDays, Package];
        const ModuleIcon = moduleIcons[index % moduleIcons.length];
        return <button key={module} type="button" onClick={() => onSelectModule(module)} className="flex min-h-[66px] items-center gap-3 rounded-xl border p-3 text-right transition hover:border-primary/50 hover:bg-muted/40">
          <span className="rounded-lg bg-muted p-2"><ModuleIcon className="h-4 w-4 text-muted-foreground" /></span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold">{module}</span><span className="mt-1 block text-[10px] text-muted-foreground">مشاهده ساختار و جایگاه ماژول</span></span><ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </button>;
      })}
    </div>
    {group.id === 'dashboard' && <div className="overflow-x-auto rounded-lg border"><table className="w-full min-w-[600px] text-right text-xs"><thead className="bg-muted/60 text-muted-foreground"><tr><th className="p-3">شناسه نمونه</th><th className="p-3">نوع عملیات</th><th className="p-3">حساب مرتبط</th><th className="p-3">بدهکار</th><th className="p-3">بستانکار</th><th className="p-3">کنترل</th></tr></thead><tbody>{SAMPLE_ROWS.map(row => <tr key={row.ref} className="border-t"><td className="p-3 font-medium">{row.ref}</td><td className="p-3">{row.type}</td><td className="p-3">{row.account}</td><td className="p-3 tabular-nums">{row.debit}</td><td className="p-3 tabular-nums">{row.credit}</td><td className="p-3"><span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] text-emerald-800">{row.state}</span></td></tr>)}</tbody></table></div>}
    {notice && <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-[10px] leading-5">{notice}</div>}
  </section>;
}
