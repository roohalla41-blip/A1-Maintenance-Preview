import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Banknote, CalendarDays, Landmark, Send, ShoppingCart, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState, LoadingState, TransactionRow } from '@/components/sarraaf/Pieces';
import { TX_TYPE_LABELS } from '@/lib/sarraaf';
import { buildSummaryCards } from '@/lib/dashboardStats';

const ACTIONS = [
  { label: 'خرید و فروش ارز', path: '/trade', icon: ShoppingCart, tone: 'blue' },
  { label: 'حواله جدید', path: '/transfer-book', icon: Send, tone: 'green' },
  { label: 'صندوق', path: '/cash', icon: Banknote, tone: 'slate' },
  { label: 'مشتریان', path: '/customers', icon: Users, tone: 'slate' },
];

const TONES = {
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  slate: 'bg-slate-50 text-slate-700 border-slate-200',
};

export default function MobileDashboard({
  profile, currencies, curLoading, txs, txLoading, customers, custLoading,
  treasuryBalances, treasuryLoading, bankBalances, bankLoading, debtorCount,
}) {
  const navigate = useNavigate();
  const cards = buildSummaryCards({
    txs, customers, treasuryBalances, bankBalances, debtorCount, currencies,
    loading: { bank: bankLoading, treasury: treasuryLoading, customers: custLoading, sent: txLoading, received: txLoading },
  });
  const date = new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'long', weekday: 'long' }).format(new Date());

  return (
    <div className="a1-mobile-dashboard space-y-4" dir="rtl">
      <header className="rounded-2xl bg-gradient-to-l from-[#092b59] to-[#145a9c] p-4 text-white shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-blue-100">داشبورد مالی صرافی</p>
            <h1 className="mt-1 text-lg font-extrabold truncate">{profile?.exchange_name || profile?.name || 'حساب صراف'}</h1>
            <p className="mt-1 text-[11px] text-blue-100">{date}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5 text-white"/>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-100">
          <span className="w-2 h-2 rounded-full bg-emerald-300"/>
          نمای کلی وضعیت مالی
        </div>
      </header>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-extrabold text-slate-800">خلاصه حساب‌ها</h2>
          <span className="text-[10px] text-slate-500">بر پایه اطلاعات ثبت‌شده</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {cards.map((card, index) => (
            <article key={card.key} className={`rounded-xl border border-slate-200 bg-white p-3 shadow-sm ${index === 4 ? 'col-span-2' : ''}`}>
              <p className="text-[11px] font-bold text-slate-500">{card.label}</p>
              <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
                <strong className="text-lg font-extrabold text-slate-900 tabular-nums">{card.main.value}</strong>
                {card.main.unit && <span className="text-[10px] text-slate-500">{card.main.unit}</span>}
              </div>
              {card.others.slice(0, 1).map(item => <p key={item.unit} className="mt-1 text-[10px] text-slate-500">{item.value} {item.unit}</p>)}
              {card.footer.slice(0, 1).map(item => <p key={item} className="mt-1 text-[10px] text-slate-500">{item}</p>)}
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-extrabold text-slate-800">عملیات پرکاربرد</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {ACTIONS.map(({ label, path, icon: Icon, tone }) => (
            <Link key={path} to={path} className={`flex min-h-[58px] items-center gap-2.5 rounded-xl border p-3 text-xs font-bold shadow-sm active:scale-[.99] ${TONES[tone]}`}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/80"><Icon className="h-5 w-5"/></span>
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-800">آخرین تراکنش‌ها</h2>
          <Link to="/reports" className="text-[11px] font-bold text-blue-700">مشاهده همه</Link>
        </div>
        <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
          <CardContent className="p-2">
            {txLoading ? <LoadingState/> : (txs || []).length === 0 ? (
              <EmptyState title="تراکنشی ثبت نشده" description="پس از ثبت عملیات، سوابق در این بخش نمایش داده می‌شود"/>
            ) : (
              <div className="grid grid-cols-1 gap-1">
                {(txs || []).slice(0, 6).map(tx => (
                  <TransactionRow key={tx.id} tx={tx} labels={TX_TYPE_LABELS} onClick={() => navigate(`/receipt?type=tx&id=${tx.id}`)}/>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-800">نرخ ارز</h2>
          <Link to="/currencies" className="text-[11px] font-bold text-blue-700">همه نرخ‌ها</Link>
        </div>
        {curLoading ? <p className="py-3 text-center text-xs text-slate-500">در حال بارگذاری نرخ‌ها...</p> : (
          <div className="divide-y divide-slate-100">
            {(currencies || []).filter(c => c.is_active !== false).slice(0, 4).map(c => (
              <div key={c.code} className="flex items-center justify-between gap-2 py-2 text-xs">
                <span className="font-bold text-slate-700">{c.name} <span className="text-[10px] text-slate-400" dir="ltr">{c.code}</span></span>
                <span className="text-left tabular-nums text-slate-600">خرید {c.buy_rate || '—'} · فروش {c.sell_rate || '—'}</span>
              </div>
            ))}
            {(currencies || []).filter(c => c.is_active !== false).length === 0 && <p className="py-3 text-center text-xs text-slate-500">نرخی ثبت نشده است</p>}
          </div>
        )}
      </section>

      <div className="grid grid-cols-2 gap-2">
        <Link to="/bank" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-700"><Landmark className="h-4 w-4 text-blue-700"/> حساب‌های بانکی</Link>
        <Link to="/enterprise/treasury" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-700"><ArrowLeftRight className="h-4 w-4 text-blue-700"/> خزانه‌داری</Link>
      </div>
    </div>
  );
}
