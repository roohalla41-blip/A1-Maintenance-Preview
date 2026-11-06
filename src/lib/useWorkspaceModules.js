import { useCallback, useEffect, useState } from 'react';

export const WORKSPACE_MODULES = [
  { id: 'operations', label: 'عملیات صرافی', description: 'خرید و فروش، داد و گرفت و تبدیل ارز', keys: ['dadogereft', 'trade', 'convert'] },
  { id: 'rates', label: 'ارز و نرخ‌ها', description: 'مدیریت ارزها، نرخ‌ها و بازار نرخ', keys: ['currencies', 'sarraaf_market'] },
  { id: 'customers', label: 'مشتریان و مطالبات', description: 'مشتریان، بدهکاران و بستانکاران', keys: ['customers', 'debtors', 'accounts_receivable', 'accounts_payable'] },
  { id: 'transfers', label: 'حواله و تسویه', description: 'ارسال، دریافت و دفتر حواله', keys: ['transfer_send', 'transfer_receive', 'transfer_book', 'intercompany'] },
  { id: 'treasury', label: 'صندوق و خزانه‌داری', description: 'صندوق، بانک، رسید و نقدینگی', keys: ['cash', 'bank', 'receipt', 'treasury', 'cash_flow'] },
  { id: 'accounting', label: 'حسابداری و دفاتر', description: 'اسناد، دفاتر، کدینگ و دوره‌های مالی', keys: ['journal_entry', 'journal', 'general_ledger', 'chart_of_accounts', 'subsidiary_ledger', 'trial_balance', 'balance_sheet', 'reconciliation', 'period_close', 'fiscal_periods', 'fixed_assets', 'cost_centers', 'budgets', 'standards', 'tax', 'fx_revaluation', 'consolidation'] },
  { id: 'reports', label: 'گزارش و تحلیل', description: 'گزارش‌ها، سود و زیان و تحلیل ریسک', keys: ['reports', 'profit_loss', 'fx_exposure'] },
  { id: 'organization', label: 'شعب و سازمان', description: 'نمایندگی‌ها و مدیریت چندشرکتی', keys: ['agents', 'agency_network', 'multi_company'] },
  { id: 'digital', label: 'خدمات دیجیتال', description: 'محصولات آنلاین و درگاه پرداخت', keys: ['online_products', 'payment_gateway'] },
  { id: 'governance', label: 'امنیت، کنترل و ارتباطات', description: 'امنیت، حسابرسی، انطباق، پشتیبانی و ارتباطات', keys: ['kyc', 'compliance', 'aml_screening', 'internal_controls', 'data_governance', 'audit_log', 'document_center', 'approvals', 'sarraaf_chat', 'chat_groups', 'backup', 'support', 'assistant'] },
];

const STORAGE_PREFIX = 'sarraaf-workspace-modules-v1:';
const EVENT_NAME = 'sarraaf-workspace-modules-changed';

function readState(userId) {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_PREFIX + (userId || 'guest')) || '{}');
  } catch {
    return {};
  }
}

export function isWorkspaceFeatureEnabled(featureKey, state = {}) {
  const module = WORKSPACE_MODULES.find(item => item.keys.includes(featureKey));
  return !module || state[module.id] !== false;
}

export default function useWorkspaceModules(userId) {
  const [enabled, setEnabled] = useState(() => readState(userId));

  useEffect(() => {
    setEnabled(readState(userId));
    const refresh = event => {
      if (!event.detail || event.detail.userId === (userId || 'guest')) setEnabled(readState(userId));
    };
    window.addEventListener(EVENT_NAME, refresh);
    return () => window.removeEventListener(EVENT_NAME, refresh);
  }, [userId]);

  const setModuleEnabled = useCallback((moduleId, value) => {
    const next = { ...readState(userId), [moduleId]: Boolean(value) };
    setEnabled(next);
    try {
      window.localStorage.setItem(STORAGE_PREFIX + (userId || 'guest'), JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { userId: userId || 'guest' } }));
    } catch {
      // Keep the in-memory setting active when browser storage is unavailable.
    }
  }, [userId]);

  return { enabledModules: enabled, setModuleEnabled };
}
