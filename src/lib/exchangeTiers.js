// Three predefined exchanger workspace tiers.
// These tiers shape the available workspace; they do not delete data or change accounting history.
export const EXCHANGE_TIERS = {
  basic: {
    id: 'basic',
    label: 'معمولی',
    englishLabel: 'Basic',
    tagline: 'برای صرافی‌های کوچک و فعالیت‌های روزمره',
    description: 'امکانات ضروری برای ثبت معاملات، مدیریت مشتریان و کنترل صندوق با محیطی خلوت و ساده.',
    recommendedFor: 'صرافی تک‌شعبه‌ای یا کسب‌وکار تازه‌کار',
    features: [
      'داشبورد و خلاصه وضعیت مالی',
      'مدیریت مشتریان و مانده حساب',
      'خرید و فروش و تبدیل ارز',
      'حواله‌های ارسال و دریافت',
      'یک صندوق اصلی و گردش صندوق',
      'مدیریت حساب بانکی و گردش پایه بانک',
      'حسابداری دوطرفه، ثبت سند و دفتر روزنامه و کل',
      'کدینگ پایه حساب‌ها و تراز آزمایشی',
      'ثبت دریافت و پرداخت و صدور رسید',
      'فهرست ارزها و نرخ‌های پایه',
      'گزارش‌های روزانه و گردش حساب',
      'اعلان‌ها، پشتیبانی و تنظیمات پایه',
    ],
    navKeys: [
      'dashboard', 'customers', 'dadogereft', 'trade', 'transfer_send',
      'transfer_receive', 'cash', 'bank', 'currencies', 'reports', 'transfer_book',
      'journal_entry', 'journal', 'general_ledger', 'chart_of_accounts', 'trial_balance', 'income_expense',
      'convert', 'receipt', 'support', 'assistant', 'notifications', 'settings',
    ],
    modules: ['dashboard', 'customers', 'trade', 'transfers', 'cash', 'bank', 'currencies', 'accounting', 'reports', 'receipts', 'support', 'settings'],
  },
  professional: {
    id: 'professional',
    label: 'حرفه‌ای',
    englishLabel: 'Professional',
    tagline: 'برای صرافی‌های در حال رشد و چندکاربره',
    description: 'تمام امکانات سطح معمولی به‌علاوه کنترل دقیق‌تر صندوق، بانک، حسابداری و مدیریت کارکنان.',
    recommendedFor: 'صرافی دارای چند صندوق‌دار، کارمند یا حجم معاملات بالاتر',
    features: [
      'تمام امکانات سطح معمولی',
      'چند صندوق و انتقال بین صندوق‌ها',
      'مدیریت بانک و مغایرت‌گیری',
      'دفتر روزنامه و دفتر کل',
      'اسناد حسابداری و ترازنامه',
      'بدهکاران، بستانکاران و نمایندگان',
      'مدیریت کارکنان و سطح دسترسی',
      'گزارش سود و زیان و گزارش‌های تحلیلی',
      'مدیریت اسناد و گردش تأییدها',
      'پشتیبانی از چند شعبه در ساختار صرافی',
    ],
    navKeys: [
      'dashboard', 'customers', 'dadogereft', 'trade', 'transfer_send',
      'transfer_receive', 'cash', 'bank', 'currencies', 'reports', 'profit_loss',
      'debtors', 'agents', 'agency_network', 'transfer_book', 'journal',
      'general_ledger', 'journal_entry', 'chart_of_accounts', 'trial_balance', 'income_expense', 'balance_sheet', 'reconciliation',
      'convert', 'receipt', 'support', 'assistant', 'notifications', 'settings',
      'document_center', 'approvals', 'treasury',
    ],
    modules: ['dashboard', 'customers', 'trade', 'transfers', 'cash', 'bank', 'currencies', 'accounting', 'treasury', 'reports', 'staff', 'documents', 'approvals', 'support', 'settings'],
  },
  enterprise: {
    id: 'enterprise',
    label: 'سازمانی',
    englishLabel: 'Enterprise',
    tagline: 'برای صرافی‌های بزرگ، چندشعبه‌ای و سازمانی',
    description: 'مجموعه کامل امکانات مالی، کنترلی، تحلیلی و سازمانی برای ساختارهای پیچیده.',
    recommendedFor: 'مجموعه‌های چندشعبه‌ای، چندشرکتی و دارای تیم مالی و حسابرسی',
    features: [
      'تمام امکانات سطح حرفه‌ای',
      'مدیریت چندشرکتی و حسابداری تلفیقی',
      'خزانه‌داری و مدیریت نقدینگی پیشرفته',
      'حساب‌های بین‌شرکتی و تسویه متقابل',
      'مدیریت ریسک و موقعیت ارزی',
      'بودجه‌بندی و مراکز هزینه',
      'دارایی‌های ثابت و استهلاک',
      'تسعیر ارز و تعدیلات پایان دوره',
      'کنترل‌های داخلی و گزارش حسابرسی',
      'KYC، انطباق و غربالگری AML',
      'حاکمیت داده و سیاست‌های نگهداری',
      'گردش‌کارهای تأیید چندمرحله‌ای و گزارش‌های مدیریتی پیشرفته',
    ],
    navKeys: [
      'dashboard', 'customers', 'dadogereft', 'trade', 'transfer_send',
      'transfer_receive', 'cash', 'bank', 'currencies', 'reports', 'profit_loss',
      'debtors', 'agents', 'agency_network', 'transfer_book', 'journal',
      'general_ledger', 'journal_entry', 'balance_sheet', 'reconciliation',
      'convert', 'online_products', 'payment_gateway', 'settings', 'sarraaf_market',
      'sarraaf_chat', 'chat_groups', 'backup', 'support', 'assistant', 'notifications',
      'chart_of_accounts', 'subsidiary_ledger', 'trial_balance', 'cash_flow',
      'cost_centers', 'fiscal_periods', 'period_close', 'fixed_assets',
      'accounts_receivable', 'accounts_payable', 'budgets', 'treasury',
      'intercompany', 'multi_company', 'kyc', 'compliance', 'audit_log',
      'document_center', 'approvals', 'fx_exposure', 'tax', 'standards',
      'aml_screening', 'fx_revaluation', 'consolidation', 'internal_controls',
      'data_governance', 'receipt',
    ],
    modules: ['all'],
  },
};

