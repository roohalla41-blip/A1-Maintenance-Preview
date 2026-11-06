import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';

export const DASHBOARD_SHORTCUTS = [
  { path: '/customers', label: 'مشتریان' },
  { path: '/trade', label: 'خرید و فروش' },
  { path: '/dadogereft', label: 'داد و گرفت' },
  { path: '/cash', label: 'صندوق' },
  { path: '/bank', label: 'بانک' },
  { path: '/transfer-book', label: 'حواله‌ها' },
  { path: '/currencies', label: 'ارز و نرخ‌ها' },
  { path: '/reports', label: 'گزارش‌ها' },
  { path: '/profit-loss', label: 'سود و زیان' },
  { path: '/debtors', label: 'بدهکاران' },
  { path: '/agents', label: 'نمایندگی‌ها' },
  { path: '/agency-network', label: 'شبکه نمایندگی' },
  { path: '/journal', label: 'دفتر روزنامه' },
  { path: '/general-ledger', label: 'دفتر کل' },
  { path: '/balance-sheet', label: 'ترازنامه' },
  { path: '/reconciliation', label: 'مغایرت‌گیری' },
  { path: '/online-products', label: 'خدمات آنلاین' },
  { path: '/sarraaf-chat', label: 'ارتباطات' },
  { path: '/settings', label: 'تنظیمات' },
];

const storageKey = userId => 'sarraaf-dashboard-hidden-v1:' + String(userId || 'guest');

export function useDashboardShortcuts() {
  const { user } = useAuth();
  const key = storageKey(user?.id);
  const [hidden, setHidden] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    try { setHidden(JSON.parse(localStorage.getItem(key) || '[]')); }
    catch { setHidden([]); }
  }, [key]);

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(hidden)); }
    catch { /* Preferences remain usable for this session. */ }
  }, [key, hidden]);

  const isVisible = useCallback(path => !hidden.includes(path), [hidden]);
  const toggle = useCallback(path => {
    setHidden(current => current.includes(path)
      ? current.filter(item => item !== path)
      : [...current, path]);
  }, []);
  const reset = useCallback(() => setHidden([]), []);

  return useMemo(() => ({ isVisible, toggle, reset, hidden }), [isVisible, toggle, reset, hidden]);
}
