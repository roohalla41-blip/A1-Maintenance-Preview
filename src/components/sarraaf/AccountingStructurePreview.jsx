import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, Users, ArrowLeftRight, Send, Wallet, BookOpen,
  ChartNoAxesCombined, GitBranch, Globe2, Settings2, Search, Bell,
  ChevronLeft, Plus, FileText, CircleDollarSign, ArrowDownUp,
  Landmark, ClipboardList, ShieldCheck, CalendarDays, Menu, X,
  CheckCircle2, Building2, Calculator, ReceiptText, Scale, BookMarked,
  History, UserRound, Banknote, Coins, BadgeCheck, Archive, SlidersHorizontal,
  ArrowDownToLine, ArrowUpFromLine, ListChecks, LockKeyhole, CircleHelp
} from 'lucide-react';

const GROUPS = [
  { id: 'dashboard', title: 'داشبورد مالی', subtitle: 'نمای یکپارچه وضعیت روزانه صرافی', icon: LayoutDashboard, modules: [
    ['خلاصه وضعیت مالی', 'مانده صندوق‌ها، حساب‌ها و وضعیت نقدینگی'],
    ['عملکرد روزانه', 'تعداد عملیات، حجم خرید و فروش و کارمزدها'],
    ['سود و زیان', 'نمای درآمد، هزینه و سود دوره‌ای'],
    ['فعالیت‌های اخیر', 'آخرین اسناد، دریافت‌ها، پرداخت‌ها و حواله‌ها'],
  ]},
  { id: 'customers', title: 'مشتریان و حساب‌ها', subtitle: 'دفتر مشتریان و گردش بدهکار و بستانکار', icon: Users, modules: [
    ['ثبت مشتری', 'نام و مشخصات تماس و شناسه داخلی مشتری'],
    ['فهرست مشتریان', 'جست‌وجو، گروه‌بندی و وضعیت پرونده'],
    ['حساب و گردش مشتری', 'مانده به تفکیک ارز و ریز گردش حساب'],
    ['بدهکاران و بستانکاران', 'فهرست مانده‌های باز و سررسیدها'],
    ['مدارک و سوابق مشتری', 'ثبت اطلاعات پایه و مدارک موردنیاز کسب‌وکار'],
  ]},
  { id: 'operations', title: 'عملیات روزانه', subtitle: 'یک بار ثبت عملیات و ایجاد مسیر حسابداری متناظر', icon: ArrowLeftRight, modules: [
    ['خرید و فروش ارز', 'ارز پرداختی، ارز دریافتی، نرخ و طرف حساب'],
    ['دریافت وجه', 'دریافت نقدی یا از حساب و صدور رسید'],
    ['پرداخت وجه', 'پرداخت نقدی یا از حساب و ثبت رسید'],
    ['انتقال بین حساب‌ها', 'انتقال داخلی با کنترل ارز و مانده'],
    ['اصلاح و برگشت عملیات', 'اصلاح مستند یا برگشت با حفظ ردپای حسابرسی'],
  ]},
  { id: 'remittances', title: 'حواله‌ها', subtitle: 'مدیریت چرخه حواله از ثبت تا تسویه', icon: Send, modules: [
    ['حواله ارسالی', 'ثبت فرستنده، گیرنده، مقصد، ارز و کارمزد'],
    ['حواله دریافتی', 'ثبت دریافت‌کننده و کنترل پرداخت'],
    ['دفتر حواله‌ها', 'فهرست، جست‌وجو و فیلتر وضعیت حواله'],
    ['تسویه و پیگیری', 'وضعیت در انتظار، پرداخت‌شده و برگشتی'],
    ['رسید و بایگانی حواله', 'رسید مشتری و سوابق تغییر وضعیت'],
  ]},
  { id: 'treasury', title: 'صندوق و خزانه', subtitle: 'مدیریت وجه نقد، بانک و تطبیق مانده‌ها', icon: Wallet, modules: [
    ['صندوق‌ها', 'صندوق اصلی، صندوق شعب و صندوق ارزی'],
    ['حساب‌های بانکی', 'حساب بانکی به تفکیک بانک و ارز'],
    ['ورود و خروج وجه', 'گردش نقدی صندوق و کنترل مسئول صندوق'],
    ['انتقال بین صندوق‌ها', 'حواله داخلی و تأیید تحویل وجه'],
    ['شمارش و تطبیق صندوق', 'موجودی دفتری در برابر شمارش واقعی'],
  ]},
  { id: 'ledger', title: 'دفاتر حسابداری', subtitle: 'کدینگ و حسابداری دوطرفه و اسناد قابل ردیابی', icon: BookOpen, modules: [
    ['کدینگ حساب‌ها', 'گروه، کل، معین و تفصیلی'],
    ['سند حسابداری', 'سند دستی و سند خودکار ناشی از عملیات'],
    ['دفتر روزنامه', 'ثبت مرتب اسناد بر اساس تاریخ و شماره'],
    ['دفتر کل و معین', 'گردش و مانده حساب‌ها در دوره مالی'],
    ['دفتر تفصیلی', 'گردش اشخاص، صندوق‌ها و مراکز هزینه'],
    ['تراز آزمایشی', 'کنترل برابری جمع بدهکار و بستانکار'],
  ]},
  { id: 'reports', title: 'گزارش‌ها و بایگانی', subtitle: 'گزارش‌های عملیاتی، مالی و مدیریتی', icon: ChartNoAxesCombined, modules: [
    ['گزارش روزانه', 'خلاصه دریافت، پرداخت، خرید و فروش'],
    ['ترازنامه', 'نمای دارایی، بدهی و سرمایه'],
    ['سود و زیان', 'درآمد کارمزد، هزینه و نتیجه دوره'],
    ['گردش ارزها', 'مانده و گردش هر ارز در بازه زمانی'],
    ['گزارش صندوق و شعب', 'مقایسه عملکرد و مانده واحدها'],
    ['بایگانی اسناد', 'جست‌وجو و بازیابی رسید و سند'],
  ]},
  { id: 'branches', title: 'شعب و نمایندگی‌ها', subtitle: 'کنترل چندشعبه‌ای و حساب‌های فی‌مابین', icon: GitBranch, modules: [
    ['فهرست شعب', 'تعریف شعبه و مشخصات محل فعالیت'],
    ['کارکنان شعب', 'مدیر، حسابدار و صندوق‌دار هر شعبه'],
    ['حساب بین‌شعبه‌ای', 'ثبت مطالبات و بدهی‌های متقابل شعب'],
    ['انتقال و تسویه شعب', 'کنترل انتقال وجه و تأیید دریافت'],
    ['گزارش عملکرد شعب', 'گزارش مستقل و تجمیعی'],
  ]},
  { id: 'currencies', title: 'ارزها، نرخ و کارمزد', subtitle: 'مدیریت ارزهای متعدد و قواعد تبدیل', icon: Coins, modules: [
    ['فهرست ارزها', 'کد ارز، نام، دقت اعشار و وضعیت'],
    ['نرخ خرید و فروش', 'نرخ‌های خرید، فروش و نرخ مرجع'],
    ['تاریخچه نرخ‌ها', 'ثبت زمان تغییر و کاربر ثبت‌کننده'],
    ['کارمزد و تعرفه', 'کارمزد ثابت یا درصدی بر اساس خدمت'],
    ['ماشین‌حساب تبدیل', 'محاسبه مبلغ مقصد با نرخ انتخابی'],
  ]},
  { id: 'management', title: 'مدیریت و کنترل', subtitle: 'نقش‌ها، امنیت، دوره مالی و تنظیمات', icon: Settings2, modules: [
    ['کاربران و کارکنان', 'حساب کاربری و وضعیت دسترسی'],
    ['نقش‌ها و مجوزها', 'دسترسی مجزا برای مدیر، حسابدار و صندوق‌دار'],
    ['سوابق حسابرسی', 'ثبت‌کننده، زمان، تغییر و مرجع عملیات'],
    ['دوره مالی', 'سال مالی، بستن دوره و کنترل تاریخ اسناد'],
    ['تنظیمات و پشتیبان', 'قواعد عمومی، چاپ و نسخه پشتیبان'],
  ]},
];

