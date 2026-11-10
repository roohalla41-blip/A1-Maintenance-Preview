import React, { useMemo, useState } from 'react';
import { queryClientInstance } from '@/lib/query-client';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Banknote, Bell, BookOpen, Building2, Calculator, ChartNoAxesCombined,
  CheckCircle2, ChevronDown, CircleDollarSign, ClipboardList, Coins, Crown, FileClock,
  FilePlus2, FileText, Landmark, LayoutDashboard, LogOut, Menu, Network, Package,
  Receipt, Scale, Search, Send, Settings, ShieldCheck, ShoppingBag, Users, Wallet, X
} from 'lucide-react';
import { readPreviewState, writePreviewState, clearPreviewSession, hasPreviewSession } from '@/lib/previewDemo';
import { resolvePreviewWorkspaceTier } from '@/lib/exchangeTiers';

const plans = [
  { id: 'basic', name: 'Basic', title: 'معمولی' },
  { id: 'professional', name: 'Professional', title: 'حرفه‌ای' },
  { id: 'enterprise', name: 'Enterprise', title: 'سازمانی' },
];

// The complete navigation skeleton is visible at every tier. Higher tiers unlock
// advanced capabilities; they do not remove the shared accounting workspace.
const groups = [
  { title: 'نمای کلی', items: [
    ['داشبورد مالی','نمای کلی مانده‌ها، گردش روزانه و وضعیت صندوق','پایه',LayoutDashboard],
    ['اعلان‌ها','پیام‌ها، هشدارها و رویدادهای مهم','پایه',Bell],
  ]},
  { title: 'عملیات صرافی', items: [
    ['مدیریت مشتریان','پرونده مشتری، مانده، گردش حساب و اطلاعات تماس','پایه',Users],
    ['داد و گرفت','ثبت دریافت و پرداخت و مشاهده گردش طرف حساب','پایه',CircleDollarSign],
    ['خرید و فروش ارز','ثبت معامله، نرخ، کارمزد و سود معامله','پایه',Coins],
    ['حواله‌های ارسالی','ثبت، پیگیری و تسویه حواله‌های ارسالی','پایه',Send],
    ['حواله‌های دریافتی','ثبت حواله دریافتی و تحویل به مشتری','پایه',Receipt],
    ['دفتر حواله','جست‌وجو و پیگیری اسناد حواله','پایه',BookOpen],
    ['ارزها و نرخ‌ها','تعریف ارزها و مدیریت نرخ‌های تبدیل','پایه',ChartNoAxesCombined],
    ['تبدیل ارز','محاسبه و ثبت تبدیل میان ارزها','پایه',Calculator],
  ]},
  { title: 'صندوق و نقدینگی', items: [
    ['صندوق‌ها','ایجاد صندوق، گردش، دریافت و پرداخت','پایه',Banknote],
    ['بانک','حساب‌های بانکی و گردش بانک','پایه',Landmark],
    ['خزانه‌داری و نقدینگی','موجودی نقد، انتقال بین صندوق‌ها و برنامه نقدینگی','پایه',Wallet],
    ['انتقال بین صندوق و مشتری','انتقال وجه با ثبت دوطرفه و رسید','پایه',Send],
    ['مغایرت‌گیری','تطبیق مانده صندوق، بانک و دفاتر','حرفه‌ای',Scale],
  ]},
  { title: 'حسابداری و اسناد', items: [
    ['ثبت سند حسابداری','ثبت سند دوطرفه و کنترل توازن بدهکار/بستانکار','پایه',FilePlus2],
    ['دفتر روزنامه','ثبت و مرور رویدادهای مالی به ترتیب تاریخ','پایه',BookOpen],
    ['دفتر کل','گردش و مانده حساب‌های کل','پایه',ClipboardList],
    ['معین و تفصیلی','گردش حساب‌های معین و اشخاص','پایه',FileText],
    ['کدینگ حساب‌ها','ساختار درختی سرفصل‌ها و کد حساب','حرفه‌ای',Network],
    ['تراز آزمایشی','کنترل مانده بدهکار و بستانکار','حرفه‌ای',Scale],
    ['ترازنامه','گزارش دارایی، بدهی و سرمایه','حرفه‌ای',FileText],
    ['سود و زیان','گزارش درآمد، هزینه و نتیجه عملیات','پایه',ChartNoAxesCombined],
    ['دوره مالی و بستن حساب‌ها','تعریف دوره و عملیات پایان دوره','حرفه‌ای',FileClock],
  ]},
  { title: 'گزارش‌ها و کنترل', items: [
    ['گزارش‌های مالی','گزارش گردش، مانده و عملکرد','پایه',FileText],
    ['بدهکاران و بستانکاران','فهرست مانده و سررسید حساب‌ها','پایه',Users],
    ['ردپای حسابرسی','ثبت رویدادها و پیگیری تغییرات','حرفه‌ای',ShieldCheck],
    ['کنترل‌های داخلی','سیاست‌های کنترل و گردش تأییدها','سازمانی',ShieldCheck],
    ['گزارش تحلیلی','تحلیل عملکرد، روند و شاخص‌های مالی','حرفه‌ای',ChartNoAxesCombined],
  ]},
  { title: 'مدیریت و خدمات', items: [
    ['شعب و نمایندگی‌ها','تعریف شعب، نمایندگی و ارتباطات بین آن‌ها','حرفه‌ای',Building2],
    ['کاربران و کارکنان','مدیریت صندوقدار، حسابدار و کاربران','پایه',Users],
    ['نقش‌ها و مجوزها','تعیین دسترسی هر کاربر به عملیات','پایه',ShieldCheck],
    ['محصولات و خدمات آنلاین','مدیریت خدمات قابل ارائه به مشتری','حرفه‌ای',ShoppingBag],
    ['فروشندگی','مدیریت درخواست‌ها و سفارش‌های فروش','حرفه‌ای',Package],
    ['پشتیبانی و پیام‌ها','ارتباط با مشتریان و پشتیبانی','پایه',Bell],
    ['بکاپ و بازیابی','ساختار پشتیبان‌گیری و بازیابی اطلاعات','حرفه‌ای',FileClock],
    ['تنظیمات صرافی','اطلاعات صرافی، امنیت، ترجیحات و تنظیمات ماژول‌ها','پایه',Settings],
  ]},
  { title: 'قابلیت‌های سازمانی', items: [
    ['حساب‌های بین‌صرافی','حساب و تسویه میان صرافی‌ها','سازمانی',Building2],
    ['چندشرکتی و تلفیق','مدیریت چند شرکت و گزارش تلفیقی','سازمانی',Network],
    ['مراکز هزینه و سود','تحلیل عملکرد بر اساس مرکز هزینه','سازمانی',ChartNoAxesCombined],
    ['بودجه و پیش‌بینی','بودجه‌بندی و پیش‌بینی جریان مالی','سازمانی',Calculator],
    ['احراز هویت و انطباق','کنترل مدارک و الزامات انطباق','سازمانی',ShieldCheck],
  ]},
];
const allItems = groups.flatMap(g => g.items);
const tierRank = { پایه: 1, حرفه‌ای: 2, سازمانی: 3 };
const planRank = { basic: 1, professional: 2, enterprise: 3 };

