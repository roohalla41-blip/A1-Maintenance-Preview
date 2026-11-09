// Preview-only demo sessions and workflow state. Never use for production auth.
const STATE_KEY = 'hesab_preview_demo_state_v1';

export function startPreviewSession(role) {
  if (typeof window === 'undefined' || window.__SUPABASE_CONFIG__?.previewOnly !== true) {
    throw new Error('Demo entry is available only in the isolated preview.');
  }
  const profiles = {
    customer: { id: 'preview-customer-001', full_name: 'مشتری آزمایشی', role: 'customer', status: 'active' },
    sarraaf: { id: 'preview-sarraaf-001', full_name: 'صراف آزمایشی', role: 'sarraaf', status: 'active', workspace_tier: 'basic', exchange_name: 'صرافی آزمایشی', exchange_code: 'PREVIEW-EX-001' },
    creator: { id: 'preview-creator-001', full_name: 'سازنده آزمایشی', role: 'creator', status: 'active', is_preview_demo: true },
  };
  const user = profiles[role];
  if (!user) throw new Error('Unknown preview role');
  if (role === 'sarraaf') {
    const signatureSource = `${user.id || ''}::${user.exchange_code || ''}`;
    let signatureHash = 5381;
    for (let i = 0; i < signatureSource.length; i++) signatureHash = ((signatureHash << 5) + signatureHash) + signatureSource.charCodeAt(i);
    localStorage.setItem('cache_tenant_sig', `tsig_${Math.abs(signatureHash).toString(36)}`);
  }

  // Seed isolated sample records once. All keys are preview-scoped and stay in this browser.
  if (role === 'sarraaf') {
    const stamp = new Date().toISOString();
    const seed = (key, rows) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(rows));
    };
    const seedIfEmpty = (key, rows) => {
      try { const current = JSON.parse(localStorage.getItem(key) || 'null'); if (!Array.isArray(current) || current.length === 0) localStorage.setItem(key, JSON.stringify(rows)); } catch { localStorage.setItem(key, JSON.stringify(rows)); }
    };
    seed('cache_v2_SarraafProfile_PREVIEW-EX-001', [{
      id: user.id, user_id: user.id, code: user.exchange_code, exchange_code: user.exchange_code,
      exchange_name: user.exchange_name, name: user.full_name, quota_limit: 1000, quota_used: 0,
      plan: 'free', workspace_tier: 'basic', status: 'active', created_date: stamp, updated_date: stamp,
    }]);
    seed('cache_v2_Customer_PREVIEW-EX-001', [
      { id: 'preview-customer-101', name: 'احمدی', phone: '0700000101', code: 'CUS-001', status: 'active', currency: 'AFN', created_date: stamp },
      { id: 'preview-customer-102', name: 'محمدی', phone: '0700000102', code: 'CUS-002', status: 'active', currency: 'USD', created_date: stamp },
    ]);
    seed('cache_v2_Safe_PREVIEW-EX-001', [
      { id: 'preview-safe-001', name: 'صندوق اصلی', currency: 'AFN', opening_balance: 50000, balance: 50000, status: 'active', created_date: stamp },
      { id: 'preview-safe-002', name: 'صندوق دالر', currency: 'USD', opening_balance: 500, balance: 500, status: 'active', created_date: stamp },
    ]);
    seed('cache_v2_Currency_PREVIEW-EX-001', [
      { id: 'preview-cur-afn', code: 'AFN', name: 'افغانی', symbol: '؋', is_active: true, sort_order: 1 },
      { id: 'preview-cur-usd', code: 'USD', name: 'دالر آمریکا', symbol: '$', is_active: true, sort_order: 2 },
      { id: 'preview-cur-eur', code: 'EUR', name: 'یورو', symbol: '€', is_active: true, sort_order: 3 },
    ]);
    seed('cache_v2_Transaction_PREVIEW-EX-001', []);
    seed('cache_v2_Transfer_PREVIEW-EX-001', []);
    seed('cache_v2_BankAccount_PREVIEW-EX-001', []);
    seedIfEmpty('cache_v2_LedgerEntry_PREVIEW-EX-001', [
      { id: 'preview-opening-afn-1', document_id: 'preview-opening-afn', document_no: 'OB-00001', account_type: 'cash', account_id: 'preview-safe-001', account_name: 'صندوق اصلی', currency: 'AFN', debit: 50000, credit: 0, line_no: 1, created_date: '2026-11-09T16:46:09.218Z', deleted: false },
      { id: 'preview-opening-afn-2', document_id: 'preview-opening-afn', document_no: 'OB-00001', account_type: 'suspense', account_id: 'opening', account_name: 'موجودی افتتاحیه', currency: 'AFN', debit: 0, credit: 50000, line_no: 2, created_date: '2026-11-09T16:46:09.218Z', deleted: false },
      { id: 'preview-opening-usd-1', document_id: 'preview-opening-usd', document_no: 'OB-00002', account_type: 'cash', account_id: 'preview-safe-002', account_name: 'صندوق دالر', currency: 'USD', debit: 500, credit: 0, line_no: 1, created_date: '2026-11-09T16:46:09.218Z', deleted: false },
      { id: 'preview-opening-usd-2', document_id: 'preview-opening-usd', document_no: 'OB-00002', account_type: 'suspense', account_id: 'opening', account_name: 'موجودی افتتاحیه', currency: 'USD', debit: 0, credit: 500, line_no: 2, created_date: '2026-11-09T16:46:09.218Z', deleted: false },
    ]);
  }

  localStorage.setItem('preview_demo_session', 'true');
  localStorage.setItem('auth_token', `preview_demo_${role}_session`);
  localStorage.setItem('auth_user', JSON.stringify(user));
  return user;
}

export function hasPreviewSession(role) {
  if (typeof window === 'undefined' || window.__SUPABASE_CONFIG__?.previewOnly !== true) return false;
  try {
    const user = JSON.parse(localStorage.getItem('auth_user') || 'null');
    const token = localStorage.getItem('auth_token') || '';
    return localStorage.getItem('preview_demo_session') === 'true'
      && token.startsWith('preview_demo_')
      && user?.role === role;
  } catch {
    return false;
  }
}

export function readPreviewState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STATE_KEY) || '{}');
    return {
      request: saved.request || null,
      grant: saved.grant || null,
      audit: Array.isArray(saved.audit) ? saved.audit : [],
    };
  } catch {
    return { request: null, grant: null, audit: [] };
  }
}

export function writePreviewState(next) {
  const safe = {
    request: next.request || null,
    grant: next.grant || null,
    audit: Array.isArray(next.audit) ? next.audit.slice(0, 30) : [],
  };
  localStorage.setItem(STATE_KEY, JSON.stringify(safe));
  return safe;
}

export function clearPreviewSession() {
  localStorage.removeItem('preview_demo_session');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}
