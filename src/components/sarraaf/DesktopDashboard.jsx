import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine, CalendarDays, Plus, ReceiptText, Send, Wallet } from 'lucide-react';
import { buildSummaryCards } from '@/lib/dashboardStats';
import DashboardIdentityBar from '@/components/sarraaf/DashboardIdentityBar';
import DesktopSummaryCards from '@/components/sarraaf/DesktopSummaryCards';
import CurrencyRatesTable from '@/components/sarraaf/CurrencyRatesTable';
import DashboardCharts from '@/components/sarraaf/DashboardCharts';
import RecentTransactionsCard from '@/components/sarraaf/RecentTransactionsCard';
import DesktopSidePanel from '@/components/sarraaf/DesktopSidePanel';
import DesktopPlanPanel from '@/components/sarraaf/DesktopPlanPanel';

const QUICK_ACTIONS = [
  { label: 'خرید و فروش ارز', path: '/trade', icon: ArrowLeftRight, primary: true },
  { label: 'ثبت حواله', path: '/transfer-book', icon: Send },
  { label: 'دریافت وجه', path: '/cash', icon: ArrowDownToLine },
  { label: 'پرداخت وجه', path: '/cash', icon: ArrowUpFromLine },
  { label: 'رسیدها و اسناد', path: '/receipt', icon: ReceiptText },
];

export default function DesktopDashboard({ profile, currencies, curLoading, txs, txLoading, customers, custLoading, treasuryBalances, treasuryLoading, bankBalances, bankLoading, debtorCount, plan }) {
  const cards = buildSummaryCards({
    txs, customers, treasuryBalances, bankBalances, debtorCount, currencies,
    loading: { bank: bankLoading, treasury: treasuryLoading, customers: custLoading, sent: txLoading, received: txLoading },
  });

  return (
    <div className="space-y-5">
      <div className="financial-page-heading">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> محیط کاری
            </span>
            <span>نمای کلی فعالیت‌های مالی</span>
          </div>
          <h1 className="text-2xl xl:text-[1.7rem] font-extrabold tracking-tight text-foreground">داشبورد مالی</h1>
          <p className="text-xs text-muted-foreground mt-1">خلاصه موجودی، گردش عملیات و وضعیت حساب‌ها</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground rounded-xl border bg-card px-3 py-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          <span>{new Intl.DateTimeFormat('fa-IR', { dateStyle: 'full' }).format(new Date())}</span>
        </div>
      </div>

      <DashboardIdentityBar profile={profile} />

      <section aria-label="عملیات سریع" className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="financial-section-title">عملیات پرکاربرد</h2>
          <span className="text-[11px] text-muted-foreground">دسترسی مستقیم به بخش‌ها</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map(({ label, path, icon: Icon, primary }) => (
            <Link key={label} to={path} className={primary ? 'inline-flex items-center justify-center gap-2 min-h-11 rounded-xl px-4 text-sm font-bold text-white bg-primary hover:opacity-90 shadow-sm transition' : 'financial-quick-action'}>
              <Icon className="w-4 h-4" strokeWidth={2} />
              {label}
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="خلاصه مالی" className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="financial-section-title">وضعیت مالی</h2>
          <span className="text-[11px] text-muted-foreground">بر اساس اطلاعات ثبت‌شده</span>
        </div>
        <DesktopSummaryCards cards={cards} />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-5">
        <div className="space-y-5 min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CurrencyRatesTable currencies={currencies} isLoading={curLoading} />
            <DashboardCharts type="line" transactions={txs} isLoading={txLoading} />
          </div>
          <RecentTransactionsCard transactions={txs || []} isLoading={txLoading} />
        </div>
        <div className="space-y-4 min-w-0">
          <DesktopSidePanel currencies={currencies} />
          <DesktopPlanPanel {...plan} />
        </div>
      </div>
    </div>
  );
}