const moduleRoutes = {
  'داشبورد مالی': '/dashboard', 'اعلان‌ها': '/notifications',
  'مدیریت مشتریان': '/customers', 'داد و گرفت': '/dadogereft',
  'خرید و فروش ارز': '/trade', 'حواله‌های ارسالی': '/transfers/send',
  'حواله‌های دریافتی': '/transfers/receive', 'دفتر حواله': '/transfer-book',
  'ارزها و نرخ‌ها': '/currencies', 'تبدیل ارز': '/convert',
  'صندوق‌ها': '/cash', 'بانک': '/bank', 'خزانه‌داری و نقدینگی': '/enterprise/treasury',
  'انتقال بین صندوق و مشتری': '/cash', 'مغایرت‌گیری': '/reconciliation',
  'ثبت سند حسابداری': '/journal-entry', 'دفتر روزنامه': '/journal',
  'دفتر کل': '/general-ledger', 'معین و تفصیلی': '/enterprise/subsidiary-ledger',
  'کدینگ حساب‌ها': '/enterprise/chart-of-accounts', 'تراز آزمایشی': '/enterprise/trial-balance',
  'ترازنامه': '/balance-sheet', 'سود و زیان': '/profit-loss',
  'دوره مالی و بستن حساب‌ها': '/enterprise/fiscal-periods',
  'گزارش‌های مالی': '/reports', 'بدهکاران و بستانکاران': '/debtors',
  'ردپای حسابرسی': '/enterprise/audit-log', 'کنترل‌های داخلی': '/enterprise/internal-controls',
  'گزارش تحلیلی': '/reports', 'شعب و نمایندگی‌ها': '/agents',
  'کاربران و کارکنان': '/settings', 'نقش‌ها و مجوزها': '/settings',
  'محصولات و خدمات آنلاین': '/online-products', 'فروشندگی': '/online-products',
  'پشتیبانی و پیام‌ها': '/support', 'بکاپ و بازیابی': '/backup',
  'تنظیمات صرافی': '/settings', 'حساب‌های بین‌صرافی': '/enterprise/intercompany',
  'چندشرکتی و تلفیق': '/enterprise/multi-company',
  'مراکز هزینه و سود': '/enterprise/cost-centers',
  'بودجه و پیش‌بینی': '/enterprise/budgets',
  'احراز هویت و انطباق': '/enterprise/compliance',
};

