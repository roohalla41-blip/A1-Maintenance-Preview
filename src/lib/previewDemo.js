// Preview-only demo sessions and workflow state. Never use for production auth.
const STATE_KEY = 'hesab_preview_demo_state_v1';

export function startPreviewSession(role) {
  if (typeof window === 'undefined' || window.__SUPABASE_CONFIG__?.previewOnly !== true) {
    throw new Error('Demo entry is available only in the isolated preview.');
  }
  const profiles = {
    customer: { id: 'preview-customer-001', full_name: 'مشتری آزمایشی', role: 'customer', status: 'active' },
    sarraaf: { id: 'preview-sarraaf-001', full_name: 'صراف آزمایشی', role: 'sarraaf', status: 'active', workspace_tier: 'basic', exchange_name: 'صرافی آزمایشی' },
    creator: { id: 'preview-creator-001', full_name: 'سازنده آزمایشی', role: 'creator', status: 'active', is_preview_demo: true },
  };
  const user = profiles[role];
  if (!user) throw new Error('Unknown preview role');
  localStorage.setItem('preview_demo_session', 'true');
  localStorage.setItem('auth_token', `preview_demo_${role}_session`);
  localStorage.setItem('auth_user', JSON.stringify(user));
  return user;
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
