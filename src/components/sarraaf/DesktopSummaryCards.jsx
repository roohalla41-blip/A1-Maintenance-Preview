import React from 'react';
import { Download, Send, Users, Banknote, Landmark, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/sarraaf';

const STYLES = {
  bank: { icon: Landmark, tone: 'cyan', color: 'text-cyan-700', iconBg:'bg-cyan-50', barBg:'bg-cyan-100', bar:'bg-cyan-500' },
  treasury: { icon: Banknote, tone: 'green', color: 'text-emerald-700', iconBg:'bg-emerald-50', barBg:'bg-emerald-100', bar:'bg-emerald-500' },
  customers: { icon: Users, tone: 'blue', color: 'text-blue-700', iconBg:'bg-blue-50', barBg:'bg-blue-100', bar:'bg-blue-500' },
  sent: { icon: Send, tone: 'violet', color: 'text-violet-700', iconBg:'bg-violet-50', barBg:'bg-violet-100', bar:'bg-violet-500' },
  received: { icon: Download, tone: 'teal', color: 'text-teal-700', iconBg:'bg-teal-50', barBg:'bg-teal-100', bar:'bg-teal-500' },
};

export default function DesktopSummaryCards({ cards }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-3">
      {cards.map((card) => {
        const s = STYLES[card.key] || STYLES.bank;
        const Icon = s.icon;
        return (
          <section key={card.key} className={cn('a1-stat-card min-w-0')}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-xs font-bold text-slate-600 truncate">{card.label}</p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0  ${s.iconBg}`}>
                <Icon className={cn('w-5 h-5',s.color)} strokeWidth={2.1}/>
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xl xl:text-2xl font-extrabold text-slate-900 tabular-nums">{card.main.value}</span>
              {card.main.unit && <span className="text-[11px] text-slate-500">{card.main.unit}</span>}
            </div>
            {card.others.map(o => <p key={o.unit} className="text-[11px] text-slate-500 tabular-nums mt-1">{o.value} {o.unit}</p>)}
            {card.footer.map(text => <p key={text} className="text-[11px] text-slate-500 mt-1">{text}</p>)}
            {card.trend !== null && <p className={cn('text-[11px] font-bold mt-2',card.trend >= 0 ? 'text-emerald-700':'text-rose-600')}><TrendingUp className="inline w-3 h-3 ml-1"/>{formatNumber(Math.abs(card.trend))}٪ نسبت به دوره قبل</p>}
            <div className={`h-1 rounded-full mt-3  ${s.barBg} overflow-hidden`}><div className={`h-full w-2/3 rounded-full  ${s.bar}`}/></div>
          </section>
        );
      })}
    </div>
  );
}
