import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

// Keep the full feature catalog, but use one representative icon per group.
// Individual destinations remain text-first to reduce visual noise.
const GROUPS = [
  ['نمای کلی و داشبورد', ['dashboard']],
  ['مشتریان و طرف‌های حساب', ['customers', 'debtors', 'accounts_receivable', 'accounts_payable']],
  ['عملیات صرافی و معاملات', ['dadogereft', 'trade', 'convert', 'currencies']],
  ['صندوق، بانک و خزانه‌داری', ['cash', 'bank', 'treasury', 'receipt']],
  ['حواله‌ها و تسویه بین‌صرافی', ['transfer_send', 'transfer_receive', 'transfer_book', 'intercompany']],
  ['حسابداری و دفاتر مالی', ['chart_of_accounts', 'journal_entry', 'journal', 'general_ledger', 'income_expense', 'subsidiary_ledger', 'trial_balance', 'balance_sheet', 'reconciliation', 'period_close', 'fiscal_periods']],
  ['گزارش‌ها، بودجه و تحلیل مالی', ['reports', 'profit_loss', 'cash_flow', 'budgets', 'cost_centers', 'fx_exposure', 'fx_revaluation', 'standards', 'consolidation']],
  ['سازمان، شعب و دارایی‌ها', ['agents', 'agency_network', 'multi_company', 'fixed_assets']],
  ['ریسک، انطباق و اسناد', ['kyc', 'compliance', 'aml_screening', 'internal_controls', 'data_governance', 'audit_log', 'document_center', 'approvals', 'tax']],
  ['بازار و خدمات دیجیتال', ['sarraaf_market', 'online_products', 'payment_gateway', 'sarraaf_chat', 'chat_groups', 'backup', 'support', 'assistant', 'notifications']],
];

export default function WorkspaceNavigation({ items, onNavigate }) {
  const { pathname } = useLocation();
  const activePath = items
    .filter(item => pathname === item.path || pathname.startsWith(item.path + '/'))
    .sort((a, b) => b.path.length - a.path.length)[0]?.path;

  return (
    <nav aria-label="منوی اصلی صراف" className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-2 py-3 space-y-1">
      {GROUPS.map(([title, keys], index) => {
        const entries = keys.map(key => items.find(item => item.featureKey === key)).filter(Boolean);
        if (!entries.length) return null;
        const containsActive = entries.some(item => item.path === activePath);
        const isDefaultOpen = index === 0 || containsActive;
        const GroupIcon = entries[0].icon;
        return (
          <details key={title} open={isDefaultOpen} className="group">
            <summary className="flex items-center justify-between gap-2 list-none cursor-pointer rounded-md px-3 py-2.5 text-[11px] font-bold tracking-wide text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors [&::-webkit-details-marker]:hidden">
              <span className="flex min-w-0 items-center gap-2.5">
                <GroupIcon className="w-4 h-4 shrink-0 text-indigo-300" strokeWidth={1.9} />
                <span className="truncate">{title}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[10px] font-normal tabular-nums text-slate-500">{entries.length.toLocaleString('fa-IR')}</span>
                <ChevronDown className="w-3.5 h-3.5 shrink-0 text-slate-500 group-open:rotate-180 transition-transform" />
              </span>
            </summary>
            <div className="space-y-0.5 mt-1 pb-1 pr-5">
              {entries.map(item => {
                const active = item.path === activePath;
                return (
                  <Link
                    key={item.featureKey}
                    to={item.path}
                    onClick={onNavigate}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] transition-colors border-r-2',
                      active
                        ? 'border-indigo-400 bg-indigo-600/20 text-white font-semibold'
                        : 'border-transparent text-slate-400 hover:bg-slate-700/50 hover:text-slate-100'
                    )}
                  >
                    <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', active ? 'bg-indigo-300' : 'bg-slate-600')} />
                    <span className="truncate">{item.label}</span>
                    {item.featureStatus === 'updating' && (
                      <span title={item.featureMessage || 'این بخش در حال به‌روزرسانی است'} className="mr-auto shrink-0 rounded bg-amber-400/10 px-1.5 py-0.5 text-[10px] text-amber-300">در حال تکمیل</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </details>
        );
      })}
      {(() => {
        const settingsItem = items.find(item => item.featureKey === 'settings');
        if (!settingsItem) return null;
        const active = pathname === settingsItem.path || pathname.startsWith(settingsItem.path + '/');
        return (
          <div className="mt-3 pt-3 border-t border-white/10">
            <Link
              to={settingsItem.path}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-colors border-r-2',
                active
                  ? 'border-indigo-400 bg-indigo-600/20 text-white'
                  : 'border-transparent text-slate-200 hover:bg-slate-700/60 hover:text-white'
              )}
            >
              <Settings className="w-4 h-4 shrink-0 text-indigo-300" />
              <span>تنظیمات</span>
              <span className="mr-auto text-[10px] text-slate-500">همیشه در دسترس</span>
            </Link>
          </div>
        );
      })()}
    </nav>
  );
}