const MODULE_ICONS = [FileText, ClipboardList, ReceiptText, CircleDollarSign, Landmark, BookMarked, CalendarDays, Archive, ListChecks];
const SAMPLE_ROWS = [
  { ref: 'DEMO-1048', date: '۱۴۰۵/۰۸/۲۴', type: 'خرید و فروش ارز', account: 'صندوق اصلی · EUR/USD', debit: '۱٬۲۵۰٫۰۰', credit: '۱٬۲۵۰٫۰۰', state: 'متوازن' },
  { ref: 'DEMO-1047', date: '۱۴۰۵/۰۸/۲۴', type: 'دریافت از مشتری', account: 'حساب مشتری نمونه', debit: '۴۸۰٫۰۰', credit: '۴۸۰٫۰۰', state: 'متوازن' },
  { ref: 'DEMO-1046', date: '۱۴۰۵/۰۸/۲۴', type: 'حواله دریافتی', account: 'حواله‌های در جریان', debit: '۹۰۰٫۰۰', credit: '۹۰۰٫۰۰', state: 'در انتظار' },
];
const METRICS = [
  { label: 'مانده صندوق نمونه', value: '۱۲۵٬۴۰۰', note: 'واحد نمایشی', icon: Wallet },
  { label: 'عملیات امروز', value: '۳۸', note: 'داده ساختگی', icon: ArrowDownUp },
  { label: 'اسناد متوازن', value: '۳۶ / ۳۸', note: 'دو مورد نیازمند بررسی', icon: Scale },
  { label: 'حواله‌های باز', value: '۰۷', note: 'نیازمند پیگیری', icon: Send },
];