export default function PreviewRoleDashboard({ role = 'sarraaf' }) {
  const navigate = useNavigate();
  const [state, setState] = useState(() => readPreviewState());
  const allowed = hasPreviewSession(role);
  const [requestedTier, setRequestedTier] = useState('professional');
  const [testTier, setTestTier] = useState(() => {
    try { return localStorage.getItem('exchange_workspace_tier_override_preview-sarraaf-001') || null; } catch { return null; }
  });
  const [note, setNote] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedModule, setSelectedModule] = useState(allItems[0][0]);
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const isCustomer = role === 'customer';
  const grant = state.grant;
  const today = new Date().toISOString().slice(0, 10);
  const activeGrant = useMemo(() => grant && grant.status === 'active' && grant.startDate <= today && grant.endDate >= today, [grant, today]);
  const tier = resolvePreviewWorkspaceTier(testTier, activeGrant ? grant : null, today);
  const tierName = plans.find(p => p.id === tier)?.name || 'Basic';
  const selected = allItems.find(x => x[0] === selectedModule) || allItems[0];
  const SelectedIcon = selected[3];
  const filteredGroups = groups.map(g => ({...g, items:g.items.filter(x => x[0].includes(search.trim()) || x[1].includes(search.trim()))})).filter(g=>g.items.length);

  const submitRequest = () => {
    const next = writePreviewState({
      ...state,
      request: { id: 'REQ-DEMO-001', tier: requestedTier, status: 'pending', createdAt: new Date().toISOString(), note },
      audit: [...state.audit, { action: 'درخواست ارتقا ثبت شد', at: new Date().toISOString() }],
    });
    setState(next);
  };
  const logout = () => { clearPreviewSession(); navigate('/', { replace: true }); };
  const changeTestTier = (nextTier) => {
    if (nextTier !== 'auto' && !['basic', 'professional', 'enterprise'].includes(nextTier)) return;
    const override = nextTier === 'auto' ? null : nextTier;
    setTestTier(override);
    try {
      if (override) localStorage.setItem('exchange_workspace_tier_override_preview-sarraaf-001', override);
      else localStorage.removeItem('exchange_workspace_tier_override_preview-sarraaf-001');
      const user = JSON.parse(localStorage.getItem('auth_user') || 'null');
      if (user?.role === 'sarraaf') {
        if (override) user.workspace_tier = override;
        else delete user.workspace_tier;
        localStorage.setItem('auth_user', JSON.stringify(user));
      }
      const key = 'cache_v2_SarraafProfile_PREVIEW-EX-001';
      const rows = JSON.parse(localStorage.getItem(key) || '[]');
      if (rows[0]) {
        const updated = { ...rows[0] };
        if (override) { updated.workspace_tier = override; updated.plan = override; }
        else { delete updated.workspace_tier; delete updated.plan; }
        localStorage.setItem(key, JSON.stringify([updated, ...rows.slice(1)]));
      }
      // Refresh cached profile/module queries so tier changes apply immediately
      // without requiring the user to sign out or reload the preview.
      queryClientInstance.invalidateQueries();
    } catch { /* browser storage is optional */ }
  };

  if (!allowed) return <main dir="rtl" className="min-h-screen bg-slate-950 p-8 text-slate-100"><div className="mx-auto max-w-xl rounded-xl border border-slate-800 bg-slate-900 p-6"><h1 className="text-xl font-bold">ورود آزمایشی</h1><p className="mt-3 text-sm text-slate-400">برای ورود، نقش موردنظر را از صفحه آغازین انتخاب کنید.</p><Link to="/" className="mt-5 inline-flex text-amber-300">بازگشت به صفحه آغازین</Link></div></main>;

  if (isCustomer) return <main dir="rtl" className="min-h-screen bg-slate-950 p-6 text-slate-100"><div className="mx-auto max-w-4xl"><header className="flex items-center justify-between"><h1 className="text-2xl font-bold">پنل مشتری آزمایشی</h1><button onClick={logout} className="rounded-lg border border-slate-700 px-4 py-2">خروج</button></header><p className="mt-3 text-slate-400">حساب مشتری، کیف پول، سفارش‌ها، حسابداری شخصی و پشتیبانی.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{['کیف پول و مانده حساب','سفارش‌ها و درخواست‌ها','دفتر حسابداری شخصی','انتقال و برداشت','خدمات آنلاین','پیام‌ها و پشتیبانی'].map(x=><div key={x} className="rounded-xl border border-slate-800 bg-slate-900 p-5">{x}</div>)}</div></div></main>;

  const renderModule = (item) => {
    const Icon = item[3];
    const required = tierRank[item[2]] || 1;
    const locked = required > planRank[tier];
    return <button key={item[0]} onClick={() => {const required=tierRank[item[2]]||1;if(required>planRank[tier]){setSelectedModule(item[0]);setActiveTab('module');return;}const path=moduleRoutes[item[0]];setMenuOpen(false);if(path) navigate(path);else {setSelectedModule(item[0]);setActiveTab('module');}}} className="flex w-full items-start gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3 text-right hover:border-amber-400/50">
      <span className="rounded-lg bg-slate-800 p-2 text-amber-300"><Icon className="h-5 w-5"/></span>
      <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{item[0]}</span><span className="mt-1 block text-xs leading-5 text-slate-400">{item[1]}</span></span>
      <span className="shrink-0 rounded-md bg-slate-800 px-2 py-1 text-[10px] text-slate-300">{locked ? 'قابل ارتقا' : item[2]}</span>
    </button>;
  };

  return <main dir="rtl" className="min-h-screen bg-slate-950 text-slate-100">
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur"><div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3"><div className="flex items-center gap-3"><button className="rounded-lg border border-slate-700 p-2 lg:hidden" onClick={()=>setMenuOpen(!menuOpen)} aria-label="منو"><Menu className="h-5 w-5"/></button><div><div className="flex items-center gap-2 text-xs text-amber-300"><ShieldCheck className="h-4 w-4"/> محیط آزمایشی مستقل</div><h1 className="mt-1 text-lg font-bold">صرافی آزمایشی</h1></div></div><div className="flex items-center gap-2"><label className="flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-xs text-amber-100"><span>آزمایش سطح</span><select aria-label="انتخاب سطح آزمایشی" value={testTier || 'auto'} onChange={e=>changeTestTier(e.target.value)} className="rounded bg-slate-900 px-2 py-1 text-amber-100"><option value="auto">طبق اشتراک تأییدشده</option><option value="basic">Basic</option><option value="professional">Professional</option><option value="enterprise">Enterprise</option></select></label><span className="hidden rounded-lg border border-slate-700 px-3 py-2 text-xs sm:inline">سطح {tierName}</span><button onClick={logout} className="rounded-lg border border-slate-700 p-2" aria-label="خروج"><LogOut className="h-4 w-4"/></button></div></div></header>
    <div className="mx-auto flex max-w-[1500px]">
      <aside className={`fixed inset-y-[61px] right-0 z-20 w-80 overflow-y-auto border-l border-slate-800 bg-slate-950 p-4 lg:sticky lg:top-[61px] lg:block lg:h-[calc(100vh-61px)] lg:translate-x-0 ${menuOpen?'translate-x-0':'translate-x-full'}`}>
        <button onClick={()=>setActiveTab('dashboard')} className="mb-3 flex w-full items-center gap-2 rounded-lg bg-slate-900 p-3 text-sm font-semibold"><LayoutDashboard className="h-4 w-4 text-amber-300"/> داشبورد صرافی</button>
        <button onClick={()=>setActiveTab('settings')} className="mb-3 flex w-full items-center gap-2 rounded-lg bg-slate-900 p-3 text-sm font-semibold"><Settings className="h-4 w-4 text-amber-300"/> تنظیمات و ارتقای پنل</button>
        <div className="relative mb-4"><Search className="absolute right-3 top-3 h-4 w-4 text-slate-500"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="جست‌وجوی بخش‌ها..." className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2.5 pr-9 pl-3 text-sm"/></div>
        {filteredGroups.map(group=><section key={group.title} className="mb-4"><h2 className="mb-2 px-2 text-xs font-bold text-amber-300">{group.title}</h2><div className="space-y-1">{group.items.map(item=><button key={item[0]} onClick={()=>{const required=tierRank[item[2]]||1;setMenuOpen(false);setSelectedModule(item[0]);if(required>planRank[tier]){setActiveTab('module');return;}const path=moduleRoutes[item[0]];if(path) navigate(path);else setActiveTab('module');}} className={`w-full rounded-lg px-3 py-2 text-right text-sm hover:bg-slate-900 ${selectedModule===item[0]&&activeTab==='module'?'bg-slate-800 text-amber-200':''}`}>{item[0]}<span className="mr-2 text-[10px] text-slate-500">{item[2]}</span></button>)}</div></section>)}
      </aside>
      <section className="min-w-0 flex-1 p-4 sm:p-6">
        {activeTab==='dashboard'&&<><div className="mb-5"><h2 className="text-2xl font-bold">داشبورد مدیریت صرافی</h2><p className="mt-1 text-sm text-slate-400">ساختار کامل پنل در سطح Basic در دسترس است؛ قابلیت‌های پیشرفته با ارتقای سطح فعال می‌شوند.</p></div><div className="mb-6 grid gap-3 sm:grid-cols-3"><article className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-xs text-slate-400">سطح فعلی</p><p className="mt-2 text-2xl font-bold text-amber-300">{tierName}</p></article><article className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-xs text-slate-400">وضعیت درخواست</p><p className="mt-2 text-lg font-bold">{state.request?.status==='pending'?'در انتظار بررسی':state.request?.status==='approved'?'تأیید شده':state.request?.status==='rejected'?'رد شده':'بدون درخواست'}</p></article><article className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-xs text-slate-400">اعتبار سطح بالاتر</p><p className="mt-2 text-sm font-semibold">{activeGrant?`${grant.startDate} تا ${grant.endDate}`:'—'}</p></article></div><div className="grid gap-6">{groups.map(g=><section key={g.title}><h3 className="mb-3 text-base font-bold">{g.title}</h3><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{g.items.map(renderModule)}</div></section>)}</div></>}
        {activeTab==='module'&&<div className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><div className="flex items-center gap-3"><SelectedIcon className="h-7 w-7 text-amber-300"/><h2 className="text-2xl font-bold">{selected[0]}</h2></div><p className="mt-4 leading-8 text-slate-300">{selected[1]}</p>{(tierRank[selected[2]]||1)>planRank[tier]?<div className="mt-5 rounded-xl border border-amber-400/30 bg-amber-400/5 p-5 text-sm leading-7 text-amber-100">این قابلیت در سطح {selected[2]} ارائه می‌شود. سطح آزمایشی فعلی شما {tierName} است؛ برای بررسی آن، سطح آزمایشی را از بالای صفحه تغییر دهید.</div>:<div className="mt-5 rounded-xl border border-dashed border-slate-700 p-5 text-sm leading-7 text-slate-400">این بخش هنوز صفحهٔ عملیاتی مستقل ندارد و برای تکمیل علامت‌گذاری شده است.</div>}<button onClick={()=>setActiveTab('dashboard')} className="mt-5 rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-950">بازگشت به داشبورد</button></div>}
        {activeTab==='settings'&&<div className="grid gap-4 lg:grid-cols-2"><article className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><h2 className="flex items-center gap-2 text-xl font-bold"><Crown className="h-5 w-5 text-amber-300"/> درخواست ارتقای پنل</h2><p className="mt-2 text-sm leading-6 text-slate-400">برای فعال‌سازی امکانات پیشرفته، درخواست خود را برای سازنده سامانه ارسال کنید.</p><label className="mt-5 block text-sm">سطح درخواستی<select value={requestedTier} onChange={e=>setRequestedTier(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3">{plans.filter(p=>p.id!=='basic').map(p=><option key={p.id} value={p.id}>{p.name} — {p.title}</option>)}</select></label><label className="mt-4 block text-sm">توضیحات و نیازهای صرافی<textarea value={note} onChange={e=>setNote(e.target.value)} rows={4} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3" placeholder="نیازهای خود را بنویسید (اختیاری)"/></label><button disabled={state.request?.status==='pending'} onClick={submitRequest} className="mt-4 w-full rounded-lg bg-amber-400 px-4 py-3 font-bold text-slate-950 disabled:opacity-40">ثبت درخواست برای سازنده</button>{state.request&&<p className="mt-3 text-sm text-amber-200">درخواست {state.request.tier} — {state.request.status==='pending'?'در انتظار بررسی':state.request.status==='approved'?'تأیید شده':'رد شده'}</p>}</article><article className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><h3 className="font-bold">وضعیت اشتراک</h3><p className="mt-3 text-sm text-slate-400">سطح فعلی: <b className="text-amber-200">{tierName}</b></p><p className="mt-2 text-sm text-slate-400">شروع اعتبار: {activeGrant?grant.startDate:'—'}</p><p className="mt-2 text-sm text-slate-400">پایان اعتبار: {activeGrant?grant.endDate:'—'}</p><div className="mt-5 rounded-lg bg-slate-950 p-4 text-sm leading-7 text-slate-400">پس از پایان اعتبار سطح ارتقایافته، دسترسی به‌صورت خودکار به Basic بازمی‌گردد. این چرخه در این نسخه فقط آزمایشی و محلی است.</div><h3 className="mt-5 font-bold">تنظیمات عمومی</h3><div className="mt-3 space-y-2 text-sm text-slate-300">{['اطلاعات و مشخصات صرافی','حساب کاربری و امنیت','زبان و ترجیحات','مدیریت نمایش ماژول‌ها','پشتیبانی و ارتباط با سازنده'].map(x=><div key={x} className="rounded-lg bg-slate-950 p-3">{x}</div>)}</div></article></div>}
      </section>
    </div>
    <footer className="border-t border-slate-800 px-5 py-4 text-center text-xs text-slate-500">محیط آزمایشی مستقل — هیچ عملیات مالی واقعی یا اتصال پایگاه داده فعال نیست.</footer>
  </main>;
}
