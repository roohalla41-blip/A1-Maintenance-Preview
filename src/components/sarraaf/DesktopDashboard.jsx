import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine, CalendarDays, Send, ShoppingCart } from 'lucide-react';
import { buildSummaryCards } from '@/lib/dashboardStats';
import DesktopSummaryCards from '@/components/sarraaf/DesktopSummaryCards';
import CurrencyRatesTable from '@/components/sarraaf/CurrencyRatesTable';
import DashboardCharts from '@/components/sarraaf/DashboardCharts';
import RecentTransactionsCard from '@/components/sarraaf/RecentTransactionsCard';
import DesktopSidePanel from '@/components/sarraaf/DesktopSidePanel';

const QUICK_ACTIONS = [
  { label: 'ثبت خرید ارز', path: '/trade', icon: ShoppingCart, tone: 'emerald' },
  { label: 'ثبت فروش ارز', path: '/trade', icon: ArrowLeftRight, tone: 'blue' },
  { label: 'حواله جدید', path: '/transfer-book', icon: Send, tone: 'light' },
  { label: 'دریافت / پرداخت', path: '/cash', icon: ArrowDownToLine, tone: 'light' },
];

export default function DesktopDashboard({ profile, currencies, curLoading, txs, txLoading, customers, custLoading, treasuryBalances, treasuryLoading, bankBalances, bankLoading, debtorCount }) {
  const cards = buildSummaryCards({
    txs, customers, treasuryBalances, bankBalances, debtorCount, currencies,
    loading: { bank: bankLoading, treasury: treasuryLoading, customers: custLoading, sent: txLoading, received: txLoading },
  });
  const date = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'full' }).format(new Date());

  return (
    <div className="a1-dashboard space-y-4 xl:space-y-5" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-[11px] font-bold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> آنلاین</span>
            <span className="text-[11px] text-slate-500">سامانه در حال فعالیت است</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">داشبورد مالی</h1>
          <p className="text-xs text-slate-500 mt-1">{profile?.exchange_name || profile?.name || 'مدیریت مالی صرافی'} · {date}</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm">
          <CalendarDays className="w-4 h-4 text-blue-700"/>{date}
        </div>
      </div>

      <section aria-label="خلاصه مالی">
        <DesktopSummaryCards cards={cards}/>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-800">عملیات پرکاربرد</h2>
          <span className="text-[11px] text-slate-500">دسترسی سریع به عملیات اصلی</span>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5">
          {QUICK_ACTIONS.map(({label,path,icon:Icon,tone}) => (
            <Link key={label} to={path} className={`a1-action a1-action-${tone}`}>
              <Icon className="w-5 h-5" strokeWidth={2.2}/><span>{label}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_270px] gap-4 items-start">
        <div className="min-w-0 space-y-4">
          <RecentTransactionsCard transactions={txs || []} isLoading={txLoading}/>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <DashboardCharts type="line" transactions={txs} isLoading={txLoading}/>
            <DesktopSidePanel currencies={currencies}/>
          </div>
        </div>
        <aside className="min-w-0 space-y-4">
          <CurrencyRatesTable currencies={currencies} isLoading={curLoading}/>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-extrabold text-slate-800 mb-3">خلاصه حساب‌ها</h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between gap-2"><span className="text-slate-500">مشتریان</span><span className="font-bold text-slate-800">{customers?.length || 0}</span></div>
              <div className="flex justify-between gap-2"><span className="text-slate-500">تعداد ارز فعال</span><span className="font-bold text-slate-800">{(currencies || []).filter(c => c.is_active !== false).length}</span></div>
              <div className="flex justify-between gap-2"><span className="text-slate-500">صندوق و خزانه</span><Link to="/enterprise/treasury" className="font-bold text-blue-700">مشاهده جزئیات ←</Link></div>
              <div className="pt-2 border-t border-slate-100 flex gap-2 flex-wrap">
                <Link to="/cash" className="a1-mini-link"><ArrowDownToLine className="w-3.5 h-3.5"/> صندوق</Link>
                <Link to="/bank" className="a1-mini-link"><LandmarkFallback/> بانک</Link>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function LandmarkFallback() {
  return <ArrowUpFromLine className="w-3.5 h-3.5"/>;
}