function MetricCard({ item }) {
  const Icon = item.icon;
  return <div className="min-w-0 rounded-xl border bg-card p-3 sm:p-4">
    <div className="flex items-center justify-between gap-2"><span className="text-[11px] text-muted-foreground">{item.label}</span><span className="rounded-lg bg-muted p-2"><Icon className="h-4 w-4 text-primary" /></span></div>
    <div className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">{item.value}</div>
    <div className="mt-1 text-[10px] text-muted-foreground">{item.note}</div>
  </div>;
}

export default function AccountingStructurePreview() {
  const [device, setDevice] = useState('desktop');
  const [active, setActive] = useState('dashboard');
  const [query, setQuery] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [notice, setNotice] = useState('');
  const [demoRecords, setDemoRecords] = useState(() => { try { return JSON.parse(sessionStorage.getItem('a1-accounting-demo-records') || '[]'); } catch { return []; } });
  const [activityLog, setActivityLog] = useState(() => { try { return JSON.parse(sessionStorage.getItem('a1-accounting-demo-log') || '[]'); } catch { return []; } });
  const [formTarget, setFormTarget] = useState('');
  const [draft, setDraft] = useState({ title: '', party: '', currency: 'USD', amount: '', rate: '', description: '' });
  useEffect(() => { try { sessionStorage.setItem('a1-accounting-demo-records', JSON.stringify(demoRecords)); } catch {} }, [demoRecords]);
  useEffect(() => { try { sessionStorage.setItem('a1-accounting-demo-log', JSON.stringify(activityLog)); } catch {} }, [activityLog]);
  const [records, setRecords] = useState(() => { try { return JSON.parse(localStorage.getItem('hisabsarraf_accounting_demo_v1') || '{}'); } catch { return {}; } });
  const [draft, setDraft] = useState({ title: '', party: '', currency: 'USD', amount: '', date: '', status: 'ثبت موقت', notes: '' });
  const [editingId, setEditingId] = useState(null);
  useEffect(() => { try { localStorage.setItem('hisabsarraf_accounting_demo_v1', JSON.stringify(records)); } catch { setNotice('فضای ذخیره‌سازی مرورگر در دسترس نیست؛ اطلاعات پس از بستن صفحه باقی نمی‌ماند.'); } }, [records]);
  const activeGroup = GROUPS.find(group => group.id === active) || GROUPS[0];
  const filteredGroups = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return GROUPS;
    return GROUPS.filter(group => (group.title + ' ' + group.subtitle + ' ' + group.modules.map(item => item.join(' ')).join(' ')).toLocaleLowerCase().includes(term));
  }, [query]);

  const chooseGroup = (id) => {
    setActive(id);
    setSelectedModule(null);
    setMobileMenu(false);
    setNotice('');
  };
  const chooseModule = (module) => {
    setSelectedModule(module);
    setNotice(''); 
  };
  const simulateAction = (label) => {
    const entry = { id: 'LOG-' + Date.now(), label, time: new Date().toLocaleString('fa-IR') };
    setActivityLog(items => [entry, ...items].slice(0, 50));
    setNotice(label + ' در گزارش فعالیت آزمایشی همین مرورگر ثبت شد؛ هیچ اطلاعاتی به سرور ارسال نشد.');
  };
  const openDemoForm = (label) => {
    setFormTarget(label);
    setDraft({ title: label, party: '', currency: 'USD', amount: '', rate: '', description: '' });
    setNotice('');
  };
  const saveDemoForm = (event) => {
    event.preventDefault();
    if (!draft.title.trim() || !draft.amount.trim()) { setNotice('عنوان و مبلغ را وارد کنید.'); return; }
    const record = { ...draft, id: 'TMP-' + Date.now(), module: formTarget, time: new Date().toLocaleString('fa-IR'), status: 'ذخیره موقت' };
    setDemoRecords(items => [record, ...items]);
    setActivityLog(items => [{ id: 'LOG-' + Date.now(), label: 'ذخیره موقت ' + formTarget, time: new Date().toLocaleString('fa-IR') }, ...items].slice(0, 50));
    setFormTarget('');
    setNotice('اطلاعات نمونه فقط در حافظه موقت همین زبانه مرورگر ذخیره شد.');
  };
  const deleteDemoRecord = (id) => setDemoRecords(items => items.filter(item => item.id !== id));
  const clearDemoData = () => {
    setDemoRecords([]);
    setActivityLog([]);
    try { sessionStorage.removeItem('a1-accounting-demo-records'); sessionStorage.removeItem('a1-accounting-demo-log'); } catch {}
    setNotice('تمام داده‌های آزمایشی این زبانه پاک شد.');
  };

  const saveDraft = () => {
    if (!selectedModule || !draft.title.trim()) { setNotice('عنوان یا شرح اصلی را وارد کنید.'); return; }
    const id = editingId || `LOCAL-${Date.now()}`;
    const item = { ...draft, id, module: selectedModule.name, group: active, savedAt: new Date().toISOString() };
    setRecords(current => ({ ...current, [active]: [...(current[active] || []).filter(row => row.id !== id), item] }));
    setDraft({ title: '', party: '', currency: 'USD', amount: '', date: '', status: 'ثبت موقت', notes: '' });
    setEditingId(null);
    setNotice('اطلاعات در حافظه همین مرورگر ذخیره شد؛ به سرور یا دیتابیس ارسال نشد.');
  };
  const editRecord = (row) => {
    setSelectedModule({ name: row.module, detail: 'ویرایش اطلاعات ذخیره‌شده محلی' });
    setDraft({ title: row.title || '', party: row.party || '', currency: row.currency || 'USD', amount: row.amount || '', date: row.date || '', status: row.status || 'ثبت موقت', notes: row.notes || '' });
    setEditingId(row.id);
    setNotice('حالت ویرایش فعال شد.');
  };
  const deleteRecord = (id) => {
    setRecords(current => ({ ...current, [active]: (current[active] || []).filter(row => row.id !== id) }));
    setNotice('رکورد فقط از حافظه محلی مرورگر حذف شد.');
  };
  const exportLocal = () => {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'hisabsarraf-demo-local-backup.json'; a.click();
    URL.revokeObjectURL(url);
  };
  const clearLocal = () => {
    if (!window.confirm('تمام داده‌های آزمایشی ذخیره‌شده در این مرورگر پاک شود؟')) return;
    setRecords({}); setNotice('داده‌های آزمایشی محلی پاک شد.');
  };

  return <div dir="rtl" className="space-y-4">
    <section className="rounded-2xl border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5"><Calculator className="h-5 w-5 text-primary" /></div>
          <div><h2 className="text-sm font-bold sm:text-base">اسکلت تخصصی حسابداری صرافی</h2><p className="mt-1 text-xs leading-6 text-muted-foreground">ساختار کاری دفتر صرافی؛ از ثبت عملیات روزانه تا دفاتر، خزانه و گزارش‌های مالی.</p></div>
        </div>
        <span className="rounded-full border px-3 py-1.5 text-[10px] font-semibold">محیط بررسی · داده‌های کاملاً ساختگی</span>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground"><ShieldCheck className="h-4 w-4 text-emerald-600" />فقط رابط کاربری؛ بدون اتصال به داده‌های اصلی</div>
        <div className="inline-flex gap-1 rounded-xl border bg-background p-1">
          <button type="button" onClick={() => setDevice('desktop')} className={'rounded-lg px-3 py-2 text-xs ' + (device === 'desktop' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}> <Building2 className="ml-1 inline h-3.5 w-3.5" />لپ‌تاپ</button>
          <button type="button" onClick={() => setDevice('mobile')} className={'rounded-lg px-3 py-2 text-xs ' + (device === 'mobile' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}> <UserRound className="ml-1 inline h-3.5 w-3.5" />گوشی</button>
        </div>
      </div>
    </section>

    <div className={device === 'mobile' ? 'mx-auto w-full max-w-[430px] rounded-[30px] border-[6px] border-slate-700 bg-background p-2 shadow-xl' : 'w-full rounded-2xl border bg-background p-3 sm:p-4'}>
      <header className="flex items-center justify-between gap-3 border-b pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="rounded-xl bg-primary p-2 text-primary-foreground"><Calculator className="h-5 w-5" /></div>
          <div className="min-w-0"><div className="text-sm font-bold">حساب صراف</div><div className="text-[10px] text-muted-foreground">دفتر مالی · شعبه مرکزی نمونه</div></div>
        </div>
        <div className="flex items-center gap-2"><span className="hidden rounded-full bg-muted px-2.5 py-1 text-[10px] sm:inline-flex">مدیر دفتر نمونه</span><button type="button" aria-label="اعلان‌های نمونه" onClick={() => simulateAction('اعلان‌ها')} className="relative rounded-lg border p-2"><Bell className="h-4 w-4" /><span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-amber-500" /></button></div>
      </header>

      <div className="flex items-center gap-2 py-3">
        <div className="relative flex-1"><Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="جست‌وجوی بخش، دفتر یا عملیات..." className="h-9 w-full rounded-lg border bg-background pr-9 pl-3 text-xs outline-none focus:ring-2 focus:ring-primary/30" /></div>
        {device === 'mobile' && <button type="button" onClick={() => setMobileMenu(value => !value)} className="rounded-lg border p-2" aria-label="نمایش منوی اصلی">{mobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>}
      </div>

      {device === 'mobile' ? <div className="space-y-3">
        {mobileMenu && <nav className="grid grid-cols-2 gap-2 rounded-xl border bg-muted/20 p-2">
          {filteredGroups.map(group => { const Icon = group.icon; return <button key={group.id} type="button" onClick={() => chooseGroup(group.id)} className={'flex items-center gap-2 rounded-lg border p-2 text-right text-[11px] ' + (active === group.id ? 'border-primary bg-primary/10' : 'bg-background')}><Icon className="h-4 w-4 shrink-0" /><span>{group.title}</span></button>; })}
        </nav>}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filteredGroups.map(group => { const Icon = group.icon; return <button key={group.id} type="button" onClick={() => chooseGroup(group.id)} className={'shrink-0 rounded-xl border px-3 py-2 text-[10px] ' + (active === group.id ? 'border-primary bg-primary text-primary-foreground' : 'bg-background')}><Icon className="mx-auto mb-1 h-4 w-4" />{group.title}</button>; })}
        </div>
        <WorkspaceContent group={activeGroup} selectedModule={selectedModule} onSelectModule={chooseModule} onAction={simulateAction} notice={notice} records={records[active] || []} draft={draft} setDraft={setDraft} onSave={saveDraft} onEdit={editRecord} onDelete={deleteRecord} editingId={editingId} onExport={exportLocal} onClear={clearLocal} />
      </div> : <div className="flex gap-4 pt-1">
        <aside className="w-60 shrink-0 border-l pl-3">
          <div className="mb-2 flex items-center justify-between px-2"><span className="text-[10px] font-semibold text-muted-foreground">منوی اصلی دفتر</span><span className="text-[10px] text-muted-foreground">۱۰ حوزه</span></div>
          <nav className="space-y-1">
            {filteredGroups.map(group => { const Icon = group.icon; return <button key={group.id} type="button" onClick={() => chooseGroup(group.id)} className={'flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-right text-xs transition ' + (active === group.id ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted')}><Icon className="h-4 w-4 shrink-0" /><span className="flex-1">{group.title}</span><ChevronLeft className="h-3.5 w-3.5 opacity-60" /></button>; })}
          </nav>
          <div className="mt-4 rounded-xl border bg-muted/30 p-3"><div className="flex items-center gap-2 text-xs font-semibold"><Scale className="h-4 w-4 text-emerald-600" />کنترل حسابداری</div><p className="mt-2 text-[10px] leading-5 text-muted-foreground">هر عملیات فقط یک‌بار ثبت می‌شود؛ سند متناظر باید بدهکار و بستانکار برابر داشته باشد.</p></div>
        </aside>
        <main className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><div className="text-[10px] text-muted-foreground">دفتر صرافی / ساختار کاری</div><h3 className="mt-1 text-lg font-bold">{activeGroup.title}</h3><p className="mt-1 text-xs text-muted-foreground">{activeGroup.subtitle}</p></div><button type="button" onClick={() => openDemoForm(activeGroup.modules[0][0])} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs text-primary-foreground"><Plus className="h-4 w-4" />عملیات جدید</button></div>
          <WorkspaceContent group={activeGroup} selectedModule={selectedModule} onSelectModule={chooseModule} onAction={simulateAction} notice={notice} records={records[active] || []} draft={draft} setDraft={setDraft} onSave={saveDraft} onEdit={editRecord} onDelete={deleteRecord} editingId={editingId} onExport={exportLocal} />
        </main>
      </div>}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-[10px] text-muted-foreground"><span>اسکلت رابط کاربری · اطلاعات غیرواقعی</span><span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />عدم اتصال به پایگاه داده</span></div>
    </div>

    <div className="flex flex-wrap gap-2"><button type="button" onClick={exportLocal} className="rounded-lg border px-3 py-2 text-xs">خروجی پشتیبان محلی</button><button type="button" onClick={clearLocal} className="rounded-lg border px-3 py-2 text-xs">پاک‌کردن داده‌های آزمایشی</button><span className="self-center text-[10px] text-muted-foreground">{Object.values(records).reduce((n, rows) => n + rows.length, 0)} رکورد ذخیره‌شده در این مرورگر</span></div>\n    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={exportLocal} className="rounded-lg border px-3 py-2 text-xs">خروجی پشتیبان محلی</button>
      <button type="button" onClick={clearLocal} className="rounded-lg border px-3 py-2 text-xs">پاک‌کردن داده‌های آزمایشی</button>
      <span className="text-[10px] text-muted-foreground">{Object.values(records).reduce((n, rows) => n + rows.length, 0)} رکورد ذخیره‌شده در این مرورگر</span>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[
        [Scale, 'حسابداری دوطرفه', 'ثبت بدهکار و بستانکار و کنترل توازن سند'],
        [History, 'ردپای حسابرسی', 'ثبت کاربر، زمان، اصلاح و برگشت عملیات'],
        [Coins, 'چندارزی', 'تفکیک مانده و گردش هر ارز'],
        [GitBranch, 'چندشعبه‌ای', 'حساب‌های فی‌مابین و گزارش مستقل شعب'],
      ].map(([Icon, title, detail]) => <div key={title} className="rounded-xl border p-3"><div className="flex items-center gap-2 text-xs font-semibold"><Icon className="h-4 w-4 text-primary" />{title}</div><p className="mt-2 text-[10px] leading-5 text-muted-foreground">{detail}</p></div>)}
    </div>
    <div className="rounded-xl border border-amber-300/70 bg-amber-50/50 p-3 text-[10px] leading-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-200">این فقط اسکلت رابط کاربری در پنل سازنده است. دیتابیس، جدول، API، اتصال سرور، سند واقعی و تراکنش مالی ایجاد یا تغییر نمی‌شود.</div>
  </div>;
}

function WorkspaceContent({ group, selectedModule, onSelectModule, onAction, notice, records = [], draft = {}, setDraft = () => {}, onSave = () => {}, onEdit = () => {}, onDelete = () => {}, editingId, onExport = () => {}, onClear = () => {} }) {
  const Icon = group.icon;
  return <section className="space-y-3 rounded-xl border bg-card p-3 sm:p-4">
    <div className="flex items-center gap-2"><div className="rounded-lg bg-primary/10 p-2"><Icon className="h-4 w-4 text-primary" /></div><div><h4 className="text-sm font-bold">{group.title}</h4><p className="text-[10px] text-muted-foreground">{group.subtitle}</p></div></div>
    {group.id === 'dashboard' && <div className="grid grid-cols-2 gap-2 xl:grid-cols-4 sm:gap-3">{METRICS.map(item => <MetricCard key={item.label} item={item} />)}</div>}
    {group.id === 'dashboard' && <div className="overflow-x-auto rounded-lg border"><table className="w-full min-w-[720px] text-right text-xs"><thead className="bg-muted/60 text-muted-foreground"><tr>{['شماره مرجع', 'تاریخ', 'نوع عملیات', 'حساب مرتبط', 'بدهکار', 'بستانکار', 'کنترل'].map(label => <th key={label} className="p-3">{label}</th>)}</tr></thead><tbody>{SAMPLE_ROWS.map(row => <tr key={row.ref} className="border-t"><td className="p-3 font-medium">{row.ref}</td><td className="p-3">{row.date}</td><td className="p-3">{row.type}</td><td className="p-3">{row.account}</td><td className="p-3 tabular-nums">{row.debit}</td><td className="p-3 tabular-nums">{row.credit}</td><td className="p-3"><span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] text-emerald-800">{row.state}</span></td></tr>)}</tbody></table></div>}
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {group.modules.map(([name, detail], index) => { const ModuleIcon = MODULE_ICONS[index % MODULE_ICONS.length]; return <button key={name} type="button" onClick={() => onSelectModule({ name, detail })} className={'flex min-h-[76px] items-center gap-3 rounded-xl border p-3 text-right transition hover:border-primary/50 hover:bg-muted/40 ' + (selectedModule?.name === name ? 'border-primary bg-primary/5' : '')}><span className="rounded-lg bg-muted p-2"><ModuleIcon className="h-4 w-4 text-muted-foreground" /></span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold">{name}</span><span className="mt-1 block text-[10px] leading-5 text-muted-foreground">{detail}</span></span><ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" /></button>; })}
    </div>
    {selectedModule && <div className="space-y-3 rounded-xl border border-primary/25 bg-primary/5 p-3">
      <div className="flex items-start gap-2"><div className="rounded-lg bg-background p-2"><FileText className="h-4 w-4 text-primary" /></div><div className="min-w-0 flex-1"><div className="text-xs font-bold">{selectedModule.name}</div><p className="mt-1 text-[10px] leading-5 text-muted-foreground">{selectedModule.detail}</p></div></div>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="space-y-1 text-[10px]">عنوان / شرح اصلی<input value={draft.title || ''} onChange={e => setDraft(v => ({...v,title:e.target.value}))} className="h-9 w-full rounded-lg border bg-background px-3 text-xs" placeholder="مثلاً ثبت دریافت از مشتری" /></label>
        <label className="space-y-1 text-[10px]">طرف حساب / مرجع<input value={draft.party || ''} onChange={e => setDraft(v => ({...v,party:e.target.value}))} className="h-9 w-full rounded-lg border bg-background px-3 text-xs" placeholder="نام مشتری یا حساب" /></label>
        <label className="space-y-1 text-[10px]">ارز<select value={draft.currency || 'USD'} onChange={e => setDraft(v => ({...v,currency:e.target.value}))} className="h-9 w-full rounded-lg border bg-background px-3 text-xs"><option>USD</option><option>EUR</option><option>AFN</option><option>IRR</option><option>TRY</option><option>GBP</option></select></label>
        <label className="space-y-1 text-[10px]">مبلغ<input type="number" min="0" value={draft.amount || ''} onChange={e => setDraft(v => ({...v,amount:e.target.value}))} className="h-9 w-full rounded-lg border bg-background px-3 text-xs" placeholder="مبلغ آزمایشی" /></label>
        <label className="space-y-1 text-[10px]">تاریخ<input type="date" value={draft.date || ''} onChange={e => setDraft(v => ({...v,date:e.target.value}))} className="h-9 w-full rounded-lg border bg-background px-3 text-xs" /></label>
        <label className="space-y-1 text-[10px]">وضعیت<select value={draft.status || 'ثبت موقت'} onChange={e => setDraft(v => ({...v,status:e.target.value}))} className="h-9 w-full rounded-lg border bg-background px-3 text-xs"><option>ثبت موقت</option><option>در انتظار</option><option>تکمیل‌شده (آزمایشی)</option><option>نیازمند بررسی</option></select></label>
        <label className="space-y-1 text-[10px] sm:col-span-2">یادداشت<input value={draft.notes || ''} onChange={e => setDraft(v => ({...v,notes:e.target.value}))} className="h-9 w-full rounded-lg border bg-background px-3 text-xs" placeholder="توضیحات تکمیلی" /></label>
      </div>
      <div className="flex flex-wrap gap-2"><button type="button" onClick={onSave} className="rounded-lg bg-primary px-4 py-2 text-xs text-primary-foreground">{editingId ? 'ذخیره ویرایش' : 'ذخیره موقت در مرورگر'}</button><button type="button" onClick={() => onAction('فرم ' + selectedModule.name)} className="rounded-lg border bg-background px-3 py-2 text-xs">آزمون دکمه فرم</button><button type="button" onClick={onExport} className="rounded-lg border bg-background px-3 py-2 text-xs">پشتیبان JSON</button></div>
      <div className="text-[10px] text-muted-foreground">این داده فقط در localStorage همین مرورگر ذخیره می‌شود؛ با پاک‌کردن داده‌های سایت/مرورگر ممکن است حذف شود و بین دستگاه‌ها همگام‌سازی نمی‌شود.</div>
    </div>}
    {records.length > 0 && <div className="overflow-x-auto rounded-xl border"><table className="w-full min-w-[620px] text-right text-xs"><thead className="bg-muted/60"><tr>{['عنوان','طرف حساب','ارز','مبلغ','وضعیت','عملیات'].map(x=><th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>{records.map(row=><tr key={row.id} className="border-t"><td className="p-3 font-medium">{row.title}</td><td className="p-3">{row.party || '—'}</td><td className="p-3">{row.currency}</td><td className="p-3 tabular-nums">{row.amount || '—'}</td><td className="p-3">{row.status}</td><td className="p-3"><div className="flex gap-2"><button type="button" onClick={()=>onEdit(row)} className="rounded border px-2 py-1">ویرایش</button><button type="button" onClick={()=>onDelete(row.id)} className="rounded border px-2 py-1 text-red-600">حذف</button></div></td></tr>)}</tbody></table></div>}
    {group.id === 'operations' && <div className="grid gap-2 rounded-xl border bg-muted/20 p-3 sm:grid-cols-2">
      <div className="sm:col-span-2 flex items-center gap-2 text-xs font-semibold"><ArrowLeftRight className="h-4 w-4 text-primary" />الگوی فرم عملیات روزانه</div>
      {['نوع عملیات', 'طرف حساب', 'ارز و مبلغ', 'نرخ تبدیل', 'صندوق / حساب مقصد', 'شرح و پیوست'].map(field => <label key={field} className="space-y-1 text-[10px] text-muted-foreground">{field}<input onFocus={() => onOpenForm(field)} readOnly placeholder="برای بازکردن فرم آزمایشی کلیک کنید" className="h-9 w-full cursor-pointer rounded-lg border bg-background px-3 text-xs" /></label>)}
      <button type="button" onClick={() => onOpenForm('عملیات روزانه')} className="sm:col-span-2 rounded-lg bg-primary px-3 py-2 text-xs text-primary-foreground">بازکردن فرم ثبت آزمایشی</button>
      <p className="sm:col-span-2 text-[10px] leading-5 text-muted-foreground">در معماری نهایی، ثبت این فرم یک عملیات واحد است و سند بدهکار/بستانکار متناظر از همان رویداد تولید می‌شود؛ ورود دوباره در دفترها لازم نیست.</p>
    </div>}
    {formTarget && <form onSubmit={onSaveForm} className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
      <div className="flex items-center justify-between gap-2"><h5 className="text-xs font-bold">فرم آزمایشی: {formTarget}</h5><button type="button" onClick={() => onOpenForm('')} className="rounded-md border px-2 py-1 text-[10px]">بستن</button></div>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="space-y-1 text-[10px]">عنوان / نوع عملیات<input required value={draft.title} onChange={e => setDraft(v => ({...v,title:e.target.value}))} className="h-9 w-full rounded-lg border bg-background px-3 text-xs" /></label>
        <label className="space-y-1 text-[10px]">طرف حساب<input value={draft.party} onChange={e => setDraft(v => ({...v,party:e.target.value}))} placeholder="نام مشتری نمونه" className="h-9 w-full rounded-lg border bg-background px-3 text-xs" /></label>
        <label className="space-y-1 text-[10px]">ارز<select value={draft.currency} onChange={e => setDraft(v => ({...v,currency:e.target.value}))} className="h-9 w-full rounded-lg border bg-background px-3 text-xs"><option>USD</option><option>EUR</option><option>AFN</option><option>IRR</option><option>TRY</option></select></label>
        <label className="space-y-1 text-[10px]">مبلغ<input required inputMode="decimal" value={draft.amount} onChange={e => setDraft(v => ({...v,amount:e.target.value}))} className="h-9 w-full rounded-lg border bg-background px-3 text-xs" /></label>
        <label className="space-y-1 text-[10px]">نرخ تبدیل<input inputMode="decimal" value={draft.rate} onChange={e => setDraft(v => ({...v,rate:e.target.value}))} className="h-9 w-full rounded-lg border bg-background px-3 text-xs" /></label>
        <label className="space-y-1 text-[10px]">شرح<input value={draft.description} onChange={e => setDraft(v => ({...v,description:e.target.value}))} className="h-9 w-full rounded-lg border bg-background px-3 text-xs" /></label>
      </div>
      <div className="flex flex-wrap gap-2"><button type="submit" className="rounded-lg bg-primary px-4 py-2 text-xs text-primary-foreground">ذخیره موقت در مرورگر</button><button type="button" onClick={() => onAction('پیش‌نمایش چاپ ' + formTarget)} className="rounded-lg border bg-background px-3 py-2 text-xs">آزمایش چاپ / رسید</button></div>
      <p className="text-[10px] text-muted-foreground">این فرم فقط داده آزمایشی می‌گیرد؛ ذخیره در session مرورگر است و با بستن زبانه پاک می‌شود. هیچ درخواست شبکه‌ای ارسال نمی‌شود.</p>
    </form>}
    {demoRecords?.length > 0 && <div className="space-y-2 rounded-xl border p-3"><div className="flex items-center justify-between"><h5 className="text-xs font-bold">ثبت‌های موقت این زبانه ({demoRecords.length})</h5><button type="button" onClick={onClearDemo} className="text-[10px] text-destructive">پاک‌کردن همه</button></div>{demoRecords.slice(0,8).map(item => <div key={item.id} className="flex items-center justify-between gap-2 border-t py-2 text-[10px]"><div><b>{item.title}</b><span className="mr-2 text-muted-foreground">{item.amount} {item.currency} · {item.party || 'بدون طرف حساب'}</span><div className="text-muted-foreground">{item.time}</div></div><button type="button" onClick={() => onDeleteRecord(item.id)} className="rounded border px-2 py-1">حذف</button></div>)}</div>}
    {activityLog?.length > 0 && <details className="rounded-xl border p-3"><summary className="cursor-pointer text-xs font-semibold">گزارش کلیک‌ها و فعالیت‌های آزمایشی ({activityLog.length})</summary><div className="mt-2 space-y-1">{activityLog.slice(0,10).map(item => <div key={item.id} className="text-[10px] text-muted-foreground">{item.time} — {item.label}</div>)}</div></details>}
    {notice && <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-[10px] leading-5">{notice}</div>}
  </section>;
}