// Backward-compatible alias for older preview accounts and UI code.
// New code and newly saved values must use the canonical `professional` key.
Object.defineProperty(EXCHANGE_TIERS, 'standard', {
  value: EXCHANGE_TIERS.professional,
  enumerable: false,
  configurable: false,
  writable: false,
});

export const DEFAULT_EXCHANGE_TIER = 'basic';

export function normalizeExchangeTier(value) {
  if (value === 'standard' || value === 'pro') return 'professional';
  if (value === 'special') return 'enterprise';
  return Object.prototype.hasOwnProperty.call(EXCHANGE_TIERS, value)
    ? value
    : DEFAULT_EXCHANGE_TIER;
}

export function getExchangeTier(value) {
  return EXCHANGE_TIERS[normalizeExchangeTier(value)];
}

export function canTierAccessNavKey(tier, featureKey) {
  return getExchangeTier(tier).navKeys.includes(featureKey);
}

export function getTierForUser(user, profile) {
  let localTier = null;
  try {
    if (user?.id && typeof localStorage !== 'undefined') {
      localTier = localStorage.getItem(`exchange_workspace_tier_${user.id}`);
    }
  } catch {
    // Browser storage is optional.
  }
  return normalizeExchangeTier(
    profile?.workspace_tier || user?.workspace_tier || user?.exchange_tier || localTier || DEFAULT_EXCHANGE_TIER
  );
}

export function saveExchangeTier(userId, tier) {
  if (!userId || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(`exchange_workspace_tier_${userId}`, normalizeExchangeTier(tier));
  } catch {
    // Browser storage is optional in preview environments.
  }
}
